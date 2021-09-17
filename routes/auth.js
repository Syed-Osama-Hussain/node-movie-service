const { User, validate } = require("../models/User");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const config = require("../config.json");

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { status: 404, message: "User not found" });
        }
      
        const validate = await user.isValidPassword(password);

        if (!validate) {
          return done(null, false, {
            status: 403,
            message: "Email or Password is incorrect",
          });
        }

        return done(null, user, { message: "Logged in Successfully" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: config.jwtPrivateKey,
      jwtFromRequest: ExtractJWT.fromExtractors([ExtractJWT.fromAuthHeaderWithScheme("Bearer"), ExtractJWT.fromUrlQueryParameter("Authorization")]),
    },
    async (token, done) => {
      try {
        return done(null, token);
      } catch (error) {
        done(error);
      }
    }
  )
);

router.post("/", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) {
        const error = new Error("An error occurred.");
        return next(error);
      }

      if (!user) {
        return res.status(info.status).send(info.message);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const token = user.generateAuthToken();

        return res.send({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = router;
