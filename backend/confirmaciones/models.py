from django.db import models

class Confirmacion(models.Model):
    fecha_confirmacion = models.DateField()
    nombre_confirmante = models.CharField(max_length=200)
    fecha_nacimiento = models.DateField()
    nombre_padre = models.CharField(max_length=200, blank=True)
    nombre_madre = models.CharField(max_length=200, blank=True)
    padrino = models.CharField(max_length=200, blank=True)
    madrina = models.CharField(max_length=200, blank=True)
    no_partida = models.CharField(max_length=50)
    libro = models.CharField(max_length=50)
    folio = models.CharField(max_length=50)
    sacerdote = models.CharField(max_length=200)
    nota = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['no_partida', 'libro', 'folio']
