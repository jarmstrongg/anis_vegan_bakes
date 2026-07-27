/* Front-end preorder interactions connected to n8n. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#preorder-form');
  if (!form) return;

  const WEBHOOK_URL = 'https://ianarmstrong.app.n8n.cloud/webhook-test/bakery-order';

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const products = [...document.querySelectorAll('[data-product-id]')];
  const items = document.querySelector('#summary-items');
  const subtotal = document.querySelector('#order-subtotal');
  const total = document.querySelector('#order-total');
  const error = document.querySelector('#order-error');
  const date = document.querySelector('#pickup-date');
  const populatePickupSundays = () => {
  const numberOfSundays = 8;
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const nextSunday = new Date(today);
  const daysUntilSunday = (7 - today.getDay()) % 7;

  nextSunday.setDate(today.getDate() + daysUntilSunday);

  // Do not allow same-day Sunday pickup.
  if (daysUntilSunday === 0) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  for (let index = 0; index < numberOfSundays; index += 1) {
    const pickupDate = new Date(nextSunday);

    pickupDate.setDate(
      nextSunday.getDate() + index * 7
    );

    const year = pickupDate.getFullYear();
    const month = String(
      pickupDate.getMonth() + 1
    ).padStart(2, '0');
    const day = String(
      pickupDate.getDate()
    ).padStart(2, '0');

    const option = document.createElement('option');

    option.value = `${year}-${month}-${day}`;

    option.textContent = pickupDate.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    );

    date.appendChild(option);
  }
};

  populatePickupSundays();
  const submitButton = form.querySelector('button[type="submit"]');


  const updateSummary = () => {
    let amount = 0;

    const selected = products
      .map((product) => {
        const quantityInput = product.querySelector('[data-quantity]');
        const quantity = Number(quantityInput.value);
        const price = Number(product.dataset.price);

        amount += quantity * price;

        return quantity
          ? `<p>${quantity} × ${product.dataset.productName}
              <span class="float-end">
                ${money.format(quantity * price)}
              </span>
            </p>`
          : '';
      })
      .filter(Boolean);

    items.innerHTML = selected.length
      ? selected.join('')
      : '<p>Your selected bakes will appear here.</p>';

    subtotal.textContent = money.format(amount);
    total.textContent = money.format(amount);

    return amount;
  };

  paymentPreference:
  document.querySelector('input[name="paymentPreference"]:checked')?.value || ''

  const getSelectedItems = () => {
    return products
      .map((product) => {
        const quantity = Number(
          product.querySelector('[data-quantity]').value
        );

        if (quantity === 0) return null;

        const price = Number(product.dataset.price);

        return {
          productId: product.dataset.productId,
          productName: product.dataset.productName,
          quantity,
          price,
          lineTotal: quantity * price,
        };
      })
      .filter(Boolean);
  };

  const getFieldValue = (...selectors) => {
    for (const selector of selectors) {
      const field = document.querySelector(selector);

      if (field) {
        return field.value.trim();
      }
    }

    return '';
  };

  document
    .querySelectorAll('[data-quantity-action]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const input = button.parentElement.querySelector(
          '[data-quantity]'
        );

        const change =
          button.dataset.quantityAction === 'increase' ? 1 : -1;

        input.value = Math.max(
          0,
          Math.min(Number(input.max), Number(input.value) + change)
        );

        updateSummary();
      });
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    error.textContent = '';
    form.classList.add('was-validated');

    const amount = updateSummary();
    const selectedItems = getSelectedItems();

    if (!form.checkValidity()) {
      error.textContent =
        'Please complete your contact and pickup details.';
      return;
    }

    if (amount === 0) {
      error.textContent =
        'Please add at least one bake to your order.';
      return;
    }

    const customerName = getFieldValue(
      '#customer-name',
      '[name="customerName"]'
    );

    const orderData = {
      customerName,

      email: getFieldValue(
        '#customer-email',
        '#email',
        '[name="email"]'
      ),

      phone: getFieldValue(
        '#customer-phone',
        '#phone',
        '[name="phone"]'
      ),

      pickupDate: getFieldValue(
        '#pickup-date',
        '[name="pickup_date"]'
      ),

      pickupTime: getFieldValue(
        '#pickup-time',
        '[name="pickupTime"]'
      ),

      items: selectedItems
        .map(
          (item) =>
            `${item.quantity} × ${item.productName} — ${money.format(
              item.lineTotal
            )}`
        )
        .join(', '),

      itemDetails: selectedItems,

      estimatedTotal: amount,

      specialInstructions: getFieldValue(
        '#special-instructions',
        '#order-notes',
        '[name="specialInstructions"]'
      ),

      paymentPreference: getFieldValue(
        '#payment-preference',
        '[name="paymentPreference"]'
      ),
    };

    const originalButtonText = submitButton
      ? submitButton.textContent
      : '';

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(
          `Order request failed with status ${response.status}`
        );
      }

      document.querySelector(
        '#confirmation-message'
      ).textContent =
        `Thanks, ${customerName}! We received your order request ` +
        `for ${money.format(amount)}. Ani will review it and send ` +
        `you a confirmation.`;

      bootstrap.Modal.getOrCreateInstance(
        document.querySelector('#orderConfirmation')
      ).show();

      form.reset();

      products.forEach((product) => {
        product.querySelector('[data-quantity]').value = 0;
      });

      form.classList.remove('was-validated');
      updateSummary();
    } catch (requestError) {
      console.error('Order submission error:', requestError);

      error.textContent =
        'We could not submit your order request. Please try again.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });

  updateSummary();
});