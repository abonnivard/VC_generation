# Generated by Django 4.2.9 on 2024-03-04 20:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_holder_did_issuer_did'),
    ]

    operations = [
        migrations.AlterField(
            model_name='holder',
            name='did',
            field=models.CharField(default='', max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='issuer',
            name='did',
            field=models.CharField(default='', max_length=255, unique=True),
        ),
    ]
