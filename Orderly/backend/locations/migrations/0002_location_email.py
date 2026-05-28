from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("locations", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="location",
            name="email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
    ]
