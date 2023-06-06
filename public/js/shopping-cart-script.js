window.addEventListener(("load"), () => {
    let currArr = localStorage.getItem("currCartData")
    if (currArr !== null && currArr.length > 0) {
        currArr = JSON.parse(currArr);
        let currCartTotal = 0
        currArr.forEach(function (id) {
            axios
                .get(`/jsonproduct/${id}`)
                .then((response) => {
                    // console.log(response.data)
                    displayItemInCartView(response.data)
                    console.log(response.data.itemVariationData.priceMoney.amount / 100)
                    currCartTotal = currCartTotal + (response.data.itemVariationData.priceMoney.amount / 100)
                    localStorage.setItem("currCartTotal", currCartTotal)
                })
                .catch((error) => {
                    // Handle the error
                    console.error(error);
                });
        })
        
    }
    
})
console.log(localStorage.getItem("currCartTotal"))
function cartTotalDisplayed2(){
    let tres = parseFloat(localStorage.getItem("currCartTotal")).toFixed(2)
    document.getElementById("cartSubTotalDisplayed").innerHTML = `$ ${tres}`
    document.getElementById("cartTotalDisplayed").innerHTML = `$ ${tres}`
  }
function displayItemInCartView(item){
    console.log(item)
    $("#cartViewContainer").append(`<tr>
    <td>
        <div class="tt-btn-close" onclick="removeItemFromCart2('${item.id}', '${item.itemVariationData.priceMoney.amount / 100}',(this))"></div>
    </td>
    <td>
        <div class="tt-product-img">
            <img src="${item.data.imageData.url}" data-src="${item.data.imageData.url}" alt="">
        </div>
    </td>
    <td>
        <h2 class="tt-title">
            <a href="/product/${item.id}">${item.itemVariationData.name}</a>
        </h2>
        <ul class="tt-list-parameters">
            <li>
                <div class="tt-price">
                    $${item.itemVariationData.priceMoney.amount / 100}
                </div>
            </li>
            <li>
                <div class="detach-quantity-mobile"></div>
            </li>
            <li>
                <div class="tt-price subtotal">
                    $${item.itemVariationData.priceMoney.amount / 100}
                </div>
            </li>
        </ul>
    </td>
    <td>
        <div class="tt-price">
            $${item.itemVariationData.priceMoney.amount / 100}
        </div>
    </td>
    <td>
        <div class="detach-quantity-desctope">
            <div class="tt-input-counter style-01">
                <span class="minus-btn"></span>
                <input type="text" value="1" size="5">
                <span class="plus-btn"></span>
            </div>
        </div>
    </td>
    <td>
        <div class="tt-price subtotal">
            $${item.itemVariationData.priceMoney.amount / 100}
        </div>
    </td>
</tr>`)
}
function removeItemFromCart2(item, itemPrice, element){
    let array = localStorage.getItem("currCartData");
    let valueToRemove = item;
    array = JSON.parse(array)
    let index = array.indexOf(valueToRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
    localStorage.setItem("currCartData", JSON.stringify(array))
    var row = element.closest("tr");
    row.parentNode.removeChild(row);
    localStorage.setItem("currCartTotal", localStorage.getItem("currCartTotal")-itemPrice)
  }