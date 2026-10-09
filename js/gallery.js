/* Featured slideshow counter and accessible curated-collection viewer. */

document.addEventListener("DOMContentLoaded", () => {
  const featuredCarousel = document.querySelector("#featuredBakesCarousel");
  const featuredCounter = document.querySelector("#featuredCarouselCounter");
  const featuredCaption = document.querySelector("#featuredCarouselCaption");

  if (featuredCarousel && featuredCounter && featuredCaption) {
    const featuredItems = [...featuredCarousel.querySelectorAll(".carousel-item")];

    featuredCarousel.addEventListener("slid.bs.carousel", (event) => {
      const currentItem = featuredItems[event.to];
      const caption = currentItem.querySelector("figcaption");

      featuredCounter.textContent = `${event.to + 1} / ${featuredItems.length}`;
      featuredCaption.textContent = caption.textContent.trim();
    });
  }

  /* Add or remove image objects here to update a collection. */
  const collections = {
    bakes: {
      title: "Our Bakes",
      images: [
        {
          src: "images/products/chai-roll-final.jpg",
          alt: "Fresh Chai Cinammon Roll.",
          caption: "Fresh chai cinnamon rolls, made for a sweet start to the day."
        },
        {
          src: "images/products/cranbread1.jpg",
          alt: "Freshly baked cranberry white chocolate pistachio wreath bread",
          caption: "Wreath bread covered in cranberries, pistachio, and white chocolate."
        },
        {
          src: "images/products/newgfcookie1.jpg",
          alt: "Gluten-Free Oatmeal Chocolate Chip Cookie",
          caption: "Gluten-Free Oatmeal Chocolate Chip Cookie."
        },
        {
          src: "images/products/zucchini2.jpg",
          alt: "Zucchini Bread Loaf",
          caption: "Zucchini bread loaf."
        },
        {
          src: "images/products/pumpkin-cookies2.jpg",
          alt: "Hazelnut Chocolate Pumpkin Cookies",
          caption: "Hazelnut chocolate pumpkin shortbread cookies."
        },
        {
          src: "images/products/cake1.jpg",
          alt: "Decorative Cake",
          caption: "Floral Vegan Cake."
        },
        {
          src: "images/products/bcookie3.jpg",
          alt: "Biscoff Cake Bite",
          caption: "Biscoff Cake Bites."
        }
      ]
    },
    "behind-the-bakes": {
      title: "Behind the Bakes",
      images: [
        {
          src: "images/gallery/gallery-12.jpg",
          alt: "Cookies and cake bites being prepared",
          caption: "Cookies and cake bites coming together in the kitchen."
        },
        {
          src: "images/gallery/gallery-05.jpg",
          alt: "Bakes ready for delivery",
          caption: "A little delivery prep before fresh bakes head out."
        },
        {
          src: "images/gallery/gallery-27.jpg",
          alt: "Freshly baked cookies ready to go",
          caption: "A cookie army ready to go."
        },
        {
          src: "images/gallery/btssugarcookies.jpg",
          alt: "Sugar cookies being prepped",
          caption: "Fresh baked sugar cookies."
        }
      ]
    },
    "market-days": {
      title: "Market Days",
      images: [
        {
          src: "images/gallery/gallery-29.jpg",
          alt: "Ani's Vegan Bakes at the Arvada market",
          caption: "A sweet day at the Arvada market."
        },
        {
          src: "images/gallery/gallery-20.jpg",
          alt: "Farmers market menu display",
          caption: "A farmers market menu display, ready for the community."
        },
        {
          src: "images/gallery/gallery-30.jpg",
          alt: "Bakes at a market table",
          caption: "Bakes ready to meet the community."
        },
        {
          src: "images/gallery/redbarn1.jpg",
          alt: "Bakes at the Red Barn Cottage.",
          caption: "Bakes at the Red Barn Cottage."
        },
        {
          src: "images/gallery/feral1.jpg",
          alt: "Biscoff Cake bites at the Feral Woman Market.",
          caption: "Biscoff Cake bites at the Feral Woman Market."
        },
        {
          src: "images/gallery/arvada3.jpg",
          alt: "Arvada Farmers Market Set Up.",
          caption: "Our set up at the Arvada Farmers Market."
        }
      ]
    }
  };

  const collectionButtons = document.querySelectorAll("[data-gallery-collection]");
  const modalElement = document.querySelector("#collectionViewer");

  if (!modalElement || !collectionButtons.length) {
    return;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  const modalTitle = document.querySelector("#collectionViewerTitle");
  const modalImage = document.querySelector("#collectionViewerImage");
  const modalCaption = document.querySelector("#collectionViewerCaption");
  const modalCounter = document.querySelector("#collectionViewerCounter");
  const previousButton = document.querySelector("#collectionViewerPrevious");
  const nextButton = document.querySelector("#collectionViewerNext");

  let activeCollection;
  let activeIndex = 0;
  let lastTrigger;

  const updateViewer = () => {
    const image = activeCollection.images[activeIndex];

    modalTitle.textContent = activeCollection.title;
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalCaption.textContent = image.caption;
    modalCounter.textContent = `${activeIndex + 1} / ${activeCollection.images.length}`;

    const hasMultipleImages = activeCollection.images.length > 1;
    previousButton.disabled = !hasMultipleImages;
    nextButton.disabled = !hasMultipleImages;
  };

  const showImage = (index) => {
    activeIndex = (index + activeCollection.images.length) % activeCollection.images.length;
    updateViewer();
  };

  collectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCollection = collections[button.dataset.galleryCollection];
      activeIndex = 0;
      lastTrigger = button;

      updateViewer();
      modal.show();
    });
  });

  previousButton.addEventListener("click", () => {
    showImage(activeIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    showImage(activeIndex + 1);
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    lastTrigger?.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (!modalElement.classList.contains("show")) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showImage(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
  });
});
