from flask_wtf import FlaskForm
from wtforms import (PasswordField, StringField,
                     SubmitField, TextAreaField)
from wtforms.validators import DataRequired, Length, Email

from flask_pagedown.fields import PageDownField


class PostForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    body = PageDownField('New Blog!', validators=[DataRequired()])
    submit = SubmitField('Post')


class ContactForm(FlaskForm):
    name = StringField('Your name', validators=[
        DataRequired()])
    email = StringField('Your email', validators=[
        Email(), DataRequired()])
    subject = StringField('Subject', validators=[
        DataRequired()])
    message = TextAreaField('Leave me a message between 20 and 1500 characters',
        validators=[
            Length(min=20, max=1500),
            DataRequired()])
    submit = SubmitField('Submit')


class PasswordForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Submit')
