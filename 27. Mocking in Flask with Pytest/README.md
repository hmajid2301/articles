---
title: "Testing & Mocking a Connexion/Flask Application with Pytest"
tags: ["testing", "python", "flask", "pytest"]
license: "public-domain"
date: 20200609T10:00Z
published: true
cover_image: "images/cover.jpg"
---

In this article, I will show you how you can test a Python web service that was built using [Connexion](https://github.com/zalando/connexion/)
(a wrapper library around Flask). We will go over how you can mock functions and how you can test
your endpoints. There are two related articles I have written in the past listed below. In the first
one we go over how to create a web service using Connexions, the same web service we will in this article.
In the second article I introduce how you can use `pytest-mock` and `pytest-flask` to test a Flask web
service.

- [Implementing a Simple REST API using OpenAPI, Flask & Connexions](https://medium.com/@hmajid2301/implementing-a-simple-rest-api-using-openapi-flask-connexions-1bdd01ca916)
- [Testing with pytest-mock and pytest-flask](https://medium.com/@hmajid2301/testing-with-pytest-mock-and-pytest-flask-13cd968e1f24)

The example app we will be writing tests for is a very simple CRUD API managing a pet store. It allows us
to add pets, remove pets, update pets and query pets we have in the store.

## Structure

You can find the source code here. Our project structure looks like this:

```
.
├── openapi
│   └── specification.yml
├── requirements.txt
├── test_api
│   ├── core
│   │   ├── __init__.py
│   │   ├── pets.json
│   │   └── pets.py
│   ├── __init__.py
│   ├── run.py
│   └── web
│       ├── controllers
│       │   ├── __init__.py
│       │   └── pets_controller.py
│       ├── encoder.py
│       ├── __init__.py
│       ├── models
│       │   ├── base_model_.py
│       │   ├── __init__.py
│       │   ├── pet.py
│       │   └── pets.py
│       └── util.py
└── tests
    ├── conftest.py
    ├── __init__.py
    └── test_pets_controller.py
```

## API

Here is our controller module called `web/controller/pets_controller.py`. This is where connexion routes are requests to:

```python
import connexion
import six

from ..models.pet import Pet  # noqa: E501
from ..models.pets import Pets  # noqa: E501
from .. import util

from test_api.core import pets


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

Connexion uses the open API specification `openapi/specification.yml`, to work out which function to route requests
for the path `/pet/{pet_id}`. It uses the `operationId` alongside the `x-swagger-router-controller` to determine
the function to call in the `pets_controller.py` module.

```yaml
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
```

## Tests

Now onto our tests!

### Libraries

_pytest-flask_ allows us to specify an app fixture and then send API requests with this app. Usage is similar to the `requests` library when sending HTTP requests to our app.

_pytest-mock_ is a simple wrapper around the unit test mock library, so anything you can do using `unittest.mock` you can do with `pytest-mock`. The main difference in usage is you can access it using a fixture `mocker`, also the mock ends at the end of the test. Whereas with the normal mock library if you say mock the `open()` function, it will be mocked for the remaining duration of that test module, i.e. it will affect other tests.

### conftest.py

The `conftest.py` file is automatically run by pytest and allows our test modules to access fixtures defined
in this file. One of the best features of Pytest is fixtures. Fixture are functions that have re-usable bits of code we
can run in our unit tests, such as static data used by tests.

```python
import os
import json

import pytest

from test_api.run import create_app


@pytest.fixture(scope="session")
def app():
    abs_file_path = os.path.abspath(os.path.dirname(__file__))
    openapi_path = os.path.join(abs_file_path, "../", "openapi")
    os.environ["SPEC_PATH"] = openapi_path

    app = create_app()
    return app


@pytest.fixture(scope="session", autouse=True)
def clean_up():
    yield
    default_pets = {
        "1": {"name": "ginger", "breed": "bengal", "price": 100},
        "2": {"name": "sam", "breed": "husky", "price": 10},
        "3": {"name": "guido", "breed": "python", "price": 518},
    }

    abs_file_path = os.path.abspath(os.path.dirname(__file__))
    json_path = os.path.join(abs_file_path, "../", "test_api", "core", "pets.json")
    with open(json_path, "w") as pet_store:
        json.dump(default_pets, pet_store, indent=4)

```

#### app()

In this file, we have two functions: the `app` allows users to pass the `client` argument to other tests
and then we can test our web application. You can get more information
[here](https://flask.palletsprojects.com/en/1.1.x/testing/#the-testing-skeleton) about how Flask apps can be tested.
Essentially we don't need to start/stop a server before/after our tests.

By giving it the `scope=session` the fixture will be created once before all of our tests run. Our `run.py` file looks
like this:

```python
import os

import connexion

from .web import encoder


def create_app():
    if "SPEC_PATH" in os.environ:
        openapi_path = os.environ["SPEC_PATH"]
    else:
        abs_file_path = os.path.abspath(os.path.dirname(__file__))
        openapi_path = os.path.join(abs_file_path, "../", "../", "openapi")
    app = connexion.FlaskApp(
        __name__,
        specification_dir=openapi_path,
        options={"swagger_ui": False, "serve_spec": False},
    )
    app.add_api("specification.yml", strict_validation=True)
    flask_app = app.app
    flask_app.json_encoder = encoder.JSONEncoder

    return flask_app
```

The `create_app` function creates our web application and returns a Flask object. Remember the Connexion library is
just a wrapper around Flask. Connexion just reduces the boilerplate code we wrote. Again you can have a read of the
article above to get more details about how it works.

#### clean_up()

```python
@pytest.fixture(scope="session", autouse=True)
def clean_up():
    yield
    default_pets = {
        "1": {"name": "ginger", "breed": "bengal", "price": 100},
        "2": {"name": "sam", "breed": "husky", "price": 10},
        "3": {"name": "guido", "breed": "python", "price": 518},
    }

    abs_file_path = os.path.abspath(os.path.dirname(__file__))
    json_path = os.path.join(abs_file_path, "../", "test_api", "core", "pets.json")
    with open(json_path, "w") as pet_store:
        json.dump(default_pets, pet_store, indent=4)
```

The second fixture we define is called `clean_up`, because of the `yield` line, this function will run after all of
our tests have completed. The `yield` command is related to generators, you can read
[more here](https://stackoverflow.com/questions/231767/what-does-the-yield-keyword-do). In our case, it's used in Pytest
fixtures so that we can run some cleanup jobs after our test is completed. In this example, I am simply replacing the
contents of the JSON file which acts as a data store (like a database), to its default values before the test was run.

> Since pytest-3.0, fixtures using the normal fixture decorator can use a yield statement to provide fixture values and execute teardown code - Pytest Docs

### test_pets_controller.py

Now we have gone over the setup required for our tests, let's take a look at how we can test our
code. So our first test looks like:

```python
def test_get_all_pets(client):
    url = "/api/v1/pet"
    expected_json = [
        {"id": "1", "name": "ginger", "breed": "bengal", "price": 100},
        {"id": "2", "name": "sam", "breed": "husky", "price": 10},
        {"id": "3", "name": "guido", "breed": "python", "price": 518},
    ]
    response = client.get(url)
    assert response.json == expected_json
```

It's a very simple test, here we use the `app` fixture we defined above. This `client` fixture can be used
because we are using the `pytest-flask` library. As you can see it looks very similar to `requests`, where
we give it a path `/API/v1/pet` and then tell it what kind of request to make `client.get`.
Whilst the syntax between the `requests` library and the `client` fixture is almost identical. One big
difference that always seems to trip me up is, in `requests` to get the JSON data from the `response` object would be
`response.json()` i.e it is a function. However in `client` (`pytest-flask`) fixture do get the JSON data we do
`response.json` which is just an attribute of the object not a function.

The test itself is very simple, it's making a request to get all pets in the pet store. We then compare that with=
what we expect to be in the pet store `assert response.json == expected_json`.

The next test we have looks like this:

```python
@pytest.mark.parametrize(
    "pet_data, expected_status, expected_data",
    [
        ({"name": "Yolo", "breed": "shorthair", "price": 100}, 201, {"id": 4}),
        ({}, 400, {}),
        ({"a": "b"}, 400, {}),

    ]
)
def test_add_a_pet(client, pet_data, expected_status, expected_data):
    url = "/api/v1/pet"
    response = client.post(url, json=pet_data)
    assert response.status_code == expected_status
    if response.status_code == 200:
        assert response.json == expected_data
```

This test is attempting to add a new pet to the store. It's similar to the other test we still use
the `client` fixture to make the request. This time we also give it some `json` data hence we provide the `json`
argument `json=pet_data` this automatically sets the headers correctly so the server knows it's receiving
JSON data.

We also use a decorate called `@pytest.mark.parametrize`. This allows us to run our tests against a list
of data. So we don't have to write the same test x number of times. We just pass the test different
arguments. Pytest will run this test x number of times once for each item in the list.
So, for example, the first time the test runs:

```python
pet_data = {"name": "Yolo", "breed": "shorthair", "price": 100}
expected_status = 200
expected_data = {"id": 4}
```

The second like this:

```python
pet_data = {}
expected_status = 200
expected_data = {}
```

And so on and so on. This helps keep our test file smaller and keeps the DRY (do not repeat yourself).
A very nice feature of Pytest and one I use heavily.

The final test we have in this file looks like:

```python
def test_add_pet_fail_json(client, mocker):
    pet_data = {"name": "Yolo", "breed": "shorthair", "price": 100}
    url = "/api/v1/pet"
    mock = mocker.post("connexion.request")
    mock.is_json = False
    response = client.post(url, json=pet_data)
    assert response.status_code == 400
```

At last, we see `pytest-mock` being used via the `mocker` fixture we automatically get access to.
The `mocker` is just a simple wrapper around the `unittest.mock` module. The main difference being
the mock on exists for the duration of that test. Mocking is often used when unit testing and we cannot
rely on external dependencies such as database connections or another web service.

```python
def add_pet(body):  # noqa: E501
    # ...
    if connexion.request.is_json:
        body = Pet.from_dict(connexion.request.get_json())  # noqa: E501
    # ...
```

In this example, we want to mock the part of connexion that checks if the data being sent is valid JSON.
We want the `connexion.request.is_json` to return `False`, we can do this like so:

```python
mock = mocker.patch("connexion.request")
mock.is_json = False
```

Since `is_json` is an attribute of the `connexion.request` module and not a function we need to set
it false on another line. If `is_json` was a function that we wanted to return `False` we could've done
`mocker.patch("connexion.request.is_json")` instead.

You can run the tests locally by running the `pytest` command or if you want to run the code in this article, you can
by doing the following:

```bash
gcl https://gitlab.com/hmajid2301/articles.git
cd 27.\ Mocking\ in\ Flask\ with\ Pytest/source_code
virtualenv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
```

That's it, the examples above cover most of the things you'll need to mock and test your connexion
web service.

> INFO: `pytest-flask` provides a whole bunch of other features that may be useful, you can find the full list [here](https://pytest-flask.readthedocs.io/en/latest/features.html)

## Appendix

- [Source Code](https://github.com/hmajid2301/medium/tree/master/27.%20Mocking%20in%20Flask%20with%20Pytest/source_code)
