from flask import flash, redirect, render_template, request, url_for
from flask_login import login_required#, current_user

from . import main
# from .forms import PasswordForm, PostForm

from .. import db
from ..email import send_email
from ..models import Post


@main.route('/', methods=['GET', 'POST'])
def index():

    data = request.get_json()
    print(data)
    if data:
        send_email(
            to='JordanRowland00@gmail.com',
            subject=f'New message from {data["name"]} - {data["email"]}',
            msg_body=f'''
            [SUBJECT]
            {data["subject"]}

            [MESSAGE]
            {data["message"]}
            ''',
            template='email'
            )

    return render_template(
        'index.html',
        )


@main.route('/blog')
def blog():
    return render_template('blog.html')


@main.route('/post/<blog_title>')
def blog_post(blog_title):
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
