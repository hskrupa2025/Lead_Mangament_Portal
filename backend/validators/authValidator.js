const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Please provide your email address or username'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
  loginValidator
};
