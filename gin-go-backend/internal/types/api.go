package types

type SuccessResponse[T any] struct {
	Success bool           `json:"success"`
	Data    T              `json:"data"`
	Meta    map[string]any `json:"meta,omitempty"`
}

type ProblemDetails struct {
	Type      string `json:"type"`
	Title     string `json:"title"`
	Status    int    `json:"status"`
	Detail    string `json:"detail"`
	Instance  string `json:"instance,omitempty"`
	RequestID string `json:"requestId,omitempty"`
	TraceID   string `json:"traceId,omitempty"`
	SpanID    string `json:"spanId,omitempty"`
}
