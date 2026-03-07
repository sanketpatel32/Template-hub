package main

import (
	"log"

	"gin-go-backend/internal/app"
	"gin-go-backend/internal/config"
)

func main() {
	cfg, err := config.LoadEnv()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}
	a := app.New(cfg)
	if err := a.Run(); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
