from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Matrimonio
from .serializers import MatrimonioSerializer
from django.core.paginator import Paginator
import json

class MatrimonioViewSet(viewsets.ModelViewSet):
    queryset = Matrimonio.objects.all()
    serializer_class = MatrimonioSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, pk=None):
        try:
            matrimonio = self.get_object()
            matrimonio.delete()
            return Response({'message': 'Registro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    # Mover el método get_queryset aquí, donde pertenece
    def get_queryset(self):
        queryset = Matrimonio.objects.all()
        nombre = self.request.query_params.get('nombre', None)
        if nombre:
            queryset = queryset.filter(Q(esposo__icontains=nombre) | Q(esposa__icontains=nombre))
        return queryset

class MatrimonioCount(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total = Matrimonio.objects.count()
        return Response({'total': total})


@csrf_exempt
@require_http_methods(["GET"])
def listar_todos_matrimonios(request):
    """
    Función para listar todos los registros de matrimonios sin paginación
    """
    try:
        # Obtener todos los matrimonios ordenados por fecha de matrimonio (descendente)
        matrimonios = Matrimonio.objects.all().order_by('-fecha_matrimonio')
        
        # Convertir a lista de diccionarios
        matrimonios_list = []
        for matrimonio in matrimonios:
            matrimonios_list.append({
                'id': matrimonio.id,
                'libro': matrimonio.libro,
                'nombre_esposo': matrimonio.nombre_esposo,
                'nombre_esposa': matrimonio.nombre_esposa,
                'fecha_matrimonio': matrimonio.fecha_matrimonio.isoformat() if matrimonio.fecha_matrimonio else None,
                'folio': matrimonio.folio,
                'no_partida': matrimonio.no_partida,
                'padrino': matrimonio.padrino,
                'madrina': matrimonio.madrina,
                'parroco': matrimonio.parroco,
                'nota': matrimonio.nota,
                'fecha_nacimiento_esposo': matrimonio.fecha_nacimiento_esposo.isoformat() if matrimonio.fecha_nacimiento_esposo else None,
                'lugar_nacimiento_esposo': matrimonio.lugar_nacimiento_esposo,
                'nombre_padre_esposo': matrimonio.nombre_padre_esposo,
                'nombre_madre_esposo': matrimonio.nombre_madre_esposo,
                'fecha_nacimiento_esposa': matrimonio.fecha_nacimiento_esposa.isoformat() if matrimonio.fecha_nacimiento_esposa else None,
                'lugar_nacimiento_esposa': matrimonio.lugar_nacimiento_esposa,
                'nombre_padre_esposa': matrimonio.nombre_padre_esposa,
                'nombre_madre_esposa': matrimonio.nombre_madre_esposa,
            })
        
        # Devolver todos los registros sin paginación
        return JsonResponse({
            'count': len(matrimonios_list),
            'results': matrimonios_list
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
