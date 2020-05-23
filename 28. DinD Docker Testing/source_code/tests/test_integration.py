import docker as docker_py
import pytest

docker_client = docker_py.from_env()
docker_compose = None


@pytest.fixture(scope="session", autouse=True)
def docker(docker_services):
    global docker_compose
    docker_compose = docker_services


@pytest.fixture(scope="session", autouse=True)
def setup():
    docker_compose.start()
    yield
    docker_compose.shutdown()


def kill_container(container_name):
    container = get_container(container_name)
    container.kill()
    container.remove()


def get_container(container_name):
    containers = docker_client.containers.list()
    for container in containers:
        if container.name == container_name:
            return container


def start_container(service_name):
    docker_compose.start(service_name)


def test_two_containers():
    containers = docker_client.containers.list()
    assert len(containers) == 2


def test_kill_container1():
    kill_container("container1")
    containers = docker_client.containers.list()
    container1 = get_container("container1")
    assert len(containers) == 1
    assert not container1

def test_start_container1():
    start_container("service1")
    containers = docker_client.containers.list()
    container1 = get_container("container1")
    assert len(containers) == 2
    assert container1