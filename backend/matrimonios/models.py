from django.db import models

class Matrimonio(models.Model):
    fecha_matrimonio = models.DateField()
    
    # Datos del Esposo
    nombre_esposo = models.CharField(max_length=200)
    fecha_nacimiento_esposo = models.DateField()
    lugar_nacimiento_esposo = models.CharField(max_length=200)
    nombre_padre_esposo = models.CharField(max_length=200, blank=True)
    nombre_madre_esposo = models.CharField(max_length=200, blank=True)
    
    # Datos de la Esposa
    nombre_esposa = models.CharField(max_length=200)
    fecha_nacimiento_esposa = models.DateField()
    lugar_nacimiento_esposa = models.CharField(max_length=200)
    nombre_padre_esposa = models.CharField(max_length=200, blank=True)
    nombre_madre_esposa = models.CharField(max_length=200, blank=True)
    
    # Datos Padrinos
    padrino = models.CharField(max_length=200, blank=True)
    madrina = models.CharField(max_length=200, blank=True)
    
    # Datos Registro
    no_partida = models.CharField(max_length=50)
    libro = models.CharField(max_length=50)
    folio = models.CharField(max_length=50)
    
    # Datos Sacerdote
    parroco = models.CharField(max_length=200)
    
    # Nota
    nota = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Matrimonio de {self.nombre_esposo} y {self.nombre_esposa}"
