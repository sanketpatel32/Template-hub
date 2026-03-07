package routes

import (
	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine, readiness gin.HandlerFunc) {
	r.GET("/health", Health)
	r.GET("/ready", readiness)
	v1 := r.Group("/api/v1")
	v1.GET("/ping", Ping)
}
