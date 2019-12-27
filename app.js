require('dotenv').config();
const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth.js');

const app = express();

const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        //cb(null, uuidv4())
        cb(null,uuidv4()+'-'+file.originalname);
    }
})

const fileFilter = (req,file,cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null,true);    
    } else {
        cb(null,false);
    }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded 
app.use(bodyParser.json()); // application/json
app.use(
    multer({storage: fileStorage,fileFilter: fileFilter}).single('image')
);
app.use('/images',express.static(path.join(__dirname,'images')));

// Set CORS
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','PATCH,POST,GET,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(auth);

app.put('/post-image', (req,res,next) => {
    if (!req.isAuth){
        throw new Error('Not Authenticated!');
    }
    if (!req.file) {
        return res.status(200).json({messgae: 'No file provided!'});
    }
    if (req.body.oldPath){
        clearImage(req.body.oldPath);
    }
    return res
        .status(201)
        //.json({message:'File stored', filePath: req.file.path});
        .json({message:'File stored', filePath:req.file.destination+'/'+req.file.filename})
});

app.use('/graphql',graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
        if (!err.originalError) {
            return err;
        }
        const data = err.originalError.data;
        const message = err.originalError.message || 'An error occured';
        const code = err.originalError.code || 500;
        return {
            message: message,
            data: data,
            status: code
        };
    }
}));

app.use((error,req,res,next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    })

}) 

var dbHost= process.env.DB_HOST;
var dbUsername= process.env.DB_USER;
var dbPassword= process.env.DB_PASS;

mongoose.connect(
    `mongodb+srv://${dbUsername}:${dbPassword}@${dbHost}/messages?retryWrites=true&w=majority`
)
.then(result => {
    console.log('CONNECTED!');
    app.listen(8080);
})
.catch(err => console.log(err));


const clearImage = filePath => {
    filePath = path.join(__dirname,'..',filePath);
    fs.unlink(filePath,err => console.log(err));
}