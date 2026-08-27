import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many attempts. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default rateLimiter;
