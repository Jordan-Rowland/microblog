from datetime import datetime

from flask import current_app, url_for
from flask_login import UserMixin
from . import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    # return User.query.get(int(user_id))
    pass


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.Text(20), index=True, nullable=False)
    content = db.Column(db.Text(), index=True, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)
