const express = require("express");
const http = require("http");
const path=require("path")
var cors = require("cors"); 
const sessionStorage=require("sessionstorage")
const socketIo = require("socket.io");
const app = express();
const session=require("express-session")
const passport=require("passport")
const localstra=require("passport-local").Strategy
const connect=require("./connection")
const expressSession = require('express-socket.io-session'); // Integration library
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
  async (req,username, password,done) => {
      try {
        sessionStorage.setItem("username",username)
        room=req.body.room;
        const user = await add.getUser(username); 
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  passport.serializeUser((user, done) => {
    done(null, user.username);
  });
  passport.deserializeUser( (id, done) => {
    done(null, id);
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

app.get("/",(req,res)=>{
  res.sendFile(__dirname+"/user-form.html")
})
app.get("/create",(req,res)=>{
  res.sendFile(__dirname+"/new.html")
})
app.post("/add",async(req,res)=>{
  req.session.username=req.body.username;
  await add.add_data(req.body.username,req.body.password)
  await create(req.body.username)
  room=req.body.room
  res.redirect("/logined")
})
app.get("/exist",(req,res)=>{
  res.sendFile(__dirname+"/form.html")
})


app.post('/login', (req, res, next) => {
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
const users = {};
io.use(expressSession(sessionMiddleware));
app.get("/logined",async (req,res)=>{
  const z=sessionStorage.getItem("username")
  const j=room
  req.session.username=z;
  req.session.room=j;
  res.sendFile(__dirname + "/client.html");
})  
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});
io.on("connection", async(socket) => {
  const q = socket.handshake.session.username;
  const z=socket.handshake.session.room
  socket.on("new-user",async()=>{
  let a=await add.get_data(q,z)
  socket.join(z)
  users[socket.id] = q;
    p.push(q)
    socket.to(z).emit("userjoined",q);
    io.to(socket.id).emit("lost",a)
})
  socket.on("save",async(message)=>{
    console.log(message) 
    });
  socket.on("send", async(message) => {
    const chatMessage = { data:p,message:message, name: users[socket.id], room: z, position: "right" };
     chatMessage.data.forEach( async(item) => {
      await add.add_message(chatMessage.name,item,chatMessage.message,chatMessage.room,chatMessage.position)
  })
  socket.to(chatMessage.room).emit("new-receieve",chatMessage )

})
  socket.on("disconnect", () => {
    const userName = users[socket.id];
    socket.leave(z);
    p=p.filter((item)=>
      (item!=userName)
    )
    console.log("exit", userName);
    socket.to(z).emit("dist", userName);
});

});
app.listen(6001, () => {
  console.log("Server is running on port 5500");
});
server.listen(8001)
