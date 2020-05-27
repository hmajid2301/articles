---
title: 'Testing with pytest-mock and pytest-flask'
tags: ['testing', 'python', 'mocking', 'pytest', 'flask']
license: 'public-domain'
date: 20181215T10:00Z
published: true
cover_image: 'images/cover.jpg'
---

https://media.giphy.com/media/gw3IWyGkC0rsazTi/giphy.gif

Pytest is a popular Python library used for testing. It is my preferred testing library because it requires less boilerplate code than the alternatives such as unittest, the built in testing library.
In this article, I will show you how you can use `pytest-flask` and `pytest-mock` to test your Flask app. These two
libraries are plugins for Pytest which build upon some of the features that Pytest provides us.

In this example, we will be testing a very simple Flask app I created [source code here](https://github.com/hmajid2301/medium/tree/master/9.%20Testing%20with%20pytest-mock%20and%20pytest-flask).
If you want to learn more about the Flask app you can read my previous article [here](https://medium.com/@hmajid2301/implementing-sqlalchemy-with-docker-cb223a8296de) :plug: :plug:.
All you really need to know for this article is that it involves using a very simple RESTful API for an imaginary cat store. Essentially all the API does is it interacts with a database,
to get current cats, add new cats, edit already existing cats and remove cats from the store.

---------------------------------------------------------------------------------------------------

## Prerequisites

* Your own Flask app
* Install the following dependencies, using `pip install -r requirements.txt` (or pip3 instead of pip)

Where requirements.txt is:

```text
flask==1.0.2
pytest-flask==0.10.0
pytest-mock==1.10.0
```

---------------------------------------------------------------------------------------------------

## Libraries

*pytest-flask* allows us to specify an app fixture and then send API requests with this app. Usage is similar to `requests` library, when sending HTTP requests to our flask app.

*pytest-mock* is a simple wrapper around the unittest mock library, so anything you can do using `unittest.mock` you can do with `pytest-mock`. The main difference in usage is you can access it using a fixture `mocker`, also the mock ends at the end of the test. Whereas with the normal mock library if you mock say the `open()` function, it will be mocked for the remaining duration of that test module, i.e. it will effect other tests.

---------------------------------------------------------------------------------------------------

## pytest-flask example

```python
import pytest

from example_app import create_app


@pytest.fixture
def app():
    app = create_app()
    return app


def test_example(client):
    response = client.get("/")
    assert response.status_code == 200
```

To use pytest-flask we need to create a fixture called `app()` which creates our Flask server. We can then use this fixture by passing `client`
as an argument to any test. Then we can send various http requests using `client`.

Above is a very simple example using pytest-flask, we send a GET request to our app, which should return all cats in the database.
We then check that the status code returned from the server was a 200 (OK). This is great except how can we mock out certain features within our code?

---------------------------------------------------------------------------------------------------

## pytest-mock

We can mock out certain parts of our code using the `pytest-mock` library, but we have to mock inside the `app()` fixture. Since the rest of our tests will just be making HTTP requests to our Flask server. In this example say we don't want to mock a connection to the database, we can use the following lines of code.

```python
mocker.patch("flask_sqlalchemy.SQLAlchemy.init_app", return_value=True)
mocker.patch("flask_sqlalchemy.SQLAlchemy.create_all", return_value=True)
mocker.patch("example.database.get_all", return_value={})
```

What this bit of code is doing is any time the any of the mocked functions are called, say `init_app` we mock it so it will always return true. We have to give it the "full path" to the function, it's the same as if you had to import the function itself.

---------------------------------------------------------------------------------------------------

## test_example.py

```python
import pytest

from example import create_app


@pytest.fixture
def app(mocker):
    mocker.patch("flask_sqlalchemy.SQLAlchemy.init_app", return_value=True)
    mocker.patch("flask_sqlalchemy.SQLAlchemy.create_all", return_value=True)
    mocker.patch("example.database.get_all", return_value={})
    app = create_app()
    return app


def test_example(client):
    response = client.get("/")
    assert response.status_code == 200

```

In this example it's very boring as when we send an HTTP GET request to the app it will not interact with the database since we've mocked this out but instead just return an empty dict ({}). In reality, this is
not a very good test, you would make it a bit more interesting.

---------------------------------------------------------------------------------------------------

## Appendix

* [Example source code](https://github.com/hmajid2301/medium/tree/master/9.%20Testing%20with%20pytest-mock%20and%20pytest-flask)
* [Code images made with carbon](https://carbon.now.sh)
