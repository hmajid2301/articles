package server

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/juju/errors"
	"github.com/loopfz/gadgeto/tonic"
	"github.com/wI2L/fizz"
	"github.com/wI2L/fizz/openapi"
	"gitlab.com/hmajid2301/articles/example-fizz-project/internal/server/controllers"
	"gitlab.com/hmajid2301/articles/example-fizz-project/internal/server/models"
)

// NewRouter creates all the routes/endpoints, using Fizz.
func NewRouter() (*fizz.Fizz, error) {
	engine := gin.New()

	engine.Use(cors.Default())

	fizzApp := fizz.NewFromEngine(engine)

	infos := &openapi.Info{
		Title:       "Example API",
		Description: "The API definition for the Example API.",
		Version:     "1.0.0",
	}

	fizzApp.GET("/openapi.json", nil, fizzApp.OpenAPI(infos, "json"))

	group := fizzApp.Group("", "endpoints", "All of the endpoints.")
	group.GET("/healthcheck", []fizz.OperationOption{
		fizz.Summary("Checks API is healthy."),
		fizz.Response(fmt.Sprint(http.StatusInternalServerError), "Server Error", models.APIError{}, nil, nil),
	}, tonic.Handler(controllers.Healthcheck, http.StatusOK))

	group.GET("/pets:name", []fizz.OperationOption{
		fizz.Summary("Get a pet by name."),
		fizz.Response(fmt.Sprint(http.StatusInternalServerError), "Server Error", models.APIError{}, nil, nil),
		fizz.Response(fmt.Sprint(http.StatusNotFound), "Pet Not Found", models.APIError{}, nil, nil),
	}, tonic.Handler(controllers.GetPet, http.StatusOK))

	group.PUT("/pets:name", []fizz.OperationOption{
		fizz.Summary("Update a pet."),
		fizz.Response(fmt.Sprint(http.StatusInternalServerError), "Server Error", models.APIError{}, nil, nil),
	}, tonic.Handler(controllers.UpdatePet, http.StatusOK))

	if len(fizzApp.Errors()) != 0 {
		return nil, fmt.Errorf("fizz errors: %v", fizzApp.Errors())
	}
	tonic.SetErrorHook(errHook)
	return fizzApp, nil
}

func errHook(_ *gin.Context, e error) (int, interface{}) {
	code, msg := http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError)

	if _, ok := e.(tonic.BindError); ok {
		code, msg = http.StatusBadRequest, e.Error()
	} else {
		switch {
		case errors.IsBadRequest(e), errors.IsNotValid(e), errors.IsNotSupported(e), errors.IsNotProvisioned(e):
			code, msg = http.StatusBadRequest, e.Error()
		case errors.IsForbidden(e):
			code, msg = http.StatusForbidden, e.Error()
		case errors.IsMethodNotAllowed(e):
			code, msg = http.StatusMethodNotAllowed, e.Error()
		case errors.IsNotFound(e), errors.IsUserNotFound(e):
			code, msg = http.StatusNotFound, e.Error()
		case errors.IsUnauthorized(e):
			code, msg = http.StatusUnauthorized, e.Error()
		case errors.IsAlreadyExists(e):
			code, msg = http.StatusConflict, e.Error()
		case errors.IsNotImplemented(e):
			code, msg = http.StatusNotImplemented, e.Error()
		}
	}
	err := models.APIError{
		Message: msg,
	}
	return code, err
}
