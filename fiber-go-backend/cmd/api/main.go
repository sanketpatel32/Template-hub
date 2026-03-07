package main

import (
	"log"

	"fiber-go-backend/internal/app"
	"fiber-go-backend/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	runtime := app.New(cfg)
	if err := runtime.Run(); err != nil {
		log.Fatalf("server exited with error: %v", err)
	}
}
