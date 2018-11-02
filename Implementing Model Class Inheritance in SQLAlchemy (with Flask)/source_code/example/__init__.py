from flask import Flask

from .models import db

uri = "mysql+pymysql://user:password@localhost:3306/test"
app.config['SQLALCHEMY_DATABASE_URI'] = uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.app_context().push()

db.init_app(app)
db.create_all()