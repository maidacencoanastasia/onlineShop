const mySwiper = new Swiper('.swiper-container', {
    loop: true,

    // Navigation arrows
    navigation: {
        nextEl: '.slider-button-next',
        prevEl: '.slider-button-prev',
    },
});



// cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const openModal = function(){
    cart.renderCart();
   
    modalCart.classList.add('show');
};

const closeModal = function(){
    modalCart.classList.remove('show')
    
};
modalCart.addEventListener('click', function(){
    if(event.target.classList.contains('overlay')||event.target.classList.contains('modal-close')){
        closeModal();
    }
});


buttonCart.addEventListener('click', openModal);


// scroll smooth


// {
//     const scrollLink = document.querySelector('a.scroll-link');

//     console.log(scrollLink);
//     for(let i = 0; i < scrollLink.length; i++){
//         scrollLink[i].addEventListener('click', function(event){
//             event.preventDefault();
//             const id = scrollLink[i].getAttribute('href');
//             document.querySelector(id).scrollIntoView({
//                 behavior: 'smooth',
//                 block: 'start',
//             })
//         });
//     }	
// }


// Goods

const more = document.querySelector('.more');
const navigationLink = document.querySelectorAll('.navigation-links');
const longGoodsList = document.querySelector('.long-goods-list');
const allfill = document.querySelector('.allfill')

const getGoods = async function(){
    const result = await fetch('db/db.json');
    if(!result.ok){
        throw 'error' + result.status;
    } 
    return await result.json();
}

getGoods().then(function(data){
    // console.log(data); 
});
/* second variant
fetch('db/db.json').then(function(response){
    return response.json();
}).then(function(data){
    console.log(data);
});
*/

const createCard = function(objCard){
    const card = document.createElement('div');
    card.className = 'col-lg-3 col-sm-6';
    card.innerHTML = `
    <div class="goods-card">
    ${objCard.label ? `<span class="label">${objCard.label}</span>`: ''}
    
    <img src="db/${objCard.img}" alt="${objCard.name}" class="goods-image">
    <h3 class="goods-title">${objCard.name}</h3>
    <p class="goods-description">${objCard.description}</p>
    <button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
        <span class="button-price">$${objCard.price}</span>
    </button>
    </div>
    `;
    return card;
}

const renderCards = function(data){
    longGoodsList.textContent = '';

    const cards = data.map(createCard);
    longGoodsList.append(...cards);
    document.body.classList.add('show-goods');
};


more.addEventListener('click', function(event){
    event.preventDefault();
    getGoods().then(renderCards);
    
});




const filterCards = function(field, value){
    getGoods().then(function(data){
        const filteredGoods = data.filter(function(good){
            return good[field] === value;
        });
        return filteredGoods;
    }).then(renderCards);
};

const filterCardss = function(field1, value1, field2, value2){
    getGoods().then(function(data){
        const filteredGoods = data.filter(function(good){
            return good[field1] === value1 || good[field2] === value2;
        });
        return filteredGoods;
    }).then(renderCards);
};

const shoeses = document.querySelector('.shoeses');
shoeses.addEventListener('click', function(event){
    event.preventDefault();
    filterCardss('category', 'Shoes', 'category', 'Clothing');
});


navigationLink.forEach(function(link){
    link.addEventListener('click', function(event){
        event.preventDefault();
        const field = link.dataset.field;
        const value = link.textContent;
        filterCards(field, value);
    })
});
const fashion = document.querySelector('.fashion');
fashion.addEventListener('click', function(event){
    event.preventDefault();
    const field = 'category';
    const value = 'Accessories';
    filterCards(field, value);
});


allfill.addEventListener('click', function(event){
    event.preventDefault();
    getGoods().then(renderCards);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');



const cart = {
    
    cartGoods: [],
    
    renderCart(){
        cartTableGoods.textContent = '';
        cart.cartGoods.forEach(function({id, name, price, count}){
            const trGood = document.createElement('tr');
            trGood.className = 'cart-item';
            trGood.dataset.id = id;
            trGood.innerHTML = `
                <td>${name}</td>
                <td>$${price}</td>
                <td><button class="cart-btn-minus" data-id="${id}">-</button></td>
                <td>${count}</td>
                <td><button class="cart-btn-plus" data-id="${id}">+</button></td>
                <td>${price*count}</td>
                <td><button class="cart-btn-delete" data-id="${id}">x</button></td>
            `;
            cartTableGoods.append(trGood);
        });
        
        const totalPrice = cart.cartGoods.reduce(function(sum, item){
            return sum + item.price*item.count;
        }, 0);

        cardTableTotal.textContent = '$' + totalPrice;
    },
    deleteGood(id){
        cart.cartGoods = cart.cartGoods.filter(function(item){
            return id !== item.id;
        });
        cart.renderCart(); 
        
    },
    minusGood(id){
        for(const item of cart.cartGoods){
            if(item.id == id){
                if(item.count == 1){
                    cart.deleteGood(id);
                }else{
                    item.count--;
                }
                
                break;
            }
        }
        cart.renderCart();
        
    },
    plusGood(id){
        for(const item of cart.cartGoods){
            if(item.id == id){
                item.count++;
                break;
            }
        }
        cart.renderCart(); 
        
    },
    addCartGoods(id){
        const goodItem = cart.cartGoods.find(function(item){
            return item.id === id;
        });
        
        // console.log(goodItem);
        
        if(goodItem){
            cart.plusGood(id);
           
        } else{
            getGoods()
                .then(data => data.find(item => item.id == id))
                .then(({id, price, name}) => {
                    cart.cartGoods.push({
                        id,
                        name,
                        price,
                        count: 1
                    });
                    cart.updateCart();
                });
                
        };
    },
    updateCart(){
        
        const totalPrice = cart.cartGoods.reduce(function(sum, item){
            return sum + item.count;
        }, 0);
        if(!totalPrice){
            document.querySelector('.cart-count').innerHTML = "";
        }
        else document.querySelector('.cart-count').innerHTML = `${totalPrice}`;
    },

}
cart.updateCart();
document.body.addEventListener('click', function(event){
    const addToCart = event.target.closest('.add-to-cart');
    if(addToCart){
        cart.addCartGoods(addToCart.dataset.id);
        cart.updateCart();
    }
});

document.body.addEventListener('click', function(){
    // console.log(cart.cartGoods.length);
    cart.updateCart();
})


cartTableGoods.addEventListener('click', function(event){
    if(event.target.classList.contains('cart-btn-delete')){
        cart.deleteGood(event.target.dataset.id);
    };
    if(event.target.classList.contains('cart-btn-minus')){
        cart.minusGood(event.target.dataset.id);
    };
    if(event.target.classList.contains('cart-btn-plus')){
        cart.plusGood(event.target.dataset.id);
    };
});


const clearCart = document.querySelector('.cart-clear');



clearCart.addEventListener('click', function(event){
    event.preventDefault();
    cart.cartGoods.length = 0; //[]
    cart.renderCart();
});


const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php',{
    method: 'POST',
    body: dataUser,
});

modalForm.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(modalForm);
    formData.append('cartGoods', JSON.stringify(cart.cartGoods));
    postData(formData)
        .then(response =>{
            if(!response.ok){
                throw new Error(response.status);
            }
            alert('Your book was finished successfully!');
        })
        .catch(err => {
            alert('There was an error, try it later!');
            console.error(err);
        })
        .finally(() => {
            closeModal();
            modalForm.reset();
            cart.cartGoods.length = 0;
            cart.updateCart();
        })
})