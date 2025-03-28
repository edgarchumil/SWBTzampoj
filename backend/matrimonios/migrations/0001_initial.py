# Generated by Django 5.0.2 on 2025-03-18 06:14

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Matrimonio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_matrimonio', models.DateField()),
                ('nombre_esposo', models.CharField(max_length=200)),
                ('fecha_nacimiento_esposo', models.DateField()),
                ('lugar_nacimiento_esposo', models.CharField(max_length=200)),
                ('nombre_padre_esposo', models.CharField(blank=True, max_length=200)),
                ('nombre_madre_esposo', models.CharField(blank=True, max_length=200)),
                ('nombre_esposa', models.CharField(max_length=200)),
                ('fecha_nacimiento_esposa', models.DateField()),
                ('lugar_nacimiento_esposa', models.CharField(max_length=200)),
                ('nombre_padre_esposa', models.CharField(blank=True, max_length=200)),
                ('nombre_madre_esposa', models.CharField(blank=True, max_length=200)),
                ('padrino', models.CharField(blank=True, max_length=200)),
                ('madrina', models.CharField(blank=True, max_length=200)),
                ('no_partida', models.CharField(max_length=50)),
                ('libro', models.CharField(max_length=50)),
                ('folio', models.CharField(max_length=50)),
                ('parroco', models.CharField(max_length=200)),
                ('nota', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
