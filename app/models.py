import datetime

from flask import url_for
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import bleach
from markdown import markdown

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


# Timezone adjustments
def now():
    return datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc)

def astimezone(d, offset):
    return d.astimezone(datetime.timezone(datetime.timedelta(hours=offset)))

def PDTNow():
    return str(astimezone(now(), -7))

def PSTNow():
    return str(astimezone(now(), -8))


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.Text(), index=True, nullable=False)
    title_slug = db.Column(db.Text(), index=True)
    body = db.Column(db.Text(), index=True, nullable=False)
    body_html = db.Column(db.Text())
    timestamp = db.Column(db.Text(), nullable=False, default=PDTNow)


    def to_json(self):
        json_post = {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "timestamp": self.timestamp,
            "title_slug": self.title_slug,
            "url": url_for('main.get_post', post_id=self.id)
        }
        return json_post


    @staticmethod
    def from_json(json_post):
        body = json_post.get('body')
        title = json_post.get('title')
        if body is None or body == '':
            raise ValidationError('post does not have any body')
        return Post(body=body, title=title)


    @staticmethod
    def on_changed_body(target, value):
        allowed_tags = ['a', 'abbr', 'acronym', 'b', 'blockquote', 'br', 'code',
                        'em', 'i', 'li', 'ol', 'pre', 'strong', 'ul',
                        'h1', 'h2', 'h3', 'p',]
        target.body_html = bleach.linkify(bleach.clean(
            markdown(value, output_format='html'),
            tags=allowed_tags, strip=True))


db.event.listen(Post.body, 'set', Post.on_changed_body)


class Email(db.Model):
    __tablename__ = 'emails'


    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    email = db.Column(db.Text)
    subject = db.Column(db.Text)
    body = db.Column(db.Text)
    timestamp = db.Column(db.Text(), default=PDTNow)
