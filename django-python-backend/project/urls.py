from __future__ import annotations

from django.http import HttpResponse, JsonResponse
from django.urls import include, path

from project.middleware import not_found_response, server_error_response
from project.openapi import schema

handler404 = not_found_response
handler500 = server_error_response


def openapi_json(_request):
    return JsonResponse(schema())


def docs(_request):
    html = """
    <!doctype html>
    <html>
      <head>
        <title>API Docs</title>
        <link rel='stylesheet' href='https://unpkg.com/swagger-ui-dist@5/swagger-ui.css' />
      </head>
      <body>
        <div id='swagger-ui'></div>
        <script src='https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'></script>
        <script>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui'});</script>
      </body>
    </html>
    """
    return HttpResponse(html)


urlpatterns = [
    path('', include('apps.api.urls')),
    path('openapi.json', openapi_json),
    path('docs', docs),
]
