from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Bautismo
from .serializers import BautismoSerializer

class BautismoViewSet(viewsets.ModelViewSet):
    queryset = Bautismo.objects.all()
    serializer_class = BautismoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        data = self.request.data
        estaCasado = data.get('estaCasado', False)
        nota = data.get('nota', '')
        serializer.save(estaCasado=estaCasado, nota=nota)

    def perform_update(self, serializer):
        data = self.request.data
        estaCasado = data.get('estaCasado', False)
        nota = data.get('nota', '')
        serializer.save(estaCasado=estaCasado, nota=nota)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        # Asegurar que los campos estén incluidos en la respuesta
        data['estaCasado'] = instance.estaCasado
        data['nota'] = instance.nota
        return Response(data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        # Incluir los campos en cada registro
        for item in data:
            bautismo = queryset.get(id=item['id'])
            item['estaCasado'] = bautismo.estaCasado
            item['nota'] = bautismo.nota
        return Response(data)

    def destroy(self, request, pk=None):
        try:
            bautismo = self.get_object()
            bautismo.delete()
            return Response({'message': 'Registro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        queryset = Bautismo.objects.all()
        nombre = self.request.query_params.get('nombre', None)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        return queryset


from rest_framework import generics

class BautismoListCreate(generics.ListCreateAPIView):
    queryset = Bautismo.objects.all()
    serializer_class = BautismoSerializer

class BautismoRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bautismo.objects.all()
    serializer_class = BautismoSerializer

class BautismoCount(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total = Bautismo.objects.count()
        print(f"Total de bautismos encontrados: {total}")
        return Response({
            'total': total,
            'count': total  # Incluir ambos formatos para compatibilidad
        })
