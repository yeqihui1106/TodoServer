const express = require("express");
// 创建路由
const userRouter = express.Router();
// 导入处理函数
const user_handle = require("../router_handle/user");

// 导入用户数据规则
const { register_login_schema } = require("../schema/user");
// 导入验证规则的包
const expressJoi = require('@escook/express-joi');

// 解析头像文件
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'avatar/'); // 存放路径
  },
  filename: function (req, file, cb) {
    // 使用原始文件名作为文件名，
    cb(null, req.userInfo.user_id + Date.now() + file.originalname);
  }
})
const upload = multer({ storage: storage });

// 注册接口 先用局部中间件【expressJoi(register_login_schema)先验证数据是否符合规则】
userRouter.post("/register", expressJoi(register_login_schema), user_handle.register);

// 登录接口 先用局部中间件【expressJoi(register_login_schema)先验证数据是否符合规则】
userRouter.post("/login", expressJoi(register_login_schema), user_handle.login);

// 头像接口 upload.single('avatar') 表示接收名avatar的文件,然后会添加到req.file中
userRouter.post("/changeAvatar", upload.single('avatar'), user_handle.changeAvatar)

module.exports = userRouter;