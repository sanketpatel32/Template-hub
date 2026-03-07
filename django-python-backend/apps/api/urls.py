from django.urls import path

from apps.api.views.health import health_view, ready_view
from apps.api.views.metrics import metrics_view
from apps.api.views.ping import ping_view

urlpatterns = [
    path('health', health_view),
    path('ready', ready_view),
    path('metrics', metrics_view),
    path('api/v1/ping', ping_view),
]
