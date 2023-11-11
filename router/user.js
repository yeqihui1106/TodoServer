const express = require("express");
// 创建路由
const userRouter = express.Router();

// 引入处理函数
const userHandle = require("../router_handle/user");
// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const { register_login_schema } = require('../schema/user')
// multer解析请求中包含文件的表单数据，解析后会将文件添加到req.file身上
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'avatar/') // 存放路径
    },
    filename: function (req, file, cb) {
        // 使用原始文件名作为文件名，
        cb(null, Date.now() + file.originalname)
    }
})
const upload = multer({ storage: storage });

// 注册接口
userRouter.post("/register", expressJoi(register_login_schema), userHandle.register);

// 登录接口
userRouter.post("/login", expressJoi(register_login_schema), userHandle.login);

// 头像接口 upload.single('avatar')表示接收前端命名为avatar的文件
userRouter.post("/changeAvatar", upload.single('avatar'), userHandle.changeAvatar);

module.exports = userRouter;