from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/', include('bautismos.urls')),
    path('api/', include('comuniones.urls')),
    path('api/', include('confirmaciones.urls')),
    path('api/', include('matrimonios.urls')),
    path('api/', include('calendario.urls')),
]
