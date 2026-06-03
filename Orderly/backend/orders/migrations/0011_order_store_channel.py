from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0010_alter_order_status"),
        ("locations", "0003_stateprovince_location_updates"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="store",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="orders",
                to="locations.location",
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="order_channel",
            field=models.CharField(
                choices=[("ONLINE", "Online"), ("IN_STORE", "In Store")],
                default="ONLINE",
                max_length=10,
            ),
        ),
    ]
