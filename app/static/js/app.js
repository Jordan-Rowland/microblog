let count = document.querySelector('.number-count');
let msg_box = document.querySelector('.contact-message');
let submit_btn = document.querySelector('.contact-button');

msg_box.addEventListener('input', () => {
    count.innerText = msg_box.textLength;
    if (count.innerText == 0) {
        count.innerText = '';
        submit_btn.classList = 'custom-button contact-button';
    } else if (count.innerText >= 1500 || count.innerText <= 20) {
        count.classList.add('number-count-red');
        submit_btn.classList.add('disabled-button');
        submit_btn.setAttribute('disabled', 'disabled');
    } else {
        submit_btn.classList = 'custom-button contact-button';
        submit_btn.removeAttribute('disabled');
        count.classList = 'number-count';
    }
});
