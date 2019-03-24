import os
import sys
import click

from app import create_dev_app, create_prod_app, db
from app.models import Post
from flask_migrate import Migrate

if os.getenv('FLASK_CONFIG') == 'heroku' \
or os.getenv('FLASK_CONFIG') == 'production':
    app = create_prod_app()
else:
    app = create_dev_app()

migrate = Migrate(app, db)
