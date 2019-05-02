import os

from flask_migrate import upgrade, Migrate
from flask_script import Manager

from app import create_dev_app, create_prod_app, db


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
