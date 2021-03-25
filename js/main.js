const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});


let buttonCard = document.querySelector('.button-cart');
let modalCard = document.querySelector('#modal-cart');
let modalClose = document.querySelector('.modal-close');
let topLink = document.querySelector('.top-link');
let buttonMore = document.querySelector('.more');
let navigationItem = document.querySelectorAll('.navigation-link');
let longGoodsList = document.querySelector('.long-goods-list');
let buttonAccess = document.querySelector('.access');
let buttonColthing = document.querySelector('.colthing');
let cartTableGoods = document.querySelector('.cart-table__goods');
let cardTableTotal = document.querySelector('.card-table__total');
let cartCount = document.querySelector('.cart-count');
let cartClear = document.querySelector('.cart-clear');
let itemCount = 0;
let sumItemCount = 0;


let getGoods = async function () { 

	let result = await fetch('db/db.json');
	if(!result.ok){
		throw 'Ошибочка вышла ։' + result.status;
	}
	return await result.json();
};

let cart = {
	cartGoods : [],
	renderCard(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({ id, name, price,count }) => {
			let trGoods = document.createElement('tr');
			trGoods.className = 'cart-item';
			trGoods.dataset.id = id;

			trGoods.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus" data-id="${id}">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus" data-id="${id}">+</button></td>
				<td>${price*count}$</td>
				<td><button class="cart-btn-delete" data-id="${id}">x</button></td>
			`;
			cartTableGoods.append(trGoods);
		});

		let totalGoods = this.cartGoods.reduce((sum,item) => {
			return sum + (item.price * item.count);
		}, 0);

		cardTableTotal.textContent = totalGoods + '$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCard();
		
	},
	minusGood(id){
		for(let item of this.cartGoods){
			if(item.id === id){
				if(item.count <= 1){
					this.deleteGood(id);
				}else{
					item.count--;
				}
				break;
			}
		}
		this.renderCard();
	},
	plusGood(id){
		for(let item of this.cartGoods){
			if(item.id === id){
				item.count++;
				break;
			}
		}
		this.renderCard();
	},
	addCartGoods(id){
		let goodItem = this.cartGoods.find(item => item.id === id);
		if(goodItem){
			this.plusGood(id);
		}else{
			getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({ id, name, price}) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count:1
					});
				});
		}
	},
}

document.body.addEventListener('click', event => {
	let addToCart = event.target.closest('.add-to-cart');
	if(addToCart){
		cart.addCartGoods(addToCart.dataset.id);
		itemCount += 1;
		cartCount.textContent = itemCount;
	}
});


cartTableGoods.addEventListener('click' , event => {
	let target = event.target;
	if(target.classList.contains('cart-btn-delete')){
		cart.cartGoods.forEach(({id,count}) => {
			if(target.dataset.id === id){
				itemCount -= count;
				cartCount.textContent = itemCount;
				if(itemCount === 0){
				cartCount.textContent = '';
				}
			}
		})
		cart.deleteGood(target.dataset.id);

	}
	if(target.classList.contains('cart-btn-plus')){
		cart.plusGood(target.dataset.id);
		itemCount++;
		cartCount.textContent = itemCount;
	}
	if(target.classList.contains('cart-btn-minus')){
		cart.minusGood(target.dataset.id);
		itemCount--;
		cartCount.textContent = itemCount;
		if(itemCount === 0){
			itemCount = 0;
			cartCount.textContent = '';
		}
	}
});

cartClear.addEventListener('click',() =>{
	cart.cartGoods = [];
	cart.renderCard();
	itemCount = 0;
	cartCount.textContent = '';
});

buttonCard.addEventListener('click',function () { 
	modalCard.classList.add('show');
	cart.renderCard();
	modalCard.addEventListener('click',function (event) { 
		let target = event.target;
		if(target.tagName === 'DIV'){
			modalCard.classList.remove('show');
		}
	});
});
modalClose.addEventListener('click',function () { 
	modalCard.classList.remove('show');
});



topLink.addEventListener('click',event => { 
	event.preventDefault();
	let id = topLink.getAttribute('href');
	document.querySelector(id).scrollIntoView({
		behavior:'smooth',
		block:'start'
	});
});



let createCard = function (objCard) { 

	let card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';

	card.innerHTML = `
	<div class="goods-card">
	${objCard.label ? `<span class="label">${objCard.label}</span>` : ``}
	<img src="/db/${objCard.img}" alt="image: ${objCard.name}" class="goods-image">
	<h3 class="goods-title">${objCard.name}</h3>
	<p class="goods-description">${objCard.description}</p>
	<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
	<span class="button-price">$${objCard.price}</span>
	</button>
	</div>
	`;
	
	return card;
};

let renderCards = function (data) { 
	longGoodsList.textContent = '';
	let cards = data.map(createCard);
	longGoodsList.append(...cards);
	document.body.classList.add('show-goods');
};

buttonMore.addEventListener('click',event => {
	event.preventDefault();
	let id = topLink.getAttribute('href');
	document.querySelector(id).scrollIntoView({
		behavior:'smooth',
		block:'start'
	});
	getGoods().then(renderCards);
});

let filterCards = function (filed,value) { 
	getGoods()
		.then(data => data.filter(good => good[filed] === value))
		.then(renderCards)
};

navigationItem.forEach(function (link) { 
	link.addEventListener('click',event => { 
		event.preventDefault();
		let field = link.dataset.field;
		let value = link.textContent;
		if(!link.dataset.field){
			getGoods().then(renderCards);
		}else{
			filterCards(field,value);
		}
	});
});

buttonAccess.addEventListener('click', () => {
	filterCards('category','Accessories');
	let id = topLink.getAttribute('href');
	document.querySelector(id).scrollIntoView({
		behavior:'smooth',
		block:'start'
	});
});
buttonColthing.addEventListener('click',() => {
	filterCards('category','Clothing');	
	let id = topLink.getAttribute('href');
	document.querySelector(id).scrollIntoView({
		behavior:'smooth',
		block:'start'
	});
});