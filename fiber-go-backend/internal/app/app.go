package app

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"fiber-go-backend/internal/config"
	"fiber-go-backend/internal/errors"
	"fiber-go-backend/internal/handlers"
	"fiber-go-backend/internal/middleware"
	"fiber-go-backend/internal/observability"
	"fiber-go-backend/internal/routes"
	"fiber-go-backend/internal/state"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type Runtime struct {
	App       *fiber.App
	Readiness *state.Readiness
	Logger    *observability.Logger
	Cfg       config.Config
}

func New(cfg config.Config) *Runtime {
	logger := observability.NewLogger(cfg.LogLevel, cfg.LogPretty)
	metrics := observability.NewMetrics()
	readiness := state.NewReadiness()

	app := fiber.New(fiber.Config{ErrorHandler: middleware.NewErrorHandler(logger)})

	app.Use(recover.New())
	app.Use(middleware.RequestID())
	app.Use(middleware.TraceContext(cfg.TraceEnabled))
	app.Use(helmet.New())
	app.Use(cors.New(cors.Config{AllowOrigins: cfg.CORSOrigin}))
	app.Use(compress.New())
	app.Use(middleware.RequestLogger(logger, metrics))
	app.Use(limiter.New(limiter.Config{
		Max:        cfg.RateLimitMax,
		Expiration: cfg.RateLimitWindow,
		LimitReached: func(c *fiber.Ctx) error {
			return middleware.NewErrorHandler(logger)(c, errors.NewTooManyRequests("rate limit exceeded"))
		},
	}))

	h := handlers.New(readiness)
	routes.Register(app, h, cfg.MetricsEnabled)

	return &Runtime{App: app, Readiness: readiness, Logger: logger, Cfg: cfg}
}

func (r *Runtime) Run() error {
	go func() {
		_ = r.App.Listen(":" + r.Cfg.Port)
	}()
	return r.WaitForShutdown()
}

func (r *Runtime) WaitForShutdown() error {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
	ctx, cancel := context.WithTimeout(context.Background(), r.Cfg.ShutdownTimeout)
	defer cancel()
	return r.Shutdown(ctx)
}

func (r *Runtime) Shutdown(ctx context.Context) error {
	r.Readiness.SetReady(false)
	done := make(chan error, 1)
	go func() {
		done <- r.App.Shutdown()
	}()
	select {
	case err := <-done:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
}

func TestConfig() config.Config {
	return config.Config{
		Port:            "3000",
		AppEnv:          "test",
		CORSOrigin:      "*",
		RateLimitWindow: time.Second,
		RateLimitMax:    2,
		LogLevel:        "debug",
		LogPretty:       true,
		TrustProxy:      false,
		ShutdownTimeout: 500 * time.Millisecond,
		MetricsEnabled:  true,
		TraceEnabled:    true,
	}
}
