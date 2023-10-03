const connect=require("./connection")
const util=require("util")
const sql=require("mysql")
async function create(user){
  let connet=await connect()
  const add=` create table ${user} (id int AUTO_INCREMENT primary key,sender VARCHAR(255), message TEXT,timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,room int,position varchar(255))`;
  connet.query(add, (err, result) => {
      if (err) {
          console.log(err);
      } else {
          console.log(" table created");
      }
  });
}
module.exports=create;