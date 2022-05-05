---
title: "Testing socketio in Python & uvicorn"
tags: ["testing", "python", "socketio", "pytest"]
license: "public-domain"
slug: "testing-python-socketio"
canonical_url: "https://haseebmajid.dev/blog/testing-python-socketio"
date: "2021-12-23"
published: true
cover_image: "images/cover.jpg"
---

In this article I will show you how you can test an async Socketio application in Python, where the ASGI server we are running is uvicorn.
I will be referring to these tests as integration tests, though depending on who you ask they could be called E2E tests, system tests, slow test etc.
What I am referring to is simply testing out the entire "flow" of a socketio event i.e. emitting an event from a client, then receiving it on the web service
and for my actual projects interacting with an actual database.

We will be using `pytest` as our testing framework.

::: note
ASGI (Asynchronous Server Gateway Interface) is a spiritual successor to WSGI, intended to provide a standard interface between async-capable Python web servers, frameworks, and applications. - https://asgi.readthedocs.io/en/latest/
:::

## main.py

```python:title=app/main.py file=./source_code/app/main.py

```

Let's take a look at our socketio app. Which is a very simple web app, that listens to one event `FOO` and
responds with a `BAR` event. It is just this single file.

## conftest.py

The `conftest.py` file is automatically run by pytest and allows our test modules to access fixtures defined
in this file. One of the best features of Pytest is fixtures. Fixture are functions that have re-usable bits of code we
can run in our tests, such as static data used by tests.

```python:title=tests/conftest.py file=./source_code/tests/conftest.py

```

### Quick Aside FastAPI Testing

:::important
tl:dr: We need to start and stop the Uvicorn server within our tests.
:::

Now when testing say a FastAPI application, it has a builtin test client we can use. This means we don't actually have
to spin up a Uvicorn server to test our application. We can simply pretend to send requests to the FastAPI web service
and it will handle the routing behind the scenes.

We can do something like this, where `httpx` is a async HTTP client (think like the `requests` library).

```python
import pytest
from asgi_lifespan import LifespanManager
from httpx import AsyncClient

from app.main import app



@pytest.fixture()
async def client() -> AsyncIterator[AsyncClient]:
    async with LifespanManager(app):
        async with AsyncClient(app=app, base_url="http://localhost") as client:
            yield client
```

Then we can use it like so in our tests:

```python
from fastapi import status
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_add_game(client: AsyncClient):
    response = await client.post("/game", json=request_data)
    assert response.status_code == status.HTTP_201_CREATED
```

However socketio at the moment does not provide us with a test client we can use. So we will start and stop a Uvicorn server and send actual
Socketio requests from a Socketio client. There is a Socketio client library we can use to do this, available in Python.

```python:title=tests/conftest.py
class UvicornTestServer(uvicorn.Server):
    def __init__(self, app: ASGIApp = main.app, host: str = LISTENING_IF, port: int = PORT):
        self._startup_done = asyncio.Event()
        self._serve_task: Optional[Awaitable[Any]] = None
        super().__init__(config=uvicorn.Config(app, host=host, port=port))

    async def startup(self) -> None:
        """Override uvicorn startup"""
        await super().startup()
        self.config.setup_event_loop()
        self._startup_done.set()

    async def start_up(self) -> None:
        """Start up server asynchronously"""
        self._serve_task = asyncio.create_task(self.serve())
        await self._startup_done.wait()

    async def tear_down(self) -> None:
        """Shut down server asynchronously"""
        self.should_exit = True
        if self._serve_task:
            await self._serve_task
```

This is a test class which we can use to start and stop the Uvicorn server. Note that the class inherits
from `uvicorn.server`, we need to overwrite the `startup()` method as we want to change the startup a bit.

Before explaining the code above let's take a look at how we may use it:

```python:title=conftest.py
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True, scope="session")
async def startup_and_shutdown_server():
    server = UvicornTestServer()
    await server.start_up()
    yield
    await server.tear_down()

@pytest.fixture(scope="session")
async def client() -> AsyncIterator[AsyncClient]:
    sio = socketio.AsyncClient()
    await sio.connect(BASE_URL)
    yield sio
    await sio.disconnect()

```

What we have done is created two pytest fixtures, the first simply starts an event loop so we can test async code.

### Tangent on asyncio

To test async code with pytest we need to install the `pyest-asyncio` library.
By default this will give us an `event_loop` fixture that runs on scope of `function`. So it will start and stop after
each test function. However if you want to use fixtures that aren't of scope `function` i.e. `session` or `module`.
Then we need to redefine the `event_loop` function as we have done in the example above.

Okay back to our code above. The main bit we are interested in is the `startup_and_shutdown_server` function, here we
start the server before all of our tests and due to how `yield`, you can read more about how
[yield works here](/blog/python-yield-explained/), we will stop our server after all of our tests have run.

This happens automatically without calling the function because of the decorator we have provided
`@pytest.fixture(autouse=True, scope="session")`.
Again we are using scope `session` so that this function isn't called either for
every function (which would slow down our tests). We could've set it to `module` but again
if we have multiple test files we don't want to run this function for every file (module).

### Deeper diver into UvicornTestServer

Let's take a look at the first two methods

```python:title=conftest.py
  def __init__(self, app: ASGIApp = main.app, host: str = LISTENING_IF, port: int = PORT):
      self._startup_done = asyncio.Event()
      self._serve_task: Optional[Awaitable[Any]] = None
      super().__init__(config=uvicorn.Config(app, host=host, port=port))

  async def startup(self) -> None:
      """Override uvicorn startup"""
      await super().startup()
      self.config.setup_event_loop()
      self._startup_done.set()
```

The `__init__` magic dunder method creates an asyncio event `asyncio.Event()`. These events are often used to:

> An asyncio event can be used to notify multiple asyncio tasks that some event has happened. - https://docs.python.org/3/library/asyncio-sync.html#asyncio.Event

Then we create a variable `self._serve_task: Optional[Awaitable[Any]] = None`, we will see how this used later.
Finally we call the parent calls `__init__` method (`super().__init__()`). This calls the `__init__` function
of the `uvicorn.Server` class. We do this to set the `uvicorn.Config`, which includes our app and which host and port
to start the server.

Onto the second method `startup` this also overwrites a method in the parent class. In fact the first we do is call
the parent class's `startup` method (`await super().startup()`). Then we start the event loop ourselves
`self.config.setup_event_loop()`, where our web app will run.

::: note
This is a different event loop in which our tests run in.
:::

Finally we do `self._startup_done.set()`, we are setting this event as true i.e. is complete. So any coroutines waiting
until this set can be carry on their execution.

::: note
An Event object manages an internal flag that can be set to true with the set() method and reset to false with the clear() method. The wait() method blocks until the flag is set to true. The flag is set to false initially. - https://docs.python.org/3/library/asyncio-sync.html#asyncio.Event
:::

#### Yet another tangent on run() method

Now the parent class does have a `run` method we could use, which would start the event loop for us. This however won't work,
lets pretend we change `startup_and_shutdown_server` function too look like this (`server.run()`).

```python{4}
@pytest.fixture(autouse=True, scope="session")
async def startup_and_shutdown_server():
    server = UvicornTestServer()
    await server.run()
    yield
    await server.tear_down()
```

We would get the following error `RuntimeError: asyncio.run() cannot be called from a running event loop`. This because if
we take a look at the `run` method in the parent class it contains something like this line
`return asyncio.run(self.serve(...))`.

This is why we need to write our own code to handle starting the Uvicorn server.

#### `start_up` and `tear_down`

Okay let's move and take a look at the `start_up` and `tear_down` methods

```python:title=conftest.py
async def start_up(self) -> None:
    self._serve_task = asyncio.create_task(self.serve())
    await self._startup_done.wait()

async def tear_down(self) -> None:
    self.should_exit = True
    if self._serve_task:
        await self._serve_task
```

Remember these are the two methods we will call in our "startup and shutdown" fixture. The `start_up` method, creates a task and assigns it
to our empty variable from the `__init__` method `self._serve_task = asyncio.create_task(self.serve())`. It calls the `serve` method to start
the Uvicorn server.

:::note What does `create_task` do ?

It submits the coroutine to run "in the background", i.e. concurrently with the current task and all other tasks, switching between them at await points. It returns an awaitable handle called a "task" which you can also use to cancel the execution of the coroutine. - https://stackoverflow.com/questions/62528272/what-does-asyncio-create-task-do
:::

:::note What is a task ?
It's an asyncio construct that tracks execution of a coroutine in a concrete event loop. When you call create_task, you submit a coroutine for execution and receive back a handle. You can await this handle when you actually need the result, or you can never await it, if you don't care about the result. This handle is the task, and it inherits from Future, which makes it awaitable and also provides the lower-level callback-based interface, such as add_done_callback. - https://stackoverflow.com/questions/62528272/what-does-asyncio-create-task-do
:::

Then we `await self._startup_done.wait()`, this is the event we created earlier. It will wait until the `set()` function
has been called in the in the `startup` method above.

Now onto the `tear_down` method where we set the `should_exit` to true. There is a `main_loop` method called by our
`serve` method in the parent class. This `main_loop` calls an `on_tick` function which returns if `self.should_exit` is true.
So the call chain looks like: `serve` -> `main_loop` -> `on_tick`. When on_tick returns `should_exist` as true, it exits it main loop:

:::important This is code from Uvicorn
:::

```python{3,8}:title=.venv/.../uvicorn/server.py
async def main_loop(self) -> None:
    counter = 0
    should_exit = await self.on_tick(counter)
    while not should_exit:
        counter += 1
        counter = counter % 864000
        await asyncio.sleep(0.1)
        should_exit = await self.on_tick(counter)
```

### Client Fixture

Finally lets take a look at our final fixture, here we create a client that can be used to make requests with socketio.
We use a similar technique with `yields` so we return a socketio client. We will see how this used in one of our tests.

```python:title=conftest.py
@pytest.fixture(scope="session")
async def client() -> AsyncIterator[AsyncClient]:
    sio = socketio.AsyncClient()
    await sio.connect(BASE_URL)
    yield sio
    await sio.disconnect()
```

## test_room.py

```python:title=tests/test_room.py file=./source_code/tests/test_room.py

```

Since we need to wait for the `FOO` event to return a `BAR` event we use a future
to await until we get a response then set the return data in the future

```python:title=tests/test_room.py
@client.on("BAR")
def _(data):
    future.set_result(data)
```

We `await asyncio.wait_for(future, timeout=5.0)` for the future to have data set on it.

That's it, the code itself is fairly simple once everything is setup in `conftest` to actually do the test.

## Appendix

- [Source Code](https://gitlab.com/hmajid2301/articles/tree/master/43.%20Test%20python%20socketio%20&%20uvicorn/source_code)
- [Github Issue: UvicornTestServer](https://github.com/miguelgrinberg/python-socketio/issues/332#issuecomment-712928157)
- [Async Create Task SO](https://stackoverflow.com/questions/62528272/what-does-asyncio-create-task-do)
- [Real application using this testing pattern](https://gitlab.com/banter-bus/banter-bus-core-api)
