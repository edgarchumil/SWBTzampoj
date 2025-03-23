from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Comunion
from .serializers import ComunionSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated


class ComunionViewSet(viewsets.ModelViewSet):
    queryset = Comunion.objects.all()
    serializer_class = ComunionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, pk=None):
        try:
            comunion = self.get_object()
            comunion.delete()
            return Response({'message': 'Registro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='total')
    def total(self, request):
        count = self.get_queryset().count()
        return Response({"count": count})

    def get_queryset(self):
        queryset = Comunion.objects.all()
        nombre = self.request.query_params.get('nombre', None)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        return queryset

        


class ComunionListCreate(generics.ListCreateAPIView):
    queryset = Comunion.objects.all()
    serializer_class = ComunionSerializer
    permission_classes = [IsAuthenticated]

class ComunionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comunion.objects.all()
    serializer_class = ComunionSerializer
    permission_classes = [IsAuthenticated]

# Cambiar el nombre de ComunionesCount a ComunionCount para que coincida con urls.py
class ComunionCount(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total = Comunion.objects.count()
        return Response({'total': total})


from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_todas_comuniones(request):
    """
    Función para listar todos los registros de comuniones sin paginación
    """
    try:
        # Obtener todas las comuniones ordenadas por libro, folio y partida
        comuniones = Comunion.objects.all().order_by('libro', 'folio', 'no_partida')
        
        # Convertir a lista de diccionarios
        comuniones_list = []
        for comunion in comuniones:
            comuniones_list.append({
                'id': comunion.id,
                'libro': comunion.libro,
                'folio': comunion.folio,
                'no_partida': comunion.no_partida,
                'nombre_comulgante': comunion.nombre_comulgante,
                'fecha_nacimiento': comunion.fecha_nacimiento.isoformat() if comunion.fecha_nacimiento else None,
                'fecha_comunion': comunion.fecha_comunion.isoformat() if comunion.fecha_comunion else None,
                'nombre_padre': comunion.nombre_padre,
                'nombre_madre': comunion.nombre_madre,
                'padrino': comunion.padrino,
                'madrina': comunion.madrina,
                'sacerdote': comunion.sacerdote,
                'nota': comunion.nota
            })
        
        # Devolver todos los registros sin paginación
        return JsonResponse({
            'count': len(comuniones_list),
            'results': comuniones_list
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

