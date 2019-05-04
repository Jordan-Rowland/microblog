from flask import (g, jsonify,
    redirect, render_template,
    request, url_for, current_app,
    Response)
from flask_login import login_required, login_user, logout_user, current_user

from . import main
from .forms import PasswordForm, PostForm

from .. import db, slugify
from ..email import send_email
from ..models import Email, Post, User


@main.route('/', methods=['GET', 'POST'])
def index():

    data = request.get_json()
    if data:
        email_db = Email(
            email=data['email'],
            name=data['name'],
            subject=data['subject'],
            body=data['message'])
        db.session.add(email_db)
        db.session.commit()
        send_email(
            to='jrowlandlmp@gmail.com',
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


@main.route('/resume/')
def resume():
    return render_template('resume.html')


@main.route('/blog/')
def blog():
    posts = Post.query.order_by(Post.timestamp.desc()).all()
    return render_template('blog.html', posts=posts)


@main.route('/blog/<string:title_slug>')
def blog_post(title_slug):
    post = Post.query.filter_by(title_slug=title_slug).first_or_404()
    return render_template('post.html', post=post)


@main.route('/login/', methods=['GET', 'POST'])
def login():
    form = PasswordForm()
    if form.validate_on_submit():
        user = User.query.first()
        if user.check_password(form.password.data):
            login_user(user)
            return redirect(url_for('.admin'))
    return render_template('login.html', form=form)


@main.route('/admin/', methods=['GET', 'POST'])
@login_required
def admin():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(title=form.title.data,
                    body=form.body.data,
                    title_slug=slugify(form.title.data))
        db.session.add(post)
        db.session.commit()
        return redirect(url_for('.blog_post', title_slug=post.title_slug))
    return render_template('admin.html', form=form)


@main.route('/sw.js', methods=['GET'])
def sw():
    return current_app.send_static_file('sw.js')


@main.route('/offline')
def offline():
    return "Oops! This page hasn't been cached yet!"


########## API endpoints

@main.route('/api/posts/')
def get_posts():
    page = request.args.get('page', 1, type=int)
    pagination = Post.query.order_by(Post.timestamp.desc()).paginate(
        page, per_page=10, error_out=False)
    posts = pagination.items
    prev = None
    if pagination.has_prev:
        prev = url_for('main.get_posts', page=page-1)
    next_page = None
    if pagination.has_next:
        prev = url_for('main.get_posts', page=page+1)
    return jsonify({
        "posts": [post.to_json() for post in posts],
        "prev_url": prev,
        "next_url": next_page,
        "count": pagination.total
        })


@main.route('/api/post/<int:post_id>')
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_json())


# @main.route('/api/posts/', methods=['POST'])
# @login_required
# def new_post():
#     post = Post.from_json(request.get_json())
#     db.session.add(post)
#     db.session.commit()
#     return jsonify(post.to_json()), 201, \
#         {"Location": url_for('main.get_post', post_id=post.id)}


# @main.route('/api/post/<int:id>', methods=['PUT'])
# def edit_post(id):
#     post = Post.query.get_or_404(id)
#     post.body = request.json.get('body', post.body)
#     post.title = request.json.get('title', post.title)
#     db.session.add(post)
#     db.session.commit()
#     return jsonify(post.to_json())


@main.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
