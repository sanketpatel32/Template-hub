from django.http import JsonResponse

from apps.api.types.api import success_response


def ping_view(request):
    if request.GET.get('fail') == 'true':
        raise RuntimeError('forced failure')
    return JsonResponse(success_response({'message': 'pong'}))
