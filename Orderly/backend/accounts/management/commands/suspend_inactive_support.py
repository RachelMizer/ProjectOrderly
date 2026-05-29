"""
Management command: suspend_inactive_support

Deactivates support accounts that have not logged in within INACTIVITY_DAYS days.
Intended to be run as a scheduled job (e.g., Render Cron Job, daily).

Usage:
    python manage.py suspend_inactive_support
    python manage.py suspend_inactive_support --days 60
    python manage.py suspend_inactive_support --dry-run
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from accounts.models import UserRoleChoices

User = get_user_model()

# Default: suspend after this many days without logging in
DEFAULT_INACTIVITY_DAYS = 90


class Command(BaseCommand):
    help = "Suspend support accounts that have been inactive for too long."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=DEFAULT_INACTIVITY_DAYS,
            help=f"Number of days of inactivity before suspending (default: {DEFAULT_INACTIVITY_DAYS})",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print accounts that would be suspended without making any changes.",
        )

    def handle(self, *args, **options):
        days = options["days"]
        dry_run = options["dry_run"]
        cutoff = timezone.now() - timedelta(days=days)

        # Find active support users whose last login is before the cutoff,
        # or who have never logged in and whose account is older than the cutoff.
        support_users = User.objects.filter(
            is_active=True,
            profile__role=UserRoleChoices.SUPPORT,
        )

        to_suspend = []
        for user in support_users:
            last_login = user.last_login
            date_joined = user.date_joined
            if last_login is None:
                # Never logged in — use account creation date
                if date_joined < cutoff:
                    to_suspend.append((user, "never logged in"))
            elif last_login < cutoff:
                to_suspend.append((user, f"last login {last_login.date()}"))

        if not to_suspend:
            self.stdout.write(self.style.SUCCESS(
                f"No support accounts inactive for {days}+ days."
            ))
            return

        label = "Would suspend" if dry_run else "Suspending"
        for user, reason in to_suspend:
            self.stdout.write(f"  {label}: {user.username} ({user.email}) — {reason}")

        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"Dry run — {len(to_suspend)} account(s) would be suspended. "
                "Run without --dry-run to apply."
            ))
            return

        ids = [u.pk for u, _ in to_suspend]
        User.objects.filter(pk__in=ids).update(is_active=False)
        self.stdout.write(self.style.SUCCESS(
            f"Suspended {len(to_suspend)} support account(s) inactive for {days}+ days."
        ))
