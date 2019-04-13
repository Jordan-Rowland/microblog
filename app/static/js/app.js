let count = document.querySelector('.number-count');
let submit_btn = document.querySelector('.contact-button');
let nav = document.querySelector('nav');
let inputform = document.querySelector('#inputform');


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
        submit_btn.setAttribute('disabled', 'disabled');
    } else {
        submit_btn.removeAttribute('disabled');
        count.classList = 'number-count';
    }
});


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
    .then(res => JSON.stringify(res.json()))
    .catch(err => console.log(err));

    form.name.value = '';
    form.email.value = '';
    form.subject.value = '';
    form.message.value = '';
    count.innerText = '';
    submit_btn.setAttribute('disabled', 'disabled');

});


window.onscroll = () => {
    if (window.pageYOffset >= 500) {
        nav.classList.add("sticky");
    } else {
        nav.classList.remove("sticky");
    }
};


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
