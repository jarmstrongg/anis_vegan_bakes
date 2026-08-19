/* Gallery filters and accessible Bootstrap lightbox. */

document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll("[data-gallery-filter]");
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  const galleryCards = document.querySelectorAll(".gallery-card");
  const modalElement = document.querySelector("#galleryLightbox");

  if (!modalElement || !galleryItems.length) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  const modalImage = document.querySelector("#galleryLightboxImage");
  const modalCaption = document.querySelector("#galleryLightboxCaption");
  const previousButton = document.querySelector("#galleryPrevious");
  const nextButton = document.querySelector("#galleryNext");

  let activeItems = galleryItems;
  let activeIndex = 0;

  const updateLightbox = () => {
    const item = activeItems[activeIndex];
    const image = item.querySelector("img");
    const caption = item.querySelector(".gallery-caption");

    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalCaption.textContent = caption.textContent.trim();

    previousButton.disabled = activeItems.length < 2;
    nextButton.disabled = activeItems.length < 2;
  };

  const showItem = (index) => {
    activeIndex = (index + activeItems.length) % activeItems.length;
    updateLightbox();
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.galleryFilter;

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;

        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      galleryItems.forEach((item) => {
        const categories = item.dataset.category.split(" ");
        const shouldShow = filter === "all" || categories.includes(filter);

        item.hidden = !shouldShow;
      });

      activeItems = galleryItems.filter((item) => !item.hidden);
    });
  });

  galleryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const item = card.closest(".gallery-item");

      activeItems = galleryItems.filter((galleryItem) => !galleryItem.hidden);
      activeIndex = activeItems.indexOf(item);

      updateLightbox();
      modal.show();
    });
  });

  previousButton.addEventListener("click", () => {
    showItem(activeIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    showItem(activeIndex + 1);
  });

  document.addEventListener("keydown", (event) => {
    if (!modalElement.classList.contains("show")) return;

    if (event.key === "ArrowLeft") {
      showItem(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      showItem(activeIndex + 1);
    }
  });
});
