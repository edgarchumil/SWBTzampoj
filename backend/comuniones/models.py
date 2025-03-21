from django.db import models

class Comunion(models.Model):
    fecha_comunion = models.DateField()
    nombre_comulgante = models.CharField(max_length=200)
    fecha_nacimiento = models.DateField()
    nombre_padre = models.CharField(max_length=200, blank=True, null=True)
    nombre_madre = models.CharField(max_length=200, blank=True, null=True)
    padrino = models.CharField(max_length=200, blank=True, null=True)
    madrina = models.CharField(max_length=200, blank=True, null=True)
    no_partida = models.CharField(max_length=50)
    libro = models.CharField(max_length=50)
    folio = models.CharField(max_length=50)
    sacerdote = models.CharField(max_length=200)
    nota = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Comunión"
        verbose_name_plural = "Comuniones"
        ordering = ['-fecha_registro']
