# Generated by Django 4.2.9 on 2024-02-25 21:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_holder_uuid'),
    ]

    operations = [
        migrations.AddField(
            model_name='holder',
            name='ethdid',
            field=models.CharField(default='did:ethr:example', max_length=100),
        ),
        migrations.AddField(
            model_name='issuer',
            name='did',
            field=models.CharField(default='did:ethr:example', max_length=100),
        ),
    ]
