import os
import json

import pytest

from test_api.run import create_app


@pytest.fixture(scope="session")
def app():
    abs_file_path = os.path.abspath(os.path.dirname(__file__))
    openapi_path = os.path.join(abs_file_path, "../", "openapi")
    os.environ["SPEC_PATH"] = openapi_path

    app = create_app()
    return app


@pytest.fixture(scope="session", autouse=True)
def clean_up():
    yield
    default_pets = {
        "1": {"name": "ginger", "breed": "bengal", "price": 100},
        "2": {"name": "sam", "breed": "husky", "price": 10},
        "3": {"name": "guido", "breed": "python", "price": 518},
    }

    abs_file_path = os.path.abspath(os.path.dirname(__file__))
    json_path = os.path.join(abs_file_path, "../", "test_api", "core", "pets.json")
    with open(json_path, "w") as pet_store:
        json.dump(default_pets, pet_store, indent=4)
