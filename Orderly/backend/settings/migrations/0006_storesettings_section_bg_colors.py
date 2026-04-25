from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("settings", "0005_storesettings_appearance"),
    ]

    operations = [
        migrations.AddField(model_name="storesettings", name="section_bg_1_color", field=models.CharField(blank=True, default="#f5f0e8", max_length=7)),
        migrations.AddField(model_name="storesettings", name="section_bg_2_color", field=models.CharField(blank=True, default="#e8f0f5", max_length=7)),
    ]
