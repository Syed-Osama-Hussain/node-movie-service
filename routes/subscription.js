const _ = require("lodash");
const { User } = require("../models/User");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { getPaymentDatePaidAmount, getPaymentDateSubscriptionChange, getPaymentAmount } = require("../utils/paymentHelpers");

const subscriptions = ["free trial", "basic", "premium"];

router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findById(req.user._id).select("-__v");

    if (!user)
    return res.status(404).send({ message: 'User not found.' });

    const paymentDate = getPaymentDateSubscriptionChange(user)
    if(!paymentDate) return res.status(400).send("Please clear your dues before changing subscription");

    user.subscription = req.body.subscription.toLowerCase();

    if (!subscriptions.find(sub => sub === req.body.subscription.toLowerCase()))
      return res.status(400).send({ message: 'Invalid subscription type' });

    user.paymentDate = paymentDate;
    user.paymentAmount = getPaymentAmount(user.subscription);

    await user.save();
    res.send(_.omit(user.toObject(),['password']));
  }
);

router.post("/pay",passport.authenticate("jwt", { session: false }), async (req, res) => {
    const user = await User.findById(req.user._id).select("-__v");

    if (!user)
    return res.status(404).send({ message: 'User not found.' });

    user.paymentDate = getPaymentDatePaidAmount(user.paymentDate);

    await user.save();
    res.send({message: "Subscription Amout Paid"});
});

module.exports = router;
