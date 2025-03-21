from rest_framework import serializers
from .models import Comunion

class ComunionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comunion
        fields = '__all__'