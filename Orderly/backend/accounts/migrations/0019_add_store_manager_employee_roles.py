from django.db import migrations, models


def rename_business_to_store_manager(apps, schema_editor):
    UserRole = apps.get_model("accounts", "UserRole")
    UserRole.objects.filter(role="BUSINESS").update(role="STORE_MANAGER")


def rename_store_manager_to_business(apps, schema_editor):
    UserRole = apps.get_model("accounts", "UserRole")
    UserRole.objects.filter(role="STORE_MANAGER").update(role="BUSINESS")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0018_userrole_last_seen_at"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userrole",
            name="role",
            field=models.CharField(
                choices=[
                    ("STORE_MANAGER", "Store Manager"),
                    ("EMPLOYEE", "Employee"),
                    ("CUSTOMER", "Customer"),
                    ("EXECUTIVE", "Executive"),
                    ("SUPPORT", "Support"),
                ],
                default="CUSTOMER",
                max_length=20,
            ),
        ),
        migrations.RunPython(
            rename_business_to_store_manager,
            reverse_code=rename_store_manager_to_business,
        ),
    ]
