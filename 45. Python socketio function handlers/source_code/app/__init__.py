import uvicorn

import app.foo.foo_handlers
from app.main import application

app = application

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
