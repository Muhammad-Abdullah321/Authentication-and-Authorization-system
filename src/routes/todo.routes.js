import { Router } from "express";

import authMiddleware from "../Middleware/auth.middleware.js";

import { createTodo, deleteTodo, getTodo, updateTodo, } from "../Controllers/todo.controller.js"

const todoRouter = Router();

//create todo 
todoRouter.post(
    "/",
    authMiddleware,
    createTodo
);

//read todo by id
todoRouter.get(
    "/",
    authMiddleware,
    getTodo
);

//update todo 
todoRouter.put(
    "/:id",
    authMiddleware,
    updateTodo
);

//delete todo
todoRouter.delete(
    "/:id",
    authMiddleware,
    deleteTodo
)

export default todoRouter;
