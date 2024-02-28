# Generated by Django 4.2.9 on 2024-02-23 17:02

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='UniversityDegree',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(default='', max_length=100)),
                ('institution', models.CharField(max_length=100)),
                ('year_of_graduation', models.CharField(max_length=15)),
                ('first_name', models.CharField(max_length=100)),
                ('name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('id_card_photo', models.CharField(max_length=100)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('status', models.CharField(default='unsigned', max_length=100)),
            ],
        ),
    ]
