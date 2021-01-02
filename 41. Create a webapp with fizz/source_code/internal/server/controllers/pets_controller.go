package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/juju/errors"
	"gitlab.com/hmajid2301/articles/example-fizz-project/internal/server/models"
)

func GetPet(_ *gin.Context, params *models.PetParams) (models.Pet, error) {
	if params.Name != "bob" {
		return models.Pet{}, errors.NotFoundf("Pet %s", params.Name)
	}

	return models.Pet{
		Name:  "bob",
		Price: 100,
		Breed: "bengal",
	}, nil

}

func UpdatePet(_ *gin.Context, input *models.PetInput) (models.Pet, error) {
	if input.PetParams.Name != "bob" {
		return models.Pet{}, errors.NotFoundf("Pet %s", input.PetParams.Name)
	}

	return input.Pet, nil
}
