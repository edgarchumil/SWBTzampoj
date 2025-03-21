from django.db import models

class Actividad(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    fecha = models.DateTimeField()
    lugar = models.CharField(max_length=200)
    estado = models.CharField(max_length=20, choices=[
        ('programada', 'Programada'),
        ('en_curso', 'En Curso'),
        ('finalizada', 'Finalizada'),
        ('cancelada', 'Cancelada')
    ], default='programada')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['fecha']

    def __str__(self):
        return f"{self.titulo} - {self.fecha.strftime('%Y-%m-%d %H:%M')}"
