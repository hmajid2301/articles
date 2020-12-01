---
title: "What does yield do in Python?"
tags: ["python", "pytest"]
license: "public-domain"
slug: "python-yield-explained"
canonical_url: "https://haseebmajid.dev/blog/python-yield-explained/"
date: "2020-11-30"
published: true
cover_image: "images/cover.jpg"
---

In this article, we will go over what the `yield` keyword is used for. We will also cover how you can use a `yield`
with a pytest fixture to allow us to clean up data after our tests.

## Background

### Iterables & Iterators

Before we can look at the `yield` keyword we will need to cover iterables and generators in Python. An "iterable" is
any Python object that can return its members one at a time, in a for-loop.

In Python we have functions called magic methods, there are methods like `__enter__` and `__exit__` defined within
objects. These are called "magic" methods because they are never directly called by the user. For an object to be
iterable, it needs to implement the `__iter__` method. If an object is iterable it can be passed to the `iter()`
function. The `iter()` function returns an iterator.

```python
❯ ipython
Python 3.8.5 (default, Jul 28 2020, 12:59:40)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.14.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: iter([1, 2, 3])
Out[1]: <list_iterator at 0x7f4c11556730>

In [2]: iter("hello")
Out[2]: <str_iterator at 0x7f4c11598c10>

In [3]: iter(42)
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-3-ef50b48e4398> in <module>
----> 1 iter(42)

TypeError: 'int' object is not iterable

In [4]:
```

An iterator is any object which has the `__next__` magic method defined. Whenever we use a for-loop
(or list comprehension), the `next` method is called automatically for us, to get the next item from
the iterable.

```python
In [5]: hello_list = ["h", "e", "l", "l", "o"]

In [6]: iterator = iter(hello_list)

In [7]: next(iterator)
Out[7]: 'h'

In [8]: next(iterator)
Out[8]: 'e'

In [9]: next(iterator)
Out[9]: 'l'

In [10]: next(iterator)
Out[10]: 'l'

In [11]: next(iterator)
Out[11]: 'o'

In [12]: next(iterator)
---------------------------------------------------------------------------
StopIteration                             Traceback (most recent call last)
<ipython-input-12-4ce711c44abc> in <module>
----> 1 next(iterator)

StopIteration:
```

In summary, an iterable is an object that can be "looped" over and an iterator is an object which can
do the "looping" for us, it will keep track of the current state/index and move to the next item.
In the example above the `hello_list` is iterable and the `iterator` variable is the iterator.

### Generators

Generators are a special type of iterable, they differ from normal lists in two main ways:

- You can only iterate over them once
- They don't store all of their values in memory

So generators can be great when lists get very large.

```python
In [14]: g = (x^2 for x in range(10))

In [15]: for i in g:
    ...:     print(i)
    ...:
2
3
0
1
6
7
4
5
10
11

In [16]: for i in g:
    ...:     print(i)
    ...:
```

## Yield

Now that we finally understand iterables and generators let's see how they relate to the `yield` keyword. `yield` can be
used like `return` except it will return a generator.

```python
In [17]: def example():
    ...:     yield "A"
    ...:     yield "B"
    ...:     yield "C"
    ...:

In [18]: for i in example():
    ...:     print(i)
    ...:
A
B
C

In [22]: example()
Out[22]: <generator object example at 0x7f4c1147a0b0>
```

A good example of `yield` can be seen above, it differs from a return because it is smart enough to retain "state"
and resume where it left off in the function. We can see the same example with `return`. In this example there is only
a single item being returned so only "A" is being looped over.

```python
In [19]: def example():
    ...:     return "A"
    ...:     return "B"
    ...:     return "C"
    ...:
    ...:

In [20]: for i in example():
    ...:     print(i)
    ...:
A
```

## Pytest Example

One interesting use case of using the `yield` keyword is using it to run clean up tasks after running tests using
pytest. Pytest is a very popular testing framework in Python, it allows us to create a file called `conftest.py`.
Here we store common functions, fixtures shared between our tests.

In the example below, before any tests have run the `clean_up` fixture will be called, because we have given
it the `autouse=True` parameter. It will `yield`, and return a generator after all of our tests have finished
running. The print and the teardown tasks will then be run. This is useful for example when you want to clean up
your database after running tests that will add "test" data to it. Or in fact, any other type of teardown tasks
you need to run after all of your tests have finished running.

```python:title=conftest.py
@pytest.fixture(scope="session", autouse=True)
def clean_up():
    yield
    print("teardown after yield")
    delete_database_collection()
```

## Appendix

- [Cover Photo](https://unsplash.com/photos/ieic5Tq8YMk) from Chris Ried on Usplash
- [Real Python](https://realpython.com/python-for-loop/) "for" loop
- [Real Python](https://realpython.com/introduction-to-python-generators/) generators
- [SO Post](https://stackoverflow.com/questions/231767/what-does-the-yield-keyword-do)
- [DZone Yield vs Return](https://dzone.com/articles/when-to-use-yield-instead-of-return-in-python)
