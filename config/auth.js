module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            console.log('i am here -> inside of auth');
            next();
        } else {
            req.flash('error_msg', 'pelase log in to view this resource');
            res.redirect('/auth/login-index'); //Go to the built in log-in option page
        }
        
    }
}