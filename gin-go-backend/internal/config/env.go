package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Env struct {
	Port              string
	AppEnv            string
	CORSOrigin        string
	RateLimitWindowMS int
	RateLimitMax      int
	LogLevel          string
	LogPretty         bool
	TrustProxy        bool
	ShutdownTimeoutMS int
	MetricsEnabled    bool
	TraceEnabled      bool
}

func LoadEnv() (Env, error) {
	must := func(k string) (string, error) {
		v := os.Getenv(k)
		if v == "" {
			return "", fmt.Errorf("missing required env var: %s", k)
		}
		return v, nil
	}
	port, err := must("PORT")
	if err != nil {
		return Env{}, err
	}
	appEnv, err := must("APP_ENV")
	if err != nil {
		return Env{}, err
	}
	cors, err := must("CORS_ORIGIN")
	if err != nil {
		return Env{}, err
	}
	rw, err := toInt("RATE_LIMIT_WINDOW_MS")
	if err != nil {
		return Env{}, err
	}
	rm, err := toInt("RATE_LIMIT_MAX")
	if err != nil {
		return Env{}, err
	}
	ll, err := must("LOG_LEVEL")
	if err != nil {
		return Env{}, err
	}
	lp, err := toBool("LOG_PRETTY")
	if err != nil {
		return Env{}, err
	}
	tp, err := toBool("TRUST_PROXY")
	if err != nil {
		return Env{}, err
	}
	sd, err := toInt("SHUTDOWN_TIMEOUT_MS")
	if err != nil {
		return Env{}, err
	}
	me, err := toBool("METRICS_ENABLED")
	if err != nil {
		return Env{}, err
	}
	te, err := toBool("TRACE_ENABLED")
	if err != nil {
		return Env{}, err
	}
	return Env{Port: port, AppEnv: appEnv, CORSOrigin: cors, RateLimitWindowMS: rw, RateLimitMax: rm, LogLevel: ll, LogPretty: lp, TrustProxy: tp, ShutdownTimeoutMS: sd, MetricsEnabled: me, TraceEnabled: te}, nil
}

func (e Env) ShutdownTimeout() time.Duration {
	return time.Duration(e.ShutdownTimeoutMS) * time.Millisecond
}
func (e Env) RateLimitWindow() time.Duration {
	return time.Duration(e.RateLimitWindowMS) * time.Millisecond
}

func toInt(key string) (int, error) {
	v, err := mustEnv(key)
	if err != nil {
		return 0, err
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return 0, fmt.Errorf("invalid int for %s", key)
	}
	return i, nil
}
func toBool(key string) (bool, error) {
	v, err := mustEnv(key)
	if err != nil {
		return false, err
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return false, fmt.Errorf("invalid bool for %s", key)
	}
	return b, nil
}
func mustEnv(key string) (string, error) {
	v := os.Getenv(key)
	if v == "" {
		return "", fmt.Errorf("missing required env var: %s", key)
	}
	return v, nil
}
