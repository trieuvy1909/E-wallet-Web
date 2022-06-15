const { check } = require('express-validator');
module.exports = [
    check('username').exists().withMessage('Username không được để trống').notEmpty().withMessage('Username không được để trống'),
    check('password').exists().withMessage('Password không được để trống').notEmpty().withMessage('Password không được để trống')
    .isLength({ min: 6 }).withMessage('Password gồm 6 ký tự trở lên'),
];