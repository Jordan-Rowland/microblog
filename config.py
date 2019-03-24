import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'mysecretkey'
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.googlemail.com')
    MAIL_PORT = os.environ.get('MAIL_PORT', '587')
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in \
        ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    # FAKEBOOK_MAIL_SENDER_PREFIX = '[FAKEBOOK]'
    # FAKEBOOK_MAIL_SENDER = 'FakeBook Admin <BionicPythonic@gmail.com>'
    # FAKEBOOK_ADMIN = os.environ.get('FAKEBOOK_ADMIN')
    # FAKEBOOK_POSTS_PER_PAGE = 10
    # FAKEBOOK_COMMENTS_PER_PAGE = 10
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SSL_REDIRECT = False

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        f'sqlite:///{os.path.join(basedir, "data.sqlite")}'


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{os.path.join(basedir, "data.sqlite")}'


class HerokuConfig(ProductionConfig):
    @classmethod
    def init_app(cls, app):
        ProductionConfig.init_app(app)
        from werkzeug.contrib.fixers import ProxyFix
        app.wsgi_app = ProxyFix(app.wsgi_app)

        import logging
        from logging import StreamHandler
        file_handler = StreamHandler()
        file_handler.setLevel(logging.INFO)
        app.logger.add_Handler(file_handler)
        SSL_REDIRECT = True if os.environ.get('DYNO') else False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
