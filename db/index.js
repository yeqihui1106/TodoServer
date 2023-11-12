const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "todo"
})

db.connect(function (err) {
  if (err) {
    console.error("数据库连接失败", err);
  } else {
    console.log("数据库，启动！！！");
  }
})
module.exports = db;
