import pytest


def test_get_all_pets(client):
    url = "/api/v1/pet"
    expected_json = [
        {"id": "1", "name": "ginger", "breed": "bengal", "price": 100},
        {"id": "2", "name": "sam", "breed": "husky", "price": 10},
        {"id": "3", "name": "guido", "breed": "python", "price": 518},
    ]
    response = client.get(url)
    assert response.json == expected_json


@pytest.mark.parametrize(
    "pet_data, expected_status, expected_data",
    [({"name": "Yolo", "breed": "shorthair", "price": 100}, 201, {"id": 4}), ({}, 400, {}), ({"a": "b"}, 400, {}),],
)
def test_add_a_pet(client, pet_data, expected_status, expected_data):
    url = "/api/v1/pet"
    response = client.post(url, json=pet_data)
    assert response.status_code == expected_status
    if response.status_code == 200:
        assert response.json == expected_data


def test_add_pet_fail_json(client, mocker):
    pet_data = {"name": "Yolo", "breed": "shorthair", "price": 100}
    url = "/api/v1/pet"
    mock = mocker.patch("connexion.request")
    mock.is_json = False
    response = client.post(url, json=pet_data)
    assert response.status_code == 400
