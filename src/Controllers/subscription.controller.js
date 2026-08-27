import User from "../Models/user.model.js";
import stripe from "../config/stripe.config.js";

//veiw user plan
export const getSubscription = async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        return res.status(200).json({

            plan: user.plan

        });

    } catch (error) {

        return res.status(500).json({

            message: error.message

        });

    }

};

// //upgrade user plan
// export const upgradePlan = async (req, res) => {
//     try {

//         const user = await User.findByIdAndUpdate(
//             req.user.id,
//             { plan: "premium" },
//             { returnDocument: 'after' }
//         );

//         return res.status(200).json({
//             message: "plan upgrade successfully",
//             plan: user.plan
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// }

// //downgrade user plan
// export const downgradePlan = async (req, res) => {
//     try {

//         const user = await User.findByIdAndUpdate(
//             req.user.id,
//             { plan: "free" },
//             { returnDocument: 'after' }
//         );

//         console.log(user.plan);
//         return res.status(200).json({
//             message: "plan downgraded successfully",
//             plan: user.plan
//         });

//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// }

//create checkout session
export const createCheckoutSession = async (req, res) => {

    try {

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],

            mode: "subscription",

            line_items: [

                {

                    price: process.env.STRIPE_PRICE_ID,

                    quantity: 1

                }

            ],

            metadata: {

                userId: req.user.id

            },

            success_url:
                `${process.env.CLIENT_URL}/payment_success`,


            cancel_url:
                `${process.env.CLIENT_URL}/payment_cancel`
        });

        return res.status(200).json({
            url: session.url
        })

    } catch (error) {

        return res.status(500).json({

            message: error.message

        });

    }

};

export const cancelSubscription = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.subscriptionId) {
            return res.status(400).json({
                message: "No active subscription found"
            });
        }

        await stripe.subscriptions.update(
            user.subscriptionId,
            {
                cancel_at_period_end: true
            }
        );

        return res.status(200).json({
            message: "Subscription will cancel at the end of the current billing period."
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};