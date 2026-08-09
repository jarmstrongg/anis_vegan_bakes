/* Temporary Feral Women Farmers Market announcement. */

document.addEventListener("DOMContentLoaded", () => {
  const announcements = document.querySelectorAll("[data-market-announcement]");
  const dismissButton = document.querySelector("[data-market-dismiss]");
  const storageKey = "anisMarketAnnouncementDismissed";
  const eventEnd = new Date("2026-08-16T18:00:00-06:00");

  const hideAnnouncements = () => {
    announcements.forEach((announcement) => {
      announcement.hidden = true;
    });
  };

  if (new Date() > eventEnd || localStorage.getItem(storageKey) === "true") {
    hideAnnouncements();
    return;
  }

  if (dismissButton) {
    dismissButton.addEventListener("click", () => {
      localStorage.setItem(storageKey, "true");
      hideAnnouncements();
    });
  }
});