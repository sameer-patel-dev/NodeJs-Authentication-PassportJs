const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require('../models/User');

//Login Page
router.get('/login', function(req, res){
    res.render('login');
});

//Register Page
router.get('/register', function(req, res){
    res.render('register');
});

// Register Handle
router.post('/register', function(req, res){
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //Check required feilds
    if(!name || !email || !password || !password2)
    {
        errors.push({ msg: 'Pleaase fill in all fields'});
    }

    //Check passwords Match
    if(password !== password2)
    {
        errors.push({ msg: 'Password do not match'});
    }

    // Check password is 6 characters
    if(password.length < 6)
    {
        errors.push({ msg: 'Password should be atleast 6 characters'});
    }

    if(errors.length > 0)
    {
        res.render('register', {
           errors,
           name,
           email,
           password,
           password2 
        });
    }

    else
    {
        // Validation Passed
        User.findOne({ email: email })
            .then(user => {
                if(user) 
                {
                    //User Exists
                    errors.push({ msg: 'Email is already registered'});
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2 
                     });   
                }

                else
                {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, function(err,salt){
                        bcrypt.hash(newUser.password, salt, function(err, hash){
                            if (err) throw err;

                            // Set Password to Hash
                            newUser.password = hash;

                            //Save User
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });

    }

});


//Login handle
router.post('/login', function(req,res, next){
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', function(req,res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;