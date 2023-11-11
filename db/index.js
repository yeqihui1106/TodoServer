const mysql = require("mysql2");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'todo'
})
db.connect(function (err) {
    if (err) {
        // 处理连接错误
        console.error('连接数据库失败 ' + err.stack);
        return;
    }
    console.log('数据库，启动！！！！' + db.threadId);
});
module.exports = db;