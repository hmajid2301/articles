package models

type Pet struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
	Breed string `json:"breed"`
}
