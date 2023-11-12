const db = require("../db/index")
const moment = require("moment");

// 获取todo
exports.getTodo = (req, res) => {
  // 查询用户
  db.query("select * from todoinfo where user_id=?", [req.userInfo.user_id], (err, result) => {
    if (err) return res.sendtwo(err);
    // console.log(result);   数组包含对象格式
    res.sendtwo(result)
  })
}

// 新增todo
exports.addTodo = (req, res) => {
  // 格式化当前时间戳
  const currentTime = moment(Date.now()).format("YYYY-MM-DD hh:mm:ss")
  // { todo_id, user_id, title, status, createdate, donedate, deletedate } 数据库字段
  db.query("insert into todoinfo set ?", { user_id: req.userInfo.user_id, title: req.body.title, createdate: currentTime }, function (err, result) {
    // 插入失败
    if (err) {
      return res.sendtwo(err);
    } else {
      if (result.affectedRows !== 1) return res.sendtwo("添加数据出错，请重试！ ");
    }
    res.sendtwo("添加成功", 0);
  })
}
