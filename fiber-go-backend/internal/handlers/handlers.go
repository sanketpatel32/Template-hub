package handlers

import (
	"fiber-go-backend/internal/errors"
	"fiber-go-backend/internal/state"
	"fiber-go-backend/internal/types"

	fiber "github.com/gofiber/fiber/v2"
)

type Handlers struct {
	Readiness *state.Readiness
}

func New(readiness *state.Readiness) *Handlers {
	return &Handlers{Readiness: readiness}
}

func (h *Handlers) Health(c *fiber.Ctx) error {
	return c.JSON(types.OK(map[string]string{"status": "ok"}))
}

func (h *Handlers) Ready(c *fiber.Ctx) error {
	if !h.Readiness.IsReady() {
		return errors.NewUnavailable("service is shutting down")
	}
	return c.JSON(types.OK(map[string]string{"status": "ready"}))
}

func (h *Handlers) Ping(c *fiber.Ctx) error {
	return c.JSON(types.OK(map[string]string{"message": "pong"}))
}

func (h *Handlers) InternalError(c *fiber.Ctx) error {
	return errors.NewInternal("forced internal error")
}
