const User = require("../models/User");

// Tiny helper to make errors with HTTP codes
function makeError(status, message) {
  const err = new Error(message);
  err.statusCode = status;
  return err;
}

function toPublic(user) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

exports.signup = async ({ firstName, lastName, email, password }) => {
  if (!firstName || !lastName || !email || !password) {
    throw makeError(400, "All fields are required");
  }

  if (password.length < 8) {
    throw makeError(400, "Password must be at least 8 characters");
  }

  try {
    const user = await User.create({ firstName, lastName, email, password });
    return toPublic(user);
  } catch (err) {
    if (err && err.code === 11000) {
      throw makeError(409, "Email already in use");
    }
    throw err;
  }
};
