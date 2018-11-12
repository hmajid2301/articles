import pytest

from example import create_app


@pytest.fixture
def app(mocker):
    mocker.patch("flask_sqlalchemy.SQLAlchemy.init_app", return_value=True)
    mocker.patch("flask_sqlalchemy.SQLAlchemy.create_all", return_value=True)
    mocker.patch("example.database.get_all", return_value={})
    app = create_app()
    return app


def test_example(client):
    response = client.get("/")
    assert response.status_code == 200
