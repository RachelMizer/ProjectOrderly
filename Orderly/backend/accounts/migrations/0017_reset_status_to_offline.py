from django.db import migrations


def reset_all_statuses_to_offline(apps, schema_editor):
    UserRole = apps.get_model("accounts", "UserRole")
    UserRole.objects.all().update(status="OFFLINE")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0016_change_status_default_to_offline"),
    ]

    operations = [
        migrations.RunPython(reset_all_statuses_to_offline, migrations.RunPython.noop),
    ]
