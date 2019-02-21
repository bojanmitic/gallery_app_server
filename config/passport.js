const JwtStrategy = require("passport-jwt").Strategy;
const mongoose = require("mongoose");
const User = require('../models/User');
const keys = require("./keys");

const cookieExtractor = req => {
	let token = null;
	if (req && req.cookies) {
		token = req.cookies["jwt_token"];
	}
	return token;
};
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
	passport.use(
		"jwt-user",
		new JwtStrategy(opts, (jwt_payload, done) => {
			User.findById(jwt_payload.id)
				.then(user => {
					if (user) {
						return done(null, user);
					}
					return done(null, false);
				})
				.catch(err => done(err));
		})
	);
};