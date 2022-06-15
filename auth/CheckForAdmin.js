module.exports = (req, res, next) => {
    if (!req.session.account) {
        return res.redirect('/');
    }
    if (req.session.account.isAdmin) {
        return next();
    }
    return res.redirect('/user');
}