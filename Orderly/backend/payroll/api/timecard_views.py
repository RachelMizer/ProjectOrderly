from datetime import date, datetime, timedelta
from collections import defaultdict

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from accounts.api.permissions import IsStoreManagerOrAbove
from accounts.models import UserRoleChoices
from payroll.models import PunchRecord, PayPeriod

User = get_user_model()

EDIT_WINDOW_DAYS = 30


def _resolve_access(requester_profile, employee_user):
    """
    Returns (can_view, can_edit) for requester accessing employee's timecard.
    """
    if requester_profile is None:
        return False, False
    role = requester_profile.role
    if role == UserRoleChoices.EXECUTIVE:
        return True, True
    if role == UserRoleChoices.STORE_MANAGER:
        emp_profile = getattr(employee_user, "profile", None)
        if emp_profile and emp_profile.store_id == requester_profile.store_id:
            return True, True
        return False, False
    return False, False


def _build_timecard(punches):
    """
    Takes an ordered list of PunchRecord objects and returns:
      - sessions: list of {date, clock_in, clock_out (or None), hours (or None)}
      - daily_totals: {date_str: hours}
      - total_hours: Decimal-like float
    """
    sessions = []
    pending_in = None

    for p in punches:
        ts = p.timestamp
        if p.punch_type == PunchRecord.IN:
            if pending_in is not None:
                # Unclosed punch — record as open session
                sessions.append({
                    "punchInId":  pending_in.id,
                    "punchOutId": None,
                    "date":       pending_in.timestamp.date().isoformat(),
                    "clockIn":    pending_in.timestamp.isoformat(),
                    "clockOut":   None,
                    "hours":      None,
                    "open":       True,
                    "inEditable": pending_in.is_editable,
                    "outEditable": False,
                })
            pending_in = p
        else:  # OUT
            if pending_in is not None:
                dur = (ts - pending_in.timestamp).total_seconds() / 3600
                sessions.append({
                    "punchInId":  pending_in.id,
                    "punchOutId": p.id,
                    "date":       pending_in.timestamp.date().isoformat(),
                    "clockIn":    pending_in.timestamp.isoformat(),
                    "clockOut":   ts.isoformat(),
                    "hours":      round(dur, 2),
                    "open":       False,
                    "inEditable": pending_in.is_editable,
                    "outEditable": p.is_editable,
                })
                pending_in = None
            else:
                # Orphan OUT — record as stub
                sessions.append({
                    "punchInId":  None,
                    "punchOutId": p.id,
                    "date":       ts.date().isoformat(),
                    "clockIn":    None,
                    "clockOut":   ts.isoformat(),
                    "hours":      None,
                    "open":       False,
                    "inEditable": False,
                    "outEditable": p.is_editable,
                })

    if pending_in is not None:
        sessions.append({
            "punchInId":  pending_in.id,
            "punchOutId": None,
            "date":       pending_in.timestamp.date().isoformat(),
            "clockIn":    pending_in.timestamp.isoformat(),
            "clockOut":   None,
            "hours":      None,
            "open":       True,
            "inEditable": pending_in.is_editable,
            "outEditable": False,
        })

    daily = defaultdict(float)
    for s in sessions:
        if s["hours"] is not None:
            daily[s["date"]] += s["hours"]

    total = sum(daily.values())

    return sessions, {k: round(v, 2) for k, v in daily.items()}, round(total, 2)


def _punch_detail(p):
    return {
        "id":         p.id,
        "timestamp":  p.timestamp.isoformat(),
        "punch_type": p.punch_type,
        "note":       p.note,
        "editable":   p.is_editable,
        "created_by": (
            f"{p.created_by.first_name} {p.created_by.last_name}".strip()
            or p.created_by.username
        ) if p.created_by else None,
    }


class TimecardView(APIView):
    """
    GET /api/v1/timecard/<user_id>/?start=&end=  OR  ?pay_period=<id>
    Returns punch records + computed sessions + totals.
    """
    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def get(self, request, user_id):
        employee = get_object_or_404(User, pk=user_id)
        requester = getattr(request.user, "profile", None)
        can_view, can_edit = _resolve_access(requester, employee)
        if not can_view:
            return Response({"detail": "Permission denied."}, status=403)

        # Date range resolution
        pay_period_id = request.query_params.get("pay_period")
        if pay_period_id:
            pp = get_object_or_404(PayPeriod, pk=pay_period_id)
            start = datetime.combine(pp.start_date, datetime.min.time())
            end   = datetime.combine(pp.end_date,   datetime.max.time())
            start = timezone.make_aware(start)
            end   = timezone.make_aware(end)
        else:
            try:
                start = timezone.make_aware(
                    datetime.fromisoformat(request.query_params.get("start", ""))
                )
            except (ValueError, TypeError):
                start = timezone.now() - timedelta(days=30)
            try:
                end = timezone.make_aware(
                    datetime.fromisoformat(request.query_params.get("end", ""))
                )
            except (ValueError, TypeError):
                end = timezone.now()

        punches = PunchRecord.objects.filter(
            employee=employee,
            timestamp__gte=start,
            timestamp__lte=end,
        ).order_by("timestamp")

        sessions, daily_totals, total_hours = _build_timecard(list(punches))

        emp_profile = getattr(employee, "profile", None)
        return Response({
            "employee": {
                "id":        employee.pk,
                "name":      f"{employee.first_name} {employee.last_name}".strip() or employee.username,
                "employeeId": emp_profile.employee_id if emp_profile else None,
                "jobTitle":   emp_profile.job_title if emp_profile else None,
                "storeName":  str(emp_profile.store) if emp_profile and emp_profile.store else None,
            },
            "canEdit":     can_edit,
            "start":       start.isoformat(),
            "end":         end.isoformat(),
            "punches":     [_punch_detail(p) for p in punches],
            "sessions":    sessions,
            "dailyTotals": daily_totals,
            "totalHours":  total_hours,
        })


class PunchCreateView(APIView):
    """POST /api/v1/timecard/<user_id>/punches/ — manager adds a punch."""
    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def post(self, request, user_id):
        employee = get_object_or_404(User, pk=user_id)
        requester = getattr(request.user, "profile", None)
        _, can_edit = _resolve_access(requester, employee)
        if not can_edit:
            return Response({"detail": "Permission denied."}, status=403)

        ts_raw  = request.data.get("timestamp")
        p_type  = request.data.get("punch_type")
        note    = request.data.get("note", "")

        if not ts_raw or p_type not in (PunchRecord.IN, PunchRecord.OUT):
            return Response({"detail": "timestamp and punch_type (IN/OUT) are required."}, status=400)

        try:
            ts = timezone.make_aware(datetime.fromisoformat(ts_raw))
        except (ValueError, TypeError):
            return Response({"detail": "Invalid timestamp format. Use ISO 8601."}, status=400)

        cutoff = timezone.now() - timedelta(days=EDIT_WINDOW_DAYS)
        if ts < cutoff:
            return Response({"detail": "Cannot add punches older than 30 days."}, status=400)

        emp_profile = getattr(employee, "profile", None)
        store = emp_profile.store if emp_profile else None
        if not store:
            return Response({"detail": "Employee has no assigned store."}, status=400)

        punch = PunchRecord.objects.create(
            employee=employee,
            store=store,
            timestamp=ts,
            punch_type=p_type,
            note=note,
            created_by=request.user,
        )
        return Response(_punch_detail(punch), status=201)


class PunchDetailView(APIView):
    """
    PATCH  /api/v1/timecard/punches/<punch_id>/  — edit timestamp or note
    DELETE /api/v1/timecard/punches/<punch_id>/  — delete
    """
    permission_classes = [IsAuthenticated, IsStoreManagerOrAbove]

    def _get_punch_with_access(self, request, punch_id):
        punch = get_object_or_404(PunchRecord, pk=punch_id)
        requester = getattr(request.user, "profile", None)
        _, can_edit = _resolve_access(requester, punch.employee)
        if not can_edit:
            return None, Response({"detail": "Permission denied."}, status=403)
        if not punch.is_editable:
            return None, Response({"detail": "This punch is older than 30 days and cannot be modified."}, status=400)
        return punch, None

    def patch(self, request, punch_id):
        punch, err = self._get_punch_with_access(request, punch_id)
        if err:
            return err

        ts_raw = request.data.get("timestamp")
        if ts_raw:
            try:
                punch.timestamp = timezone.make_aware(datetime.fromisoformat(ts_raw))
            except (ValueError, TypeError):
                return Response({"detail": "Invalid timestamp format."}, status=400)

        if "note" in request.data:
            punch.note = request.data["note"]
        if "punch_type" in request.data:
            if request.data["punch_type"] not in (PunchRecord.IN, PunchRecord.OUT):
                return Response({"detail": "punch_type must be IN or OUT."}, status=400)
            punch.punch_type = request.data["punch_type"]

        punch.save()
        return Response(_punch_detail(punch))

    def delete(self, request, punch_id):
        punch, err = self._get_punch_with_access(request, punch_id)
        if err:
            return err
        punch.delete()
        return Response(status=204)
