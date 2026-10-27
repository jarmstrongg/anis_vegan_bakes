console.log("ordering-window.js loaded!");
// =====================================================
// Ani's Vegan Bakes Ordering Window
// Open Monday at 9:00 AM through Thursday at 11:59 PM
// Time zone: America/Denver
// =====================================================

const ORDER_WINDOW = {
  timeZone: "America/Denver",
  mondayOpenHour: 9
};

function getDenverTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ORDER_WINDOW.timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  const parts = formatter.formatToParts(date);
  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const dayNumbers = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    day: dayNumbers[values.weekday],
    year: Number(values.year),
    month: Number(values.month),
    date: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function isOrderingOpen(date = new Date()) {
  const now = getDenverTimeParts(date);

  // Temporary early closing: October 29, 2026, at noon Mountain Time.
  if (
    now.year === 2026 &&
    now.month === 10 &&
    now.date === 29
  ) {
    return now.hour < 12;
  }

  // Sunday
  if (now.day === 0) {
    return false;
  }

  // Monday before 9:00 AM
  if (now.day === 1) {
    return now.hour >= ORDER_WINDOW.mondayOpenHour;
  }

  // Tuesday, Wednesday, and Thursday
  if (now.day >= 2 && now.day <= 4) {
    return true;
  }

  // Friday and Saturday
  return false;
}

function updateOrderingWindow() {
  const orderForm = document.getElementById("preorder-form");
  const status = document.getElementById("ordering-status");
  const submitButton = document.getElementById("submit-order-button");

  if (!orderForm || !status) {
    console.warn(
      "Could not find #preorder-form or #ordering-status."
    );
    return;
  }

  const orderingIsOpen = isOrderingOpen();

  if (orderingIsOpen) {
    orderForm.hidden = false;

    if (submitButton) {
      submitButton.disabled = false;
    }

    status.innerHTML = `
      <div class="ordering-open" role="status">
        <strong>Weekly ordering is open.</strong>
        <span>Orders close Thursday at midnight MST.</span>
      </div>
    `;

    return;
  }

  orderForm.hidden = true;

  if (submitButton) {
    submitButton.disabled = true;
  }

  status.innerHTML = `
    <div class="ordering-closed" role="status">
      <p class="ordering-label">Weekly ordering</p>

      <h2>Ordering is currently closed</h2>

      <p>
        Ordering reopens Monday at
        <strong>9:00 AM Mountain Time</strong>.
      </p>

      <p>
        Orders close every Thursday at midnight.
      </p>

      <p class="ordering-thank-you">
        Thank you for supporting Ani's Vegan Bakes!
      </p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  updateOrderingWindow();

  // Refresh at the temporary October 29 noon cutoff, if the page is already open.
  const temporaryEarlyClosingAt = Date.parse(
    "2026-10-29T12:00:00-06:00"
  );
  const millisecondsUntilEarlyClosing =
    temporaryEarlyClosingAt - Date.now();

  if (millisecondsUntilEarlyClosing > 0) {
    setTimeout(updateOrderingWindow, millisecondsUntilEarlyClosing);
  }
});

// Recheck once per minute in case the page remains open
setInterval(updateOrderingWindow, 60 * 1000);
