const { check } = require('express-validator');
module.exports = [
    check('email')
    .exists().withMessage('Email không được để trống')
    .notEmpty().withMessage('Email không để trống')
    .isEmail().withMessage('Email không hợp lệ'),
    check('phone')
    .exists().withMessage('Số điện thoại không được để trống')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .isNumeric().withMessage('Số điện thoại không hợp lệ'),
    check('fullname')
    .exists().withMessage('Họ và tên không được để trống')
    .notEmpty().withMessage('Họ và tên không được để trống')
    .isLength({ min: 5 }).withMessage('họ và tên phải có ít nhất 6 ký tự'),
    check('birthday')
    .exists().withMessage('Ngày sinh không được để trống')
    .notEmpty().withMessage('Ngày sinh không được để trống'),
    check('address')
    .exists().withMessage('Địa chỉ không được để trống')
    .notEmpty().withMessage('Địa chỉ không được để trống')
    .isLength({ min: 6 }).withMessage('Địa chỉ phải có ít nhất 6 ký tự'),
];