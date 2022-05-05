import socketio
import uvicorn
from pydantic import BaseModel


async def startup():
    print("Starting Application")


sio = socketio.AsyncServer(async_mode="asgi")
app = socketio.ASGIApp(sio, on_startup=startup)


class FooEvent(BaseModel):
    name: str


@sio.on("FOO")
async def foo_event(sid, *args, **kwargs):
    data = FooEvent(**args[0])
    await sio.emit("BAR", {"foo": data.name})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
