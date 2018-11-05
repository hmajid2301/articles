from setuptools import find_packages, setup

setup(
    name="example",
    version="0.1.0",
    author="Haseeb Majid",
    description="An example app",
    keywords="Flask example",
    url=("https://github.com/hmajid2301/medium/tree/feature/using-sql/7.%20Multi%20Docker%20Container%20with%20Nginx,"
         "%20Flask%20and%C2%A0MySQL"),
    python_requires='~=3.6',
    package_dir={'': 'src'},
    packages=find_packages(where='src'),
    zip_safe=False,
    install_requires=[
        "flask==1.0.2",
        "flask-sqlalchemy==2.3.0",
        "psycopg2==2.7.6.1",
        "uwsgi==2.0.17.1"
    ],
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Topic :: Utilities",
        "License :: OSI Approved :: BSD License",
    ],
)
