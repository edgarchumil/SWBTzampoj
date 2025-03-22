from django.http import JsonResponse

def health_check(request):
    """Endpoint simple para verificar que el servidor está funcionando"""
    return JsonResponse({'status': 'ok'}, status=200)