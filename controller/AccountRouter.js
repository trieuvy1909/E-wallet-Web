const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt');
const Account = require('../models/AccountModel');
const flash = require('express-flash');
const nodemailer = require('nodemailer');
//validator
const registerValidator = require('../routers/validators/registerValidator');
const loginValidator = require('../routers/validators/loginValidator');
const changePassValidator = require('../routers/validators/changePassValidator');
const resetPassValidator = require('../routers/validators/resetPassValidator');
const { render, redirect } = require('express/lib/response');
const generator = require('generate-password');
const { validationResult } = require('express-validator');
const path = require('path');
const app = express();
const multer = require('multer');


var storage = multer.diskStorage({
    destination: function(req, file, cb) {

        cb(null, 'public/uploads');

    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });
var multipleUpload = upload.fields([{ name: 'idcard_front' }, { name: 'idcard_back' }]);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ewallet.webnc@gmail.com',
        pass: 'webnangcao'
    }
    // host: 'mail.phongdaotao.com',
    // port: 25,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //     user: 'sinhvien@phongdaotao.com',
    //     pass: 'svtdtu'
    // },
    // tls: {
    //     // do not fail on invalid certs
    //     rejectUnauthorized: false
    // },
    // ssl: {
    //     // do not fail on invalid certs
    //     rejectUnauthorized: false
    // }
});
//login
Router.get('/', loginValidator, (req, res) => {
    res.render('login', {
        error: '',
        username: '',
        password: ''
    });
});
Router.post('/', loginValidator, (req, res) => {
    let result = validationResult(req);
    let now = new Date();
    if (result.errors.length === 0) {
        let { username, password } = req.body;
        Account.findOne({ username }).then(account => {
            if (!account) {
                throw new Error('Username không tồn tại');
            } else if (account.inconstant_login === 1) {
                throw new Error('Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ ');
            } else if (account.status === 3) {
                throw new Error('Tài khoản đã bị khóa, vui lòng liên hệ 18001008');
            }else
            if (account.waitLogin > now) {
                throw new Error('Hãy thử lại sau ' + (parseInt((account.waitLogin - now) / 1000)) + ' giây');
            } else
            if (bcrypt.compareSync(password, account.password)) {
                return account;
            } else {
                if (account.isAdmin == false) {
                    if (account.wrong_pass < 5) {
                        if (account.wrong_pass === 2) {
                            Account.findByIdAndUpdate(account._id, {
                                    $inc: { wrong_pass: 1 },
                                    $set: {
                                        waitLogin: now.setSeconds(now.getSeconds() + 60)
                                    }
                                })
                                .then(() => {
                                    return null;
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        } else {
                            Account.findByIdAndUpdate(account._id, { $inc: { wrong_pass: 1 } })
                                .then(() => {
                                    return null;
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        }
                    } else {
                        Account.findByIdAndUpdate(account._id, { $set: { inconstant_login: 1 } })
                            .then(() => {
                                return null;
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    }
                } else {
                    return null;
                }
            }
        }).then(account => {
            if (!account) {
                throw new Error('Sai mật khẩu', 'password', username);
            } else {
                req.session.account = account;
                Account.findByIdAndUpdate(account._id, {
                    $set: { wrong_pass: 0 },
                    $unset: { waitLogin: '' }
                }).then(() => {
                    if (account.isAdmin) {
                        return res.redirect('/admin');
                    }
                    return res.redirect('/user');
                }).catch(err => {
                    console.log(err);
                });
            }
        }).catch(err => {
            return res.render('login', {
                error: err.message,
                password: '',
                username
            });
        })
    } else {
        let messages = result.mapped();
        let message = '';
        for (m in messages) {
            message = messages[m].msg;
            break;
        }
        return res.render('login', {
            username: '',
            password: '',
            error: message
        });
    }
});
//register
Router.get('/register', registerValidator, (req, res) => {
    res.render('register', {
        error: '',
        email: '',
        phone: '',
        address: '',
        fullname: '',
        birthday: '',
        idcard_front: '',
        idcard_back: ''
    });
});
Router.post('/register', multipleUpload, registerValidator, (req, res) => {
    let result = validationResult(req);
    let {
        email,
        fullname,
        phone,
        address,
        birthday,
        idcard_front = req.files.idcard_front[0].originalname,
        idcard_back = req.files.idcard_back[0].originalname,
        password = generator.generate({
            // //Tự tạo mật khẩu
            length: 6,
            numbers: true
        }),
        // //Tạo username tự động
        username = generator.generate({
            length: 10,
            numbers: true,
            uppercase: false,
            exclude: 'abcdefghijklmnopqrstuvwxyz'
        }),
    } = req.body;
    if (result.errors.length === 0) {
        Account.findOne({ $or: [{ email }, { phone }] }).then(account => {
                if (account) {
                    throw new Error('Email hoặc số điện thoại đã tồn tại');
                }
            })
            .then(() => bcrypt.hash(password, 10))
            .then(hashed => {
                let user = new Account({
                    email,
                    username,
                    phone,
                    password: hashed,
                    address,
                    fullname,
                    birthday,
                    idcard_front,
                    idcard_back,
                });
                return user.save();
            }).then(() => {
                var mailOptions = {
                    // from: 'sinhvien@phongdaotao.com',
                    from: 'ewallet.webnc@gmail.com',
                    to: email,
                    subject: 'E-Wallet',
                    text: 'Tài khoản của bạn đã được tạo \nUsername: ' + username + '\nPassword: ' + password
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        return res.redirect('/' + '?message=thanhcong');
                    }
                });
            }).catch(err => {
                return res.render('register', {
                    email,
                    phone,
                    address,
                    fullname,
                    birthday,
                    idcard_front,
                    idcard_back,
                    error: err.message
                });
            })
    } else {
        let messages = result.mapped();
        let message = '';
        for (m in messages) {
            message = messages[m].msg;
            break;
        }
        res.render('register', {
            email,
            phone,
            address,
            fullname,
            birthday,
            idcard_front,
            idcard_back,
            error: message
        });
    }
});
//Đổi mật khẩu
Router.get('/changePassword', (req, res) => {

    res.render('changePassword', {
        error: '',
    });
});
Router.post('/changePassword', changePassValidator, (req, res) => {
    let { confirm1, confirm2 } = req.body;
    let result = validationResult(req);
    if (result.errors.length === 0) {
        if (req.session.account) {
            if (confirm1 === confirm2) {
                bcrypt.hash(confirm2, 10).then(hashed => {
                    Account.findByIdAndUpdate(req.session.account._id, {
                        password: hashed,
                        firsttime: false
                    }).then(() => {
                        req.session.account.firsttime = false;
                        if (req.session.account.isAdmin) {
                            return res.redirect('/admin');
                        }
                        return res.redirect('/user');
                    })
                }).catch(err => {
                    return res.render('changePassword', {
                        error: err.message
                    });
                })
            } else {
                return res.render('changePassword', {
                    error: 'Mật khẩu không khớp'
                });
            }
        } else {
            res.redirect('/');
        }
    } else {
        let messages = result.mapped();
        let message = '';
        for (m in messages) {
            message = messages[m].msg;
            break;
        }
        res.render('changePassword', {
            error: message
        });
    }

});
//reset mật khẩu
Router.get('/resetPassword', (req, res) => {
    res.render('resetPassword', {
        error: '',
        email: '',
        phone: ''
    });
});
Router.post('/resetPassword', resetPassValidator, (req, res) => {
    let result = validationResult(req);
    let {
        email,
        phone,
        password = generator.generate({
            // //Tự tạo mật khẩu
            length: 6,
            numbers: true
        }),
    } = req.body;
    if (result.errors.length === 0) {
        Account.findOne({ $or: [{ email }, { phone }] }).then(account => {
            if (!account) {
                throw new Error('Email hoặc số điện thoại không tồn tại');
            } else {
                bcrypt.hash(password, 10).then(hashed => {
                    Account.findByIdAndUpdate(account._id, {
                        password: hashed,
                        firsttime: true
                    }).catch(err => {
                        return res.render('resetPassword', {
                            error: err.message,
                            email: '',
                            phone: ''
                        });
                    });
                });
            }
        }).then(() => {
            var mailOptions = {
                // from: 'sinhvien@phongdaotao.com',
                from: 'ewallet.webnc@gmail.com',
                to: email,
                subject: 'E-Wallet',
                text: 'Mật khẩu mới của bạn: ' + password
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    return res.redirect('/' + '?message=thanhcong');
                }
            });
        }).catch(err => {
            res.render('resetPassword', {
                email,
                phone,
                error: err.message
            });
        })
    } else {
        let messages = result.mapped();
        let message = '';
        for (m in messages) {
            message = messages[m].msg;
            break;
        }
        res.render('resetPassword', {
            email,
            phone,
            error: message
        });
    }
});
module.exports = Router;