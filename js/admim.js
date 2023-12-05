const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`;

function init(){
  getOrderList();
}

init();

let orderData = [];
const orderList = document.querySelector('.js-orderList');

function renderC3(){
  // 物件資料收集
  let obj = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productsItem){
      if(obj[productsItem.title] == undefined){
        obj[productsItem.title] = productsItem.price * productsItem.quantity;
      }else{
        obj[productsItem.title] += productsItem.price * productsItem.quantity;
      }
    })
  })
  console.log(obj);

  // 資料關聯
  let originAry = Object.keys(obj);
  console.log(originAry);

  let rankSortAry = [];
  originAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  })
  console.log(rankSortAry);

  rankSortAry.sort(function(a,b){
    return b[1] - a[1];
  })

  if(rankSortAry.length > 3){
    let otherTotal = 0;
    rankSortAry.forEach(function(item,num){
      if(num > 2){
        otherTotal += rankSortAry[num][1];
      }
    })
    rankSortAry.splice(3,rankSortAry.length - 1);
    rankSortAry.push(['其他',otherTotal]);
  }

  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: rankSortAry,
        colors:{
            pattern:["#301E5F","#5434A7","#9D7FEA","#DACBFF"]
        }
    },
  });
}

// 取得訂單列表
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

// 修改訂單狀態
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

// 刪除特定訂單
function deleteOrderItem(userId){
  axios
    .delete(`${url}/orders/${userId}`,{
      headers:{
        'Authorization':token,
      }
    })
    .then(function(response){
      alert('刪除成功');
      getOrderList();
    })  
}

// 刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
  e.preventDefault();
  axios.delete(`${url}/orders`,{
      headers:{
        'Authorization':token,
      }
    })
    .then(function(response){
      alert('購物車產品已全部清空');
      getOrderList();
    })  
})