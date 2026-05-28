from django.db import migrations, models


def migrate_statuses_forward(apps, schema_editor):
    Ticket = apps.get_model("tickets", "Ticket")
    # NEW and OPEN both become UNASSIGNED
    Ticket.objects.filter(status__in=["NEW", "OPEN"]).update(status="UNASSIGNED")
    # RESOLVED becomes IN_REVIEW
    Ticket.objects.filter(status="RESOLVED").update(status="IN_REVIEW")
    # IN_PROGRESS and CLOSED are unchanged


def migrate_statuses_backward(apps, schema_editor):
    Ticket = apps.get_model("tickets", "Ticket")
    Ticket.objects.filter(status="UNASSIGNED").update(status="NEW")
    Ticket.objects.filter(status="IN_REVIEW").update(status="RESOLVED")


class Migration(migrations.Migration):

    dependencies = [
        ("tickets", "0008_add_history_announcements_knowledge"),
    ]

    operations = [
        migrations.RunPython(migrate_statuses_forward, migrate_statuses_backward),
        migrations.AlterField(
            model_name="ticket",
            name="status",
            field=models.CharField(
                choices=[
                    ("UNASSIGNED", "Unassigned"),
                    ("IN_PROGRESS", "In Progress"),
                    ("IN_REVIEW", "In Review"),
                    ("CLOSED", "Closed"),
                ],
                default="UNASSIGNED",
                max_length=20,
            ),
        ),
    ]
