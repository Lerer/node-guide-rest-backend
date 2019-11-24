const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.js');

const User = require('../models/user');
const Post = require('../models/post');

const jwtSalt = process.env.JWT_SALT;

module.exports = {
    createUser: async function({userInput},req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)){
            errors.push({message: "Invalid Email address"});
        }
        if (validator.isEmpty(userInput.password) ||
            (!validator.isLength(userInput.password,{min:6}))){
                errors.push("Password is empty or too short");
        }
        if (errors.length>0){
            const error = new Error('Invalid Input!');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({email:userInput.email});
        if (existingUser){
            const error = new Error('User already exists!');
            throw error;
        }
        const hashedPw = await bcrypt.hash(userInput.password,12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPw
        });
        const createdUser = await user.save();
        return {...createdUser._doc, _id:createdUser._id.toString()}
    },
    login: async function({email,password},req) {
        const errors = [];
        if (!validator.isEmail(email)){
            errors.push({message: "Invalid Email address"});
        }
        if (validator.isEmpty(password)){
                errors.push("Password was not provided");
        }
        if (errors.length>0){
            const error = new Error('Invalid Input!');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const user = await User.findOne({email:email});
        if (!user){
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password,user.password);
        if (!isEqual){
            const error = new Error('Invalid user and password combination');
            error.code = 401;
            throw error;
        }
        const token = jwt.sign({
                userId: user._id.toString(),
                email: email
            }, 
            jwtSalt, 
            {expiresIn: '1h'} 
        );
        return {token:token,userId:user._id.toString()};
    },
    createPost: async function({postInput},req) {
        if (!req.isAuth){
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }

        const title = postInput.title;
        const content = postInput.content; 
        const errors = [];
        if (validator.isEmpty(title) || !validator.isLength(title,{min:5})){
            errors.push({message: "Title is invalid."});
        }
        if (validator.isEmpty(content) || !validator.isLength(content,{min:5})){
            errors.push({message: "Content is invalid."});
        }
        if (errors.length>0){
            const error = new Error('Invalid Input!');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }
        const post = new Post({
            title: title,
            content: content,
            imageUrl: postInput.imageUrl,
            creator: user
        });
        const createdPost = await post.save();

        user.posts.push(createPost);

        return {
            ...createdPost._doc, 
            _id:createdPost._id.toString(),
            createdAt: createPost.createdAt.toISOString(),
            updatedAt: createPost.updatedAt.toISOString()
        };
    }
};