from setuptools import find_packages, setup

setup(
    name="example",
    version="0.1.0",
    author="Haseeb Majid",
    description="An example app",
    keywords="Flask example",
    url=("https://gitlab.com/hmajid2301/articles/-/tree/master/9.%20Testing%20with%20pytest-mock%20and%20pytest-flask,"
         "%20Flask%20and%C2%A0MySQL"),
    python_requires='~=3.6',
    package_dir={'': 'src'},
    packages=find_packages(where='src'),
    zip_safe=False,
    install_requires=[
        "flask",
        "flask-sqlalchemy",
        "psycopg2",
    ],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Topic :: Utilities",
        "License :: OSI Approved :: BSD License",
    ],
)
