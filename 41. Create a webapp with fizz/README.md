---
title: "How to create a Golang Web Application using Fizz"
tags: ["golang", "web-app", "fizz", "gin", "openapi"]
license: "public-domain"
slug: "golang-fizz-web-app"
canonical_url: "https://haseebmajid.dev/blog/golang-fizz-web-app/"
date: "2021-01-19"
published: true
cover_image: "images/cover.png"
---

> Cover Photo from [Clipartmax](https://www.clipartmax.com/middle/m2i8m2K9G6K9N4d3_learn-golang-in-your-own-sandbox-golang-gopher/) and [Fizz Logo](https://github.com/wI2L/fizz)

# Background

A bit of background before we start the article. When I develop a Python web service I use the
[Connexion library created by Zalando](https://github.com/zalando/connexion). It's a great library which is built on top of
Flask. It uses an OpenAPI Specification (OAS) file to handle input validation and routing for you. Therefore reducing the boilerplate code you need to write.

The main advantage of this is that we have a design-first approach to developing our API. We fully define the
OAS then develop the code/web service. This also keeps the OAS up to date, helping to mitigate the issue of the
code/documentation getting out of date. Especially when you share the OAS with other people (clients) to use. The last
thing you want to do is give them an out-of-date file.

Anyways short story aside, recently I started learning Golang and developing a simple CRUD web service using Gin.
However, I discovered (at least at the time of writing) there was no equivalent library to Connexion. The closest
library I could find was Fizz.

## What is Fizz?

Fizz almost works the opposite way Connexion does. It generates an OAS
file from our code. Now again I prefer the Connexion approach because we just use
the OAS file we created at the beginning of the project. However, this is the next best thing.

What I ended up doing was creating an OAS by hand. Then implementing that OAS using Golang and letting Fizz
auto-generate the "new" OAS. This "new" OAS is the one that gets shared with clients and is kept up to date.
In theory the OAS I defined manually can now be deleted as it's not required anymore.

This solves the problem of our code getting out-of-date with the specification.
Fizz also uses other libraries behind the scenes to help us reduce the boilerplate code similiar to
how Connexion works.

# Web Service

Now onto the real meat and potatoes of this article. We will create three different endpoints:

- GET /healthcheck: Checks if the application is healthy or not
- GET /pet/{name}: Get information about a single pet
- PUT /pet/{name}: Update information about a single pet

## Structure

```bash
├── cmd
│   └── example-fizz-project
│       └── main.go
├── go.mod
├── go.sum
└── internal
    └── server
        ├── controllers
        │   ├── maintenance_controllers.go
        │   └── pets_controller.go
        ├── models
        │   ├── error.go
        │   ├── healthcheck.go
        │   ├── input.go
        │   ├── params.go
        │   └── pets.go
        └── routes.go
```

Our project will follow the structure shown above. We will go (no pun intended 🤷) over what each of the folder "do".

:::note Core Code
Since this example application is so simple we don't have a `core` folder but for more complicated
applications you should probably add another folder inline with the `server` folder. For example, this could include code that interacts with the database.

This helps to de-couple the application's various layers. You could, for example, remove the web service part in the `server` folder and
turn into a CLI application at a later date. Using the core code you already have.
:::

## Dependencies

The main dependency for this project is [Fizz](https://github.com/wI2L/fizz). Simply run `go get github.com/wI2L/fizz` to
install it.

## internal

The main logic of our web service will be stored within the `internal` folder.

### server

This folder contains all the logic related to the web service itself. This will include
models (data structure returned to the client) and the controllers, which are functions
that will handle the various requests sent by clients. They act as an "interface" to our application.

:::note Fizz Routing
The Fizz library abstracts away routing partially for us, more on this later.
:::

#### models

This folder contains all the data structure and data types that will be received by the application
from the client or sent back to the client from the application. For example:

```go
package models

type Pet struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
	Breed string `json:"breed"`
}
```

This will be the object sent back to the client when they request to get a pet. Note the use of struct tags
`json:"name"`. When the data is unmarshaled from JSON to this struct (again we will see how this done later) the `Name`
field will look for the `name` field in the JSON file. Later on we will see why we need to specify struct tags and not
just us being explicit.

```go
package models

type PetParams struct {
	Name string `query:"name"`
}
```

Note the struct tag in this example is `query` and not `json` because it's used as a query parameter.
We also have one final type of model to take a look at:

```go
package models

type PetInput struct {
	PetParams
	Pet
}

```

This model is used when we need to pass both a Pet struct in the body of a request and also a query parameter. Again
we will see exactly how we use this model a bit later.

#### controllers

The controllers folder contains the main web service logic for the application. It contains the one function for every
route/endpoint you have in your application. Let's take a look at the maintenance controller first

```go
package controllers

import (
	"net"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/juju/errors"

	"gitlab.com/hmajid2301/articles/example-fizz-project/internal/server/models"
)

func Healthcheck(_ *gin.Context) (*models.Healthcheck, error) {
	host := "example.com"
	port := "80"
	timeout := time.Duration(1 * time.Second)
	_, healthy := net.DialTimeout("tcp", host+":"+port, timeout)

	if healthy != nil {
		return &models.Healthcheck{}, errors.Errorf("Healthcheck Failed!")
	}

	return &models.Healthcheck{
		Message: "The API is healthy.",
	}, nil
}
```

So we have defined a new function, which receives a single argument the gin context (which we don't use, hence the `_`).
This function returns the health check model. It simply checks if we can connect to
`example.com:80` (on port 80).

Fizz uses the [Tonic library](https://github.com/loopfz/gadgeto/tree/master/tonic) to assign function handlers to our
route.

> Package tonic handles path/query/body parameter binding in a single consolidated input object which allows you to remove all the boilerplate code that retrieves and tests the presence of various parameters. - Tonic README

We need to specify two return types in the function definition because this function is a handler set using Tonic
Again we will see how we do this in the `routes.go` file. The first return type is a struct, which will be
returned to the client (marshalled into JSON). In the example above this is the `*models.Healthcheck`.
The second is an `error`, again we will see how errors are handled a bit later.

Let's now take a look at the pets controller.

```go
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
```

The first function:

```go
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
```

:::note JuJu Errors
For throwing errors in this application we used [juju's error library](https://github.com/juju/errors).
:::

The main difference in this function is we pass in an extra parameter which is the query parameter `{name}`. The logic of this function is not very smart because
it expects the name of the pet to be `bob` in order to send a successful respone back to the client. Of course in
reality you would look in your data store for information about the pet.

The second function looks like:

```go
func UpdatePet(_ *gin.Context, input *models.PetInput) (models.Pet, error) {
	if input.PetParams.Name != "bob" {
		return models.Pet{}, errors.NotFoundf("Pet %s", input.PetParams.Name)
	}

	return input.Pet, nil
}
```

Again this is slightly different because the client sends both a HTTP body and a path query parameter. So the
`input` argument is a combination of two structs:

```go
type PetInput struct {
	PetParams
	Pet
}
```

We can access the query parameter like so `input.PetParams.Name` and the pet's data like `input.Pet`. Note how we
use the name of the struct after `input`. This is how we can combine the body, query parameters and also the query
string into a single struct. The struct tags are really important as they let Tonic know what type of data that field is
i.e. `json` or `query` etc.

Again we can ignore the logic of the function itself. It's not supposed to be very complicated. Just more of an
example of how we can use Fizz, with more complicated HTTP requests.

#### routes.go

This file is where we link the routes to their specific handler functions (using Tonic). This is also where we
provide most of the data that will be used to populate the OAS file.

```go
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

	group := fizzApp.Group("", "maintenance", "Related to managing the maintenance of the API.")
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
```

Let's break this function down:

```go
	engine := gin.New()

	engine.Use(cors.Default())

	fizzApp := fizz.NewFromEngine(engine)

	infos := &openapi.Info{
		Title:       "Example API",
		Description: "The API definition for the Example API.",
		Version:     "1.0.0",
	}

	fizzApp.GET("/openapi.json", nil, fizzApp.OpenAPI(infos, "json")
```

First, we create the Gin engine and share this with a new Fizz engine. Fizz just uses Gin behind the scenes.
Then we create an info struct, which stores the metadata for the generated OAS file. Then we add a new route
`/openapi.json`, which will serve the OAS file.

Note we could change the path if we wanted and serve
a YAML file as well `fizzApp.GET("/openapi", nil, fizzApp.OpenAPI(infos, "yaml"))`. Here we removed the
extension and changed the generated file so that we will serve the client a YAML file.

```go
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
```

Next, let's get to the part of the function where we define our routes. First, we create a group, this will group the
routes within the OAS (such as the tag).

```go
	group.GET("/pets:name", []fizz.OperationOption{
		fizz.Summary("Get a pet by name."),
		fizz.Response(fmt.Sprint(http.StatusInternalServerError), "Server Error", models.APIError{}, nil, nil),
		fizz.Response(fmt.Sprint(http.StatusNotFound), "Pet Not Found", models.APIError{}, nil, nil),
	}, tonic.Handler(controllers.GetPet, http.StatusOK))
```

Next, let's take a look at how we define a new route. We add it to our existing group, then we give it some
information to add to the OAS such as summary. What responses we can get here I have defined the possible
errors. Note that because I prefer not to use magic numbers I have used the `http` package constants instead
of using numbers i.e. 404 -> `http.StatusNotFound`. And of course the most important bit, the Tonic handler
where we tell this route what function to call when a client sends a request to this route. In this case, we
choose the `GetPet` function we mentioned earlier and on a successful response we return a `200` status code i.e.
`http.StatusOK`.

You can define whichever status code you want here such as an `http.StatusCreated` or `http.NoContent`.

```go
	if len(fizzApp.Errors()) != 0 {
		return nil, fmt.Errorf("fizz errors: %v", fizzApp.Errors())
	}
	tonic.SetErrorHook(errHook)
	return fizzApp, nil
```

The final part of the function checks if Fizz returned any errors and sets up the Tonic error hook. What to do if
any of the Tonic function handler return an error. As we saw earlier with some of the functions
returning errors.

```go
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
```

This function receives an error since we are using juju error in our controller functions. We can then use the `isX`
the function provided by the library to check what kind of error we received. Using a switch statement we then determine
what type of HTTP status code to return to the client depending on the error thrown by the function. For example an `NotFoundError` means we return `http.StatusNotFound` (404).

Ok, that's the main part of our application so how do we start our web service?

## cmd

In our cmd folder, we have the `main.go` file.

### main.go

The `main.go` file, as is good practice in Golang, is used to start our application. In
the root folder of our application run `go run cmd/example-fizz-project/main.go` then
you should see something like:

```bash
go run cmd/example-fizz-project/main.go

[GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
 - using env:   export GIN_MODE=release
 - using code:  gin.SetMode(gin.ReleaseMode)

[GIN-debug] GET    /openapi.json             --> github.com/wI2L/fizz.(*Fizz).OpenAPI.func1 (2 handlers)
[GIN-debug] GET    /healthcheck              --> github.com/wI2L/fizz.(*RouterGroup).Handle.func1 (2 handlers)
[GIN-debug] GET    /pets:name                --> github.com/wI2L/fizz.(*RouterGroup).Handle.func1 (2 handlers)
[GIN-debug] PUT    /pets:name                --> github.com/wI2L/fizz.(*RouterGroup).Handle.func1 (2 handlers)
```

And voila you now have a working web service you have created using Fizz. That's it we have now built a web application with Fizz and Golang.

## Appendix

- [Source Code](https://gitlab.com/hmajid2301/articles/tree/master/41.%20Create%20a%20webapp%20with%20fizz/source_code)
- [Fizz](https://github.com/wI2L/fizz/)
- [Tonic](https://github.com/loopfz/gadgeto/tree/master/tonic)
- [Juju's Errors](https://github.com/juju/errors)
