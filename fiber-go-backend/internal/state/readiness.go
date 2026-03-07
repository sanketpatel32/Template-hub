package state

import "sync/atomic"

type Readiness struct {
	ready atomic.Bool
}

func NewReadiness() *Readiness {
	r := &Readiness{}
	r.ready.Store(true)
	return r
}

func (r *Readiness) SetReady(v bool) {
	r.ready.Store(v)
}

func (r *Readiness) IsReady() bool {
	return r.ready.Load()
}
