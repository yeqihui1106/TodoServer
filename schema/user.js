// 定义数据规则的包
const joi = require("joi");

// 定义数据规则
const username = joi.string().alphanum().min(1).max(10).required()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()

exports.register_login_schema = {
  // 表示对req.body的username和password验证，规则为上面的username和password规则
  body: {
    username,
    password,
  }
}