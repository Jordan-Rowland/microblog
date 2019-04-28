/* jshint esversion: 9 */
let count = document.querySelector('.number-count');
let submit_btn = document.querySelector('.contact-button');
let nav = document.querySelector('nav');
let inputform = document.querySelector('#inputform');

let post_title = document.querySelector('#post-title');
let post_timestamp = document.querySelector('#post-timestamp');
let post_body = document.querySelector('#post-body');
let post_link = document.querySelector('#post-link');
let next_post = document.querySelector('#next-post');
let prev_post = document.querySelector('#prev-post');
let blog_nav = document.querySelector('.blog-nav');


let blog_number = 0;


let display_blog_post = function (res, blog_index = blog_number) {
  post_title.innerText = res[blog_index].title;
  post_timestamp.innerText = res[blog_index].timestamp.slice(0, 16);
  post_body.innerText = `${res[blog_index].body.slice(0,500)}...`;
  post_link.innerHTML = `<a href="blog/${res[blog_index].title_slug}">Read More</a>`;
};


let posts;
let fetch_posts = (post_number) => {
  fetch('/api/posts')
    .then(res => res.json())
    .then(res => res.posts)
    .then(res => posts = res)
    .then(res => {
      display_blog_post(res, post_number);
    });
};

// onselectstart = (e) => {e.preventDefault()}

window.onload = fetch_posts(0);

// Edit this and put if blog_number inside of clicked_elements
blog_nav.addEventListener('click', (e) => {
  let clicked_element = e.path[0];
  if (clicked_element == next_post) {
    blog_number += 1;
    display_blog_post(posts, blog_number);
  } else if (clicked_element == prev_post) {
    blog_number -= 1;
    display_blog_post(posts, blog_number);
  }
  if (blog_number == 0) {
    prev_post.style.visibility = 'hidden';
  } else if (blog_number == (posts.length - 1)) {
    next_post.style.visibility = 'hidden';
  } else {
    prev_post.style.visibility = 'visible';
    next_post.style.visibility = 'visible';
  }
});


document.addEventListener('input', () => {
  let form = inputform.elements;

  let form_name = form.name;
  let form_email = form.email;
  let form_subject = form.subject;
  let form_message = form.message;

  count.innerText = form_message.textLength;

  if (count.innerText == 0) {
    count.innerText = '';
    submit_btn.classList = 'custom-button contact-button';
  } else if (count.innerText >= 1500 ||
    count.innerText <= 20 ||
    form_name.value == '' ||
    form_email.value == '' ||
    !form_email.value.includes('@') ||
    form_subject.value == '') {
    count.classList.add('number-count-red');
    submit_btn.classList.remove('allow-button');
    submit_btn.classList = 'custom-button contact-button';
    submit_btn.setAttribute('disabled', 'disabled');
  } else {
    submit_btn.removeAttribute('disabled');
    count.classList = 'number-count';
  }

});


function toast_function() {
  let toast = document.querySelector('#toast');
  toast.className = 'show';
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 5000);
}


submit_btn.addEventListener('click', () => {
  let form = inputform.elements;

  let form_name = form.name.value;
  let form_email = form.email.value;
  let form_subject = form.subject.value;
  let form_message = form.message.value;

  let data = JSON.stringify({
    name: form_name,
    email: form_email,
    subject: form_subject,
    message: form_message
  });

  fetch('/', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: data
    })
    .then(() => toast_function())
    .catch(err => console.log(err));

  form.name.value = '';
  form.email.value = '';
  form.subject.value = '';
  form.message.value = '';
  count.innerText = '';
  submit_btn.setAttribute('disabled', 'disabled');

});


window.onscroll = () => {
  if (window.pageYOffset >= 730) {
    nav.classList.add("sticky");
  } else {
    nav.classList.remove("sticky");
  }
};


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
