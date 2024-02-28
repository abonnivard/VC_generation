# Generated by Django 4.2.9 on 2024-02-25 14:49

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('key_storage', '0002_alter_privatekey_name 2'),
    ]

    operations = [
        migrations.CreateModel(
            name='JWTsignature',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jwt', models.TextField()),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
            ],
        ),
    ]