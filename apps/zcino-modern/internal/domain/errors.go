package domain

import "errors"

var (
	ErrNotFound   = errors.New("resource not found")
	ErrValidation = errors.New("validation failed")
)

type ValidationError struct {
	Message string
}

func (e ValidationError) Error() string {
	return e.Message
}

func (e ValidationError) Unwrap() error {
	return ErrValidation
}
