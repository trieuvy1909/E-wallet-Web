module.exports = (req, res, next) => {
    if (!req.session.account.firsttime) {
        return next();
    }
    return res.redirect('/changePassword');
}