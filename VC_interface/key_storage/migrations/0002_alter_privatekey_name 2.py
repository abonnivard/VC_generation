# Generated by Django 4.2.9 on 2024-02-23 16:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('key_storage', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='privatekey',
            name='name',
            field=models.CharField(max_length=100),
        ),
    ]
