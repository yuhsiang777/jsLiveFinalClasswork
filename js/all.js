const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`;

let productData = [];
let cartData = [];

function init(){
    getProductList();
    getCartList();
}

init();

// 取得產品列表
const productWrap = document.querySelector('.productWrap');

function getProductList(){
    axios
        .get(`${url}/products`)
        .then(function(response){
            productData = response.data.products;
            renderProductList();
        })
        .catch(function(error){
            console.log(error.response.data)
        }) 
}

// 合併 ProductList 內 str 字串內容 " 總管理 "
// 函式 消除重複兩處以上內容
function mergeProductListHTMLItemStr(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="${item.title}">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>`;
}

function renderProductList(){
    let strForProductCard = '';

    productData.forEach(function(item){
      // 函式消除重複
        strForProductCard += mergeProductListHTMLItemStr(item);
    })

    productWrap.innerHTML = strForProductCard; 
}

// 篩選選單
let productSelect = document.querySelector('.productSelect');

productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if(category == "全部"){
        renderProductList();
        return;
    }

    let str = '';

    productData.forEach(function(item){
      if(item.category == category){
        // 函式消除重複
        str += mergeProductListHTMLItemStr(item);
      }
    })
    productWrap.innerHTML = str;
})


// 加入購物車
productWrap.addEventListener("click",function(e){
    e.preventDefault();
    let addCardBtnClass = e.target.getAttribute("class")
    
    if(addCardBtnClass !== "addCardBtn"){
      return;
    }

    let productId = e.target.getAttribute("data-id");
    let numCheck = 1;

    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity += 1;
        }
    })
    
    axios
        .post(`${url}/carts`,{
            "data": {
                "productId": productId,
                "quantity": numCheck
            }
        })
        .then(function(response){
            alert('加入購物車');
            getCartList();
        })
})

// 取得購物車列表
const cartList = document.querySelector('.shoppingCart-tableTbody');

function getCartList(){
    axios
        .get(`${url}/carts`)
        .then(function(response){
            cartData = response.data.carts;
            document.querySelector(".js-total").textContent = toThousands(response.data.finalTotal);

            let str = '';
            cartData.forEach(function(item){
                str += `<tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="${item.product.title}">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousands(item.product.price)}</td>
                <td>${item.quantity}</td>
                <td>NT$${toThousands(item.product.price*item.quantity)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-id="${item.id}" data-product="${item.product.title}">
                        clear
                    </a>
                </td>
            </tr>`
            })
            cartList.innerHTML = str;
        })
        .catch(function(error){
            console.log(error.response.data);
        }) 
}
// 刪除購物車內特定產品
cartList.addEventListener('click',function(e){
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    const productName = e.target.getAttribute("data-product");
    if(cartId == null){
        return;
    }
    axios
        .delete(`${url}/carts/${cartId}`)
        .then(function(response){
            alert(`刪除 ${productName} 成功`);
            getCartList();
        })
})

// 清除購物車內全部產品

const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios
        .delete(`${url}/carts`)
        .then(function(response){
            alert(`刪除全部購物車成功`);
            getCartList();
        })
        .catch(function(error){
            alert(`購物車已清空`);
        }) 
})


// 信箱驗證
const checkCustomerEmail = document.querySelector('#customerEmail');
const orderInfoMessageEmail = document.querySelector('.orderInfo-message[data-message="Email"]');
checkCustomerEmail.addEventListener('blur', function(e){
  if(validateEmail(customerEmail.value) === false){
    orderInfoMessageEmail.style.display = 'block';
  } else {
    orderInfoMessageEmail.style.display = 'none';
  }
});






// 送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    if(cartData.length == 0){
        alert('您購物車尚未加入產品');
        return;
    }

    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const customerTradeWay = document.querySelector('#tradeWay').value;

    if(validateEmail(customerEmail)){
    }else{
        alert("請填寫正確E-mail");
        return;
    }
    if (tradeWay.value == 'blank') {
        alert('請選擇交易方式！');
        return;
    };
    // 如果有其中一個沒有填寫，則返回
    if(customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay == ""){
        alert('您尚未填寫預定資訊');
        orderInfoMessageName.style.display = 'block';
        orderInfoMessagePhone.style.display = 'block';
        orderInfoMessageEmail.style.display = 'block';
        orderInfoMessageAddress.style.display = 'block';
        return;
    }
    axios
        .post(`${url}/orders`,{
            "data": {
                "user": {
                  "name": customerName,
                  "tel": customerPhone,
                  "email": customerEmail,
                  "address": customerAddress,
                  "payment": customerTradeWay
                }
              }
        })
        .then(function(response){
            alert('訂單建立成功');
            document.querySelector('#customerName').value = '';
            document.querySelector('#customerPhone').value = '';
            document.querySelector('#customerEmail').value = '';
            document.querySelector('#customerAddress').value = '';
            document.querySelector('#tradeWay').value = 'blank';
            getCartList();
        })
})

// util js
function toThousands(x){
    let num = x
    return num.toLocaleString('zh-tw',{minimumFractionDigits: false});
}

// email 驗證
function validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    } else {
      return false;
    }
}

// 手機 驗證
function validatePhone(phone) {
  if (/^(09)[0-9]{8}$/.test(phone)) {
    return true;
  } else {
    return false;
  }
}