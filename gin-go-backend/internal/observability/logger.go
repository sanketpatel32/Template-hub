package observability

import (
	"context"
	"log/slog"
	"os"
	"strings"
)

func NewLogger(level string, pretty bool) *slog.Logger {
	var l slog.Level
	switch strings.ToLower(level) {
	case "debug":
		l = slog.LevelDebug
	case "warn":
		l = slog.LevelWarn
	case "error":
		l = slog.LevelError
	default:
		l = slog.LevelInfo
	}
	opts := &slog.HandlerOptions{Level: l, ReplaceAttr: redact}
	if pretty {
		return slog.New(slog.NewTextHandler(os.Stdout, opts))
	}
	return slog.New(slog.NewJSONHandler(os.Stdout, opts))
}

func redact(_ []string, a slog.Attr) slog.Attr {
	if strings.Contains(strings.ToLower(a.Key), "authorization") || strings.Contains(strings.ToLower(a.Key), "password") {
		return slog.String(a.Key, "[REDACTED]")
	}
	return a
}

func LogTrace(ctx context.Context, logger *slog.Logger, enabled bool, msg string, attrs ...any) {
	if enabled {
		logger.InfoContext(ctx, msg, attrs...)
	}
}
