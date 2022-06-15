const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const today = new Date();
const TransactionSchema = new Schema({
    username: String,
    time: {
        type: String,
        default: today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' +
            today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    },

    money: { type: Number, default: 0 },
 
    //nạp tiền: 0, chuyển tiền: 1, rút tiền: 2, mua thẻ: 3
    kind: { type: Number, default: 0 },
    //0:duyệt, 1:chờ duyệt, 2:từ chối
    status_transaction: { type: Number, default: 0 },
    note:String,

    quantity: { type: Number  ,default:1 },
    fee: {type:Number,default:0},
    // mệnh giá 1:100000, 2:200000,3:500000,4:100000
    price: { type: Number },
    number_card: String,
    name_card: String,
    receiver_id: String,  //lưu id người nhận tiền khi chuyển tiền, sau khi xác nhận các giao dịch trên 5 triệu dựa vào id để cập nhật ví
    nguoitra: String, //xác nhận người trả phí giao dịch chuyển tiền
});
module.exports = mongoose.model('Transaction', TransactionSchema);