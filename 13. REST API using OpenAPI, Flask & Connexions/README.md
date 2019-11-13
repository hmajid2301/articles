---
title: "Implementing a Simple REST API using OpenAPI, Flask & Connexions"
tags: ["flask", "swagger", "openapi", "python", "connexion"]
license: "public-domain"
---

![We will need to use Swagger.](https://giphy.com/gifs/hqUGOeVeCARiUKavT7/html5)

RESTful APIs are very popular at the moment and Python is a great language to develop
web APIs with. In this article we will go over a documentation first approach to building APIs.
We will be using Flask, Swagger Code-Gen (OpenAPI) and Connexions.
I will go over an API/documentation first approach to building a RESTful API in 
Python. Which will try to minimise the differences between what's defined in the API 
specification and the actual API logic
itself. 

One of the main problems you'll find with using openapi is that every time you update your API 
you have to update your documentation or your openapi yaml/json file. Now what happens if you
forget? Now your API is different to what's documented which can be a real pain for your users. 
The aim of this approach is that you update your specification file first.

---------------------------------------------------------------------------------------------------

## Tools/Libraries

Let's very quickly go over the tools and libraries we will use.

### OpenAPI

Openapi or the Openapi Specification (OAS), defines a standard language agnostic approach to 
developing RESTful APIs, which are both human and machine readable.

### Swagger

A set of open-source tools built around the OAS that help support development, including:

- Swagger Editor: Browser based editor where you can write (and view) OpenAPI specs.
- Swagger UI: Renders OAS as interactive API documentation (also can be seen within Swagger Editor).
- Swagger Codegen - generates server stubs and client libraries from an OpenAPI spec.

### Connexion

Is a Python library that "automagically" handles HTTP requests based on your OAS. It acts as a
simple wrapper around Flask reducing the boilerplate code you have to write as well. So we still
have access to all the functionality we would have when developing a normal Flask web API.

**NOTE:** At the time of writing this article OAS3 support had just come out for codegen.
So this article is written using OAS2. However everything in this article should be applicable
to OAS2 and AOS3.

![Swagger UI](https://synaptiklabs.com/wp-content/uploads/2019/02/javaee-swagger-screen-1.png)

---------------------------------------------------------------------------------------------------

## API

Now onto actually developing our API.

### Project Structure

In this article our code will be using the following structure.

```
test-api/
├── openapi/
├── src/
|   └── test_api
|   |  ├── wsgi.py
|   |  ├──__init__.py
|   |  ├── core/
|   |  └── web/
└── setup.py
```

---------------------------------------------------------------------------------------------------

### Define Specification

First thing we do is define our OAS. We will use YAML to do this because I think it's much easier to read 
and almost all specifications you see will be written in YAML (not JSON). However you can write the 
specification in JSON if you so wish. There are a few tools that can make this a bit easier.

We can use the [online swagger editor](https://editor.swagger.io/), which allows us to edit the 
OAS and you can see the OAS as an interactive document (half the screen for the editor and half 
for the interactive document). You can also run the editor locally as a
[Docker container](https://hub.docker.com/r/swaggerapi/swagger-editor/)

**NOTE**: If you use the editor to generate models (using swagger-codegn), it makes an API call to 
a remote server. Run the swagger-codegen manually to generate the models locally, if you're using 
this for work and confidentality matters.

My preferred way of writing an OAS is using VSCode with the
[Swagger Viewer](https://marketplace.visualstudio.com/items?itemName=Arjun.swagger-viewer) 
plugin, which allows you to write the OAS and preview the interactive document at the same time. 
I prefer this approach because I have all my plugins setup (colour scheme, vim bindings etc).

Now we have to define our specification. We will be using OAS version 2 because swagger-codegen 
at the moment cannot generate models for flask for OAS version 3. Now I've created a very simple 
specification for an imaginary pet store. 

```yaml
# openapi/specification.yml
swagger: "2.0"
info:
  version: "1.0.0"
  title: "Pet Store"
basePath: "/api/v1"
tags:
  - name: "pet"
schemes:
  - "https"
consumes:
  - "application/json"
produces:
  - "application/json"
paths:
  /pet/{pet_id}:
    get:
      tags:
      - "pet"
      summary: "Get a pet in the store"
      operationId: "get_pet"
      parameters:
        - name: "pet_id"
          in: "path"
          description: "The id of the pet to retrieve"
          required: true
          type: "string"
      responses:
        200:
          description: "Successfully retrived pet"
          schema:
            $ref: "#/definitions/Pet"
        404:
          description: "Pet doesn't exist"
      x-swagger-router-controller: "test_api.web.controllers.pets_controller"
    delete:
      tags:
      - "pet"
      summary: "Remove a pet in the store"
      operationId: "remove_pet"
      parameters:
        - name: "pet_id"
          in: "path"
          description: "The id of the pet to remove from the store"
          required: true
          type: "string"
      responses:
        202:
          description: "Successfully deleted pet"
        404:
          description: "Pet doesn't exist"
      x-swagger-router-controller: "test_api.web.controllers.pets_controller"
...
```

The specification defines several endpoints for our API. Essentially I've defined one endpoint
for each of the main CRUD verbs (GET, POST, PUT and DELETE). Some things to note: 
the `operation_id`, will be the function name in our Python code. In a production,
you should also look at using `OAuth2` for securing your API this can also be defined within in 
the specification.

**Note** the extra field `x-swagger-router-controller` is very important. It is used by `Connexion` to 
map which module (and function) to send requests to. For example a GET request send to `/api/v1/pets`,
will go to `test_api.web.controllers.pets_controller` and function called `get_pet` (`operation_id`) 
so it looks like `test_api.web.controllers.pets_controller:get_pet`. Which means we call the function
in the folder `src/test_api/web/controllers/pets_controller` we call the `get_pet` function.

---------------------------------------------------------------------------------------------------

### Server Stubs

Now we want to generate some server stubs from this specification we can do this by either using the `codegen` tool or
in the `editor` we can go to `Generate Server > python-flask`. This will download a zip file, after you decompress it.
We want to copy the `controllers, models, encoder.py, __init__.py and util.py` files into the `web` folder. The models 
are the classes of objects that we expect as input and output such as a `Pet` class. The controllers contain the actual
webserver logic. There is one function for every endpoint (and CRUD method) we defined above, there is also one file for
every tag we defined. In this example we only have one controller file because we only have `tag` called pet. Then in the
controller we have 4 functions (named after the `operation_id`).

We have to make some changes to the codegen generated files. The imports will be wrong when we move the files. We have to change them from
`swagger_server`. So for example `controllers/pet_controller.py` and `models/pets.py` would become: 

```python
#pet_controller.py
from ..models.pet import Pet  # noqa: E501
from ..models.pets import Pets  # noqa: E501
from .. import util
```


```python
#pets.py
from .base_model_ import Model
from .pet import Pet  # noqa: F401,E501
from .. import util
```

In this case I'm using relative imports but you could also use absolute imports. For example `..models.patch_request` would
become `test_api.models.patch_request`. It's all personal preference. [This article](https://realpython.com/absolute-vs-relative-python-imports/)
goes into more detail on the issue.

**Note:** Some imports aren't required and can always be removed later, this will vary project to project. You can use a linter to help you determine
unused imports.

So now we have generated some models and controllers from our openapi specification we can write the logic for our application. I usually
write all of my core logic in a folder called `core` which is a sibling of `test_api`. Then I import the modules into the controllers. This
adds a nice layer of abstraction, let's say tomorrow you wanted to turn into a cli we can keep the `core` folder and delete the `web` folder
and add a cli library such as `click`. This involves minimal code change.

**Note** Some import maybe unnecessary you can use a linter (such as `flask8`) to help you remove them from the `models`.

---------------------------------------------------------------------------------------------------

### Core Logic

I've created a file called `pets.py` in `core`. In this example we just write and read from a JSON
file. This isn't the best code I've written but should be enough to show what we're trying to achieve.
In reality this data would likely be stored in a database but I don't want to overcomplicate this 
example. As far as you're concerned data is being stored and retrieve from a file as if it were a 
database.

```python
...

def add_pet(pet):
    pets = read_from_file()
    ids = pets.keys()
    new_id = int(ids[-1]) + 1
    pets[new_id] = {"name": pet.name, "breed": pet.breed, "price": pet.price}
    write_to_file(pets)

...
```

---------------------------------------------------------------------------------------------------

### Controllers

Now we have our core logic, let's looks at how we interact with it in our controllers, first
`import test_api.core import pets` import our new file into the controllers (`pet_controller`).

Then let's look at `get_pet`

```python
def get_pet(pet_id):  # noqa: E501
    """Get a pet in the store

     # noqa: E501

    :param pet_id: The id of the pet to retrieve
    :type pet_id: str

    :rtype: Pet
    """
    try:
        pet = pets.get_pet(pet_id)
        response = Pet(id=pet.id, breed=pet.breed, name=pet.name, price=pet.price), 200
    except KeyError:
        response = {}, 404

    return response
```

As you can see we call our `get_pet()` function from our `core.pets` module. Then if the pets exist
we turn the dict that is returned, into a Python object of class `Pet` as per `rtype` we defined in 
our OAS. Connexion will handle converting this object into JSON. One other thing we do is if a
`KeyError` exception was thrown, that must mean we don't have a pet with that id in the pet store. Say we have the following

```json
{
    "1": {
        "name": "ginger",
        "breed": "bengal",
        "price": 100
    },
    "2": {
        "name": "sam",
        "breed": "husky",
        "price": 10
    },
    "3": {
        "name": "guido",
        "breed": "python",
        "price": 518
    }
}
```

If we try to retrieve a pet of id 4, Python will throw a KeyError saying this doesn't exist (when we load
the JSON file we convert into a dict). So in this case as per our OAS we want to return a 404 pet doesn't
exist.

```yaml
responses:
  200:
    description: "Successfully retrived pet"
      schema:
      $ref: "#/definitions/Pet"
  404:
    description: "Pet doesn't exist"
```

One very important thing to note is that when we receive a HTTP request with JSON, say for
the `add_pet()` function Connexion will convert this into a Python object for us and when we
return a Python object it will convert that Python object into JSON. So within our controllers
and core logic we don't actually need to interact with JSON at all. It's all abstracted away
with the Connexion library. We also don't need to use Swagger codegen to generate the models
and controllers we could've done ourselves, Connexions can run on it's own without them.

Let's see an example of this.

```python
# pets_controller.py
def add_pet(body):  # noqa: E501
    """Add a new pet to the store

     # noqa: E501

    :param body: Pet to add to the store
    :type body: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        body = Pet.from_dict(connexion.request.get_json())  # noqa: E501
    
    pets.add_pet(body)
    return {}, 201
```

The body variable will be a Python object of class Pet. We can then pass this as an argument
to our other `add_pet` function in our core folder. As you can see we access attributes 
because it's an object not a dict i.e. `pets["name"]` vs `pets.name`.

```python
# pets.py
def add_pet(pet):
    pets = read_from_file()
    ids = pets.keys()
    new_id = int(ids[-1]) + 1
    pets[new_id] = {"name": pet.name, "breed": pet.breed, "price": pet.price}
    write_to_file(pets)
```

### Swagger Codegen vs Connexion

So Connexion does all the routing and validation for us but Swagger codegen is what converts
our input and output into Python classes. Connexions only deals with JSON, it will convert
the JSON into it's equivalent Python object such as lists, strings and dictionary. Swagger
codegen will take this input (a dictionary) and convert that into a Python class. 
One example of this in the `add_pet` function in the `pets_controller` file. It converts our
dictionary into a `Pet` object (as shown below). So rather than accessing data using normal
dictionary notation `body["id"]` we can now use `body.id`.
`body = Pet.from_dict(connexion.request.get_json())  # noqa: E501`

For Codegen to convert our Python objects back into a dictionary, so that Connexion can then
convert this into JSON so respond back we use the JSON encoder that codegen provides us
(`test_api.web.encoder`). To use it all we need to add is to set it as our default encoder
for our flask app `flask_app.json_encoder = encoder.JSONEncoder`, usually this is done in the
app setup (shown below).

---------------------------------------------------------------------------------------------------

## Run a Server

Now that we have our code how do we actually start up our web application so we can test it. To do this we will create a file which in turn 
will create our Connexion/Flask app and start the server,  called `run.py` inside of our `test_api` folder.

```python
import os

import connexion

from .web import encoder


def create_app():
    abs_file_path = os.path.abspath(os.path.dirname(__file__))
    openapi_path = os.path.join(abs_file_path, "../", "../", "openapi")
    app = connexion.FlaskApp(
        __name__, specification_dir=openapi_path, options={"swagger_ui": False, "serve_spec": False}
    )
    app.add_api("specification.yml", strict_validation=True)
    flask_app = app.app
    flask_app.json_encoder = encoder.JSONEncoder

    return flask_app
```

You can run the application like a normal flask app from the project root(running from folder where `openapi/` and `src/` exist.)

```bash
FLASK_APP=./src/test_api/run.py FLASK_DEBUG=1 flask run
```

### Example Project

Related to this article there is an example project which you can take a look at, to get it running do the following.
Voila we have built a Flask web service with Connexion and OpenAPI.

```bash
git clone https://gitlab.com/hmajid2301/medium.git
cd medium/13.\ REST\ API\ using\ OpenAPI\,\ Flask\ \&\ Connexions/source_code/test-api
virtualenv .venv
source .venv/bin/activate
pip install -r requirements.txt
FLASK_APP=test_api.wsgi:app FLASK_DEBUG=1 flask run
```

---------------------------------------------------------------------------------------------------

## Final Thoughts

So as you can see we've built an web API using Connexion and Flask, where all our code is generated
based of our OAS. So now we are sure our API documentation is accurate. We've also managed to reduce
some of the boilerplate using Flask, Connexions handles which functions should be called depending on the
CRUD (Create Read Update Delete) operation and endpoints defined in the OAS.

---------------------------------------------------------------------------------------------------

## Appendix

- [Source Code](https://github.com/hmajid2301/medium/tree/master/13.%20REST%20API%20using%20OpenAPI,%20Flask%20&%20Connexions/source_code)
- [OpenAPI](https://swagger.io/docs/specification/about/)
- [Swagger Codegen](https://github.com/swagger-api/swagger-codegen)
- [Swagger Editor](https://editor.swagger.io/)
- [Connexion](https://github.com/zalando/connexion)
