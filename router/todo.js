const express = require("express")
const todoRouter = express.Router()
const todo_handle = require("../router_handle/todo")

// 获取todo
todoRouter.get("/getTodo", todo_handle.getTodo);

// 新增todo
todoRouter.post("/addTodo", todo_handle.addTodo);
module.exports = todoRouter