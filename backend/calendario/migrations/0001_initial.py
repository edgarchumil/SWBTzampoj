# Generated by Django 5.0.2 on 2025-03-19 19:10

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Actividad',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=200)),
                ('descripcion', models.TextField()),
                ('fecha', models.DateTimeField()),
                ('lugar', models.CharField(max_length=200)),
                ('estado', models.CharField(choices=[('programada', 'Programada'), ('en_curso', 'En Curso'), ('finalizada', 'Finalizada'), ('cancelada', 'Cancelada')], default='programada', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['fecha'],
            },
        ),
    ]
