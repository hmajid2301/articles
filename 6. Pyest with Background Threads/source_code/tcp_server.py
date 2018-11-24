import socket


class TCPServer:
    def __init__(self):
            self._sock = socket.socket(socket.AF_INET, 
                                       socket.SOCK_STREAM)
            self._sock.setsockopt(socket.SOL_SOCKET, 
                                  socket.SO_REUSEADDR, 1)
            
    def __enter__(self):
            self._sock.bind(('127.0.0.1', 9500))
            return self
            
    def __exit__(self, exception_type, exception_value, traceback):
            self._sock.close()
            
    def listen_for_traffic(self):
            while True:
                self._sock.listen(5)
                connection, address = self._sock.accept()
                message = connection.recv(1024)
                response = "Received"
                connection.send(response.encode())
                connection.close()
