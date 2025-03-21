from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatrimonioViewSet
from . import views  # Importación para poder usar views.MatrimonioCount

router = DefaultRouter()
router.register(r'matrimonios', MatrimonioViewSet, basename='matrimonios')

urlpatterns = [
    path('', include(router.urls)),
    path('matrimonio/total', views.MatrimonioCount.as_view(), name='matrimonio-count'),
    path('matrimonios/todos', views.listar_todos_matrimonios, name='listar_todos_matrimonios'),
]