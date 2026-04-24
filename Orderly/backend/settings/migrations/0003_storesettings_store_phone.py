from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings', '0002_storesettings_hours_storesettings_hq_address_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='storesettings',
            name='store_phone',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
