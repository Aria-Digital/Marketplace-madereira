document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);

    const els = {
        products: $('products-container'),
        cartList: $('cart-list'),
        total: $('cart-total'),
        emptyMsg: $('empty-cart-message'),
        finish: $('finish-btn'),
        totalDisplay: $('cart-total-display'),
        search: $('search-input'),
        modal: $('image-modal'),
        modalImg: $('modal-image'),
        closeModal: $('close-modal')
    };

    const formatBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));

    const getProducts = () => JSON.parse(localStorage.getItem('products')) || [];

    const renderProducts = (list = getProducts()) => {
        els.products.innerHTML = list.length ? list.map(p => `
            <div class="card">
                <img src="${p.image}" alt="${p.name}" class="product-image-thumbnail" data-id="${p.id}">
                <h3>${p.name}</h3>
                <p class="product-description">${p.description}</p>
                <p class="price">${formatBRL(p.price)}</p>
                <div class="quantity-input-container">
                    <label>Quantidade:</label>
                    <input type="number" id="quantity-${p.id}" value="1" min="1" max="100">
                </div>
                <button class="add-to-cart-btn" data-id="${p.id}">Adicionar ao Carrinho</button>
            </div>
        `).join('') : `<p class="empty-message">Nenhum produto cadastrado.</p>`;
    };

    const renderCart = () => {
        els.cartList.innerHTML = '';
        let total = 0, items = Object.values(cart);

        items.forEach(({ id, name, price, quantity, image }) => {
            els.cartList.innerHTML += `
                <li>
                    <img src="${image}" alt="${name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <span>${name}</span>
                        <div class="quantity-control">
                            <button class="quantity-btn" data-action="dec" data-id="${id}">-</button>
                            <input type="number" value="${quantity}" min="1" class="item-quantity-input" data-id="${id}">
                            <button class="quantity-btn" data-action="inc" data-id="${id}">+</button>
                        </div>
                    </div>
                    <span>${formatBRL(price * quantity)}</span>
                    <button class="remove-btn" data-id="${id}">🗑️</button>
                </li>`;
            total += price * quantity;
        });

        els.emptyMsg.style.display = items.length ? 'none' : 'block';
        els.total.style.display = items.length ? 'flex' : 'none';
        els.finish.disabled = !items.length;
        els.totalDisplay.textContent = formatBRL(total);
        saveCart();
    };

    const addToCart = (id, qty) => {
        const p = getProducts().find(p => p.id == id);
        if (!p) return alert('Produto não encontrado!');
        cart[id] ? cart[id].quantity += qty : cart[id] = { ...p, quantity: qty };
        renderCart();
    };

    const sendToWhatsApp = () => {
        const phone = '5587999580348';
        const message = Object.values(cart).map(item =>
            `- ${item.name}\nQuantidade: ${item.quantity}\nSubtotal: ${formatBRL(item.price * item.quantity)}`
        ).join('\n\n') + `\n\nTotal: ${els.totalDisplay.textContent}`;
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
        cart = {};
        renderCart();
    };

    // Delegação de eventos
    document.body.addEventListener('click', e => {
        const id = e.target.dataset.id;

        if (e.target.classList.contains('add-to-cart-btn')) {
            const qty = +$(`quantity-${id}`).value || 1;
            addToCart(id, qty);
        }
        if (e.target.classList.contains('remove-btn')) delete cart[id];
        if (e.target.classList.contains('quantity-btn')) {
            const item = cart[id];
            e.target.dataset.action === 'inc' ? item.quantity++ : (item.quantity > 1 ? item.quantity-- : delete cart[id]);
        }
        if (e.target.tagName === 'IMG' && e.target.classList.contains('product-image-thumbnail')) {
            els.modal.style.display = 'flex';
            els.modalImg.src = e.target.src;
        }
        renderCart();
    });

    els.cartList.addEventListener('change', e => {
        if (e.target.classList.contains('item-quantity-input')) {
            cart[e.target.dataset.id].quantity = Math.max(1, +e.target.value || 1);
            renderCart();
        }
    });

    els.search.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        renderProducts(getProducts().filter(p =>
            p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
        ));
    });

    els.finish.addEventListener('click', sendToWhatsApp);
    els.closeModal.addEventListener('click', () => els.modal.style.display = 'none');
    window.addEventListener('click', e => e.target === els.modal && (els.modal.style.display = 'none'));

    renderProducts();
    renderCart();
});
