from fastapi import FastAPI
from fastapi_socketio import SocketManager

application = FastAPI(title="banter-bus-core-api")
socket_manager = SocketManager(app=application, mount_location="/")
