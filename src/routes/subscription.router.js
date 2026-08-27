import express, { Router } from "express";

import authMiddleware from "../Middleware/auth.middleware.js";

import { getSubscription, createCheckoutSession, cancelSubscription} from "../Controllers/subscription.controller.js";

import { stripeWebhook } from "../Controllers/stripe.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", authMiddleware, getSubscription);

// subscriptionRouter.post("/upgrade", authMiddleware, upgradePlan);

// subscriptionRouter.post("/downgrade", authMiddleware, downgradePlan);

subscriptionRouter.post("/checkout", authMiddleware, createCheckoutSession)

subscriptionRouter.post(
    "/checkout",
    authMiddleware,
    createCheckoutSession
);

subscriptionRouter.post(

    "/webhook",

    express.raw({ type: "application/json" }),

    stripeWebhook

);

subscriptionRouter.post(
    "/cancel",
    authMiddleware,
    cancelSubscription
);

export default subscriptionRouter;