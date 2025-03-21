from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BautismoViewSet
from . import views 

router = DefaultRouter()
router.register(r'bautismos', BautismoViewSet, basename='bautismo')

urlpatterns = [
    path('', include(router.urls)),
    path('bautismo/count/', views.BautismoCount.as_view(), name='bautismo-count-alt'),
]