const _ = require("lodash");
const { User, validate } = require("../models/User");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const { getPaymentDateUserCreated } = require("../utils/paymentHelpers");

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const userObj = {
          email,
          password,
          subscription: "free trial",
          paymentAmount: 0,
          paymentDate: getPaymentDateUserCreated(),
        };
        const { error } = validate(userObj);

        if (error)
          return done(null, false, {
            status: 400,
            message: error.details[0].message,
          });

        let user = await User.findOne({ email: email });

        if (user)
          return done(null, false, {
            status: 400,
            message: "User already registered.",
          });

        const hash = await bcrypt.hash(password, 10);
        userObj.password = hash;

        user = await User.create(userObj);
        return done(null, user, {
          status: 201,
          message: "User created successfully.",
        });
      } catch (error) {
        done(error);
      }
    }
  )
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
  }
);

router.post("/", async (req, res, next) => {
  passport.authenticate(
    "signup",
    { session: false },
    async (err, user, info) => {
      if (err) {
        const error = new Error("An error occurred.");
        return next(error);
      }

      if (!user) {
        return res.status(info.status).send(info.message);
      }
      const token = user.generateAuthToken();

      res.status(201).send({
        message: "Signup successful",
        token,
      });
    }
  )(req, res, next);
});

module.exports = router;
