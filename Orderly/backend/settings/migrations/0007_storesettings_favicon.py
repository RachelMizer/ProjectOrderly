from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("settings", "0006_storesettings_section_bg_colors"),
    ]

    operations = [
        migrations.AddField(
            model_name="storesettings",
            name="favicon",
            field=models.ImageField(blank=True, null=True, upload_to="store/"),
        ),
    ]
