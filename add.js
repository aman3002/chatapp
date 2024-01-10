const connect=require("./connection")
const util=require("util")
const sql=require("mysql")
async function add_data(user,pass){
   let  connet=await connect();
    const add=` INSERT INTO passwords VALUES("${user}","${pass}")`;
    connet.query(add, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("created");
        }
    });

}
async function add_message(users,user,mess,room,position){
  let  connet=await connect();
   const add=` INSERT INTO ${user} (sender,message,room,position) VALUES("${users}","${mess}","${room}","${position}")`;
   connet.query(add, (err, result) => {
       if (err) {
           console.log(err);
       } else {
           console.log("message_added");
       }
   });

}
async function getUser(username) {
    try {
      const connection = await connect();
      const query = util.promisify(connection.query).bind(connection);
      const quer = `SELECT * FROM passwords WHERE username = "${username}"`;
      const result = await query(quer);
      console.log(result)
      if (result.length > 0) {
          const user = await  { username: result[0].username, password: result[0].password };
          await console.log(user);
          return user;
      } else {
          return null; // Return null if no user is found
      }
    
    } catch (error) {
      throw error;
    }
  }
  async function get_data(user,room) {
    try {
      const connection = await connect();
      const query = util.promisify(connection.query).bind(connection);
      const quer = `SELECT * FROM ${user} WHERE (room=${room} ) `;
      const result = await query(quer);

      if (result.length > 0) {
        const updatedResult = result.map(item => ({ ...item, user }));
        console.log(updatedResult)
        return updatedResult;
      } else {
          return null; // Return null if no user is found
      }
    
    } catch (error) {
      throw error;
    }
  }
module.exports={add_data,getUser,add_message,get_data}
