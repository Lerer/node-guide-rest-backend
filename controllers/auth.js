const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSec = 'secretpassphrasetohashjwt';

const User = require('../models/user');

exports.signup = (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password,12)
        .then(hashedPw => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPw
            });
            return user.save();
        })
        .then(userRec => {
            res.status(201).json({
                message: 'User Created',
                userId: userRec._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            console.log(err);
            next(err);
        });
}

exports.login = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email:email})
        .then(user => {
            if (!user){
                const error = new Error('User with the email not found');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password,user.password);
        })
        .then(isEqual => {
            if (!isEqual){
                const error = new Error('Incorrect password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                jwtSec, 
                {expiresIn: '1h'}
            );
            res.status(200).json({token:token,userId: loadedUser._id.toString()});
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            console.log(err);
            next(err);
        })
}