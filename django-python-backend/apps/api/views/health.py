from django.http import JsonResponse

from apps.api.errors.http_errors import ServiceUnavailableError
from apps.api.types.api import problem_details, success_response
from project.readiness import is_ready


def health_view(_request):
    return JsonResponse(success_response({'status': 'ok'}))


def ready_view(request):
    if is_ready():
        return JsonResponse(success_response({'status': 'ready'}))
    error = ServiceUnavailableError(detail='Service is shutting down')
    return JsonResponse(problem_details(error, request), status=503)
