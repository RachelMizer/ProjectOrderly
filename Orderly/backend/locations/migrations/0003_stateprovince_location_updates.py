from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("locations", "0002_location_email"),
    ]

    operations = [
        migrations.CreateModel(
            name="StateProvince",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("abbreviation", models.CharField(blank=True, default="", max_length=10)),
                ("region", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="states",
                    to="locations.region",
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["name"],
                "unique_together": {("region", "name")},
            },
        ),
        migrations.AddField(
            model_name="location",
            name="state_province",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="locations",
                to="locations.stateprovince",
            ),
        ),
        migrations.AddField(
            model_name="location",
            name="manager_name",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
    ]
