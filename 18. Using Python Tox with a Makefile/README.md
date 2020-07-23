---
title: "Using Tox with a Makefile to Automate Python related tasks"
tags: ["Python", "Tox", "Makefile", "automation"]
license: "public-domain"
slug: "using-tox-and-makefile-automation"
canonical_url: "https://haseebmajid.dev/blog/using-tox-and-makefile-automation"
date: "2020-01-13"
published: true
cover_image: "images/cover.jpg"
---

In this article, we will go over how we can use a makefile and tox to automate various Python related command line (CLI) tools.
This article assumes you are running bash (or equivalent).

---

## Tox

[Tox](https://tox.readthedocs.io/en/latest/) is an automation tool used primarily to add in testing.
On the Tox website, it describes itself as

> tox aims to automate and standardize testing in Python. It is part of a larger vision of easing the packaging, testing and release process of Python software.

You define a configuration file `tox.ini` where you define all of your tox environments. In the example below,we have two environments, `testenv` to run our tests
and `testenv:lint` to lint our code with Flake8.

```ini
[tox]
envlist = py36,py37,lint

[testenv]
basepython =
    {lint}: {env:TOXPYTHON:python3}
    py36: {env:TOXPYTHON:python3.6}
    py37: {env:TOXPYTHON:python3.7}
passenv = *
install_command = pip install {opts} {packages}
deps =
    pytest
    pytest-mock
usedevelop = false
commands = pytest -v {posargs} tests

[testenv:lint]
skip_install = true
deps = flake8
commands = flake8 src/
```

How Tox works is that it created a virtual environment (virtualenv) for each tox environment defined in the configuration file (`tox.ini`).
It then runs our command within that virtualenv, you can see these if you take a look in the `.tox` folder.
So in our lint example, it would create a virtualenv called lint in the .tox folder, install our dependencies `flake8` and finally run the command
`flake8 src/` (within the lint virtualenv). You can read more about how Tox works [over here](https://tox.readthedocs.io/en/latest/#system-overview).
So how do we run a tox environment, like so;

```bash
# Install Tox
pip install tox
# Run the tox environment
tox -e lint
```

We can pass extra parameters to tox environments using the `{posargs}`. So for example, if we had an environment defined as

```ini
[testenv:bumpversion]
skip_install = true
deps = bumpversion
commands = bumpversion --verbose {posargs}
```

We could run it like so `tox -e bumpversion -- --allow-dirty patch` (note the extra `--`).

So as you can see Tox allows us to automate tedious Python related tasks such as code formatting, running the lint and running unit tests.
We can test our against using different versions of Python as well such as Python3.6 or Python3.7, to make sure our code is compatible with
both. So if we wanted to run pytest against python3.6 we could do it like so `tox -e py36` and equally python3.7 as `tox -e py37`
(given the same configuration file as above). Some common tools Tox is used in conjunction with include;

- [Black](https://github.com/psf/black)
- [Isort](https://github.com/timothycrosley/isort)
- [Pytest](https://github.com/timothycrosley/isort)
- [Flake8](https://github.com/PyCQA/flake8)
- [Bumpversion](https://github.com/peritus/bumpversion)
- [Twine](https://github.com/pypa/twine)

---

## Makefile

Makefiles are often used in C/C++ programs to compile the code/generate binaries etc. Used to automate (often long-winded) tasks.
To use a make file all you need to do is create a file called `Makefile`. Each "job" in the makefile is called a `target`, for
example a makefile may look like so;

```makefile
PY = py36

# prompt_example> make test PY=py36 OPTIONS="-- -s"
.PHONY: test
test:
	@tox -e $(PY) $(OPTIONS)

.PHONY: lint
lint:
	@tox -e lint
```

So now if we want to run our linter we could simply do `make lint`, to run our tests we can simply type the command `make test`.
If we want to specify a Python version we could do `make test PY=py37` (note how `$(PY)` is a variable
we can override). This may remind of tools available to other languages such as `package.json` for JavaScript/NodeJS.
The main advantage of using a Makefile with Tox is that we can define targets in our makefile that aren't specifically
related to Python tools. Such as cleaning our project.

```makefile
.PHONY: clean
clean:
	@find . -type f -name '*.pyc' -delete
	@find . -type d -name '__pycache__' | xargs rm -rf
	@find . -type d -name '*.ropeproject' | xargs rm -rf
	@rm -rf build/
	@rm -rf dist/
	@rm -f src/*.egg*
	@rm -f MANIFEST
	@rm -rf docs/build/
	@rm -f .coverage.*
```

That's is a simple introduction how you can use a `Makefile` and `Tox` in conjunction to automate various
tedious tasks.

---

## Appendix

- [Example Project](https://gitlab.com/gitlab-automation-toolkit/gitlab-auto-release/tree/abfdd70e1dae8bacf7dfd999a76711ca052ce23e)
