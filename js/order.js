/* Front-end preorder interactions connected to n8n. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#preorder-form');
  if (!form) return;

  const WEBHOOK_URL = 'https://ianarmstrong.app.n8n.cloud/webhook/bakery-order';

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

  const pickupLocation = document.querySelector('#pickup-location');
  const pickupTime = document.querySelector('#pickup-time');
  const pickupLocationInfo = document.querySelector('#pickup-location-info');

  const OAKHURST_PICKUP_LOCATION = "Oakhurst Park, Westminster";
  const BOULDER_PICKUP_LOCATION = "Boulder Pickup — January Coffee Parking Lot";
  const BOULDER_PICKUP_DATES = [
    { value: "2026-11-15", label: "Sunday, November 15, 2026" },
    { value: "2026-11-24", label: "Tuesday, November 24, 2026" },
    { value: "2026-11-25", label: "Wednesday, November 25, 2026" }
  ];
  const OAKHURST_EXTRA_PICKUP_DATES = [
    { value: "2026-11-24", label: "Tuesday, November 24, 2026" },
    { value: "2026-11-25", label: "Wednesday, November 25, 2026" }
  ];

  const addPickupDateOption = (value, label) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    date.appendChild(option);
  };

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

  const unavailableSundayDates = new Set([
    "2026-11-22",
    "2026-11-29"
  ]);

  for (let index = 0; index < numberOfSundays; index += 1) {
    const sundayDate = new Date(nextSunday);

    sundayDate.setDate(
      nextSunday.getDate() + index * 7
    );

    const sundayYear = sundayDate.getFullYear();
    const sundayMonth = String(
      sundayDate.getMonth() + 1
    ).padStart(2, "0");
    const sundayDay = String(
      sundayDate.getDate()
    ).padStart(2, "0");

    const dateValue = `${sundayYear}-${sundayMonth}-${sundayDay}`;

    // No Sunday pickups are offered on November 22 or November 29.
    if (unavailableSundayDates.has(dateValue)) {
      continue;
    }

    addPickupDateOption(
      dateValue,
      sundayDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    );
  }
};

  const populatePickupDates = () => {
    const selectedDate = date.value;

    date.innerHTML = '<option value="">Choose a Pickup Day</option>';

    if (pickupLocation.value === BOULDER_PICKUP_LOCATION) {
      BOULDER_PICKUP_DATES.forEach(({ value, label }) => {
        addPickupDateOption(value, label);
      });
    } else {
      populatePickupSundays();

      if (pickupLocation.value === OAKHURST_PICKUP_LOCATION) {
        OAKHURST_EXTRA_PICKUP_DATES.forEach(({ value, label }) => {
          addPickupDateOption(value, label);
        });

        [...date.options]
          .slice(1)
          .sort((firstDate, secondDate) =>
            firstDate.value.localeCompare(secondDate.value)
          )
          .forEach((option) => date.appendChild(option));
      }
    }

    if ([...date.options].some((option) => option.value === selectedDate)) {
      date.value = selectedDate;
    }
  };

  const boulderPickupTimes = [
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM"
  ];
  const oakhurstPickupTimes = [
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM"
  ];

  // Temporary November Boulder pickup schedule.
  const specialPickupSchedule = {
    "2026-11-15": {
      [BOULDER_PICKUP_LOCATION]: {
        hours: "Sunday, November 15, 3:00 PM-7:00 PM",
        times: boulderPickupTimes
      }
    },
    "2026-11-24": {
      [BOULDER_PICKUP_LOCATION]: {
        hours: "Tuesday, November 24, 3:00 PM-7:00 PM",
        times: boulderPickupTimes
      },
      [OAKHURST_PICKUP_LOCATION]: {
        hours: "Tuesday, November 24, 11:00 AM-6:00 PM",
        times: oakhurstPickupTimes
      }
    },
    "2026-11-25": {
      [BOULDER_PICKUP_LOCATION]: {
        hours: "Wednesday, November 25, 3:00 PM-7:00 PM",
        times: boulderPickupTimes
      },
      [OAKHURST_PICKUP_LOCATION]: {
        hours: "Wednesday, November 25, 11:00 AM-6:00 PM",
        times: oakhurstPickupTimes
      }
    }
  };

  const pickupTimesByLocation = {
    [OAKHURST_PICKUP_LOCATION]: oakhurstPickupTimes,
    "Red Barn Cottage": [
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM"
    ]
  };

  const pickupLocationDetails = {
    [OAKHURST_PICKUP_LOCATION]: {
      hours: "Sunday, 11:00 AM-6:00 PM",
      address: "9311 Lark Bunting Dr, Westminster, CO 80021",
      mapUrl: "https://maps.app.goo.gl/sDKtHfLt8nXAdV116"
    },
    "Red Barn Cottage": {
      hours: "Sunday, 10:00 AM-2:00 PM",
      address: "6600 Miller St | Arvada, CO",
      mapUrl: "https://maps.app.goo.gl/BpmQafUGVjjLuGWe7"
    },
    [BOULDER_PICKUP_LOCATION]: {
      hours: "November 15, 24, and 25, 3:00 PM-7:00 PM",
      address: "1886 30th St. | Ste B |  Boulder, CO",
      mapUrl: "https://maps.app.goo.gl/yNX9qi9utqCwjeWp7"
    }
  };

  const updatePickupTimes = () => {
    const specialSchedule =
      specialPickupSchedule[date.value]?.[pickupLocation.value];

    const availableTimes =
      specialSchedule?.times ||
      pickupTimesByLocation[pickupLocation.value] ||
      [];

    pickupTime.innerHTML =
      '<option value="" selected disabled>Select a time</option>';

    availableTimes.forEach((time) => {
      const option = document.createElement('option');

      option.value = time;
      option.textContent = time;

      pickupTime.appendChild(option);
    });
  };

  const updatePickupLocationInfo = () => {
    const details =
      pickupLocationDetails[pickupLocation.value];

    const specialSchedule =
      specialPickupSchedule[date.value]?.[pickupLocation.value];

    if (!details) {
      pickupLocationInfo.innerHTML = '';
      return;
    }

    const directions = details.mapUrl
      ? `
        &nbsp;•&nbsp;
        <a
          href="${details.mapUrl}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="bi bi-geo-alt"></i>
          Directions
        </a>
      `
      : `
        &nbsp;•&nbsp;
        <span>
          <i class="bi bi-geo-alt"></i>
          ${details.address}
        </span>
      `;

    pickupLocationInfo.innerHTML = `
        <i class="bi bi-clock"></i>
        <strong>${specialSchedule?.hours || details.hours}</strong>
        ${directions}
    `;
  };

  pickupLocation.addEventListener('change', () => {
    populatePickupDates();
    updatePickupTimes();
    updatePickupLocationInfo();
  });

  date.addEventListener("change", () => {
    updatePickupTimes();
    updatePickupLocationInfo();
  });

  populatePickupDates();
  updatePickupTimes();
  updatePickupLocationInfo();

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

      pickupLocation: getFieldValue(
        '#pickup-location',
        '[name="pickup_location"]'
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

      paymentPreference: 'Pay at Pickup',

      newsletterOptIn:
        document.querySelector('#newsletter-opt-in')?.checked === true,
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

      updatePickupTimes();
      updatePickupLocationInfo();

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
