from flask import flash, redirect, render_template, request, url_for
from flask_login import login_required, current_user

from . import main
from .forms import ContactForm, PasswordForm, PasswordForm

from .. import db
from ..email import send_email
from ..models import Post


@main.route('/', methods=['GET', 'POST'])
def index():
    form = ContactForm()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        subject = form.subject.data
        msg = form.message.data
        send_email(
            to='JordanRowland00@gmail.com',
            subject=f'New message from {name} - {email}',
            msg=msg,
            template='email')
        flash('Message Sent!')
        return redirect(url_for('main.index'))
    return render_template(
        'index.html',
        form=form,)


@main.route('/blog')
def blog():
    return render_template('blog.html')


@main.route('/post/<blog_title>')
def post(blog_title):
    return render_template('post.html', blog_title=blog_title)


@main.route('/login')
def login():
    form = PasswordForm()
    if form.validate_on_submit():
        return redirect(url_for('admin'))
    return render_template('login.html')


@main.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(form.post.data)
        db.session.add(post)
        db.session.commit()
        return redirect(url_for('blog'))
    return render_template('admin.html')
