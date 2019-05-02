import os
import sys
import click

from app import create_dev_app, create_prod_app, db
from flask_migrate import upgrade
from flask_script import Manager
from app.models import Post, User
from flask_migrate import Migrate


manager = Manager()

@manager.command
def deploy():
	upgrade()


if os.getenv('FLASK_CONFIG') == 'heroku' \
or os.getenv('FLASK_CONFIG') == 'production':
    app = create_prod_app()
else:
    app = create_dev_app()

migrate = Migrate(app, db)
