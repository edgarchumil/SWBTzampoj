from rest_framework import serializers
from .models import Confirmacion

class ConfirmacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confirmacion
        fields = '__all__'