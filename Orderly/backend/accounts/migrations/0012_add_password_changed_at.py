from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0011_add_support_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="userrole",
            name="password_changed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
