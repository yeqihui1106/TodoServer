// 导入数据库
const db = require("../db/index");
// 加密的库
const bcrypt = require("bcryptjs");
// 生成token的
const jwt = require("jsonwebtoken");
// jwt密钥
const { jwtSecretKey } = require("../config.js");
const fs = require("fs");


// 注册的处理函数
exports.register = (req, res) => {
  // 收集用户信息
  const userInfo = req.body;
  // 空值处理
  if (!userInfo.username || !userInfo.password) return res.sendtwo("空用户名或密码，都不防一下小人吗");
  // 查询数据库中该用户名是否存在
  db.query("select * from user where username=?", [userInfo.username], function (err, result) {
    // sql语句执行失败
    if (err) return res.sendtwo(err);
    // 用户名已存在
    if (result.length > 0) return res.sendtwo("你这非主流的名字已经有人用了，换个好听的叭！");

    // 加密密码
    const password = bcrypt.hashSync(userInfo.password, 10);
    // 插入数据库
    db.query("insert into user set ?", { username: userInfo.username, password: password }, function (err, result) {
      if (err) {
        return res.sendtwo(err);
      } else {
        if (result.affectedRows !== 1) return res.sendtwo("出错啦，请重试！");
      }
      res.sendtwo("注册成功", 0);
    })
  })
}

// 登录的处理函数
exports.login = (req, res) => {
  const user = req.body;
  db.query("select * from user where username=?", [user.username], function (err, result) {
    // sql语句执行出错
    if (err) return res.sendtwo(err);
    // 查到用户不是一个
    if (result.length !== 1) return res.sendtwo("出错啦，请重试！");
    // 查到用户，对比密码bcrypt.compareSync(用户提交的密码, 数据库中的密码)
    const compareResult = bcrypt.compareSync(user.password, result[0].password);
    if (!compareResult) return res.sendtwo("老登，密码都错了，重新输入去");
    // 密码正确，存储需要生成token的数据（不携带密码，不安全所以将密码清空）
    const userinfo = { ...result[0], password: '' }
    // 生成token响应给客户端
    const tokenStr = jwt.sign(userinfo, jwtSecretKey);
    res.send({ status: 0, message: "登录成功", token: tokenStr, avatar_path: result[0].avatar_path });
  })
}

// 更改头像
exports.changeAvatar = (req, res) => {
  if (!req.file) return res.sendtwo("未收到头像！！！")
  // 先删除原头像（查询数据库对应路径文件并删除）
  db.query("select avatar_path from user where user_id=?", req.userInfo.user_id, (err, result) => {
    if (err) return res.sendtwo(err)
    if (result.length !== 1) res.sendtwo("查询用户不是一个！");
    // 没有设置过头像
    if (!result[0].avatar_path) {
      // 更改数据库存放的地址
      db.query('update user set avatar_path=? where user_id=?', [req.file.path, req.userInfo.user_id], (err, result) => {
        // 语句执行失败
        if (err) return res.sendtwo(err);
        return res.send({
          status: 0,
          message: "更新头像成功，去获取叭!",
          avatar_path: req.file.path
        })
      })
    } else {
      // 读取文件，读取不到会捕获到err
      fs.readFile(`${result[0].avatar_path}`, 'utf8', (err, data) => {
        if (err) return res.sendtwo(err)
        // 读取成功则删除该文件，删除失败会捕获到err
        fs.unlink(`${result[0].avatar_path}`, (err) => {
          if (err) res.sendtwo(err)
          // 删除成功更改数据库存放的地址
          db.query('update user set avatar_path=? where user_id=?', [req.file.path, req.userInfo.user_id], (err, result) => {
            // 语句执行失败
            if (err) return res.sendtwo(err);
            // 响应成功并且将存放路径返回给客户端
            return res.send({
              status: 0,
              message: "更新头像成功，去获取叭!",
              avatar_path: req.file.path
            })
          })
        });
      })
    }
  })
}