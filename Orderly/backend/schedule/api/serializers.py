from rest_framework import serializers
from schedule.models import StoreShift, ShiftAssignment


class StoreShiftSerializer(serializers.ModelSerializer):
    startTime = serializers.TimeField(source="start_time", format="%H:%M")
    endTime = serializers.TimeField(source="end_time", format="%H:%M")

    class Meta:
        model = StoreShift
        fields = ["id", "name", "startTime", "endTime", "sort_order"]
        read_only_fields = ["id"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Shift name is required.")
        return value.strip()


class ShiftAssignmentSerializer(serializers.ModelSerializer):
    employeeId = serializers.IntegerField(source="employee_id", read_only=True)
    employeeName = serializers.SerializerMethodField()
    shiftId = serializers.IntegerField(source="shift_id", read_only=True)
    shiftName = serializers.CharField(source="shift.name", read_only=True)

    class Meta:
        model = ShiftAssignment
        fields = ["id", "date", "shiftId", "shiftName", "employeeId", "employeeName"]
        read_only_fields = ["id"]

    def get_employeeName(self, obj):
        u = obj.employee
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username


class ShiftAssignmentCreateSerializer(serializers.Serializer):
    shift_id = serializers.IntegerField()
    employee_id = serializers.IntegerField()
    date = serializers.DateField()
