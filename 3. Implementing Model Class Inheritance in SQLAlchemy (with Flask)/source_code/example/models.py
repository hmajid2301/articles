import flask_sqlalchemy

db = flask_sqlalchemy

class Pets(db.Model):
    __abstract__ = True
    name = db.Column(db.String(100))
    price = db.Column(db.Integer)
    breed = db.Column(db.String(100))

class Cats(Pets):
    __tablename__ = 'cats'
    id = db.Column(db.Integer, primary_key=True)

class Dogs(Pets):
    __tablename__ = 'dogs'
    id = db.Column(db.Integer, primary_key=True)
