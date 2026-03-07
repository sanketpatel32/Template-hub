package types

type SuccessResponse[T any] struct {
	Data T `json:"data"`
}

func OK[T any](data T) SuccessResponse[T] {
	return SuccessResponse[T]{Data: data}
}
