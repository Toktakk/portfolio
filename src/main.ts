type WorkshopItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  maxSeats: number;
  img: string;
};

const TAX_RATE = 0.03;

const workshopItems: WorkshopItem[] = [
  {
    id: 1,
    title: "Ceramic Mug Making",
    description: "Learn how to hand-build and decorate your own ceramic mug.",
    price: 1200,
    category: "Craft",
    maxSeats: 6,
    img: "CeramicMugMaking.png",
  },
  {
    id: 2,
    title: "Street Photography",
    description:
      "Master light, timing, and storytelling through urban photography.",
    price: 950,
    category: "Photography",
    maxSeats: 8,
    img: "StreetPhotography.jpg",
  },
  {
    id: 3,
    title: "Fresh Pasta Making",
    description: "Learn to make fresh pasta from scratch, from dough to sauce.",
    price: 1450,
    category: "Cooking",
    maxSeats: 10,
    img: "FreshPastaMaking.jpg",
  },
  {
    id: 4,
    title: "Free-Style Flower Arranging",
    description:
      "Learn the art of free-style flower arranging with beautiful floral designs and creative bouquet techniques.",
    price: 950,
    category: "Floral",
    maxSeats: 6,
    img: "FlowerArranging.jpg",
  },
  {
    id: 5,
    title: "Botanical Watercolour Painting",
    description:
      "Learn colour mixing and paint beautiful botanical illustrations.",
    price: 850,
    category: "Art",
    maxSeats: 8,
    img: "BotanicalWatercolourPainting.jpg",
  },
  {
    id: 6,
    title: "Scented Candle Making",
    description:
      "Create your own scented candles and personalise the packaging.",
    price: 790,
    category: "Craft",
    maxSeats: 10,
    img: "ScentedCandleMaking.jpg",
  },
];

const quantities: Record<number, number> = {};

const workshopGridElement = document.getElementById("workshopGrid");
const bookItemsElement = document.getElementById("bookingItems");
const emptyBookingMessageElement = document.getElementById(
  "emptyBookingMessage",
);

const subtotalElement = document.getElementById("subtotal");
const taxElement = document.getElementById("tax");
const totalElement = document.getElementById("total");

const customerNameElement = document.getElementById("customerName");
const confirmBookingButtonElement = document.getElementById(
  "confirmBookingButton",
);
const clearBookingButtonElement = document.getElementById("clearBookingButton");
const bookingMessageElement = document.getElementById("bookingMessage");

// Currency format
const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

function formatPrice(price: number): string {
  return currencyFormatter.format(price);
}

function getQuantity(itemId: number): number {
  return quantities[itemId] || 0;
}

function getRemainingSeats(item: WorkshopItem): number {
  return item.maxSeats - getQuantity(item.id);
}

function renderWorkshopItems() {
  if (!workshopGridElement) {
    return;
  }

  workshopGridElement.innerHTML = "";

  workshopItems.forEach((item) => {
    const quantity = getQuantity(item.id);
    const remainingSeats = getRemainingSeats(item);
    const workshopCard = document.createElement("article");

    workshopCard.classList.add("workshop-card");

    workshopCard.innerHTML = `
        <img class="card-banner" src="/images/${item.img}" alt="${item.title}">
          <div class="workshop-card-content">
            <div class="workshop-card-header">
              <p class="workshop-category">${item.category}</p>
              <span class="workshop-price">${formatPrice(item.price)}</span>
            </div>

            <h3>${item.title}</h3>

            <p class="workshop-description">
              ${item.description}
            </p>

            <div class="seat-meta">
              <span>
        ${
          remainingSeats > 0
            ? `Remaining ${remainingSeats} seats`
            : "Fully Booked"
        }
    </span>
              <span>Selected ${quantity} seats</span>
            </div>
            <div class="quantity-control" aria-label="Select seats for ${item.title}">
              <button type="button" aria-label="Decrease seats" data-action="decrease" data-id="${item.id}">−</button>
              <span aria-live="polite">${quantity}</span>
              <button type="button" aria-label="Increase seats" data-action="increase" data-id="${item.id}">+</button>
            </div>
        `;

    workshopGridElement.appendChild(workshopCard);
  });
}

function decreaseQuantity(itemId: number): void {
  const currentQuantity = getQuantity(itemId);

  if (currentQuantity <= 0) {
    return;
  }

  quantities[itemId] = currentQuantity - 1;

  // LocalStorage
  localStorage.setItem(
    "quantities",
    JSON.stringify(quantities)
  );
}

function increaseQuantity(itemId: number): void {
  const currentQuantity = getQuantity(itemId);

  const item = workshopItems.find((item) => item.id === itemId);

  if (!item) {
    return;
  }

  if (currentQuantity >= item.maxSeats) {
    return;
  }

  quantities[itemId] = currentQuantity + 1;

  // LocalStorage
  localStorage.setItem(
    "quantities",
    JSON.stringify(quantities)
  );
}

function setupWorkshopClickEvents(): void {
  if (!workshopGridElement) {
    return;
  }

  workshopGridElement.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest("button");

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const action = button.dataset.action;
    const itemId = Number(button.dataset.id);

    if (action === "decrease") {
      decreaseQuantity(itemId);
    }

    if (action === "increase") {
      increaseQuantity(itemId);
    }

    renderWorkshopItems();
    renderBookingItems();
    renderSummary();
  });
}

function renderBookingItems(): void {
  if (
    !bookItemsElement ||
    !emptyBookingMessageElement ||
    !clearBookingButtonElement
  ) {
    return;
  }

  bookItemsElement.innerHTML = "";

  const selectedItems = workshopItems.filter((item) => {
    return getQuantity(item.id) > 0;
  });

  if (selectedItems.length === 0) {
    emptyBookingMessageElement.style.display = "block";
    clearBookingButtonElement.hidden = true;
  } else {
    emptyBookingMessageElement.style.display = "none";
    clearBookingButtonElement.hidden = false;
  }

  selectedItems.forEach((item) => {
    const quantity = getQuantity(item.id);
    const lineTotal = item.price * quantity;
    const bookItem = document.createElement("article");

    bookItem.classList.add("book-item");
    bookItem.innerHTML = `
            <div>
                <h3>${item.title}</h3>
                <p>${quantity} x ${formatPrice(item.price)}</p>
            </div>

            <strong>${formatPrice(lineTotal)}</strong>
        `;

    bookItemsElement.appendChild(bookItem);
  });
}

function calculateSubtotal(): number {
  let subtotal = 0;

  workshopItems.forEach((item) => {
    const quantity = getQuantity(item.id);

    subtotal = subtotal + item.price * quantity;
  });

  return subtotal;
}

function calculateTax(subtotal: number): number {
  return subtotal * TAX_RATE;
}

function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

function renderSummary(): void {
  console.log(subtotalElement, taxElement, totalElement);

  if (!subtotalElement || !taxElement || !totalElement) {
    return;
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);

  subtotalElement.textContent = formatPrice(subtotal);
  taxElement.textContent = formatPrice(tax);
  totalElement.textContent = formatPrice(total);
}

function calculateTotalItems(): number {
  let totalItems = 0;

  workshopItems.forEach((item) => {
    totalItems = totalItems + getQuantity(item.id);
  });

  return totalItems;
}

function setupPlaceBookingButton(): void {
  if (
    !customerNameElement ||
    !confirmBookingButtonElement ||
    !bookingMessageElement
  ) {
    return;
  }

  confirmBookingButtonElement.addEventListener("click", () => {
    const input = customerNameElement as HTMLInputElement;
    const customerName = input.value.trim();
    const totalItems = calculateTotalItems();
    const subtotal = calculateSubtotal();

    if (customerName === "") {
      bookingMessageElement.textContent = "📝 Oops! Please enter your name.";
      bookingMessageElement.className = "book-message error";
      return;
    }

    if (totalItems === 0) {
      bookingMessageElement.textContent =
        "🎨 Oops! Please choose at least one workshop.";
      bookingMessageElement.className = "book-message error";
      return;
    }

    bookingMessageElement.innerHTML = `
  Thank you, <strong>${customerName}</strong> ✨<br>
  Your <strong>${totalItems}</strong> workshop${totalItems !== 1 ? "s" : ""} booking is confirmed.<br>
  Total before tax: <strong>${formatPrice(subtotal)}</strong>
`;
    bookingMessageElement.className = "book-message success";
  });
}

// Add clear booking button
function clearBooking(): void {
  workshopItems.forEach((item) => {
    quantities[item.id] = 0;
  });

  localStorage.removeItem("quantities");

  if (customerNameElement instanceof HTMLInputElement) {
    customerNameElement.value = "";
  }

  if (bookingMessageElement) {
    bookingMessageElement.textContent = "";
    bookingMessageElement.className = "book-message";
  }

  renderApp();
}

function setupClearBookingButton(): void {
  if (!clearBookingButtonElement) {
    return;
  }

  clearBookingButtonElement.addEventListener("click", () => {
    clearBooking();
  });
}

function renderApp(): void {
  renderWorkshopItems();
  renderBookingItems();
  renderSummary();
}

setupWorkshopClickEvents();
setupPlaceBookingButton();
setupClearBookingButton();

// Download localStorage
const savedQuantities = localStorage.getItem("quantities");

if (savedQuantities) {
  Object.assign(quantities, JSON.parse(savedQuantities));
}

renderApp();
