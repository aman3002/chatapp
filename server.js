const express = require("express");
const http = require("http");
const path=require("path")
let localUsers = {};
let googleUsers = {};

var cors = require("cors"); 
const sessionStorage=require("sessionstorage")
const socketIo = require("socket.io");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const session=require("express-session")
const passport=require("passport")
const localstra=require("passport-local").Strategy
const connect=require("./connection")
const expressSession = require('express-socket.io-session');
const create=require("./practice")
let room;
const add=require("./add")
const uuid=require("uuid")
const bodyParser = require("body-parser");
let z,j,b;
const sessionMiddleware = session({
  secret: 'hello',
  resave: false,
  saveUninitialized: true
});

app.use(sessionMiddleware);
let p=[];

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstra({
  passReqToCallback: true
},
async (req, username, password, done) => {
  try {
    req.session.user = { username: username };
    sessionStorage.setItem("username", username);
    room = req.body.room;
    const user = await add.getUser(username);
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    j=username
    localUsers[username] = username;
    return done(null, localUsers[username]);
  } catch (err) {
    return done(err);
  }
}
));
  function convertDisplayName(name) {
    return name.replace(/\s+/g, '_'); 
  }
  passport.use(new GoogleStrategy({
    clientID: '492147582846-cnvmg9au6p1e92mjelabvk7h2io7coii.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:6001/auth/google/callback',
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    req.session.user = {
      username: convertDisplayName(profile.displayName)
    };
    const user = await add.getUser(req.session.user.username);
    if (!user) {
      await add.add_data(req.session.user.username, "google");
      await create(req.session.user.username);
    }
    req.session.accessToken = accessToken;
    googleUsers[req.session.user.username] =  req.session.user.username;
    return done(null, googleUsers[req.session.user.username]);
  }
  ));
  passport.serializeUser((user, done) => {
    console.log(user)
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    console.log("Deserialized user:", user);
    done(null, user);
  });
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT"], 
  allowedHeaders: [
    "Content-Type",
    "X-Auth-Token",
    "Origin",
    "Authorization", 
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin",
    "Accept",
    "X-Requested-With",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  credentials: true, 
}));
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/authenticated');
  }
);


app.get("/",(req,res)=>{
  res.sendFile(__dirname+"/user-form.html")
})
app.get("/create",(req,res)=>{
  res.sendFile(__dirname+"/new.html")
})
app.post("/add",async(req,res)=>{
  j=req.body.username;
  await add.add_data(req.body.username,req.body.password)
  await create(req.body.username)
  room=req.body.room
  res.redirect("/logined")
})
app.get("/exist",(req,res)=>{
  res.sendFile(__dirname+"/form.html")
})
app.get("/authenticated",async(req,res)=>{
  if(req.isAuthenticated()){
    res.redirect("/room")
  }
  else{
    res.redirect("/")
  }
})
app.get('/room', (req, res) => {
  res.sendFile(__dirname+"/room.html")
});
app.post("/room_no",async(req,res)=>{
  room=req.body.room
  j=req.user
  console.log("usernamae",j)
 z=room
  res.redirect("/logined")
})
app.post('/login', (req, res, next) => {
  z=req.body.room
  passport.authenticate('local', {
    successRedirect: "/logined",
    failureRedirect: "/exists"
  })(req, res, next);
});
app.get("/exists",(req,res)=>{
  res.sendFile(__dirname+"/form.html")
})
const server = http.createServer(app);
const io = socketIo(server);
io.use(expressSession(sessionMiddleware));
app.get("/logined",async (req,res)=>{
 
  res.sendFile(__dirname + "/client.html");
})  
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});
let users={}
io.on("connection", async(socket) => {
  const q = j
  console.log("users inside connection:", users);
  console.log(q)
  socket.on("new-user",async()=>{
  let a=await add.get_data(q,z)
  users[socket.id] = { username:q, ping: false };
  console.log("users inside connection:", users);
  io.emit('update-online-users', Object.values(users).map(user => user.username));
  socket.join(z)
  console.log("users inside connection:", users);

    p.push(q)
    socket.to(z).emit("userjoined",q);
    io.to(socket.id).emit("lost",a)
})
socket.on('typing', () => {
  users[socket.id].ping = true;
  console.log("input server")
  socket.broadcast.emit('opponent-typing', users[socket.id].username);
});
socket.on('stop-typing', () => {
  users[socket.id].isTyping = false;
  socket.broadcast.emit('opponent-stop-typing', users[socket.id].username);
});
  socket.on("save",async(message)=>{
    console.log(message) 
    });
  socket.on("send", async(message) => {
    const chatMessage = { data:p,message:message, name: users[socket.id].username, room: z, position: "right" };
     chatMessage.data.forEach( async(item) => {
      await add.add_message(chatMessage.name,item,chatMessage.message,chatMessage.room,chatMessage.position)
  })
  socket.to(chatMessage.room).emit("new-receieve",chatMessage )
  console.log(users[socket.id]+"send")
})
socket.on("disconnect", () => {
  const user = users[socket.id] || googleUsers[socket.id];
  if (user) {
    const userName = user.username;
    console.log(userName + " delete");
    socket.leave(z);
    p = p.filter((item) => item !== userName);
    io.emit('remove-online-users', Object.values(users).map(user => user.username));
    socket.to(z).emit("dist", userName);
    delete users[socket.id];
    delete googleUsers[socket.id];
    console.log("exit", userName);
  }
});
});
app.listen(6001, () => {
  console.log("Server is running on port 5500");
});
server.listen(8001)
