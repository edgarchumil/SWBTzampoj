from rest_framework import serializers
from .models import Actividad

class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = ['id', 'titulo', 'descripcion', 'fecha', 'lugar', 'estado', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']