from django.contrib import admin
from .models import Bautismo

@admin.register(Bautismo)
class BautismoAdmin(admin.ModelAdmin):
    list_display = ('noPartida', 'nombre', 'fechaNacimiento', 'libro', 'folio', 'parroco')
    search_fields = ('nombre', 'noPartida')
    list_filter = ('libro', 'parroco')
