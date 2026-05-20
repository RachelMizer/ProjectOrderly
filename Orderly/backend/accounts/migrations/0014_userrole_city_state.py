from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0013_add_deleted_account"),
    ]

    operations = [
        migrations.AddField(
            model_name="userrole",
            name="city",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="userrole",
            name="state",
            field=models.CharField(blank=True, default="", max_length=2),
        ),
    ]
