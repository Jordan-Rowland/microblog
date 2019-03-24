from flask_wtf import FlaskForm
from wtforms import BooleanField, StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Length, Email


class PostForm(FlaskForm):
    post = StringField('New Blog!', validators=[DataRequired()])
    submit = SubmitField('Post')


class ContactForm(FlaskForm):
    email = StringField('Email', validators=[Email()])
    subject = StringField('Subject', validators=[DataRequired()])
    message = StringField('Message', validators=[DataRequired()])
    submit = SubmitField('Submit')


class PasswordForm(FlaskForm):
    password = StringField('Password', validators=[DataRequired()])
    submit = SubmitField('Post')
