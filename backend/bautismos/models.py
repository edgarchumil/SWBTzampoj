from django.db import models

class Bautismo(models.Model):
    noPartida = models.IntegerField()
    nombre = models.CharField(max_length=200)
    fechaBautismo = models.DateField(verbose_name="Fecha de Bautismo", null=True, blank=True)
    fechaNacimiento = models.DateField()
    nombrePadre = models.CharField(max_length=100, null=True, blank=True)
    nombreMadre = models.CharField(max_length=100, null=True, blank=True)
    padrino = models.CharField(max_length=100, null=True, blank=True)
    madrina = models.CharField(max_length=100, null=True, blank=True)
    libro = models.IntegerField()
    folio = models.IntegerField()
    parroco = models.CharField(max_length=200)
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    fechaActualizacion = models.DateTimeField(auto_now=True)
    estaCasado = models.BooleanField(default=False)
    nota = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'bautismos'
        ordering = ['-fechaCreacion']
        verbose_name = 'Bautismo'
        verbose_name_plural = 'Bautismos'

    def __str__(self):
        return f"{self.nombre} - Partida: {self.noPartida}"
