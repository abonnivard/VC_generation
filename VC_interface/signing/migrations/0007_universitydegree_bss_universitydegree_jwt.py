# Generated by Django 4.2.9 on 2024-03-13 14:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('signing', '0006_alter_universitydegree_did'),
    ]

    operations = [
        migrations.AddField(
            model_name='universitydegree',
            name='bss',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='universitydegree',
            name='jwt',
            field=models.BooleanField(default=False),
        ),
    ]
