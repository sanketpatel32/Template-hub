package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"gin-go-backend/internal/config"
	apperrors "gin-go-backend/internal/errors"
	"gin-go-backend/internal/middleware"
	"gin-go-backend/internal/observability"
	"gin-go-backend/internal/routes"
	"gin-go-backend/internal/state"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type App struct {
	Engine    *gin.Engine
	Server    *http.Server
	Readiness *state.Readiness
	Logger    *slog.Logger
	Config    config.Env
}

func New(cfg config.Env) *App {
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	logger := observability.NewLogger(cfg.LogLevel, cfg.LogPretty)
	r := gin.New()
	readiness := state.NewReadiness(true)

	reg := prometheus.NewRegistry()
	m := observability.NewHTTPMetrics(reg)

	r.Use(middleware.RequestID())
	r.Use(middleware.RequestContext(logger, cfg.TraceEnabled))
	r.Use(securityHeaders())
	r.Use(cors.New(cors.Config{AllowOrigins: []string{cfg.CORSOrigin}, AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}, AllowHeaders: []string{"Origin", "Content-Type", "Authorization", "X-Request-Id", "X-Trace-Id"}}))
	r.Use(gzip.Gzip(gzip.DefaultCompression))
	r.Use(metricsMiddleware(m))
	r.Use(middleware.RateLimit(cfg.RateLimitWindow(), cfg.RateLimitMax))
	r.Use(middleware.ErrorHandler())
	r.Use(middleware.RecoveryAsError())

	routes.Register(r, routes.Ready(readiness))
	if cfg.MetricsEnabled {
		r.GET("/metrics", gin.WrapH(promhttp.HandlerFor(reg, promhttp.HandlerOpts{})))
	}
	r.GET("/openapi.json", func(c *gin.Context) { c.Data(http.StatusOK, "application/json", []byte(config.OpenAPISpec)) })
	r.GET("/docs", func(c *gin.Context) { c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(config.SwaggerUIHTML)) })
	r.NoRoute(middleware.NotFoundHandler)

	srv := &http.Server{Addr: ":" + cfg.Port, Handler: r}
	return &App{Engine: r, Server: srv, Readiness: readiness, Logger: logger, Config: cfg}
}

func (a *App) Run() error {
	errCh := make(chan error, 1)
	go func() {
		a.Logger.Info("server_starting", "addr", a.Server.Addr)
		if err := a.Server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigCh:
		a.Logger.Info("shutdown_signal", "signal", sig.String())
		return a.Shutdown(context.Background())
	case err := <-errCh:
		return fmt.Errorf("server failed: %w", err)
	}
}

func (a *App) Shutdown(ctx context.Context) error {
	a.Readiness.SetReady(false)
	timeoutCtx, cancel := context.WithTimeout(ctx, a.Config.ShutdownTimeout())
	defer cancel()
	return a.Server.Shutdown(timeoutCtx)
}

func securityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("Referrer-Policy", "no-referrer")
		c.Next()
	}
}

func metricsMiddleware(m *observability.HTTPMetrics) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}
		status := fmt.Sprintf("%d", c.Writer.Status())
		m.Requests.WithLabelValues(c.Request.Method, path, status).Inc()
		m.Duration.WithLabelValues(c.Request.Method, path, status).Observe(time.Since(start).Seconds())
	}
}

func ExampleInternalErrorRoute(r *gin.Engine) {
	r.GET("/__test/internal-error", func(c *gin.Context) {
		c.Error(apperrors.InternalServerError("test internal error"))
		c.Abort()
	})
}
