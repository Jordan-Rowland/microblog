import os
from flask import Flask
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from config import config


mail = Mail()
moment = Moment()
db = SQLAlchemy()


def create_dev_app():
    app = Flask(__name__)
    app.config.from_object(config['development'])
    config['development'].init_app(app)

    mail.init_app(app)
    db.init_app(app)
    login_manager.init_app(app)

    return app


def create_prod_app():
    app = Flask(__name__)
    app.config.from_object(config['production'])
    config['production'].init_app(app)

    if app.config['SSL_REDIRECT']:
        from flask_sslify import SSLify
        sslify = SSLify(app)

    mail.init_app(app)
    db.init_app(app)
    login_manager.init_app(app)

    return app
