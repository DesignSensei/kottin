"use strict";

//config/passport.js
var LocalStrategy = require("passport-local").Strategy;

var GoogleStrategy = require("passport-google-oauth20").Strategy;

var bcrypt = require("bcryptjs");

var User = require("../models/User");

module.exports = function (passport) {
  /* --------------------------- Local Strategy (Email + Password) --------------------------- */
  passport.use(new LocalStrategy({
    usernameField: "email"
  }, function _callee(email, password, done) {
    var user, isMatch;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return regeneratorRuntime.awrap(User.findOne({
              email: email
            }).select("+password"));

          case 3:
            user = _context.sent;

            if (user) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", done(null, false, {
              message: "Invalid credentials"
            }));

          case 6:
            _context.next = 8;
            return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

          case 8:
            isMatch = _context.sent;

            if (isMatch) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("return", done(null, false, {
              message: "Invalid credentials"
            }));

          case 11:
            return _context.abrupt("return", done(null, user));

          case 14:
            _context.prev = 14;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", done(_context.t0));

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 14]]);
  }));
  /* --------------------------- GOOGLE Strategy (OAuth 2.0) --------------------------- */

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, function _callee2(accessToken, refreshToken, profile, done) {
    var googleId, email, displayName, photo, user;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            // Extract fields from Google's profile
            googleId = profile.id;
            email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            displayName = profile.displayName || "";
            photo = profile.photos && profile.photos[0] ? profile.photos[0].value : "";
            _context2.next = 7;
            return regeneratorRuntime.awrap(User.findOne({
              googleId: googleId
            }));

          case 7:
            user = _context2.sent;

            if (user) {
              _context2.next = 12;
              break;
            }

            _context2.next = 11;
            return regeneratorRuntime.awrap(User.create({
              googleId: googleId,
              email: email,
              displayName: displayName,
              photo: photo,
              firstName: displayName.split(" ")[0] || "",
              lastName: displayName.split(" ").slice(1).join(" ") || ""
            }));

          case 11:
            user = _context2.sent;

          case 12:
            return _context2.abrupt("return", done(null, user));

          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return", done(_context2.t0));

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[0, 15]]);
  })); // Serialize: only store user ID in session

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  }); // Deserialize: retrieve full user object (without password)

  passport.deserializeUser(function _callee3(id, done) {
    var user;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return regeneratorRuntime.awrap(User.findById(id).select("-password"));

          case 3:
            user = _context3.sent;
            done(null, user);
            _context3.next = 10;
            break;

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](0);
            done(_context3.t0);

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 7]]);
  });
};