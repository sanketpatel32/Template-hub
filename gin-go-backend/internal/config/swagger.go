package config

const OpenAPISpec = `{"openapi":"3.0.3","info":{"title":"gin-go-backend API","version":"1.0.0"},"paths":{"/health":{"get":{"responses":{"200":{"description":"OK"}}}},"/ready":{"get":{"responses":{"200":{"description":"Ready"},"503":{"description":"Not Ready"}}}},"/metrics":{"get":{"responses":{"200":{"description":"Prometheus metrics"}}}},"/api/v1/ping":{"get":{"responses":{"200":{"description":"pong"}}}}}}`

const SwaggerUIHTML = `<!doctype html><html><head><title>API Docs</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script><script>window.onload=()=>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui'});</script></body></html>`
