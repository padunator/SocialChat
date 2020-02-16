'use strict';

/**
 * This is the Check-Auth middleware which is porhibiting access to the the specified endpoints where this Middleware is defined
 * @type {{JsonWebTokenError: function(*=, *=): void, TokenExpiredError: function(*=, *): void, sign: function(*=, *=, *=, *=): (undefined|undefined), verify: function(*=, *=, *=, *=): (void), decode: function(*=, *=): (null|{payload: *, signature: *, header: *}), NotBeforeError: function(*=, *): void}}
 */
const jwt = require ('jsonwebtoken');


// Node express middleware - exporting for use outside
// Function which gets executed on incoming requests
// Split because of the Header Auth format with usually "Bearer token" where token is pos [1] after " "
module.exports = (req, res, next) => {
  try {
    //Look in Header - Authorization and there the second part [1] after Bearer" "Token
    const token = req.headers.authorization.split(" ")[1];
    // Verify token after you get it if valid - use the passphrase for verification
    jwt.verify(token, 'secret_passphrase_for_encryption');
    next();
  }
  catch (e) {
    res.status(401).json({
      message: e
    });
  }
}
