const socket = io("http://localhost:8001",{transports:["websocket"]});
const form=document.getElementById("send");
const messageinp=document.getElementById("input");
const messages=document.querySelector(".container");
const typingIndicator = document.getElementById("typing-indicator");
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
messageinp.addEventListener('input', () => {
  console.log("input ")
  if (messageinp.value.length > 0) {
    socket.emit('typing');
  } else {
    socket.emit('stop-typing');
  }
});

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
socket.on('opponent-typing', (opponentUsername) => {
  console.log(`${opponentUsername} is typing...`);
  const typingIndicator = document.getElementById('typing-indicator');
  typingIndicator.textContent = `${opponentUsername} is typing...`;
});
socket.on('opponent-stop-typing', (opponentUsername) => {
  console.log(`${opponentUsername} stopped typing.`);
  const typingIndicator = document.getElementById('typing-indicator');
  typingIndicator.textContent = '';
});
socket.on('update-online-users', (onlineUsers) => {
  const typingIndicator = document.getElementById('typing-indicator2');
  typingIndicator.textContent = onlineUsers;
  console.log('Online Users:', onlineUsers);
});
socket.on('remove-online-users', (onlineUsers) => {
  const typingIndicator = document.getElementById('typing-indicator2');
  typingIndicator.textContent = onlineUsers;
  console.log('Online Users:', onlineUsers);
});
