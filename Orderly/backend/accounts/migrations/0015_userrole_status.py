from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0014_userrole_city_state"),
    ]

    operations = [
        migrations.AddField(
            model_name="userrole",
            name="status",
            field=models.CharField(
                max_length=10,
                choices=[
                    ("ONLINE", "Online"),
                    ("OFFLINE", "Offline"),
                    ("BUSY", "Busy"),
                    ("AWAY", "Away"),
                ],
                default="ONLINE",
            ),
        ),
    ]
