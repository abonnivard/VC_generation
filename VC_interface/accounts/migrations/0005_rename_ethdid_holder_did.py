# Generated by Django 4.2.9 on 2024-02-25 21:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_holder_ethdid_issuer_did'),
    ]

    operations = [
        migrations.RenameField(
            model_name='holder',
            old_name='ethdid',
            new_name='did',
        ),
    ]
