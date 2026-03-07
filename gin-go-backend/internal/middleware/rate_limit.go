package middleware

import (
	"net"
	"sync"
	"time"

	apperrors "gin-go-backend/internal/errors"

	"github.com/gin-gonic/gin"
)

type limiterEntry struct {
	count int
	reset time.Time
}

type inMemoryLimiter struct {
	mu      sync.Mutex
	window  time.Duration
	max     int
	clients map[string]*limiterEntry
}

func RateLimit(window time.Duration, max int) gin.HandlerFunc {
	l := &inMemoryLimiter{window: window, max: max, clients: make(map[string]*limiterEntry)}
	return func(c *gin.Context) {
		ip := clientIP(c)
		now := time.Now()
		l.mu.Lock()
		e := l.clients[ip]
		if e == nil || now.After(e.reset) {
			e = &limiterEntry{count: 0, reset: now.Add(l.window)}
			l.clients[ip] = e
		}
		e.count++
		exceeded := e.count > l.max
		l.mu.Unlock()
		if exceeded {
			c.Error(apperrors.RateLimitExceededError("rate limit exceeded"))
			c.Abort()
			return
		}
		c.Next()
	}
}

func clientIP(c *gin.Context) string {
	host, _, err := net.SplitHostPort(c.Request.RemoteAddr)
	if err != nil {
		return c.ClientIP()
	}
	return host
}
