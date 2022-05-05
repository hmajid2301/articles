from app.main import socket_manager as sm


@sm.on("FOO")
async def foo_event(sid, *args, **kwargs):
    await sm.emit("BAR", {"response": "hello world!"})
