const { check } = require('express-validator');
module.exports = [
    check('email')
    .exists().withMessage('Email không được để trống')
    .notEmpty().withMessage('Email không để trống')
    .isEmail().withMessage('Email không hợp lệ'),
    check('phone')
    .exists().withMessage('Số điện thoại không được để trống')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .isNumeric().withMessage('Số điện thoại không hợp lệ')
];