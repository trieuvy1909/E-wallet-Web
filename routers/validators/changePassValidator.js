const { check } = require('express-validator');
module.exports = [
    // check('oldpass')
    // .exists().withMessage('Password cũ không được để trống')
    // .notEmpty().withMessage('Password cũ không được để trống')
    // .isLength({ min: 6 }).withMessage('Password gồm 6 ký tự trở lên'),
    check('confirm1')
    .exists().withMessage('Password mới không được để trống')
    .notEmpty().withMessage('Password mới không được để trống')
    .isLength({ min: 6 }).withMessage('Password gồm 6 ký tự trở lên'),
    check('confirm1')
    .exists().withMessage('Xác nhận password không được để trống')
    .notEmpty().withMessage('Xác nhận password không được để trống')
    .isLength({ min: 6 }).withMessage('Password gồm 6 ký tự trở lên'),
];