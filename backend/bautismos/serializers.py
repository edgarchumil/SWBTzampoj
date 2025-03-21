from rest_framework import serializers
from .models import Bautismo

class BautismoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bautismo
        fields = ['id', 'fechaBautismo', 'noPartida', 'nombre', 'fechaNacimiento', 
                 'nombrePadre', 'nombreMadre', 'padrino', 'madrina',
                 'libro', 'folio', 'parroco', 'estaCasado', 'nota']
        extra_kwargs = {
            'estaCasado': {'required': False},
            'nota': {'required': False}
        }