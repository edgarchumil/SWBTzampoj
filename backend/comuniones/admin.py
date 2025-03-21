from django.contrib import admin
from .models import Comunion

@admin.register(Comunion)
class ComunionAdmin(admin.ModelAdmin):
    list_display = ('nombre_comulgante', 'fecha_comunion', 'no_partida', 'libro', 'folio')
    search_fields = ('nombre_comulgante', 'no_partida')
    list_filter = ('fecha_comunion',)
