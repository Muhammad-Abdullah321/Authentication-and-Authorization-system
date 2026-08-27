import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import todoRouter from "./routes/todo.routes.js";
import subscriptionRouter from "./routes/subscription.router.js";



const app = express();

// Webhook first
app.use(
    "/api/subscription/webhook",
    express.raw({ type: "application/json" })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

//use authRouter
app.use("/api/auth", authRouter);

//use todo router
app.use("/api/todos", todoRouter);

//use subcription router
app.use("/api/subscription", subscriptionRouter);



export default app; 