import stripe from "../config/stripe.config.js";
import User from "../Models/user.model.js";

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    // payment completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                plan: "premium",
                stripeCustomerId: session.customer,
                subscriptionId: session.subscription
            });
            console.log("user upgrade to premium");
        }
    }

    if (event.type === "customer.subscription.deleted") {

        const subscription = event.data.object;

        await User.findOneAndUpdate(
            {
                subscriptionId: subscription.id
            },
            {
                plan: "free",
                subscriptionId: null,
                stripeCustomerId: null
            }
        );

        console.log("User downgraded to Free");

    }

return res.status(200).json({
    received: true
});

};



