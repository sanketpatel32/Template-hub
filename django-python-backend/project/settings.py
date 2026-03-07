from __future__ import annotations

import logging
from pathlib import Path

from project.env import get_settings
from project.logging import PrettyFormatter, RedactingJsonFormatter

BASE_DIR = Path(__file__).resolve().parent.parent
settings = get_settings()

SECRET_KEY = settings.django_secret_key
DEBUG = False
ALLOWED_HOSTS = settings.allowed_hosts

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'apps.api',
]

MIDDLEWARE = [
    'project.middleware.ErrorHandlingMiddleware',
    'project.middleware.RequestCorrelationMiddleware',
    'project.middleware.ReadinessMiddleware',
    'project.middleware.SecurityHeadersMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'project.middleware.CorsMiddleware',
    'project.middleware.RequestLoggingMiddleware',
    'project.middleware.RateLimitMiddleware',
]

ROOT_URLCONF = 'project.urls'
WSGI_APPLICATION = 'project.wsgi.application'
ASGI_APPLICATION = 'project.asgi.application'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

if settings.log_pretty and settings.node_env != 'production':
    formatter_class: type[logging.Formatter] = PrettyFormatter
else:
    formatter_class = RedactingJsonFormatter

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'structured': {
            '()': formatter_class,
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'structured',
            'level': settings.log_level.upper(),
        }
    },
    'root': {'handlers': ['console'], 'level': settings.log_level.upper()},
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': settings.log_level.upper(),
            'propagate': False,
        },
        'api.request': {
            'handlers': ['console'],
            'level': settings.log_level.upper(),
            'propagate': False,
        },
        'api.trace': {
            'handlers': ['console'],
            'level': settings.log_level.upper(),
            'propagate': False,
        },
    },
}

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
