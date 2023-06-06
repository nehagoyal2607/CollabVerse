const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const expressSanitizer = require("express-sanitizer");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const { Client, Environment, ApiError } = require("square");
const mongoose = require("mongoose");
const User = require("./models/user");
const Room = require("./models/room");
const passportSocketIo = require("passport.socketio");


mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB!"))
  .catch((error) => console.log(error.message));

require("dotenv").config();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use(express.json());
app.use(expressSanitizer());
const sessionMiddleware = session({
  secret: "Our square app",
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    User.authenticate()
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
});

const isLoggedIn = function (req, res, next) {
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

var http = require("http").Server(app);
var io = require("socket.io")(http);
const { v4: uuidv4 } = require("uuid");
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Routes

app.get("/", async (req, res) => {
  const results = await client.catalogApi.searchCatalogObjects({
    objectTypes: ["ITEM_VARIATION"],
    includeDeletedObjects: false,
    includeRelatedObjects: true,
  });
  const items = JSON.parse(JSON.stringify(results.result.objects));
  const images = JSON.parse(JSON.stringify(results.result.relatedObjects));
  var mergeArr = images.map((a) =>
    Object.assign(
      a,
      items.find((b) => a.id == b.itemVariationData.imageIds[0])
    )
  );
  mergeArr = mergeArr.filter((a) => a.type === "ITEM_VARIATION");
  res.render("index", { catalog: mergeArr });
  // console.log(mergeArr);
});

app.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    // User is authenticated
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    // User is not authenticated
    res.status(401).json({ authenticated: false });
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let newUser = new User({
    givenName: req.body.givenName,
    familyName: req.body.familyName,
    email: req.body.email,
  });
  User.register(newUser, req.body.password, async (err, user) => {
    if (err) {
      console.log(err);
      return res.redirect("back");
    }
    try {
      const response = await client.customersApi.createCustomer({
        idempotencyKey: uuidv4(),
        givenName: req.body.givenName,
        familyName: req.body.familyName,
        emailAddress: req.body.email,
      });

      console.log(response.result);
    } catch (error) {
      console.log(error);
    }
    passport.authenticate("local")(req, res, () => {
      console.log("Successfully Registered");
      res.redirect("/");
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
  }),
  (req, res) => {
    console.log("Successfully Logged in");
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/shop-listing", async (req, res) => {
  const results = await client.catalogApi.searchCatalogObjects({
    objectTypes: ["ITEM_VARIATION"],
    includeDeletedObjects: false,
    includeRelatedObjects: true,
  });
  const items = JSON.parse(JSON.stringify(results.result.objects));
  const images = JSON.parse(JSON.stringify(results.result.relatedObjects));
  var mergeArr = images.map((a) =>
    Object.assign(
      a,
      items.find((b) => a.id == b.itemVariationData.imageIds[0])
    )
  );
  mergeArr = mergeArr.filter((a) => a.type === "ITEM_VARIATION");
  res.render("shop-listing", { catalog: mergeArr });
});

app.get("/product/:id", async (req, res) => {
  try {
    const response = await client.catalogApi.retrieveCatalogObject(
      req.params.id,
      true
    );
    let product = JSON.parse(JSON.stringify(response.result));
    let result = {
      ...product.object,
      data: {},
    };
    Object.assign(result.data, ...product.relatedObjects);
    res.render("product", { product: result });
    // console.log(result);
  } catch (error) {
    console.log(error);
  }
});
app.get("/jsonproduct/:id", async (req, res) => {
  try {
    const response = await client.catalogApi.retrieveCatalogObject(
      req.params.id,
      true
    );
    let product = JSON.parse(JSON.stringify(response.result));
    let result = {
      ...product.object,
      data: {},
    };
    Object.assign(result.data, ...product.relatedObjects);
    res.json(result);
    // console.log(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/recommendation", (req, res) => {
  Room.findById(req.query.roomId)
  .select({
    messages: {
      $filter: {
        input: "$messages",
        as: "message",
        cond: { $gt: [{ $size: "$$message.likes" }, 0] }
      }
    }
  })
  .sort({ "messages.likes": -1 })
  .exec()
  .then((room) => {
    // console.log(room)
    if (!room) {
      // Room not found or no matching messages
      return [];
    }

    const sortedMessages = room.messages.sort((a, b) => b.likes.length - a.likes.length);
    // console.log(sortedMessages);
    res.json(sortedMessages);
    // Further processing or sending the sortedMessages to the client
  })
  .catch((err) => {
    console.error(err);
    // Handle error
  });
});
app.get("/empty-cart", (req, res) => {
  res.render("empty-cart");
});
app.get("/empty-wishlist", (req, res) => {
  res.render("empty-wishlist");
});
app.get("/wishlist", (req, res) => {
  res.render("wishlist");
});
app.get("/shopping-cart", (req, res) => {
  res.render("shopping-cart");
});
//
app.get("/index1", (req, res) => {
  res.render("index1");
});
app.get("/index2", (req, res) => {
  res.render("index2");
});
app.post("/createRoom", (req, res) => {
  Room.create({ _id: req.body.roomID })
    .then((room) => {
      if (!room) {
        console.log("unsuccessful room");
      } else {
        console.log("room created");
        return res.status(200).json({ data: "Success" });
      }
    })
    .catch((e) => {
      console.log(e);
    });
});
app.get("/verifyRoom", (req, res) => {
  Room.findById(req.query.roomID).then((room) => {
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    } else {
      return res.status(200).json({ success: "Verified" });
    }
  });
});

function toggleElement(array, element) {
  const index = array.indexOf(element);
  if (index !== -1) {
    // Element exists in the array, so remove it
    array.splice(index, 1);
  } else {
    // Element doesn't exist in the array, so add it
    array.push(element);
  }
}

let roomID;
io.on("connect", function (socket) {
  console.log("user connected with id ", socket.id);
  socket.on("join-room", (roomId, currentUser, cb) => {
    socket.join(roomId);
    cb(`Joined ${roomId}`);

    Room.findById(roomId).then((room) => {
      if (!room) {
        Room.create({ _id: roomId })
          .then((room) => {
            if (!room) {
              console.log("unsuccessful room");
            } else {
              console.log("room created");
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else socket.emit("old-message", room.messages);
    });

    socket.to(roomId).emit("new-joiner", currentUser); //added extra

    socket.on("like", async (messageId, likes) => {
      // socket.to(roomId).emit("updateLikes", { messageId, likes: likes });

      try {
        const room = await Room.findById(roomId);
        if (!room) {
          // Handle room not found error
          return;
        }
        
        const message = room.messages.find((msg) => msg._id === messageId);
        if (!message) {
          // Handle message not found error
          return;
        }
        
        toggleElement(message.likes, currentUser._id);
        await room.save();
    
        socket.to(roomId).emit("updateLikes", { messageId, likes: likes });
      } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
      }
 
    });

    socket.on("send-message", (message) => {
      Room.findById(roomId)
        .then((room) => {
          const newMsg = {
            text: message,
            likes: [],
            sender: currentUser.givenName + " " + currentUser.familyName,
            senderId: currentUser._id,
            messageType: 1,
          };
          room.messages.push(newMsg);
          room.save().then(() => {
            socket.to(roomId).emit("receive-message", { message, currentUser });
          });
        })
        .catch((e) => {
          console.log(e);
        });
    });

    socket.on("send-message-product", (messageId, message) => {
      Room.findById(roomId)
        .then((room) => {
          const newMsg = {
            _id: messageId,
            likes: [],
            text: JSON.stringify(message),
            sender: currentUser.givenName + " " + currentUser.familyName,
            senderId: currentUser._id,
            messageType: 2,
          };
          room.messages.push(newMsg);
          room.save().then(() => {
            socket
              .to(roomId)
              .emit("receive-message-product", {
                message,
                messageId,
                currentUser,
              });
          });
        })
        .catch((e) => {
          console.log(e);
        });
    });
  });
  socket.on("leave-room", (roomId, currentUser) => {
    socket.to(roomId).emit("left-room", currentUser);
    socket.leave(roomId);
    socket.removeAllListeners("send-message");
    socket.removeAllListeners("send-message-product");
  });
});
// Connection

const port = process.env.PORT || 3000;
http.listen(port, process.env.IP, function () {
  console.log("App is running.");
});
