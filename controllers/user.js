const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getUserStatus = async (req,res,next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "Found user status",
            status: user.status
        });
    } catch (err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
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

