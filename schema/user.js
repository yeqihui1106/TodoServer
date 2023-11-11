const joi = require('joi')

// 用户名的验证规则
const username = joi.string().alphanum().min(1).max(10).required()
// 密码的验证规则
const password = joi.string().pattern(/^[\S]{6,12}$/).required()
exports.register_login_schema = {
    // 表示需要对 req.body 中的username和password数据进行验证,并配置对应验证规则
    body: {
        username: username,
        password: password,
    },
}