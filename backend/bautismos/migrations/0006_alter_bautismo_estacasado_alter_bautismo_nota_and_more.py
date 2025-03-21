# Generated by Django 5.0.2 on 2025-03-13 16:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bautismos', '0005_bautismo_estacasado_bautismo_nota'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bautismo',
            name='estaCasado',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='bautismo',
            name='nota',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterModelTable(
            name='bautismo',
            table='bautismos',
        ),
    ]
