from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Comunion
from .serializers import ComunionSerializer

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

