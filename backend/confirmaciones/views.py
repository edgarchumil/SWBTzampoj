from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Confirmacion
from .serializers import ConfirmacionSerializer

class ConfirmacionViewSet(viewsets.ModelViewSet):
    queryset = Confirmacion.objects.all()
    serializer_class = ConfirmacionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, pk=None):
        try:
            confirmacion = self.get_object()
            confirmacion.delete()
            return Response({'message': 'Registro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ConfirmacionListCreate(generics.ListCreateAPIView):
    queryset = Confirmacion.objects.all()
    serializer_class = ConfirmacionSerializer
    permission_classes = [IsAuthenticated]

class ConfirmacionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Confirmacion.objects.all()
    serializer_class = ConfirmacionSerializer
    permission_classes = [IsAuthenticated]

class ConfirmacionCount(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total = Confirmacion.objects.count()
        return Response({'total': total})
