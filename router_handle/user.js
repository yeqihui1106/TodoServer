const fs = require('fs');
// 导入数据库模块
const db = require("../db/index");
// 加密密码的库
const bcrypt = require('bcrypt');
// 引入jwt生成token
const jwt = require("jsonwebtoken");
// 引入jwt密钥
const { jwtSecretKey } = require("../config.js");

// 注册接口的处理函数
exports.register = (req, res) => {
    // 接受请求注册的相关信息
    const userInfo = req.body;
    // 查找数据库中有无相同的用户
    console.log("查询之前");
    db.query("select * from user where username=?", [userInfo.username], function (err, result) {
        console.log("查询之中");
        if (err) return res.send({ status: 1, message: err.message })
        // 查询结果大于0表示用户名已存在
        console.log(result.length);
        if (result.length > 0) return res.sendtwo("你这非主流的名字已经被用了，换一个好听的去！！！")
        // 加密用户的密码再插入数据库
        const password = bcrypt.hashSync(userInfo.password, 10);
        db.query("insert into user set ?", { username: userInfo.username, password: password }, function (err, result) {
            // 执行 SQL 语句失败
            if (err) return res.sendtwo(err);
            // SQL 语句执行成功，但影响行数不为 1，按道理就插入一条不为1说明出错
            if (result.affectedRows !== 1) return res.sendtwo('出错啦！请重试！');
            // 注册成功
            return res.sendtwo('注册成功！', 0);
        })
    })
}

// 登录接口的处理函数
exports.login = (req, res) => {
    const user = req.body;
    // 查询用户是否存在
    db.query("select * from user where username=?", [user.username], function (err, result) {
        // 语句执行失败或结果不为1
        if (err) return res.sendtwo(err);
        if (result.length !== 1) return res.sendtwo("无该用户，请先注册！");
        // 验证密码输入是否正确 bcrypt.compareSync(用户提交的密码, 数据库中的密码)
        const compareResult = bcrypt.compareSync(user.password, result[0].password);
        if (!compareResult) return res.sendtwo("老登，密码都不记得了？！！");
        // 需要生成token的用户信息，不能带密码、头像地址，不安全（此处选择先设为空）
        const userinfo = { ...result[0], password: "", avatarpath: "" };
        // 生成token并响应, { expiresIn: "1h" }
        const tokenStr = jwt.sign(userinfo, jwtSecretKey);
        console.log(result[0].avatarpath);
        res.send({ status: 0, message: "登录成功", token: tokenStr, avatarpath: result[0].avatarpath });
    })
}

// 修改头像接口
exports.changeAvatar = (req, res) => {
    // 先删除原头像（查询数据库对应路径文件并删除）
    db.query("select avatarpath from user where user_id=?", req.userinfo.user_id, (err, result) => {
        if (err) return res.sendtwo(err)
        if (result.length !== 1) res.sendtwo("查询用户不是一个！");
        // 如果是新用户直接更改地址即可，无需读取和删除原头像
        if (!result[0].avatarpath) {
            // 删除成功更改数据库存放的地址
            db.query('update user set avatarpath=? where user_id=?', [req.file.path, req.userinfo.user_id], (err, result) => {
                // 语句执行失败
                if (err) return res.sendtwo(err);
                // 响应成功并且将存放路径返回给客户端
                return res.send({
                    status: 0,
                    message: "更新头像成功，去获取叭!",
                    avatarpath: req.file.path
                })
            })
        } else {    // 老用户直接读取删除原头像
            // 读取文件，读取不到会捕获到err
            fs.readFile(`${result[0].avatarpath}`, 'utf8', (err, data) => {
                if (err) return res.sendtwo(err)
                // 读取成功则删除该文件，删除失败会捕获到err
                fs.unlink(`${result[0].avatarpath}`, (err) => {
                    if (err) res.sendtwo(err)
                    // 删除成功更改数据库存放的地址
                    db.query('update user set avatarpath=? where user_id=?', [req.file.path, req.userinfo.user_id], (err, result) => {
                        // 语句执行失败
                        if (err) return res.sendtwo(err);
                        // 响应成功并且将存放路径返回给客户端
                        return res.send({
                            status: 0,
                            message: "更新头像成功，去获取叭!",
                            avatarpath: req.file.path
                        })
                    })
                });
            })
        }
    })

}