from flask import flash, redirect, render_template, request, url_for
from flask_login import login_required, current_user

from . import main
from .forms import ContactForm, PasswordForm, PasswordForm

from .. import db
from ..models import Post


@main.route('/')
def index():
    form = ContactForm()
    return render_template(
        'index.html',
        form=form,)


@main.route('/about')
def about():
    return render_template('about.html')


@main.route('/blog')
def blog():
    return render_template('blog.html')


@main.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')


@main.route('/contact')
def contact():
    form = ContactForm()
    return render_template('contact.html')


@main.route('/post/<blog_title>')
def post(blog_title):
    return render_template('post.html', blog_title=blog_title)


@main.route('/login')
def login():
    form = PasswordForm()
    if form.validate_on_submit():
        return redirect(url_for('admin'))
    return render_template('login.html')


@main.route('/admin')
@login_required
def admin():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(form.post.data)
        db.session.add(post)
        db.session.commit()
        return redirect(url_for('blog'))
    return render_template('admin.html')
