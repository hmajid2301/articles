---
title: "Simple App with Flask, SQLalchemy and Docker"
tags: ["docker", "python", "docker-compose", "sqlalchemy"]
license: "public-domain"
slug: "simple-app-flask-sqlalchemy-and-docker"
canonical_url: "https://haseebmajid.dev/blog/simple-app-flask-sqlalchemy-and-docker"
date: "2018-11-24"
published: true
cover_image: "images/cover.jpg"
---

https://media.giphy.com/media/35KpaeAHCl0wt8O8Nc/giphy.gif

Unfortunately, we won't be turning any SQL statements into gold in this tutorial.

SQLAlchemy is an object-relational mapper (ORM), it allow us to interact with a database using Python functions and objects. For example, if we have a table called
`Cats` we could retrieve every row with a command like `Cats.query.all()`. The main advantage of this is that it allows us to abstract away the SQL.

Docker :whale: allows us to quickly bring up a database within a Docker container, this means we don't have to set up and configure a database on our local machine. We can simply kill the Docker container when we are done with the database. In this article, I will show you how you can create a very simple RESTful API using Flask and SQLAlchemy, which will connect to a database running in a Docker container.

**NOTE:** Flask server will be running locally, not in a Docker container.

In this example, I will be using Postgres but it should be easy enough to use any other relational database, such as MySQL. I will also be using `flask-sqlalchemy`, which is a wrapper around `SQLAlchemy`, it simplifies our code and means we can use less boilerplate code.

## Prerequisites

- [Install Docker](https://docs.docker.com/install/)
- (optional) [Install docker-compose](https://docs.docker.com/compose/install/)
- Install Python3.6
- Install the following dependencies, using `pip install -r requirements.txt` (or pip3 instead of pip)

Where requirements.txt is:

```text
flask==1.0.2
flask-sqlalchemy==2.3.0
psycopg2==2.7.6.1
```

---

## **init**.py

```python
from flask import Flask

from .models import db
from . import config


def create_app():
    flask_app = Flask(__name__)
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = config.DATABASE_CONNECTION_URI
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    flask_app.app_context().push()
    db.init_app(flask_app)
    db.create_all()
    return flask_app
```

The init file has one function `create_app()`, which funnily enough creates our Flask app with this line `Flask(__name__)`. It then assigns a URI, from the `config.py` file, to the Flask app's configuration. This URI is used to connect to the Postgres database.

One important thing about this function is that we have to use Flask contexts. Since Flask can have multiple apps we have to specify which app we are using with SQLAlchemy, hence we push the context with our newly created app. Else we would see the following error, [more information here](http://flask-sqlalchemy.pocoo.org/2.3/contexts/).

```text
No application found. Either work inside a view function or push an application context.
```

After pushing our context, we link our `db` to the Flask app with the following line `db.init_app(flask_app)`. We then create all of our tables (in the database) if they don't already exist, using `db.create_all()`. The tables are created using the classes defined in `models.py`.

---

## config.py

```python
import os

user = os.environ['POSTGRES_USER']
password = os.environ['POSTGRES_PASSWORD']
host = os.environ['POSTGRES_HOST']
database = os.environ['POSTGRES_DB']
port = os.environ['POSTGRES_PORT']

DATABASE_CONNECTION_URI = f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}'
```

This module's only job at the moment is to generate this URI, but could easily be extended to add extra configuration variables if required.

```python
DATABASE_CONNECTION_URI = f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}'
```

**NOTE:** F-strings used for formatting strings (as shown above) can only be used with Python3.6.

---

## database.conf

These are examples of the variables that need to get passed as environment variables to the Flask app.

```text
POSTGRES_USER=test
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=example
```

**NOTE:** If you're running the Flask app in a Docker container you will need to change the variable `POSTGRES_HOST=postgres`, (from localhost)
where `postgres` is the Docker container name we are connecting to.

**WARNING:** Make sure these are the same values passed to the Flask app and the Postgres database.

---

## models.py

```python
import flask_sqlalchemy

db = flask_sqlalchemy.SQLAlchemy()


class Cats(db.Model):
    __tablename__ = 'cats'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price = db.Column(db.Integer)
    breed = db.Column(db.String(100))
```

This module defines our classes which then become tables within our database. For example, the class `Cats` (cats) is the table name and each attribute becomes a column in that table. So the `cats` table with have four columns id, name, price and breed.

The `db` variable is imported from here by the `__init__.py` file, that's how the `db.create_all()` function knows which classes/tables to create in the database.

---

## app.py

```python
import json

from flask import request

from . import create_app, database
from .models import Cats

app = create_app()


@app.route('/', methods=['GET'])
def fetch():
    cats = database.get_all(Cats)
    all_cats = []
    for cat in cats:
        new_cat = {
            "id": cat.id,
            "name": cat.name,
            "price": cat.price,
            "breed": cat.breed
        }

        all_cats.append(new_cat)
    return json.dumps(all_cats), 200


@app.route('/add', methods=['POST'])
def add():
    data = request.get_json()
    name = data['name']
    price = data['price']
    breed = data['breed']

    database.add_instance(Cats, name=name, price=price, breed=breed)
    return json.dumps("Added"), 200


@app.route('/remove/<cat_id>', methods=['DELETE'])
def remove(cat_id):
    database.delete_instance(Cats, id=cat_id)
    return json.dumps("Deleted"), 200


@app.route('/edit/<cat_id>', methods=['PATCH'])
def edit(cat_id):
    data = request.get_json()
    new_price = data['price']
    database.edit_instance(Cats, id=cat_id, price=new_price)
    return json.dumps("Edited"), 200
```

This is a simple Flask file, which creates our app by calling `create_app()` function from `__init__.py` module.
Then it defines four functions for our four routes for the "RESTful" API:

- GET: Get information about all the cats
- POST: Add a new cat
- DELETE: Remove a cat
- PATCH: Edit a cat's price

---

## database.py

```python
from .models import db


def get_all(model):
    data = model.query.all()
    return data


def add_instance(model, **kwargs):
    instance = model(**kwargs)
    db.session.add(instance)
    commit_changes()


def delete_instance(model, id):
    model.query.filter_by(id=id).delete()
    commit_changes()


def edit_instance(model, id, **kwargs):
    instance = model.query.filter_by(id=id).all()[0]
    for attr, new_value in kwargs:
        setattr(instance, attr, new_value)
    commit_changes()


def commit_changes():
    db.session.commit()
```

This module is created so we can abstract away how we interact with the database. We simply use
the functions in this module to interact with the database. This means it's easier to change the
library we use to interact with the database. It also means that if for some reason we need to change how we interact with the database. We only have to change it in a single module (this one).

The `app.py` module calls functions in this file to interact with database.

- GET - `get_all()`
- POST - `add_instance()`
- DELETE - `delete_instance()`
- PUT - `edit_instance()`

Some functions use this special keyword called `**kwargs`, kwargs (keyword arguments) could be called anything but it's best practice to call it kwargs. This allows
the caller of the function to pass in an arbitrary number of keyword arguments.

Let's take a look at the `add_instance()` function as an example. The function is called in `app.py` like so `database.add_instance(Cats, name=name, price=price, breed=breed)` the `model=Cats` and `kwargs` is the rest of the arguments which are passed onto the cats model so we can add our cat object to the database.

**NOTE:** The `kwargs` just stores the arguments as a dictionary, the `**` operator unpacks our dictionary
and passes them as keyword arguments.

---

## docker-compose.yml

```yaml
version: "3.5"
services:
  database:
    container_name: postgres
    image: postgres:latest
    env_file: database.conf
    ports:
      - 5432:5432
    volumes:
      - db_volume:/var/lib/postgresql

volumes:
  db_volume:
```

For development, I like to use docker-compose. In docker compose we can specify Docker containers using YAML. It can help to simplify the commands we need to type when trying to build/run multiple Docker containers. In this example, we only define a single Docker container.

Taking a look at the file:

First, we define our version number `version: '3.5'`, it is recommended by Docker that you use at least version 3. You can find
[more information here](https://docs.docker.com/compose/compose-file/compose-versioning/).

Then we give our a service name, in this case, `database`. I like to name my services with what they are used for generic names such as `web server`, `database` or `message broker`. This means I can change the underlying technology without changing the service name.

After this we name our container `postgres`, this is the name of the Docker container.
It can be used to interact with the container (to kill it or exec onto it) without using an ID.

We use the official Postgres image on [Docker Hub](https://hub.docker.com/_/postgres/), we pull the image that is tagged with `latest`.

This image requires us to use some variables to set it up such as username, password and database. We pass these in the form of a file to make things a bit simpler (the same `database.conf as defined above).

We then map the host port 5432 to the guest Docker container port 5432, this is the port that Postgres listens on. You could change the host port if you wanted to something else like `9000` say, this means all traffic on the host on port 9000 will be sent to the Postgres container on port 5432. We would also need to update the environment variable the Flask app is using.

Finally, we mount a volume so that our data is persistent, without this when the database Docker container is killed you would lose all of your data. By mounting `db_volume` even when you kill the container, like when you want to update the Postgres image, your data will persist.

---

## Running our application

To build and run our Docker container with docker-compose:

```bash
docker-compose up --build -d
```

The equivalent commands using just normal Docker would be

```bash
docker volume create --name db_volume
docker run -d --name postgres -p 5432:5432 \
           ---------------------------------------------------------------------------------------------------env-file docker/database.conf \
           -v db_volume:/var/lib/postgresql postgres:latest
```

To start our Flask app

```bash
docker-compose up --build

# In a new terminal
virtualenv .venv
source .venv/bin/activate
pip install -r requirements.txt
# To load env variables
export $(xargs < database.conf)
export FLASK_APP=src/example/app.py
flask run
# Running on http://127.0.0.1:5000
```

You can send HTTP requests to your Flask server on `127.0.0.1:5000`, you can either use a REST client like Postman or Insomnia. You can also use cURL on the cli.

```bash
curl -XPOST -H "Content-type: application/json" -d \
'{"name": "catty mcCatFace", "price": 5000, "breed": "bengal"}' \
'127.0.0.1:5000/add'
```

---

## Appendix

- [Example source code](https://github.com/hmajid2301/medium/tree/master/8.%20Docker%20with%20SQLAlchemy)
- [Code images made with carbon](https://carbon.now.sh)
- [Postman](https://www.getpostman.com/)
- [Insomnia](https://insomnia.rest/)
