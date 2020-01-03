require('dotenv').config();
// Test imports
const sinon = require('sinon');
const expect = require('chai').expect;
// 3rd party code
const mongoose = require('mongoose');
// 1st party code
const User = require('../models/user.js');
// const Post = require('../models/post.js');
const feedController = require('../controllers/feed.js');

describe('Feed controller',function() {

    before(function(done) {
        var dbHost= process.env.DB_HOST;
        var dbUsername= process.env.DB_USER;
        var dbPassword= process.env.DB_PASS;
        mongoose.connect(
            `mongodb+srv://${dbUsername}:${dbPassword}@${dbHost}/test-messages?retryWrites=true&w=majority`,
            {useNewUrlParser: true}
        )
            .then(result => {
                const user = new User({
                    email: 'test@test.com',
                    password: 'tester',
                    name: 'Test',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                })
                return user.save();
            })
            .then(() => {
                done();
            });
    });

    beforeEach(function() {});

    afterEach(function() {});

    it('Should create a post and link it to the creator',function(done) {
        
        const userId = '5c0f66b979af55031b34728a';
        // the request object
        const req = {
            userId: userId,
            body: {
                title: 'Test title',
                content: 'Test content',
            },
            file: {
                path: 'images/cats-and-dogs.jpg'
            }
        };
        // the response object
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function(code){
                if (code){
                    this.statusCode = code;
                }
                return this;
            },
            json: function(){
            }
        };
        feedController.createPost(req,res,() => {})
            .then((savedUser) => {
                //console.log(savedUser);
                expect(savedUser).to.have.property('posts');
                expect(savedUser.posts).to.have.length(1);
                done();
            });

    });

    after(function(done) {
        User.deleteMany({})
          .then(() => {
            return mongoose.disconnect();
          })
          .then(() => {
            done();
          });
      });

});