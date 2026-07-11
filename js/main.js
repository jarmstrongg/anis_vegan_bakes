/* Shared site behavior: year, newsletter feedback, and back-to-top control. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-current-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) { window.addEventListener('scroll', () => backToTop.classList.toggle('is-visible', window.scrollY > 450), { passive: true }); backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })); }
  const form = document.querySelector('.newsletter-form');
  if (form) form.addEventListener('submit', (event) => { event.preventDefault(); const message = form.parentElement.querySelector('.form-message'); message.textContent = 'Thank you — you’re on the list!'; form.reset(); });
});
