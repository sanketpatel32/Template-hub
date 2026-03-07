package observability

import (
	"crypto/rand"
	"encoding/hex"
)

func NewID(bytes int) string {
	b := make([]byte, bytes)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
