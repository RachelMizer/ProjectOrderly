from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("settings", "0004_add_show_tagline"),
    ]

    operations = [
        migrations.AddField(model_name="storesettings", name="page_background_color",    field=models.CharField(blank=True, default="#ffffff", max_length=7)),
        migrations.AddField(model_name="storesettings", name="header_special_text_color", field=models.CharField(blank=True, default="#111111", max_length=7)),
        migrations.AddField(model_name="storesettings", name="header_text_color",         field=models.CharField(blank=True, default="#333333", max_length=7)),
        migrations.AddField(model_name="storesettings", name="nav_bg_color",              field=models.CharField(blank=True, default="#222222", max_length=7)),
        migrations.AddField(model_name="storesettings", name="nav_link_color",            field=models.CharField(blank=True, default="#ffffff", max_length=7)),
        migrations.AddField(model_name="storesettings", name="nav_text_color",            field=models.CharField(blank=True, default="#ffffff", max_length=7)),
        migrations.AddField(model_name="storesettings", name="main_link_color",           field=models.CharField(blank=True, default="#555555", max_length=7)),
        migrations.AddField(model_name="storesettings", name="main_text_color",           field=models.CharField(blank=True, default="#333333", max_length=7)),
        migrations.AddField(model_name="storesettings", name="footer_bg_color",           field=models.CharField(blank=True, default="#222222", max_length=7)),
        migrations.AddField(model_name="storesettings", name="footer_link_color",         field=models.CharField(blank=True, default="#ffffff", max_length=7)),
        migrations.AddField(model_name="storesettings", name="btn_bg_color",              field=models.CharField(blank=True, default="#eeeeee", max_length=7)),
        migrations.AddField(model_name="storesettings", name="btn_text_color",            field=models.CharField(blank=True, default="#333333", max_length=7)),
        migrations.AddField(model_name="storesettings", name="font_choice",               field=models.CharField(blank=True, default="munson",   max_length=50)),
    ]
