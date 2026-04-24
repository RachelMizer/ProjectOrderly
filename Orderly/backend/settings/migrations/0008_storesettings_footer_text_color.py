from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("settings", "0007_storesettings_favicon"),
    ]

    operations = [
        migrations.AddField(
            model_name="storesettings",
            name="footer_text_color",
            field=models.CharField(blank=True, default="#dddddd", max_length=7),
        ),
    ]
