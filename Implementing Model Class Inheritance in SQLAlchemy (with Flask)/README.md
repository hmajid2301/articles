---
title: 'Implementing Model Class Inheritance in SQLAlchemy (with Flask)'
tags: ['Python', 'Sql', 'Orm', 'Sqlalchemy', 'Database']
license: 'public-domain'
---

# Implementing Model Class Inheritance in SQLAlchemy (with Flask)

![More cats and dogs than you expect](https://media.giphy.com/media/xBAreNGk5DapO/giphy.gif)

SQLAlchemy is an Object-relational mapping (ORM) made for the Python programming language. ORMs in theory allow programmers to abstract away SQL. In simple terms they allow us to interact with a database using purely Python (objects/functions). I will be using the flask-SQLAlchemy extension for my examples.

Each table is referred to as a model, each model is simply just a python class and each attribute of that class becomes a column in an SQL table. The database is made up of multiple models. Just like with normal Python models can inherit from other models and share attributes with the parent model. This is very useful if you going to have models that will store similar types of data.

---------------------------------------------------------------------------------------------------

## models.py

![models.py](images/models.png)

Taking a look at the _models.py_ module, we define an abstract class called Pets. Which means SQLAlchemy will not create a table for that model. Our next two models Cats and Dogs inherit all the attributes form Pets. So Cats and Dog tables will each have a column called name, price and breed.

The main advantage of this is if you ever need to change the models you just have to change it in once place. The more models that inherit from the base model.

---------------------------------------------------------------------------------------------------

## __init__.py

![__init__.py](images/init.png)

Above is an example _\_\_init\_\_.py_ file to initialise the database and create all the database tables from the models. That's it folks, thanks for reading.

**Please** note there are other ways to implement inheritance with SQLAlchemy, I personally found this way to be the cleanest in terms of code readability.

---------------------------------------------------------------------------------------------------

## Appendix

* [Example source code](https://github.com/hmajid2301/medium/tree/master/Implementing%20Model%20Class%20Inheritance%20in%20SQLAlchemy%20\(with%20Flask\))
* [SQLAlchemy](https://www.sqlalchemy.org/)
* [flask-sqlalchemy](http://flask-sqlalchemy.pocoo.org/2.3/)
