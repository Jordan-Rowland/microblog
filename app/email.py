from threading import Thread
from flask import current_app, render_template
from flask_mail import Message
from . import mail
import blog


def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)


def send_email(to, subject, msg_body, template, **kwargs):
    msg = Message(current_app.config['MAIL_SENDER_PREFIX'] + subject,
        sender=current_app.config['MAIL_SENDER'], recipients=[to])
    # msg.body = render_template(template + '.txt', **kwargs)
    # msg.html = render_template(template + '.html', **kwargs)
    msg.body = msg_body
    thr = Thread(target=send_async_email, args=[blog.app, msg])
    thr.start()
    return thr
