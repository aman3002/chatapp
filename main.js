const socket = io("http://localhost:8001",{transports:["websocket"]});

const form=document.getElementById("send");
const messageinp=document.getElementById("input");
const messages=document.querySelector(".container");
console.log(messages)
socket.emit("new-user", (error) => {
    if (error) {

      console.error("Error while emitting 'new-user' event:", error);
    } else {
      console.log("Successfully emitted 'new-user' event.");
    }
  });
  console.log("name");
var audio=new Audio("sound.mp3")
function appends(message,position){
    const messageelement=document.createElement("div");
    messageelement.innerText=message;
    console.log("message")
    messageelement.classList.add('message');
    messageelement.classList.add(position);
    messages.appendChild(messageelement);
    audio.play()
};
function append(message,position){
    const messageelement=document.createElement("div");
    messageelement.innerText=message;
    console.log("message")
    messageelement.classList.add('message');
    messageelement.classList.add(position);
    messages.appendChild(messageelement);
};
form.addEventListener('submit',(e)=>{
    e.preventDefault()
    const mess=messageinp.value
    append(`you: ${mess}`,"right");
    socket.emit("send",mess)
    messageinp.value=""
})
socket.on("lost",async(chatMessage)=>{
  chatMessage.forEach(async(item) => {
    
  if(item.user==item.sender){
  appends(`"you" : ${item.message}`,"right")
  }
  else{
    appends(`${item.sender}: ${item.message}`,"left")

  }})
})  
socket.on("new-receieve",async(chatMessage)=>{
    appends(`${chatMessage.name}: ${chatMessage.message}`,"left")
    socket.emit("save",chatMessage)
})  
socket.on("userjoined",(data)=>{
    console.log("hello")
    appends(`${data} joined the chat`,"right")
});
socket.on("dist",data=>{
    appends(`${data} left the chat`, "right")
})