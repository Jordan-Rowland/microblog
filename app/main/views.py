from flask import flash, redirect, render_template, request, url_for

from .forms import ContactForm

from .. import app, db
from ..models import Post


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/blog')
def blog():
    return render_template('blog.html')


@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')


@app.route('/contact')
def contact():
    form = ContactForm()
    return render_template('contact.html')


@app.route('/post/<blog_title>')
def post(blog_title):
    return render_template('post.html', blog_title=blog_title)
