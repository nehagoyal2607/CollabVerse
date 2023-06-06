let socket = io("/");
let roomID;
let currentUser;
let currCartTotal;
window.addEventListener("load", (event) => {
  let temp = localStorage.getItem("lastJoinedRoom");
  roomID = temp;

  if (temp) {
    axios
      .get("/verifyRoom", { params: { roomID: temp } })
      .then((response) => {
        if (response.status == 200) {
          axios
            .get("/check-auth")
            .then((res) => {
              let a1 = document.querySelector(".end-session-btn");
              let a2 = document.querySelector(".chat-invite");
              let a3 = document.querySelector(".msger");
              let a4 = document.querySelector(".no-connection-mainDiv");
              a4.style.display = "none";
              a1.style.display = "block";
              a2.style.display = "block";
              a3.style.display = "flex";
              socket.emit("join-room", temp, res.data.user, (message) => {
                displayMessageInfo(message);
              });
              localStorage.setItem("lastJoinedRoom", temp);
              openForm();
            })
            .catch((e) => {
              $("#tt-btn-authenticate").click();
            });
        }
      })
      .catch((e) => {
        $("#wrongRoomError").text("Wrong Room ID entered");
        setTimeout(() => $("#wrongRoomError").text(""), 5000);
      });
  }else {
    const queryString = window.location.search;
    if (queryString.includes("?")) {
      const urlParams = new URLSearchParams(queryString);
      const roomId = urlParams.get("roomid");
      roomID = roomId;
      if (roomId) {
        axios
          .get("/verifyRoom", { params: { roomID: roomId } })
          .then((response) => {
            if (response.status == 200) {
              axios
                .get("/check-auth")
                .then((res) => {
                  let a1 = document.querySelector(".end-session-btn");
                  let a2 = document.querySelector(".chat-invite");
                  let a3 = document.querySelector(".msger");
                  let a4 = document.querySelector(".no-connection-mainDiv");
                  a4.style.display = "none";
                  a1.style.display = "block";
                  a2.style.display = "block";
                  a3.style.display = "flex";
                  socket.emit("join-room", roomID, res.data.user, (message) => {
                    displayMessageInfo(message);
                  });
                  localStorage.setItem("lastJoinedRoom", roomID);
                  openForm();
                })
                .catch((e) => {
                  $("#tt-btn-authenticate").click();
                });
            }
          })
          .catch((e) => {
            $("#wrongRoomError").text("Wrong Room ID entered");
            setTimeout(() => $("#wrongRoomError").text(""), 5000);
          });
      }
    }
  }
});
function hasQueryParams(url) {
    return url.includes('?');
}
function joinRoom() {
  let roomId = document.getElementById("joinRoomInput").value;
  roomID = roomId;
  if (roomId) {
    axios
      .get("/verifyRoom", { params: { roomID: roomId } })
      .then((response) => {
        if (response.status == 200) {
          axios
            .get("/check-auth")
            .then((res) => {
              let a1 = document.querySelector(".end-session-btn");
              let a2 = document.querySelector(".chat-invite");
              let a3 = document.querySelector(".msger");
              let a4 = document.querySelector(".no-connection-mainDiv");
              a4.style.display = "none";
              a1.style.display = "block";
              a2.style.display = "block";
              a3.style.display = "flex";
              socket.emit("join-room", roomID, res.data.user, (message) => {
                displayMessageInfo(message);
              });
              localStorage.setItem("lastJoinedRoom", roomID);
            })
            .catch((e) => {
              $("#tt-btn-authenticate").click();
            });
        }
      })
      .catch((e) => {
        $("#wrongRoomError").text("Wrong Room ID entered");
        setTimeout(() => $("#wrongRoomError").text(""), 5000);
      });
  }
  document.getElementById("joinRoomInput").value = "";
}

function beginSession() {
    roomID = Array.from(Array(11), () =>
        Math.floor(Math.random() * 36).toString(36)
      ).join("");
      console.log(roomID);
  axios
    .get("/check-auth")
    .then(async (res) => {
        try{
            const results = await axios
            .post("/createRoom", {
              roomID: roomID,
            });
            let a1 = document.querySelector(".end-session-btn");
            let a2 = document.querySelector(".chat-invite");
            let a3 = document.querySelector(".msger");
            let a4 = document.querySelector(".no-connection-mainDiv");
            a4.style.display = "none";
            a1.style.display = "block";
            a2.style.display = "block";
            a3.style.display = "flex";
            socket.emit("join-room", roomID, res.data.user, (message) => {
              displayMessageInfo(message);
            });
            localStorage.setItem("lastJoinedRoom", roomID);
        } catch(error){
            console.log(error)

        }
        
    })
    .catch((e) => {
      $("#tt-btn-authenticate").click();
    });
}

$("#modalLoginForm").on("submit", (e) => {
  e.preventDefault();
  var email = document.getElementById("loginEmail").value;
  var password = document.getElementById("loginPassword").value;

  // Create an object with the form data
  var formData = {
    email: email,
    password: password,
  };
  axios
    .post("/login", formData)
    .then((res) => {
      $("#ModalauthenticateCloseButton").click();
      axios.get("/check-auth").then((res) => {
        console.log(res.data.user);
        let a1 = document.querySelector(".end-session-btn");
        let a2 = document.querySelector(".chat-invite");
        let a3 = document.querySelector(".msger");
        let a4 = document.querySelector(".no-connection-mainDiv");
        a4.style.display = "none";
        a1.style.display = "block";
        a2.style.display = "block";
        a3.style.display = "flex";
        socket.emit("join-room", roomID, res.data.user, (message) => {
          displayMessageInfo(message);
        });
        localStorage.setItem("lastJoinedRoom", roomID);
      });
    })
    .catch((e) => {
      setTimeout(() => {
        $("#modalErrorMessage").text("Wrong details");
      }, 2000);
      console.log(e);

    });
});

$("#modalRegisterForm").on("submit", (e) => {
  e.preventDefault();
  var email = document.getElementById("loginInputEmail").value;
  var password = document.getElementById("loginInputPassword").value;
  var givenName = document.getElementById("loginInputName").value;
  var familyName = document.getElementById("loginLastName").value;

  // Create an object with the form data
  var formData = {
    givenName: givenName,
    familyName: familyName,
    email: email,
    password: password,
  };
  axios
    .post("/register", formData)
    .then((res) => {
      $("#ModalauthenticateCloseButton").click();
      axios.get("/check-auth").then((res) => {
        let a1 = document.querySelector(".end-session-btn");
        let a2 = document.querySelector(".chat-invite");
        let a3 = document.querySelector(".msger");
        let a4 = document.querySelector(".no-connection-mainDiv");
        a4.style.display = "none";
        a1.style.display = "block";
        a2.style.display = "block";
        a3.style.display = "flex";
        socket.emit("join-room", roomID, res.data.user, (message) => {
            displayMessageInfo(message);
        });
        localStorage.setItem("lastJoinedRoom", roomID);
      });
    })
    .catch((e) => {
      setTimeout(() => {
        $("#modalErrorMessage").text("Wrong details");
      }, 2000);
    });
  console.log(e);
});

function addToChat(id) {
  axios
    .get(`/jsonproduct/${id}`)
    .then((response) => {
        const msgId = Math.random().toString(36).slice(2);
      socket.emit("send-message-product", msgId, response.data);
      displayMessageProduct(response.data, msgId, [], {givenName:"You", familyName:""});
      console.log(msgId);
    })
    .catch((error) => {
      // Handle the error
      console.error(error);
    });
}

document.getElementById("message").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
document.getElementById("msger-send-btn").addEventListener("click", function(event) {
  event.preventDefault();
  sendMessage();
});
function sendMessage() {
  let message = document.getElementById("message").value;
  if (message) {
    socket.emit("send-message", message);
    displayMessage(message, {givenName:"You", familyName:""});
    console.log(message);

    document.getElementById("message").value = "";
  }
}

socket.on("receive-message", (data) => {
  let {message, currentUser} = data;
  displayMessage(message, currentUser);
});
socket.on("new-joiner", (currentUser) => {
  let temp = `${currentUser.givenName} ${currentUser.familyName} just joined the room`;
  displayMessageInfo(temp);
});
socket.on("left-room", (currentUser) => {
  let temp = `${currentUser.givenName} ${currentUser.familyName} left the room`;
  displayMessageInfo(temp);
});
socket.on("old-message", (messages) => {
  messages.forEach((msg) => {
    if (msg.messageType == 1) {
      displayMessage(msg.text, {givenName:msg.sender, familyName:"", senderId:msg.senderId});
    } else {
      displayMessageProduct(JSON.parse(msg.text), msg._id, msg.likes, {givenName:msg.sender, familyName:"", senderId:msg.senderId});
    }
  });
});
const scrollBottom = () => {
  let d = $("#chatContainer");
  d.scrollTop(d.prop("scrollHeight"));
};
function displayMessage(message, currentUser) {
    let myId;
    axios.get("/check-auth").then((res) => {
        myId = res.data.user._id;
    
    let leftmsg =
      (currentUser._id != undefined && currentUser._id != myId) ||
      (currentUser.senderId != undefined && currentUser.senderId != myId)
        ? true
        : false;
    // console.log(currentUser);
  $("#chatContainer").append(`<div class="msg ${leftmsg?'left-msg': 'right-msg'}"">
        <div
         class="msg-img"
         style="background-image: url(images/male-user.svg)"
        ></div>
        <div class="msg-bubble">
          <div class="msg-info">
            <div class="msg-info-name">${currentUser.givenName} ${currentUser.familyName}</div>
          </div>
  
          <div class="msg-text">
            ${message}
          </div>
        </div>
      </div>`);
  scrollBottom();})
}
function openInviteDiv() {
  let button = document.querySelector(".chat-invite");
  let content = document.querySelector(".form-container-inviteCopyDiv");
  let videoContent = document.querySelector(".msger");
  button.classList.toggle("chat_invite--active");
  if (button.classList.contains("chat_invite--active")) {
    videoContent.style.transition = "height 0.5s ease-in";
    content.style.transition = "opacity 0.5s ease-in-out";
    content.style.visibility = "visible";
    content.style.opacity = "1";
    content.style.position = "relative";
    videoContent.style.height = "calc(100% - 80px)";
  } else {
    videoContent.style.transition = "height 0.5s ease-out";
    content.style.transition = "opacity 0.5s ease-in-out";
    content.style.visibility = "hidden";
    content.style.opacity = "0";
    content.style.position = "absolute";
    videoContent.style.height = "calc(100% - 40px)";
  }
}
function sendEmail() {
    const emailId = document.querySelector("#inviteEmailInputId");
    const roomId = localStorage.getItem("lastJoinedRoom");
    // console.log(emailId.val())
    if (emailId.value) {
        Email.send({
            Host: "smtp.elasticemail.com",
            Secure: false,
            Username: `${username}`,
            Password: `${password}`,
            To: emailId.value,
            From: "reetarora245@gmail.com",
            Subject: "Help me Shop!",
            Body: `Hey! Let's shop together. Join this link - https://collabverse.onrender.com/?roomid=${roomId}`
        }).then(
            message => swal({
                title: "Email sent!",
                text: "Your buddy is on their way xD",
                icon: "success",
              })
            //add a flash/modal here to confirm that email was sent
        );
    }
    document.querySelector("#inviteEmailInputId").value = ""
}

// Tool tip function
function myFunction() {
  const roomId = localStorage.getItem("lastJoinedRoom");
  navigator.clipboard.writeText(roomId);
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied: " + roomId;
}

function outFunc() {
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copy Code";
}

function leaveRoom() {
    axios.get("/check-auth").then((res) => {
     const temp2 = localStorage.getItem("lastJoinedRoom");
     localStorage.removeItem("lastJoinedRoom");
      socket.emit("leave-room", temp2, res.data.user);
      let a1 = document.querySelector(".end-session-btn");
      let a2 = document.querySelector(".chat-invite");
      let a3 = document.querySelector(".msger");
      let a4 = document.querySelector(".no-connection-mainDiv");
      a4.style.display = "flex";
      a1.style.display = "none";
      a2.style.display = "none";
      a3.style.display = "none";
      let content = document.querySelector(".form-container-inviteCopyDiv");
      content.style.transition = "opacity 0.5s ease-in-out";
      content.style.visibility = "hidden";
      content.style.opacity = "0";
      content.style.position = "absolute";
      roomID = "";
      $("#chatContainer").html("");
    });
  
}

socket.on("receive-message-product", (data) => {
    let {message, messageId, currentUser} = data
  displayMessageProduct(message, messageId, [], currentUser);
});

function displayMessageProduct(message, messageId, msgArray, currentUser) {
    let myId;
    axios.get("/check-auth").then((res) => {
        myId = res.data.user._id;
    
    let leftmsg =
        (currentUser._id != undefined && currentUser._id != myId) ||
        (currentUser.senderId != undefined && currentUser.senderId != myId)
          ? true
          : false;        
          
        $("#chatContainer").append(`
    <div class="msg ${leftmsg?'left-msg': 'right-msg'}">
        <div class="msg-img" style="background-image: url(images/male-user.svg)"></div>
        <div class="msg-bubble" >
            <div class="msg-info" >
                <div class="msg-info-name">
                    ${currentUser.givenName} ${currentUser.familyName}
                </div>
            </div>
    
            <div class="msg-text">
    
                <div class="card_">
    
                    <div class="card-img-div_">
                        <a href="/product/${message.id}"><img 
                            src="${message.data.imageData.url}" 
                            class="card-img-top_" alt="..."></a>
                    </div>
    
                    <div class="card-details_">
                        <div class="card-title_">
                            <a href="/product/${message.id}">
                                ${message.itemVariationData.name}
                            </a>
                        </div>
                        <div class="card-text_">
                            <a href="/product/${message.id}">
                                ${message.customAttributeValues.description.stringValue}
                            </a>
                        </div>
                    </div>
    
                    <div class="cta-section_parentDiv">
                        <div class="cta-section_">
                            <div><b>$${
                                    message.itemVariationData.priceMoney.amount / 100
                                    }</b></div>
                        </div>
                        
                        <a href="/product/${message.id}" class="btn_ btn-light_">Buy</a>
                    </div>
    
                </div>
                
            </div>
        </div>
        <button type='button' class="btn_ btn-light_ " id="message-${messageId}" onclick="handleProductLike('${messageId}')" style="
                                font-size: 1.5em;
                                margin: 0.3em;
                                border: none;
                                background: none;
                            ">
                            <i id="msgheart-${messageId}" class="fa ${msgArray.includes(myId)?'fa-heart': 'fa-heart-o'}" aria-hidden="true" style="color:red"></i>
                            <span id="msglike-${messageId}" class=${msgArray.includes(myId)?'liked': myId} style="margin: 5px;">
                        ${msgArray.length}</span>
                        </button>
    </div>
    `);
  scrollBottom();
    });
    
    // https://codepen.io/codingyaar/pen/ZEqEpem
    
}

function displayMessageInfo(msg){
    $("#chatContainer").append(`<div class="msg left-msg" style="display:flex; text-align:center">
        
          <p class="msg-text">
            ${msg}
          </p>

      </div>`);
  scrollBottom();
}

function handleProductLike(messageId){
    const likeCountElement = $(`#msglike-${messageId}`);
    const likeHeartIcon = $(`#msgheart-${messageId}`)
    const likes = Number(likeCountElement.text());

    if (likeCountElement.hasClass('liked')) {
        // User has already liked, so remove the like
        likeCountElement.removeClass('liked');
        likeHeartIcon.removeClass('fa fa-heart')
        likeHeartIcon.addClass('fa fa-heart-o');

        likeCountElement.text(likes - 1);
        socket.emit('like', messageId, likes-1);
    } else {
        // User has not liked, so add the like
        likeCountElement.addClass('liked');
        likeHeartIcon.removeClass('fa fa-heart-o');
        likeHeartIcon.addClass('fa fa-heart')

        likeCountElement.text(likes + 1);
        socket.emit('like', messageId, likes+1);
    }

}

  
// When the like count is updated
socket.on('updateLikes', ({ messageId, likes }) => {
    const messageElement = document.getElementById(`msglike-${messageId}`);
    if (messageElement) {
      messageElement.textContent = likes;
    }
  });


  function handleCartClick() {
    $("#recommdationCartList").html('')
    axios.get("/recommendation", {params:{roomId:localStorage.getItem("lastJoinedRoom")}})
    .then(res => {
        console.log(res.data);
        let cartListItems = res.data.slice(0,3);
        let sum = 0;
        cartListItems.forEach(item => {
            const product = JSON.parse(item.text);
            sum += Number(product.itemVariationData.priceMoney.amount);
            $("#recommdationCartList").append(
                `<div class="tt-item">
                    <a href="/product">
                        <div class="tt-item-img">
                            <img src=${product.data.imageData.url} data-src=${product.data.imageData.url} alt="">
                        </div>
                        <div class="tt-item-descriptions">
                            <h2 class="tt-title">${product.itemVariationData.name}</h2>
                            <ul class="tt-add-info">
                                <li>${product.customAttributeValues.description.stringValue}</li>
                            </ul>
                            <div class="tt-quantity">1 X</div> <div class="tt-price">$${product.itemVariationData.priceMoney.amount/100}</div>
                        </div>
                    </a>
                    <div class="tt-item-close">
                        <a href="#" class="tt-btn-close"></a>
                    </div>
                </div>`            
            )
        })
        $("#recommdationCartListTotal").text(`$${sum/100}`);
    })
  }
function getCurrCartFromLS(){
  
}  
//add productID to cart  
function addToCartFromProducts(item){
  let cartArr;
  if (localStorage.getItem("currCartData")) {
    cartArr = JSON.parse(localStorage.getItem("currCartData"));
    cartArr.push(item);
  } else {
    console.log("hello brooo")
    cartArr = [item];
  }
  localStorage.setItem("currCartData", JSON.stringify(cartArr));
  swal({
    title: "Added to Cart Successfully!",
    text: "Keep shopping",
    icon: "success",
  })
//add a flash/modal here to confirm that email was sent
  // console.log(cartArr)
}  

//remove productID from cart
function removeItemFromCart(item, itemPrice, element){
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

//clear shopping cart
function clearShoppingCart(){
  localStorage.removeItem("currCartData")
  $("#cartViewContainer").html('')
  localStorage.setItem("currCartTotal", "0")
  window.location.href = "/empty-cart";
}

//update cart toal displayed
function cartTotalDisplayed(){
  document.getElementById("#cartTotalDisplayed").innerHTML = `$ ${localStorage.getItem("currCartTotal")}`
}

//share my cart to everyone in chat
function shareMyCarttoChat(){
  let currArr = localStorage.getItem("currCartData")
  if(currArr!==null && currArr.length>0){
    let message = "Hey! Check out my cart -";
    if (message) {
      socket.emit("send-message", message);
      displayMessage(message, {givenName:"You", familyName:""});
      console.log(message);
    }
    currArr = JSON.parse(currArr);
    currArr.forEach(function(element){
      addToChat(element);
    })
  }
}
