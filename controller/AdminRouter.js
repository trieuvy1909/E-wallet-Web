const express = require('express');
const bcrypt = require('bcrypt');
const Account = require('../models/AccountModel');
const Transaction = require('../models/TransactionModel');
const CheckLogin = require('../auth/CheckForAdmin');
const changePassValidator = require('../routers/validators/changePassValidator');
const { validationResult } = require('express-validator');
const { render } = require('ejs');
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ewallet.webnc@gmail.com",
        pass: "webnangcao",
    },
});
let userList = new Map();
const Router = express.Router();
Router.get('/', CheckLogin, (req, res) => {
    Account.find({ isAdmin: false }, function(err, users) {
        res.render('admin', {
            users
        });
    });
});

//danh sách chờ xác minh -sắp xếp giảm dần theo ngày tạo
Router.get('/waitActive', CheckLogin, (req, res) => {
    var sort = { date_register: -1 };
    Account.find({inconstant_login: 0 ,isAdmin: false, $or: [{ status: 0 }, { status: 2 }] }, function(err, users) {
        res.render('waitActive', {
            users
        });
    }).sort(sort);

});

// Xem thông tin chi tiết chờ xác minh
Router.get('/detailuser/:id', CheckLogin, (req, res) => {
    Account.findById(req.params.id, function(err, user) {
        res.render('detailuser', {
            user
        });
    });
});

//danh sách đã xác minh - sắp xếp giảm dần theo ngày tạo
Router.get('/actived', CheckLogin, (req, res) => {
    var sort = { date_register: -1 };
    Account.find({ isAdmin: false, status: 1,inconstant_login:0}, function(err, users) {
        res.render('actived', {
            users
        });
    }).sort(sort);
});

// Xác minh(btn đầu) - yêu cầu bổ sung thông tin( btn - giữa) - khóa tài khoản (btn cuối)
Router.post('/detailuser/:id', CheckLogin, (req, res) => {
    let { status } = req.body;
    status = parseInt(status);
    if (status === 1) {
        Account.findByIdAndUpdate(req.params.id, {
            status
        }).then(() => {
            return res.redirect('/admin/detailuser/' + req.params.id);
        });
    } else if (status === 0) {
        Account.findByIdAndUpdate(req.params.id, {
            status
        }).then(() => {
            return res.redirect('/admin/detailuser/' + req.params.id);
        });
    } else {
        Account.findByIdAndUpdate(req.params.id, {
            status
        }).then(() => {
            return res.redirect('/admin/detailuser/' + req.params.id);
        });
    }
});


// Xác minh tài khoản khóa do đăng nhập sai
Router.post('/detailban/:id', CheckLogin, (req, res) => {
    Account.findByIdAndUpdate(req.params.id, {
        inconstant_login: 0,
        wrong_pass: 0
    }).then(() => {
        return res.redirect('/admin/bannedForever');
    });
});


// Xem thông tin chi tiết tài khoản khóa do đăng nhập sai
Router.get('/detailban/:id', CheckLogin, (req, res) => {
    Account.findById(req.params.id, function(err, user) {
        res.render('detailban', {
            user
        });
    })
});

//danh sách bị vô hiệu hóa
Router.get('/banning', CheckLogin, (req, res) => {
    var sort = { date_register: -1 };
    Account.find({ isAdmin: false, status: 3 , inconstant_login: 0 }, function(err, users) {
        res.render('banning', {
            users
        });
    }).sort(sort);
});

//danh sách bị khóa vô thời hạn do đăng nhập sai
Router.get('/bannedForever', CheckLogin, (req, res) => {
    var sort = { date_register: -1 };
    Account.find({ isAdmin: false, inconstant_login: 1 }, function(err, users) {
        res.render('bannedForever', {
            users
        });
    }).sort(sort);
});

//đổi mật khẩu
Router.get('/changePasswordadmin', CheckLogin, (req, res) => {
    let user = req.session.account;
    res.render('changePasswordadmin', { error: '', fullname: user.fullname });
});
Router.post("/changePasswordadmin", changePassValidator, (req, res) => {
    let user = req.session.account;
    let { oldpass, confirm1, confirm2 } = req.body; 
    let result = validationResult(req);
    if (result.errors.length === 0) {
        if (req.session.account) {
            if (bcrypt.compareSync(oldpass, user.password)) { // confirm với mật khẩu cũ đã được mã hóa
                if (confirm1 === confirm2) { // so sánh mật khẩu mới với mật khẩu xác nhận
                    bcrypt // mã hóa mật khẩu
                        .hash(confirm2, 10)
                        .then((hashed) => {
                            Account.findByIdAndUpdate(req.session.account._id, {
                                password: hashed,
                            }).then(() => {
                                return res.redirect("/admin/changePasswordadmin");
                            });
                        })
                        .catch((err) => {
                            return res.render("changePasswordadmin", {
                                error: err.message,
                            });
                        });
                } else { // thông báo không khớp
                    return res.render("changePassworduser", {
                        error: "Mật khẩu không khớp",
                        fullname: user.fullname,
                    });
                }
            } else {
                return res.render("changePasswordadmin", {
                    error: "Mật khẩu cũ không đúng",
                    fullname: user.fullname,
                });
            }
        } else {
            res.redirect("/");
        }
    } else {
        let messages = result.mapped();
        let message = "";
        for (m in messages) {
            message = messages[m].msg;
            break;
        }
        res.render("changePasswordadmin", {
            error: message,
            fullname: user.fullname,
        });
    }
});
//Quản lý giao dịch - bắt đầu
Router.get('/acceptTransaction', CheckLogin, (req, res) => {
    Transaction.find({ status_transaction: 1 }, function(err, transaction) { // tìm tất cả giao dịch có trạng thái là 1
        res.render('acceptTransaction', {
            transaction
        });
    });

});
// Xem thông tin chi tiết giao dịch
Router.get('/acceptTransaction/:id', CheckLogin, (req, res) => {
    Transaction.findById(req.params.id, function(err, transaction) { // tìm giao dịch theo id của giao dịch
        res.render('detailTransaction', {
            transaction
        });
    });
});
// Đồng ý giao dịch và Hủy giao dịch
Router.post('/acceptTransaction/:id', CheckLogin, (req, res) => {
    let { status_transaction } = req.body; // lấy trạng thái từ giao dịch
    status_transaction = parseInt(status_transaction); // convert sang int
    let id = req.params.id, // id của giao dịch
        time = new Date().toISOString(),
        nguoigui;

    if (status_transaction === 0) { // Trạng thái giao dịch được đồng ý
        Transaction.findOne({ _id: id }).then(transaction => {
            Transaction.findByIdAndUpdate(id, { status_transaction }, ).then(() => {
                if (transaction.kind === 2) { // Giao dịch rút tiền
                    username = transaction.username
                    Account.findOne({ username }).then(account => {
                        Account.findByIdAndUpdate(account._id, { $inc: { account_balance: -transaction.money * 1.05 } }) // Trừ 100% + 5% phí rút
                            .catch(err => {
                                console.log(err);
                            })
                    })
                } else if (transaction.kind === 1) { // Giao dịch chuyển tiền
                    username = transaction.username
                    Account.findOne({ username }).then(account => {
                        nguoigui = account.fullname;
                    });
                    //cập nhật lại số dư tài khoản
                    Account.findOne({ _id: transaction.receiver_id }).then(account => {
                            if (transaction.nguoitra === 'nguoichuyentra') {
                                Account.findByIdAndUpdate(account._id, { $inc: { account_balance: +transaction.money } })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            } else if (transaction.nguoitra === 'nguoinhantra') {// người nhận trả thì chỉ nhận được 95% số tiền
                                Account.findByIdAndUpdate(account._id, { $inc: { account_balance: +transaction.money * 0.95 } }) 
                                    .catch(err => {
                                        console.log(err);
                                    })
                            }
                        })
                        .then(() => {
                            //mail thông báo số nhận được tiền
                            Account.findOne({ _id: transaction.receiver_id }).then(account => {
                                var mailOptions = {
                                    from: "ewallet.webnc@gmail.com",
                                    to: account.email,
                                    subject: "Giao dịch thành công E-Wallet",
                                    text: "Tài khoản của bạn: " +
                                        account.fullname +
                                        "\nVừa nhận: " +
                                        transaction.money + " VND." +
                                        "\nPhí chuyển: " +
                                        transaction.fee + " VND." +
                                        "\nTừ: " +
                                        nguoigui + " VND." +
                                        "\nSố dư: " +
                                        account.account_balance + " VND." +
                                        "\nNgày giao dich: " + time + ".",
                                };
                                transporter.sendMail(mailOptions, function(error, info) {
                                    if (error) {
                                        if (error) {
                                            console.log(error);
                                        }
                                    }
                                });
                            })
                        })
                }
            }).then(() => {
                return res.redirect('/admin/acceptTransaction/' + req.params.id);
            }).catch(err => {
                console.log(err)
            })
        })
    } else if (status_transaction === 2) { // Trạng thái giao dịch bị hủy
        Transaction.findOne({ _id: id }).then(transaction => {
            Transaction.findByIdAndUpdate(id, { status_transaction })
                .then(() => {
                    username = transaction.username
                    Account.findOne({ username }).then(account => {
                        if (transaction.nguoitra === 'nguoichuyentra') {
                            Account.findByIdAndUpdate(account._id, { $inc: { account_balance: +transaction.money * 1.05 } }) // Hoàn lại 105% phí nếu người chuyển trả
                                .catch(err => {
                                    console.log(err);
                                })
                        } else if (transaction.nguoitra === 'nguoinhantra') {
                            Account.findByIdAndUpdate(account._id, { $inc: { account_balance: +transaction.money } }) 
                                .catch(err => {
                                    console.log(err);
                                })
                        }
                    })
                })
                .then(() => {
                    return res.redirect('/admin/acceptTransaction/');
                }).catch(err => {
                    console.log(err)
                });
        });
    }
});

//Quản lý giao dịch - kết thúc

module.exports = Router;