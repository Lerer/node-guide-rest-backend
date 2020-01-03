require('dotenv').config();
// Test imports
const sinon = require('sinon');
const expect = require('chai').expect;
// 3rd party code
const mongoose = require('mongoose');
// 1st party code
const User = require('../models/user.js');
const authController = require('../controllers/auth.js');
const userController = require('../controllers/user.js');

describe('Auth controller login',function() {

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

    it('Should throw an error with code 500 if DB inaccessible',function(done) {
        sinon.stub(User,'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'tester'
            }
        };

        authController.login(req,{},(result) => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode',500);
            done();
        })

        User.findOne.restore();
    });

    it('Should send a response with valid user status',function(done) {
        
        const userId = '5c0f66b979af55031b34728a';
        // the request object
        const req = {
            userId: userId
        };
        // the response object
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function(code){
                this.statusCode = code;
                return this;
            },
            json: function(data){
                this.userStatus = data.status;
            }
        };
        userController.getUserStatus(req,res,() => {})
            .then(() => {
                expect(res).has.property('statusCode',200);
                expect(res).has.property('userStatus','I am new!');
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