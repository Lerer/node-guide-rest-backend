const expect = require('chai').expect;
const authmiddleware = require('../middleware/auth.js');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

describe('auth middelware',function (){
    it('Should throw an error if not authorization header present',function(){
        const req = {
            get: function(){
                return null;
            }
        }
        expect(authmiddleware.bind(this,req,{},() => {})).to.throw('Not authenticated');
    });
    
    it('Should yield a user id if token is veroified',function() {
        const req = {
            get: function(param){
                return 'Bearer header';
            }
        }
        sinon.stub(jwt,'verify');
        // jwt.verify = function() {
        //     return {userId:'abc'};
        // }
        jwt.verify.returns({userId:'abc'});
        authmiddleware(req,{},() => {});
        expect(req).to.haveOwnProperty('userId');
        expect(req).to.have.property('userId','abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });

    it('Should throw error if token cannot be verified',function() {
        const req = {
            get: function(param){
                return 'Bearer header';
            }
        }
        expect(authmiddleware.bind(this,req,{},() => {})).to.throw('jwt malformed');
        
    });

});



