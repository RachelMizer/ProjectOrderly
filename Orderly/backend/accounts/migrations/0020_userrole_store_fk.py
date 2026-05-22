from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0019_add_store_manager_employee_roles"),
        ("locations", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="userrole",
            name="store",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="staff",
                to="locations.location",
            ),
        ),
    ]
