package routes

import (
	_ "embed"

	"fiber-go-backend/internal/errors"
	"fiber-go-backend/internal/handlers"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

//go:embed openapi.json
var openAPI []byte

const docsHTML = `<!doctype html>
<html><head><title>API Docs</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" /></head>
<body><div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>window.ui = SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui'});</script>
</body></html>`

func Register(app *fiber.App, h *handlers.Handlers, metricsEnabled bool) {
	app.Get("/health", h.Health)
	app.Get("/ready", h.Ready)
	if metricsEnabled {
		app.Get("/metrics", adaptor.HTTPHandler(promhttp.Handler()))
	} else {
		app.Get("/metrics", func(c *fiber.Ctx) error { return errors.NewNotFound("metrics disabled") })
	}

	v1 := app.Group("/api/v1")
	v1.Get("/ping", h.Ping)
	v1.Get("/test-error", h.InternalError)

	app.Get("/openapi.json", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.Send(openAPI)
	})
	app.Get("/docs", func(c *fiber.Ctx) error {
		c.Type("html")
		return c.SendString(docsHTML)
	})

	app.Use(func(c *fiber.Ctx) error {
		return errors.NewNotFound("route not found")
	})
}
