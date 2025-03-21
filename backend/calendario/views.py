from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Actividad
from .serializers import ActividadSerializer
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def por_mes(self, request):
        mes = request.query_params.get('mes')
        anio = request.query_params.get('anio')
        
        if mes and anio:
            actividades = self.queryset.filter(
                fecha__year=anio,
                fecha__month=mes
            )
        else:
            now = timezone.now()
            actividades = self.queryset.filter(
                fecha__year=now.year,
                fecha__month=now.month
            )
        
        serializer = self.get_serializer(actividades, many=True)
        return Response(serializer.data)
