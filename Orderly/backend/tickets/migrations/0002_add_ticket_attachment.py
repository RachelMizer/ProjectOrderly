from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tickets", "0001_initial_ticket_model"),
    ]

    operations = [
        migrations.AddField(
            model_name="ticket",
            name="attachment",
            field=models.FileField(blank=True, null=True, upload_to="ticket_attachments/"),
        ),
    ]
