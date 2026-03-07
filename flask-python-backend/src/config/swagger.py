OPENAPI_SPEC: dict[str, object] = {
    'openapi': '3.0.3',
    'info': {'title': 'Flask Python Backend Template', 'version': '1.0.0'},
    'paths': {
        '/health': {
            'get': {'summary': 'Health check', 'responses': {'200': {'description': 'OK'}}}
        },
        '/ready': {
            'get': {
                'summary': 'Readiness check',
                'responses': {'200': {'description': 'Ready'}, '503': {'description': 'Not ready'}},
            }
        },
        '/metrics': {
            'get': {
                'summary': 'Prometheus metrics',
                'responses': {'200': {'description': 'Prometheus text metrics'}},
            }
        },
        '/api/v1/ping': {
            'get': {'summary': 'Ping endpoint', 'responses': {'200': {'description': 'Pong'}}}
        },
    },
}

SWAGGER_UI_HTML = """<!doctype html>
<html>
  <head>
    <meta charset='utf-8'>
    <title>API Docs</title>
    <link rel='stylesheet' href='https://unpkg.com/swagger-ui-dist@5/swagger-ui.css'>
  </head>
  <body>
    <div id='swagger-ui'></div>
    <script src='https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'></script>
    <script>
      window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });
    </script>
  </body>
</html>"""
