/* Updates the shared ingredients modal for each menu item. */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#ingredientsModal");

  if (!modal) {
    return;
  }

  const modalTitle = document.querySelector("#ingredientsModalTitle");
  const modalImage = document.querySelector("#ingredientsModalImage");

  modal.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget;

    modalTitle.textContent = `${button.dataset.ingredientTitle} Ingredients`;
    modalImage.src = button.dataset.ingredientImage;
    modalImage.alt = button.dataset.ingredientAlt;
  });
});