from flask import flash, g, jsonify, redirect, render_template, request, url_for
from flask_login import login_required#, current_user
# from app.exceptions import ValidationError

from . import main
# from .forms import PasswordForm, PostForm

from .. import db
from ..email import send_email
from ..models import Post


@main.route('/')
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

# API endpoints

@main.route('/api/posts')
def get_posts():
    page = request.args.get('page', 1, type=int)
    pagination = Post.query.paginate(
        page, per_page=10, error_out=False)
    posts = pagination.items
    prev = None
    if pagination.has_prev:
        prev = url_for('main.get_posts', page=page-1)
    next = None
    if pagination.has_next:
        prev = url_for('main.get_posts', page=page+1)
    return jsonify({
        "posts": [post.to_json() for post in posts],
        "prev_url": prev,
        "next_url": next,
        "count": pagination.total
        })


@main.route('/api/post/<int:post_id>')
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_json())


@main.route('/api/posts/', methods=['POST'])
def new_post():
    post = Post.from_json(request.get_json())
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_json()), 201, \
        {"Location": url_for('main.get_post', post_id=post.id)}


@main.route('/api/post/<int:id>', methods=['PUT'])
def edit_post(id):
    post = Post.query.get_or_404(id)
    post.content = request.json.get('content', post.content)
    post.title = request.json.get('title', post.title)
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_json())


@main.route('/poster')
def add_post_once():
    post = Post.query.first()
    return render_template('post.html', post=post)
