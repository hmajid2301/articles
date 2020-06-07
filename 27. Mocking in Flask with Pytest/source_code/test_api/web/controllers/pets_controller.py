import connexion
import six

from ..models.pet import Pet  # noqa: E501
from ..models.pets import Pets  # noqa: E501
from .. import util

from test_api.core import pets


def add_pet(body):  # noqa: E501
    """Add a new pet to the store

     # noqa: E501

    :param body: Pet to add to the store
    :type body: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        body = Pet.from_dict(connexion.request.get_json())  # noqa: E501
        new_id = pets.add_pet(body)
        status_code = 201
    else:
        new_id = -1
        status_code = 400

    return {"id": new_id}, status_code


def get_all_pets():  # noqa: E501
    """Gets all pets in the store

     # noqa: E501


    :rtype: Pets
    """
    pets_list = pets.get_all_pets()
    pets_in_store = []
    for pet_id, pet in pets_list.items():
        current_pet = Pet(id=pet_id, breed=pet["breed"], name=pet["name"], price=pet["price"])
        pets_in_store.append(current_pet)

    return pets_in_store, 200


def get_pet(pet_id):  # noqa: E501
    """Get a pet in the store

     # noqa: E501

    :param pet_id: The id of the pet to retrieve
    :type pet_id: str

    :rtype: Pet
    """
    try:
        pet = pets.get_pet(pet_id)
        response = Pet(id=pet.id, breed=pet.breed, name=pet.name, price=pet.price), 200
    except KeyError:
        response = {}, 404

    return response


def remove_pet(pet_id):  # noqa: E501
    """Remove a pet in the store

     # noqa: E501

    :param pet_id: The id of the pet to remove from the store
    :type pet_id: str

    :rtype: None
    """
    try:
        pets.remove_pet(pet_id)
        response = {}, 200
    except KeyError:
        response = {}, 404

    return response


def update_pet(pet_id, Pet):  # noqa: E501
    """Update and replace a pet in the store

     # noqa: E501

    :param pet_id: The id of the pet to update from the store
    :type pet_id: str
    :param Pet: 
    :type Pet: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        Pet = Pet.from_dict(connexion.request.get_json())  # noqa: E501

    try:
        pets.update_pet(pet_id, Pet)
        response = {}, 200
    except KeyError:
        response = {}, 404

    return response
