from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0017_reset_status_to_offline"),
    ]

    operations = [
        migrations.AddField(
            model_name="userrole",
            name="last_seen_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
