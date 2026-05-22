from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Region",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120, unique=True)),
                ("country", models.CharField(blank=True, default="US", max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Location",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("location_number", models.PositiveIntegerField(unique=True)),
                ("name", models.CharField(max_length=200)),
                ("region", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="locations",
                    to="locations.region",
                )),
                ("address", models.CharField(blank=True, default="", max_length=255)),
                ("city", models.CharField(blank=True, default="", max_length=120)),
                ("state", models.CharField(blank=True, default="", max_length=2)),
                ("zip_code", models.CharField(blank=True, default="", max_length=10)),
                ("phone", models.CharField(blank=True, default="", max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["location_number"],
            },
        ),
    ]
