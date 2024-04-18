/* Open/close search dialog functions */

const buttonSearchs = document.querySelectorAll('.search');
const pageFindSearch = document.querySelector('.pagefind-search');

// Update button opens a modal dialog
buttonSearchs.forEach((buttonSearch) => {
  buttonSearch.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    pageFindSearch.showModal();
  });
});

// window click closes the dialog box
window.addEventListener("click", (ev) => {
  if (!ev.target.contains(pageFindSearch)) return;
  pageFindSearch.close();
});

/* Open/close mobile menu */

const mobileMenuButton = document.querySelector('#mobileMenuButton');
const mobileNav = document.querySelector('.mobileNav');
const veil = document.querySelector('.veil');

mobileMenuButton.addEventListener("click", (ev) => {
  mobileNav.classList.toggle('open');
});

veil.addEventListener("click", (ev) => {
  mobileNav.classList.toggle('open');
});

/* show/hide menuNav docs nav */

const docsNav = document.querySelector('.mobileNav #docsNav');
const isDocs = document.querySelector('#articleWrapper');

if(isDocs === null) {
  docsNav.classList.add('hidden');
} else {
  docsNav.classList.remove('hidden');
  mobileNav.classList.add('grey');
}