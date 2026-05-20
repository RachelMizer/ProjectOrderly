import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0012_add_password_changed_at"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="DeletedAccount",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("first_name", models.CharField(blank=True, default="", max_length=150)),
                ("last_name", models.CharField(blank=True, default="", max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("role", models.CharField(blank=True, default="", max_length=20)),
                ("deleted_at", models.DateTimeField(auto_now_add=True)),
                ("deleted_by_name", models.CharField(blank=True, default="", max_length=300)),
                (
                    "deleted_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="deletions_performed",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-deleted_at"]},
        ),
    ]
