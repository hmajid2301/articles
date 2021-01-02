package models

// PetParams is the params from request.
type PetParams struct {
	Name string `query:"name"`
}
