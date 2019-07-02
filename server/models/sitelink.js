const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sitelinkSchema = Schema({
    sentTo: {type: String, required: true},
    expiry: Date,
    type: String                    //activation, passwordReset, emailVerification
});

const Sitelink = module.exports = mongoose.model('Sitelink', sitelinkSchema);

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports.createActivationLink = function(email, callback){
    if(!validateEmail(email)) return callback('Invalid Email', null);
    let newSitelink = new Sitelink({
        _id: new mongoose.Types.ObjectId(),
        sentTo: email,
        expiry: null,
        type: 'activation'
    })
    newSitelink.save((err)=>{
        if(err) return callback(err, null);
        let link = "https://pisys.willings.co.jp/initAccount/" + newSitelink._id;
        callback(null, link);
    });
}

module.exports.createPasswordResetLink = function(email, callback){
    if(!validateEmail(email)) return callback('Invalid Email', null);
    let expiry = new Date();
    expiry.setHours(expiry.getHours() + 12);
    let newSitelink = new Sitelink({
        _id: new mongoose.Types.ObjectId(),
        sentTo: email,
        expiry: expiry,
        type: 'passwordReset'
    })
    newSitelink.save((err)=>{
        if(err) return callback(err, null);
        let link = "https://pisys.willings.co.jp/resetPassword/" + newSitelink._id;
        callback(null, link);
        //delete token after on successful change
    });
}

module.exports.createEmailVerificationLink = function(email, callback){
    if(!validateEmail(email)) return callback('Invalid Email', null);
    let newSitelink = new Sitelink({
        _id: new mongoose.Types.ObjectId(),
        sentTo: email,
        expiry: null,
        type: 'emailVerification'
    })
    /*future scope check if already activated if not check if already token is preset*/
    newSitelink.save((err)=>{
        if(err) return callback(err, null);
        let link = "https://pisys.willings.co.jp/verifyEmail/" + newSitelink._id;
        callback(null, link);
    });
}

module.exports.deleteSitelinks = function(email, type, callback){
    Sitelink.deleteMany({ sentTo: email, type: type }, callback);
}