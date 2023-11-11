const express = require("express");
const app = express();
const bodyParser = require('body-parser');
// 引入jwt生成token
const jwt = require("jsonwebtoken");
// 引入jwt密钥
const { jwtSecretKey } = require("./config");

// 导入并使用cors中间件做跨域处理
const cors = require('cors')
app.use(cors())
// 配置解析 application / x - www - form - urlencoded 格式的表单数据的中间件
app.use(express.urlencoded({ extended: false }));
// 使用body-parser中间件解析JSON请求体
app.use(bodyParser.json());
// 设置静态文件可访问
app.use(express.static('avatar'));

// 封装简化res.send方法,后续就用这个封装好的代替res.send
app.use(function (req, res, next) {
    // 设定status = 0 为成功;status = 1 为失败;默认status=1失败,如果是成功的话可以传入0，这样方便处理失败的情况
    res.sendtwo = function (err, status = 1) {
        res.send({
            // 状态码
            status: status,
            // 描述,判断 err 是 错误对象 还是 字符串,是错误对象则响应错误对象上的描述，字符串则为我们自己定义的错误提示
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})

// 自定义验证解析token的中间件函数
const verifyToken = (req, res, next) => {
    const imageFormatsRegex = /\.(png|jpg|jpeg|webp)$/i;
    if (imageFormatsRegex.test(req.path)) {
        // 排除图片请求，直接进入下一个中间件或路由处理
        next();
    } else {
        // 因为Authorization字段值格式为"Bearer <token>"，而jwt.verify解析不用Bearer
        const token = req.headers.authorization.replace('Bearer ', '')
        try {
            // jwt.verify验证并解析token 成功返回解析的数据(将起添加再req身上)，失败则抛出错误
            req.userinfo = jwt.verify(token, jwtSecretKey);
            next();
        } catch (error) {
            return res.sendtwo(error);
        }
    }
}
// 解析token应该排除登陆注册
app.use(/^(?!\/(login|register)).*$/, verifyToken);

const joi = require('joi')
// 错误中间件
app.use(function (err, req, res, next) {
    // 数据验证失败（错误由joi验证引起）
    if (err instanceof joi.ValidationError) {
        console.log(1);
        return res.sendtwo(err)
    }
    // 未知错误
    res.sendtwo(err)
})

// 引入用户路由并使用
const userRouter = require("./router/user");
app.use(userRouter);

app.listen(3001, () => {
    console.log("服务器，启动！！！！");
})