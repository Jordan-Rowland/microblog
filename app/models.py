from datetime import datetime

from flask import current_app, url_for
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from . import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer(), primary_key=True)
    password_hash = db.Column(db.String(128), nullable=False)

    def __init__(self, password):
        self.password_hash = generate_password_hash(password)


    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.Text(45), index=True, nullable=False, default='')
    content = db.Column(db.Text(), index=True, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)


    def to_json(self):
        json_post = {
            "url": url_for('main.get_post', post_id=self.id),
            "title": self.title,
            "content": self.content,
            "timestamp": self.timestamp,
            "id": self.id
        }
        return json_post


    @staticmethod
    def from_json(json_post):
        content = json_post.get('content')
        title = json_post.get('title')
        if content is None or content == '':
            raise ValidationError('post does not have any content')
        return Post(content=content, title=title)
