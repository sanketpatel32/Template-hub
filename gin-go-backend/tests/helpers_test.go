package tests

import (
	"gin-go-backend/internal/app"
	"gin-go-backend/internal/config"
)

func newTestApp() *app.App { return newTestAppWithLimit(1000) }

func newTestAppWithLimit(limit int) *app.App {
	cfg := config.Env{Port: "8080", AppEnv: "test", CORSOrigin: "*", RateLimitWindowMS: 60000, RateLimitMax: limit, LogLevel: "error", LogPretty: true, TrustProxy: false, ShutdownTimeoutMS: 1000, MetricsEnabled: true, TraceEnabled: true}
	a := app.New(cfg)
	app.ExampleInternalErrorRoute(a.Engine)
	return a
}
