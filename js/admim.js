const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`;


function init(){
  getOrderList();
  // renderC3();
}

init();

let orderData = [];
const orderList = document.querySelector('.js-orderList');

function getOrderList(){
  axios
    .get(`${url}/orders`,{
      headers:{
        'authorization':token,
      }
    })
    .then(function(response){
      orderData = response.data.orders;
      
      let str = '';
      orderData.forEach(function(item){
        // 時間狀態字串
        const timeStamp = new Date(item.createdAt*1000);
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

        // 組產品字串
        let productStr = '';
        item.products.forEach(function(productsItem){
          productStr += `<p>${productsItem.title} x ${productsItem.quantity}</p>`
        })

        // 判斷訂單處理狀態
        let orderPaidStatuses = '';
        if(item.paid == true){
          orderPaidStatuses = '已處裡';
        }else{
          orderPaidStatuses = '處裡中';
        }

        // 組訂單字串
        str += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productStr}</p>
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
          <a href="#" class="js-orderPaidStatuses" data-id="${item.id}" data-statuses="${item.paid}">${orderPaidStatuses}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" value="刪除" data-id="${item.id}">
        </td>
      </tr>`
      })
      orderList.innerHTML = str;
      renderC3();
    })
}

orderList.addEventListener('click',function(e){
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  const deleteOrderList = e.target.getAttribute("value");

  let userId = e.target.getAttribute("data-id");

  if(targetClass == "js-orderPaidStatuses"){
    let statuses = e.target.getAttribute("data-statuses");
    putOrderItem(statuses,userId);
    return;
  }

  if(deleteOrderList == "刪除"){
    deleteOrderItem(userId);
    return;
  }
})

function putOrderItem(statuses,userId){
  let newStatuses;
  if(statuses == true){
    newStatuses = false;
  }else{
    newStatuses = true;
  }
  axios
    .put(`${url}/orders`,{
      "data": {
        "id": userId,
        "paid": newStatuses
      }
    },{
      headers:{
        'authorization':token,
      }
    })
    .then(function(response){
      alert('修改訂單成功');
      getOrderList();
    })
}

function deleteOrderItem(userId){
  axios
    .delete(`${url}/orders/${userId}`,{
      headers:{
        'authorization':token,
      }
    })
    .then(function(response){
      alert('刪除成功');
      getOrderList();
    })  
}

function renderC3(){
  console.log(orderData);
  let total = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productsItem){
      if(total[productsItem.category]){}
    })
  })
  // C3.js
  let chart = c3.generate({
  bindto: '#chart', // HTML 元素綁定
  data: {
      type: "pie",
      columns: [
      ['Louvre 雙人床架', 1],
      ['Antony 雙人床架', 2],
      ['Anty 雙人床架', 3],
      ['其他', 4],
      ],
      colors:{
          "Louvre 雙人床架":"#DACBFF",
          "Antony 雙人床架":"#9D7FEA",
          "Anty 雙人床架": "#5434A7",
          "其他": "#301E5F",
      }
    },
  });
}