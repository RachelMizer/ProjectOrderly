from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tickets", "0003_add_backlog_item"),
    ]

    operations = [
        migrations.AddField(
            model_name="backlogitem",
            name="linked_tickets",
            field=models.ManyToManyField(
                blank=True,
                related_name="backlog_references",
                to="tickets.ticket",
            ),
        ),
    ]
