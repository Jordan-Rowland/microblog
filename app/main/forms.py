from flask_wtf import FlaskForm
from wtforms import BooleanField, StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Length, Email


class PostForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    post = StringField('New Blog!', validators=[DataRequired()])
    submit = SubmitField('Post')


class ContactForm(FlaskForm):
    name = StringField('Your name', validators=[DataRequired()])
    email = StringField('Your email', validators=[Email(), DataRequired()])
    subject = StringField('Subject', validators=[DataRequired()])
    message = TextAreaField('Message', validators=[DataRequired()])
    submit = SubmitField('Submit')


class PasswordForm(FlaskForm):
    password = StringField('Password', validators=[DataRequired()])
    submit = SubmitField('Post')
