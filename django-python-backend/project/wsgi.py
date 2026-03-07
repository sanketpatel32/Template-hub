import os

from django.core.wsgi import get_wsgi_application

from project.readiness import install_signal_handlers, mark_ready

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
install_signal_handlers()
application = get_wsgi_application()
mark_ready()
