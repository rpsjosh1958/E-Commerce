// Utility function to get DOM elements
const getElement = (selector) => document.querySelector(selector);

// State variables
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let currentProduct = null;
let buyerDetails = null;
let lastScrollTop = 0;

// Product pricing data
const pricingData = {
    "Wedding Cake": {
        options: [
            { label: "2 Tiers", price: 2500, image: "./images/2-tier.png" },
            { label: "3 Tiers", price: 3500, image: "./images/3-tier.png" },
            { label: "4 Tiers", price: 4500, image: "./images/4-tier.png" }
        ],
        image: "./images/wedding-cake.jpg"
    },
    "Birthday Cake": {
        options: [
            { label: "6”x3”", price: 350, image: "./images/birthday-1.png" },
            { label: "6”x6” Round", price: 500, image: "./images/birthday-2.png" },
            { label: "6”x6” Square", price: 800, image: "./images/birthday-4.png" },
            { label: "8”x5” Round", price: 700, image: "./images/birthday-3.png" },
            { label: "8”x5” Square", price: 1300, image: "./images/birthday-5.png" }
        ],
        image: "./images/birthday-cake.jpg"
    },
    "Cupcakes": {
        flavors: ["Vanilla", "Chocolate", "Red Velvet", "Strawberry", "Marble"],
        quantities: ["Box of 6", "Box of 12", "Box of 24"],
        pricing: {
            "Vanilla": { "Box of 6": 100, "Box of 12": 180, "Box of 24": 300 },
            "Chocolate": { "Box of 6": 120, "Box of 12": 200, "Box of 24": 320 },
            "Red Velvet": { "Box of 6": 140, "Box of 12": 220, "Box of 24": 340 },
            "Strawberry": { "Box of 6": 140, "Box of 12": 220, "Box of 24": 340 },
            "Marble": { "Box of 6": 140, "Box of 12": 220, "Box of 24": 340 }
        },
        images: {
            "Vanilla": "./images/cupcake-vanilla.png",
            "Chocolate": "./images/cupcake-chocolate.png",
            "Red Velvet": "./images/cupcake-red-velvet.png",
            "Strawberry": "./images/cupcake-strawberry.png",
            "Marble": "./images/cupcake-marble.png"
        },
        image: "./images/cupcake.jpg"
    }
};

// Cart Management
function renderCartItem(item, index) {
    const details = item.details ? ` (${item.details})` : '';
    return `
        <div class="box">
            <i class="fas fa-trash" onclick="removeCartItem(${index})"></i>
            <img src="${item.image}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}${details}</h3>
                <span class="price">GHS${item.price * item.quantity}/-</span>
                <div class="quantity">
                    <button onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span>Qty: ${item.quantity}</span>
                    <button onclick="updateCartQuantity(${index}, 1)">+</button>
                </div>
            </div>
        </div>
    `;
}

function updateCartTotal() {
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    getElement('.total').textContent = `Total: GHS${total}/-`;
}

function updateCart() {
    const cartContainer = getElement('.cart-items');
    if (cartContainer) {
        cartContainer.innerHTML = cartItems.map((item, index) => renderCartItem(item, index)).join('');
        updateCartTotal();
        updateCheckoutSummary();
    }
}

function removeCartItem(index) {
    cartItems.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCart();
}

function updateCartQuantity(index, change) {
    cartItems[index].quantity += change;
    if (cartItems[index].quantity <= 0) {
        cartItems.splice(index, 1);
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCart();
}

// Popup Management
function showPopup() {
    const popup = getElement('#cart-popup');
    if (popup) {
        popup.classList.add('active');
        setTimeout(() => popup.classList.remove('active'), 2000);
    }
}

function showSuccessPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup', 'success');
    popup.innerHTML = `
        <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
        <span>Placing Order... Please wait</span>
    `;
    document.body.appendChild(popup);
    popup.classList.add('active');
    setTimeout(() => {
        popup.classList.remove('active');
        document.body.removeChild(popup);
        window.location.href = whatsappUrl;
    }, 2000);
}

// Checkout Management
function updateCheckoutSummary() {
    const summaryContainer = getElement('.order-summary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = '';
    if (cartItems.length === 0) {
        summaryContainer.innerHTML = '<div class="item"><span>Your cart is empty</span></div>';
        return;
    }

    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
        const details = item.details ? ` (${item.details})` : '';
        summaryContainer.innerHTML += `
            <div class="item">
                <span>${item.name}${details} (x${item.quantity})</span>
                <span>GHS${item.price * item.quantity}/-</span>
            </div>
        `;
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    summaryContainer.innerHTML += `
        <div class="tax">
            <span>Tax (10%)</span><span>GHS${tax.toFixed(2)}/-</span>
        </div>
        <div class="total">
            <span>Total</span><span>GHS${total.toFixed(2)}/-</span>
        </div>
    `;
}

function saveShippingDetails(event) {
    event.preventDefault(); // Prevent form submission and page reload

    try {
        const form = getElement('#billing-form');
        if (!form) {
            console.error('Billing form not found');
            return;
        }

        // Retrieve input values
        const fullNameInput = form.querySelector('input[placeholder="Full Name"]');
        const emailInput = form.querySelector('input[placeholder="Email"]');
        const streetAddressInput = form.querySelector('input[placeholder="Street Address"]');
        const cityInput = form.querySelector('input[placeholder="City"]');
        const regionInput = form.querySelector('input[placeholder="Region"]');
        const phoneNumberInput = form.querySelector('input[placeholder="Phone Number"]');

        // Validate inputs
        if (!fullNameInput || !emailInput || !streetAddressInput || !cityInput || !regionInput || !phoneNumberInput) {
            console.error('One or more form inputs not found');
            alert('Please ensure all form fields are present.');
            return;
        }

        buyerDetails = {
            fullName: fullNameInput.value,
            email: emailInput.value,
            streetAddress: streetAddressInput.value,
            city: cityInput.value,
            region: regionInput.value, // Changed from 'state' to 'region'
            phoneNumber: phoneNumberInput.value,
            postalCode: "N/A"
        };

        // Create and display payment details
        const paymentDetails = document.createElement('div');
        paymentDetails.classList.add('payment-details');
        paymentDetails.innerHTML = `
            <h3>Shipping Details Saved</h3>
            <p>Name: ${buyerDetails.fullName}</p>
            <p>Email: ${buyerDetails.email}</p>
            <p>Address: ${buyerDetails.streetAddress}, ${buyerDetails.city}, ${buyerDetails.region}</p>
            <p>Phone: ${buyerDetails.phoneNumber}</p>
        `;
        form.parentElement.appendChild(paymentDetails);
        form.style.display = 'none';

        // Show the Place Order button
        const placeOrderBtn = getElement('#place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.classList.remove('d-none');
        } else {
            console.error('Place Order button not found');
        }
    } catch (error) {
        console.error('Error in saveShippingDetails:', error);
        alert('An error occurred while saving your details. Please try again.');
    }
}

function placeOrder() {
    if (!buyerDetails) {
        alert('Please save your shipping details first.');
        return;
    }

    if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
    }

    const orderSummary = {
        items: cartItems.map(item => ({
            name: item.name,
            details: item.details || '',
            quantity: item.quantity,
            price: item.price
        })),
        tax: 0,
        total: 0
    };

    const subtotal = orderSummary.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    orderSummary.tax = subtotal * 0.1;
    orderSummary.total = subtotal + orderSummary.tax;

    const orderItems = orderSummary.items.map(item =>
        `${item.name}${item.details ? ` (${item.details})` : ''} - Quantity: ${item.quantity}, Price: GHS${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    const whatsappMessage = `Hello Fhanash Bakery,\nI would like to place an order:\n\n${orderItems}\n\nTax (10%): GHS${orderSummary.tax.toFixed(2)}\nTotal: GHS${orderSummary.total.toFixed(2)}\n\nCustomer: ${buyerDetails.fullName}\nEmail: ${buyerDetails.email}\nPhone: ${buyerDetails.phoneNumber}\nAddress: ${buyerDetails.streetAddress}, ${buyerDetails.city}, ${buyerDetails.region}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappNumber = '233599160704';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    cartItems = [];
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCart();

    showSuccessPopup();
    setTimeout(() => {
        window.location.href = whatsappUrl;
    }, 2000);
}

// Modal Management
function createModalOptions(productType, modalOptions) {
    if (productType === "Wedding Cake" || productType === "Birthday Cake") {
        const select = document.createElement('select');
        select.id = 'tier-select';
        select.innerHTML = '<option value="">Select Option</option>';
        pricingData[productType].options.forEach(option => {
            select.innerHTML += `<option value="${option.label}" data-price="${option.price}" data-image="${option.image}">${option.label} - GHS${option.price}</option>`;
        });
        modalOptions.appendChild(select);
        return select;
    } else if (productType === "Cupcakes") {
        const flavorSelect = document.createElement('select');
        flavorSelect.id = 'flavor-select';
        flavorSelect.innerHTML = '<option value="">Select Flavor</option>';
        pricingData[productType].flavors.forEach(flavor => {
            flavorSelect.innerHTML += `<option value="${flavor}">${flavor}</option>`;
        });
        modalOptions.appendChild(flavorSelect);

        const quantitySelect = document.createElement('select');
        quantitySelect.id = 'quantity-select';
        quantitySelect.innerHTML = '<option value="">Select Quantity</option>';
        pricingData[productType].quantities.forEach(quantity => {
            quantitySelect.innerHTML += `<option value="${quantity}">${quantity}</option>`;
        });
        modalOptions.appendChild(quantitySelect);
        return { flavorSelect, quantitySelect };
    }
}

function openModal(productType) {
    currentProduct = { name: productType, image: pricingData[productType].image, price: 0, details: '' };
    const modal = getElement('#custom-product-modal');
    if (!modal) return; // Skip if modal is not present (e.g., on checkout page)

    const modalTitle = getElement('#modal-title');
    const modalOptions = getElement('#modal-options');
    const modalPrice = getElement('#modal-price');
    const addToCartBtn = getElement('#modal-add-to-cart');

    modalTitle.textContent = `Customize Your ${productType}`;
    modalOptions.innerHTML = '';
    modalPrice.textContent = 'GHS0/-';
    addToCartBtn.disabled = true;

    const selects = createModalOptions(productType, modalOptions);

    if (productType === "Wedding Cake" || productType === "Birthday Cake") {
        selects.onchange = () => {
            const selectedOption = selects.options[selects.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            const image = selectedOption.getAttribute('data-image');
            currentProduct.price = price ? parseInt(price) : 0;
            currentProduct.details = selectedOption.value;
            currentProduct.image = image || pricingData[productType].image;
            modalPrice.textContent = `GHS${currentProduct.price}/-`;
            addToCartBtn.disabled = !selectedOption.value;
        };
    } else if (productType === "Cupcakes") {
        const updatePrice = () => {
            const flavor = selects.flavorSelect.value;
            const quantity = selects.quantitySelect.value;
            if (flavor && quantity) {
                const price = pricingData[productType].pricing[flavor][quantity];
                currentProduct.price = price || 0;
                currentProduct.details = `${flavor}, ${quantity}`;
                currentProduct.image = pricingData[productType].images[flavor] || pricingData[productType].image;
                modalPrice.textContent = price ? `GHS${price}/-` : 'N/A';
                addToCartBtn.disabled = !price;
            } else {
                currentProduct.price = 0;
                currentProduct.details = '';
                currentProduct.image = pricingData[productType].image;
                modalPrice.textContent = 'GHS0/-';
                addToCartBtn.disabled = true;
            }
        };
        selects.flavorSelect.onchange = updatePrice;
        selects.quantitySelect.onchange = updatePrice;
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = getElement('#custom-product-modal');
    if (modal) {
        modal.classList.remove('active');
        currentProduct = null;
    }
}

// Blog Management
function initializeBlogSlider() {
    if (typeof Swiper === 'undefined' || !getElement('.blog-slider')) {
        return; // Skip if Swiper is not loaded or slider is not present
    }

    new Swiper('.blog-slider', {
        loop: false,
        spaceBetween: 20,
        slidesPerView: 1,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: { slidesPerView: 2 },
            1020: { slidesPerView: 3 },
        },
    });
}

function initializeBlogModal() {
    const blogCards = document.querySelectorAll('.blog-card');
    if (blogCards.length === 0) return; // Skip if no blog cards present

    const blogModal = getElement('#blog-modal');
    const blogModalBody = getElement('#blog-modal-body');
    const closeModalBtn = getElement('.close-modal');

    blogCards.forEach(card => {
        card.addEventListener('click', () => {
            const blogId = card.getAttribute('data-blog-id');
            const contentElement = getElement(`#${blogId}-content`);
            if (contentElement && blogModalBody && blogModal) {
                blogModalBody.innerHTML = contentElement.innerHTML;
                blogModal.classList.add('active');
            }
        });
    });

    if (closeModalBtn && blogModal) {
        closeModalBtn.addEventListener('click', () => blogModal.classList.remove('active'));
    }

    if (blogModal) {
        blogModal.addEventListener('click', (e) => {
            if (e.target === blogModal) blogModal.classList.remove('active');
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    updateCart();

    // Header interactions
    const cartBtn = getElement('#cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            const shoppingCart = getElement('.shopping-cart');
            const navbar = getElement('.navbar');
            if (shoppingCart && navbar) {
                shoppingCart.classList.toggle('active');
                navbar.classList.remove('active');
                updateCart();
            }
        });
    }

    const menuBtn = getElement('#menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const navbar = getElement('.navbar');
            const shoppingCart = getElement('.shopping-cart');
            if (navbar && shoppingCart) {
                navbar.classList.toggle('active');
                shoppingCart.classList.remove('active');
            }
        });
    }

    // Cart interactions
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const item = JSON.parse(button.getAttribute('data-item'));
                const existingItem = cartItems.find(cartItem => cartItem.name === item.name && cartItem.details === item.details);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    item.quantity = 1;
                    cartItems.push(item);
                }
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                showPopup();
                updateCart();
            });
        });
    }

    const addToCartCustomButtons = document.querySelectorAll('.add-to-cart-custom');
    if (addToCartCustomButtons.length > 0) {
        addToCartCustomButtons.forEach(button => {
            button.addEventListener('click', () => openModal(button.getAttribute('data-type')));
        });
    }

    // Modal interactions
    const modalCancel = getElement('#modal-cancel');
    if (modalCancel) {
        modalCancel.addEventListener('click', closeModal);
    }

    const modalAddToCart = getElement('#modal-add-to-cart');
    if (modalAddToCart) {
        modalAddToCart.addEventListener('click', () => {
            if (currentProduct && currentProduct.price > 0) {
                const existingItem = cartItems.find(cartItem => cartItem.name === currentProduct.name && cartItem.details === currentProduct.details);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    currentProduct.quantity = 1;
                    cartItems.push(currentProduct);
                }
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                closeModal();
                showPopup();
                updateCart();
            }
        });
    }

    // Popup interaction
    const closePopupBtn = getElement('#close-popup-btn');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            const popup = getElement('#cart-popup');
            if (popup) popup.classList.remove('active');
        });
    }

    // Checkout interactions
    const billingForm = getElement('#billing-form');
    if (billingForm) {
        billingForm.addEventListener('submit', saveShippingDetails);
    }

    const placeOrderButtons = document.querySelectorAll('#place-order-btn, #place-order-cart-btn');
    if (placeOrderButtons.length > 0) {
        placeOrderButtons.forEach(button => button.addEventListener('click', placeOrder));
    }

    // Blog initialization
    initializeBlogSlider();
    initializeBlogModal();
});

// Scroll behavior
window.onscroll = () => {
    const shoppingCart = getElement('.shopping-cart');
    const navbar = getElement('.navbar');
    const header = getElement('.header');

    if (shoppingCart) shoppingCart.classList.remove('active');
    if (navbar) navbar.classList.remove('active');

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (header) {
        header.classList.toggle('hidden', currentScroll > lastScrollTop);
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
};