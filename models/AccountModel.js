const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const today = new Date();
const timenow = new Date(new Date() + 3600 * 1000 * 7).toISOString();
const AccountSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    username: String,
    phone: {
        type: String,
        unique: true
    },
    password: String,
    address: String,
    fullname: String,
    date_register: {
        type: String,
        default: today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' +
            today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    },

    birthday: String,

    idcard_front: String,
    idcard_back: String,
    //4 trạng thái: 0: chưa xác minh, 1: đã xác minh, 2: chờ cập nhật, 3: vô hiệu hóa 4:bị khóa
    status: { type: Number, default: 0 },
    //kiểm tra xem có phải là đăng nhập lần đầu không true là 1st false đã đổi mk  
    firsttime: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    account_balance: { type: Number, default: 0 },
    //khóa tài khoản
    login_fail: { type: Number, default: 0 },
    wrong_pass: { type: Number, default: 0 },

    waitLogin: { type: Date },
    //đăng nhập bất thường
    inconstant_login:{type:Number,default:0}


});
module.exports = mongoose.model('Account', AccountSchema);