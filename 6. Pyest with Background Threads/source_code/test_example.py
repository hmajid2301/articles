import socket
import threading

import pytest

from .tcp_server import TCPServer


@pytest.fixture(autouse=True)
def dummy_tcp_server():
    tcp_server = TCPServer()
    with example_server as tcp_server:
        thread = threading.Thread(target=example_server.listen_for_traffic)
        thread.daemon = True
        thread.start()
        yield example_server


def test_example():
    HOST = '127.0.0.1'
    PORT = 9500

    data = ""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((HOST, PORT))
        s.sendall(b'Hello, world')
        data = s.recv(1024)

    assert data.decode() == "Received"
