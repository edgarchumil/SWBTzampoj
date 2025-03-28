# Generated by Django 5.0.2 on 2025-03-11 00:15

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Bautismo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('noPartida', models.IntegerField(unique=True)),
                ('nombre', models.CharField(max_length=200)),
                ('fechaNacimiento', models.DateField()),
                ('nombrePadre', models.CharField(blank=True, max_length=200)),
                ('nombreMadre', models.CharField(max_length=200)),
                ('padrino', models.CharField(max_length=200)),
                ('madrina', models.CharField(max_length=200)),
                ('libro', models.IntegerField()),
                ('folio', models.IntegerField()),
                ('parroco', models.CharField(max_length=200)),
                ('fechaCreacion', models.DateTimeField(auto_now_add=True)),
                ('fechaActualizacion', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Bautismo',
                'verbose_name_plural': 'Bautismos',
                'ordering': ['-fechaCreacion'],
            },
        ),
    ]
