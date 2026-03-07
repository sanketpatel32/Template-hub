package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port            string
	AppEnv          string
	CORSOrigin      string
	RateLimitWindow time.Duration
	RateLimitMax    int
	LogLevel        string
	LogPretty       bool
	TrustProxy      bool
	ShutdownTimeout time.Duration
	MetricsEnabled  bool
	TraceEnabled    bool
}

func Load() (Config, error) {
	cfg := Config{}
	var err error

	if cfg.Port, err = required("PORT"); err != nil {
		return Config{}, err
	}
	if cfg.AppEnv, err = required("APP_ENV"); err != nil {
		return Config{}, err
	}
	if cfg.CORSOrigin, err = required("CORS_ORIGIN"); err != nil {
		return Config{}, err
	}

	rateLimitWindowMS, err := requiredInt("RATE_LIMIT_WINDOW_MS")
	if err != nil {
		return Config{}, err
	}
	cfg.RateLimitWindow = time.Duration(rateLimitWindowMS) * time.Millisecond

	if cfg.RateLimitMax, err = requiredInt("RATE_LIMIT_MAX"); err != nil {
		return Config{}, err
	}
	if cfg.LogLevel, err = required("LOG_LEVEL"); err != nil {
		return Config{}, err
	}
	if cfg.LogPretty, err = requiredBool("LOG_PRETTY"); err != nil {
		return Config{}, err
	}
	if cfg.TrustProxy, err = requiredBool("TRUST_PROXY"); err != nil {
		return Config{}, err
	}
	shutdownTimeoutMS, err := requiredInt("SHUTDOWN_TIMEOUT_MS")
	if err != nil {
		return Config{}, err
	}
	cfg.ShutdownTimeout = time.Duration(shutdownTimeoutMS) * time.Millisecond
	if cfg.MetricsEnabled, err = requiredBool("METRICS_ENABLED"); err != nil {
		return Config{}, err
	}
	if cfg.TraceEnabled, err = requiredBool("TRACE_ENABLED"); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

func required(key string) (string, error) {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return "", fmt.Errorf("missing required env var %s", key)
	}
	return v, nil
}

func requiredInt(key string) (int, error) {
	v, err := required(key)
	if err != nil {
		return 0, err
	}
	parsed, err := strconv.Atoi(v)
	if err != nil {
		return 0, fmt.Errorf("invalid int for %s: %w", key, err)
	}
	return parsed, nil
}

func requiredBool(key string) (bool, error) {
	v, err := required(key)
	if err != nil {
		return false, err
	}
	parsed, err := strconv.ParseBool(v)
	if err != nil {
		return false, fmt.Errorf("invalid bool for %s: %w", key, err)
	}
	return parsed, nil
}
