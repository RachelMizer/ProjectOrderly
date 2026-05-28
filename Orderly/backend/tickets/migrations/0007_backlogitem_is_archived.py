from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tickets", "0006_add_case_notes"),
    ]

    operations = [
        migrations.AddField(
            model_name="backlogitem",
            name="is_archived",
            field=models.BooleanField(default=False),
        ),
    ]
