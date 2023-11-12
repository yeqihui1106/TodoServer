const express = require("express");
const app = express();
// 引入jwt和密钥用于解析token
const jwt = require("jsonwebtoken");
const { jwtSecretKey } = require("./config");

// 配置跨域，cors中间件
const cors = require("cors");
app.use(cors());
// 将头像存放文件夹设置静态资源给前端访问
app.use(express.static("avatar"))

// 解析json格式的数据
app.use(express.json());
// 配置解析表单数据express.urlencoded只能解析application/x-www-form-urlencoded格式的表单数据
app.use(express.urlencoded({ extended: false }));

// 简化封装res.sen方法，定义中间件，往res身上添加一个函数接收错误与状态码，调用res.send传入状态码和错误
app.use(function (req, res, next) {
  // 默认是status=1不成功，方便处理错误，如果是成功的则传入0
  res.sendtwo = function (err, status = 1) {
    res.send({
      status,
      // 如果错误是一个对象则返回这个对象的错误提示，如果不是则是我们自定义的错误提示字符串，直接返回即可
      message: err instanceof Error ? err.message : err
    })
  }
  // 放行给下一个中间件
  next()
})

// 解析请求中用户的token，并将解析的信息存放在req中供后续接口使用
const verifyToken = (req, res, next) => {
  // 排除图片请求，直接进入下一个中间件或路由处理（因为头像请求直接访问的本地端口号+静态资源文件名，而http直接请求没有携带token，我们只设置了前端axios请求携带token字段）
  const imageFormatsRegex = /\.(png|jpg|jpeg|webp)$/i;
  if (imageFormatsRegex.test(req.path)) { next(); } else {
    // 因为Authorization字段值格式为"Bearer <token>"，而jwt.verify解析不用Bearer
    const token = req.headers.authorization.replace("Bearer ", "");
    try {
      // 将解析的token挂在在req中供后续接口使用（解析失败会抛出错误）
      req.userInfo = jwt.verify(token, jwtSecretKey);
      next();
    } catch (error) {
      res.sendtwo(error);
    }
  }
}
// 解析token应该排除登陆注册
app.use(/^(?!\/(login|register)).*$/, verifyToken);

// 定义错误级别中间件
const joi = require("joi");
app.use(function (err, req, res, next) {
  // 由joi验证失败引起的错误
  if (err instanceof joi.ValidationError) return res.sendtwo(err)
  // 未知错误
  return res.sendtwo(err);
})

// 导入路由
const userRouter = require("./router/user");
// 注册路由模块
app.use(userRouter);

// 导入路由
const todoRouter = require("./router/todo");
// 注册路由模块
app.use(todoRouter);

app.listen(5000, () => {
  console.log("服务器，启动！！！");
})