from flask import (
    current_app,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    send_file,
    url_for)
from flask_login import (
    login_required,
    login_user,
    logout_user,
    )

from . import main
from .forms import PasswordForm, PostForm

from .. import db, slugify
# from ..email import send_email
from ..models import Email, Post, User


@main.route('/', methods=['GET', 'POST'])
def index():

    list_of_emails = request.get_json()
    print(list_of_emails)
    if list_of_emails:
        for data in list_of_emails:
            email_db = Email(
                email=data.get('email'),
                name=data.get('name'),
                subject=data.get('subject'),
                body=data.get('message'),
                timestamp=data.get('timestamp'))
            db.session.add(email_db)
            db.session.commit()
            # send_email(
            #     to='jrowlandlmp@gmail.com',
            #     subject=f'New message from {data.get("name")} - {data.get("email")}',
            #     msg_body=f'''
            #     [SUBJECT]
            #     {data.get("subject")}

            #     [MESSAGE]
            #     {data.get("message")}
            #     ''',
            #     template='email'
            #     )

    return render_template(
        'index.html',
        )


def download_resume():
    return send_file('static/Jordan_Rowland_Resume_2019.pdf', as_attachment=True)


@main.route('/resume/')
@main.route('/resume')
def resume():
    return download_resume()


@main.route('/blog/')
@main.route('/blog')
def blog():
    posts = Post.query.order_by(Post.timestamp.desc()).all()
    return render_template('blog.html', posts=posts)


@main.route('/blog/<string:title_slug>')
def blog_post(title_slug):
    post = Post.query.filter_by(title_slug=title_slug).first_or_404()
    return render_template('post.html', post=post)


@main.route('/login/', methods=['GET', 'POST'])
@main.route('/login', methods=['GET', 'POST'])
def login():
    form = PasswordForm()
    if form.validate_on_submit():
        user = User.query.first()
        if user.check_password(form.password.data):
            login_user(user)
            return redirect(url_for('.admin'))
    return render_template('login.html', form=form)


@main.route('/logout/')
@main.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('.index'))


@main.route('/admin/', methods=['GET', 'POST'])
@main.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    form = PostForm()
    if form.validate_on_submit():
        print(form.title.data,
            form.body.data,
            slugify(form.title.data))
        post = Post(title=form.title.data,
                    body=form.body.data,
                    title_slug=slugify(form.title.data))
        db.session.add(post)
        db.session.commit()
        return redirect(url_for('.blog_post', title_slug=post.title_slug))
    return render_template('admin.html', form=form)


@main.route('/deletepost/<post_id>')
@login_required
def deletepost(post_id):
    Post.query.filter_by(id=post_id).delete()
    db.session.commit()
    flash(f'Post has been deleted.', 'card-panel blue lighten-2 s12')
    return redirect(url_for('.admin'))


@main.route('/emails/')
@main.route('/emails')
@login_required
def emails():
    emails_ = Email.query.all()
    return render_template('emails.html', emails=emails_)


@main.route('/sw.js', methods=['GET'])
def sw():
    return current_app.send_static_file('sw.js')


@main.route('/offline')
def offline():
    return render_template('offline.html')


########## API endpoints

@main.route('/api/posts/')
@main.route('/api/posts')
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


@main.route('/api/posts/<int:post_id>')
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
def page_not_found():
    return render_template('404.html'), 404
