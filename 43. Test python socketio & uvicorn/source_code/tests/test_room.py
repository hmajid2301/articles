import asyncio

import pytest
from socketio.asyncio_client import AsyncClient


@pytest.mark.asyncio
async def test_success(client: AsyncClient):
    future = asyncio.get_running_loop().create_future()

    @client.on("BAR")
    def _(data):
        future.set_result(data)

    await client.emit("FOO", {"name": "haseeb"})
    await asyncio.wait_for(future, timeout=5.0)
    result = future.result()
    assert result == {"foo": "haseeb"}
