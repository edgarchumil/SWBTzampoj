from rest_framework import serializers
from .models import Matrimonio

class MatrimonioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matrimonio
        fields = '__all__'