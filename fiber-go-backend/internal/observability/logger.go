package observability

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

type Logger struct {
	pretty bool
	level  string
}

func NewLogger(level string, pretty bool) *Logger {
	return &Logger{level: strings.ToLower(level), pretty: pretty}
}

func (l *Logger) Info(msg string, fields map[string]any) {
	l.log("info", msg, fields)
}

func (l *Logger) Error(msg string, fields map[string]any) {
	l.log("error", msg, fields)
}

func (l *Logger) log(level, msg string, fields map[string]any) {
	payload := map[string]any{
		"timestamp": time.Now().UTC().Format(time.RFC3339Nano),
		"level":     level,
		"message":   msg,
	}
	for k, v := range fields {
		if isSensitive(k) {
			payload[k] = "[REDACTED]"
			continue
		}
		payload[k] = v
	}

	if l.pretty {
		log.Println(formatPretty(payload))
		return
	}
	enc := json.NewEncoder(os.Stdout)
	_ = enc.Encode(payload)
}

func isSensitive(key string) bool {
	k := strings.ToLower(key)
	return strings.Contains(k, "password") || strings.Contains(k, "token") || strings.Contains(k, "secret")
}

func formatPretty(payload map[string]any) string {
	return fmt.Sprintf("[%s] %s %s req=%v trace=%v span=%v status=%v durMs=%v",
		payload["timestamp"], payload["level"], payload["message"], payload["requestId"], payload["traceId"], payload["spanId"], payload["status"], payload["durationMs"],
	)
}
