const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getUserStatus = (req,res,next) => {
    User.findById(req.userId)
        .then(user => {
            res.status(200).json({
                message: "Found user status",
                status: user.status
            });
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            console.log(err);
            next(err);
        })
}

exports.updateUserStatus = (req,res,next) => {
    const newstatus = req.body.status;
    User.findById(req.userId)
        .then(user => {
            user.status = newstatus;
            return user.save();
        })
        .then(user => {
            res.status(200).json({
                message: "User status updated",
                status: user.status
            });
        })
        .catch(err => {
            if (!err.statusCode){
                err.statusCode = 500;
            }
            console.log(err);
            next(err);
        })   
}

