from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConfirmacionViewSet
from . import views  # Importación para poder usar views.ConfirmacionCount

router = DefaultRouter()
router.register(r'confirmaciones', ConfirmacionViewSet, basename='confirmaciones')

urlpatterns = [
    path('', include(router.urls)),
    path('confirmacion/total', views.ConfirmacionCount.as_view(), name='confirmacion-count'),
]