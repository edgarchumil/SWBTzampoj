from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComunionViewSet
from . import views  # Añadimos esta importación para poder usar views.ComunionCount

router = DefaultRouter()
router.register(r'comuniones', ComunionViewSet, basename='comuniones')

urlpatterns = [
    path('', include(router.urls)),
    path('comunion/total/', views.ComunionCount.as_view(), name='comunion-count'),
    path('comuniones/todas/', views.listar_todas_comuniones, name='listar-todas-comuniones'),
]