/* Front-end preorder interactions. This module intentionally makes no network requests. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#preorder-form');
  if (!form) return;

  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const products = [...document.querySelectorAll('[data-product-id]')];
  const items = document.querySelector('#summary-items');
  const subtotal = document.querySelector('#order-subtotal');
  const total = document.querySelector('#order-total');
  const error = document.querySelector('#order-error');
  const date = document.querySelector('#pickup-date');
  date.min = new Date().toISOString().split('T')[0];

  const updateSummary = () => {
    let amount = 0;
    const selected = products.map((product) => {
      const quantity = Number(product.querySelector('[data-quantity]').value);
      const price = Number(product.dataset.price);
      amount += quantity * price;
      return quantity ? `<p>${quantity} × ${product.dataset.productName} <span class="float-end">${money.format(quantity * price)}</span></p>` : '';
    }).filter(Boolean);
    items.innerHTML = selected.length ? selected.join('') : '<p>Your selected bakes will appear here.</p>';
    subtotal.textContent = money.format(amount);
    total.textContent = money.format(amount);
    return amount;
  };

  document.querySelectorAll('[data-quantity-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('[data-quantity]');
      const change = button.dataset.quantityAction === 'increase' ? 1 : -1;
      input.value = Math.max(0, Math.min(Number(input.max), Number(input.value) + change));
      updateSummary();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    error.textContent = '';
    const amount = updateSummary();
    if (!form.checkValidity()) { form.classList.add('was-validated'); error.textContent = 'Please complete your contact and pickup details.'; return; }
    if (amount === 0) { error.textContent = 'Please add at least one bake to your order.'; return; }
    const name = document.querySelector('#customer-name').value.trim();
    document.querySelector('#confirmation-message').textContent = `Thanks, ${name}! Your preorder preview for ${money.format(amount)} is ready.`;
    bootstrap.Modal.getOrCreateInstance(document.querySelector('#orderConfirmation')).show();
  });
});
