const swiper = new Swiper(
    '.swiper-container',
    {
        loop: true,
        navigation: {
            nextEl: '.slider-button-next',
            prevEl: '.slider-button-prev'
        }
    }
);

let allGoods = [];

function getGoods() {
    fetch('db/db.json').then(res => res.json()).then(result => {allGoods = result;});
}

const cart = {
    cartGoods: [],
    addCartId(id) {
        const goodItem = this.cartGoods.find(good => good.id === id);
        if (goodItem) {
            this.plusGood(id);
        } else {
            const {id: idx, name, price} = allGoods.find(good => good.id === id);
            this.cartGoods.push({id: idx, name, price, count: 1});
            this.cartRender();
        }
    },
    cartRender() {
        cartTableGoods.textContent = '';
        this.cartGoods.forEach(({id, name, price, count}) => {
            const trGood = document.createElement('tr');
            trGood.className = 'cart-item';
            trGood.dataset.id = id;
            trGood.innerHTML = `
            <td>${name}</td>
            <td>${price}\$</td>
            <td><button class="cart-btn-minus" data-id=${id}>-</button></td>
            <td>${count}</td>
            <td><button class="cart-btn-plus" data-id=${id}>+</button></td>
            <td>${count * price}\$</td>
            <td><button class="cart-btn-delete" data-id=${id}>x</button></td>
            `;

            cartTableGoods.append(trGood);
        });
        const totalPrice = this.cartGoods.reduce((sum, item) => sum + item.price * item.count, 0);
        cartTableTotal.textContent = `${totalPrice}\$`;
        cartCount.textContent = this.cartGoods.reduce((sum, item) => sum + item.count, 0);
    },
    plusGood(id) {
        const elem = this.cartGoods.find(el => el.id === id);
        if (elem) {
            elem.count++;
        }
        this.cartRender();
    },
    minusGood(id) {
        const elem = this.cartGoods.find(el => el.id === id);
        if (elem.count === 1) this.deleteGood(id);
        else elem.count--;
        this.cartRender();
    },
    deleteGood(id) {
        this.cartGoods = this.cartGoods.filter(good => good.id !== id);
        this.cartRender();
    }
};

const modalCart = document.querySelector('#modal-cart');
const buttonCart = document.querySelector('.button-cart');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cartTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');
const navigationItems = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const logoLink = document.querySelector('.logo-link');

function scrollTop() {
    const scrollLinks = document.querySelectorAll('a.scroll-link');
    for (let i = 0; i < scrollLinks.length; i++) {
        scrollLinks[i].addEventListener('click', (e) => {
            e.preventDefault();
            const id = scrollLinks[i].getAttribute('href');
            document.querySelector(id).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
}

scrollTop();

cartTableGoods.addEventListener('click', (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (target.tagName === 'BUTTON') {
        const className = target.className;
        switch (className) {
            case 'cart-btn-delete':
                cart.deleteGood(id);
                break;
            case 'cart-btn-minus':
                cart.minusGood(id);
                break;
            case 'cart-btn-plus':
                cart.plusGood(id);
                break;
            default:
                return;
        }
    }
});

function renderCards(data) {
    longGoodsList.textContent = '';
    const cards = data.map(good => createCard(good));
    longGoodsList.append(...cards);
    document.body.classList.add('show-goods');
}

logoLink.addEventListener('click', () => {
    if (document.body.classList.contains('show-goods'))
        document.body.classList.remove('show-goods');
});

function createCard(objCard) {
    const card = document.createElement('div');
    const {id, name, price, label, img, description} = objCard;
    card.className = 'col-lg-3 col-sm-6';
    card.innerHTML = `
    <div class="goods-card">
        ${label && `<span class="label">${label}</span>`}
        <img src="/db/${img}" alt="${name}" class="goods-image" />
        <h3 class="goods-title">${name}</h3>
        <p class="goods-description">${description}</p>
        <button class="button goods-card-btn add-to-cart" data-id="${id}"><span class="button-price">${price}\$</span></button>
    </div>
    `;
    return card;
}

function filterCards(field, value) {
    renderCards(allGoods.filter(good => good[field] === value));
}

navigationItems.forEach((link) => {
    link.addEventListener('click', (e) => {
        const field = link.dataset.field;
        if (field) {
            const value = link.textContent;
            filterCards(field, value);
            return;
        }
        renderCards(allGoods);
    });
});

buttonCart.addEventListener('click', () => {
    /* card.renderCart(); */
    modalCart.classList.add('show');
});

document.addEventListener('mouseup', (e) => {
    const target = e.target;
    if ((!target.closest('.modal') || target.classList.contains('modal-close')) && modalCart.classList.contains('show')) {
        modalCart.classList.remove('show');
    }
});

document.body.addEventListener('click', (e) => {
    const target = e.target.closest('.add-to-cart');
    if (target) {
        cart.addCartId(target.dataset.id);
    }
});

getGoods();