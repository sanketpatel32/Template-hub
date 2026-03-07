import os

from django.core.asgi import get_asgi_application

from project.readiness import install_signal_handlers, mark_ready

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
install_signal_handlers()
application = get_asgi_application()
mark_ready()
