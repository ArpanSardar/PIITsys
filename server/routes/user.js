const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
//models
const User = require('../models/user');
const CvBuilder = require('../models/cvbuilder');
const Sitelink = require('../models/sitelink');
const ListCandidate = require('../models/listCandidate');
//config
const config = require('../config/config');

//setting up AWS authentication and S3
aws.config.update(config.awsAuthObj);
const s3 = new aws.S3();

//multer setup
const uploadDisplayPic = multer({
    storage: multerS3({ 
        s3: s3,
        bucket: 'piitscrm',
        acl: 'public-read',
        key: function (req, file, cb) {
          cb(null, file.fieldname + Date.now());
        }
    }),
    fileFilter: function (req, file, cb){
      const filetypes = /jpeg|jpg|png|gif/;
      const mimetype = filetypes.test(file.mimetype);
      if(mimetype){
        return cb(null,true);
      } else {
        cb('Error: Please select an Image!');
      }
    }
}).single('displayPicture');

//API routes for User
router.post('/register', (req, res, next)=>{
    let newUser = new User({
        isActive: true,
        name: req.body.name,
        email: req.body.email,
        //username: req.body.username,
        password: req.body.password,
        DOB: req.body.DOB,
        phNum: req.body.phNum,
        access: 0,
        skypeId: '',
        DP: {key:"", url:"https://s3-ap-northeast-1.amazonaws.com/piitscrm/noDP.png"}
    });
    User.addUser(newUser, (err, user)=>{
        if(err) return res.json({success: false, error: err});
        if(user.access == 0) {
            //  if user is a candidate create cv
            CvBuilder.createCv(user._id,(error,cv) => {
                if(err) return res.json({success: false, message: err});
                // add cv details to user collection
                User.addCv(cv.user, cv._id, (err) => {
                    if(err) return res.json({success: false, message: err});
                    // send mail
                    User.setupEmailVerification(user.email, (err)=>{
                        if(err) return res.json({success: false, message: err});
                        return res.json({success: true, message: 'User registered successfully, email verification sent.'});
                    });
    
                })
            })
        }else{
            User.setupEmailVerification(user.email, (err)=>{
                if(err) return res.json({success: false, message: err});
                return res.json({success: true, message: 'User registered successfully, email verification sent.'});
            });
        }
    });
});

router.post('/authenticate', (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;

    User.getUserByEmail(email, (err, user)=>{
        if(err) throw err;
        if(!user) return res.json({success: false, message:'email address is not registered with us'});
        if(user.disabledAdmin) return res.json({success: false, message: 'Your account access has been disabled. please contact your company admins.'});
        User.comparePasswords(password, user.password, (err, isMatch)=>{
            if(err) throw err;
            if(!isMatch) return res.json({success:false, message:'Wrong password'});
            const userData = {_id:user._id, name: user.name, access:user.access, email: user.email, DPUrl:user.DP.url};
            const token = jwt.sign(userData, config.secret, {expiresIn: 604800});   //create token with 1 week validity
            res.json({
                success: true,
                token: token,
                userData: userData
            });
        })
    })
});

router.get('/userInfo', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        User.getUserInfoById(decoded._id, (err, user)=>{
            if(err) throw err;
            res.status(serverStatus).json({ success: true, profileData: user });
        });
    });
});

router.post('/updateUserInfo', (req, res, next)=>{
    let userInfo ={
        name: req.body.name,
        DOB: req.body.DOB,
        phNum: req.body.phNum,
        skypeId: req.body.skypeId
    }
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        User.updateInfoById(decoded._id, userInfo, (err)=>{
            if(err) throw err;
            res.status(serverStatus).json({ success: true, message: "User info updated successfully" });
            ListCandidate.updateSkype(decoded._id, userInfo.skypeId);
        });
    });
});

router.post('/delete', (req, res) => {
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access != 2) return res.json({ success: false, error: 'unauthenticated' });
        User.getInternships(req.body.userId, (err, internships)=>{
            if(err) throw err;
            if(internships){
                return res.json({ success: false, message: 'User cant be deleted as there are Internships associated with the account' });
            }
            User.findByIdAndDelete(req.body.userId, (err, user) => {
                if(err) throw err;
                if(user.DP.key){              //if present, delete current DP from AWS S3 
                    s3.deleteObject({Bucket: 'piitscrm', Key:user.DP.key}, (err) => {
                        if(err) {
                            console.log(err);
                            console.log('failed to delete ' + user.DP.key + ' from S3. Please delete it manually.');
                        }
                    });
                }
                Sitelink.deleteMany({sentTo: user.email}, (err)=>{
                    if(err) {
                        console.log(err);
                        console.log('sitelink deleting failed for '+ user.email +'. please delete them manually.');
                    }
                });
                CvBuilder.findByIdAndDelete(user.cv[0]._id, (err, cv)=>{
                    if(err) {
                        console.log(err);
                        console.log('failed to CV with ID ' + user.cv[0]._id + ' from database. Please delete it manually.');
                    }
                    if(cv.profileVideo){
                        s3.deleteObject({Bucket: 'piitscrm', Key:cv.profileVideo.key}, (err) => {
                            if(err) {
                                console.log(err);
                                console.log('failed to delete ' + user.DP.key + ' from S3. Please delete it manually.');
                            }
                        });
                    }
                });
                res.json({success: true, message: 'user deleted successfully.'});
            });
        });        
    });
});

router.post('/archive', (req, res) => {
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access != 2) return res.json({ success: false, error: 'unauthenticated' });
        User.archiveUserById(req.body.userId, (err, cvId) => {
            if(err) throw err;
            CvBuilder.archiveCVByID(cvId, (err)=>{
                if(err) throw err;
            });
            Sitelink.deleteMany({sentTo: user.email}, (err)=>{
                if(err) {
                    console.log(err);
                    console.log('sitelink deleting failed for '+ user.email +'. please delete them manually.');
                }
            });
        });        
    });
});

router.post('/requestPasswordReset', (req, res, next)=>{
    User.setupPasswordReset(req.body.email, (err)=>{
        if(err) return res.json({success: false, error: err});
        return res.json({success: true, message: 'Password reset emil sent'});
    });
});

//on page load validate the site link and its expiry 
router.post('/validateSitelink', (req, res, next)=>{
    User.validateSitelink(req.body.id, (err, userId)=>{
        if(err) return res.json({success: false, userId: userId, msg: err});
        res.json({success:true, userId: userId, msg: 'verified link'});
    });
});

router.post('/resetPassword', (req, res, next)=>{
    User.getUserInfoById(req.body.userId, (err, user)=>{
        if(err) throw err;
        Sitelink.deleteSitelinks(user.email, 'passwordReset', (err)=>{
            if(err) throw err;
            User.setPassword(user._id, req.body.newPass, (err, user)=>{
               if(err) return res.json({success: false, message: "Failed to change the Password"});
               const userData = {_id:user._id, name: user.name, access:user.access, email: user.email, DPUrl:user.DP.url};
               const token = jwt.sign(userData, config.secret, {expiresIn: 604800});   //create token with 1 week validity
               res.json({
                    success: true,
                    token: token,
                    userData: userData
                });
            });
        });
    });
});

router.post('/updatePassword', (req, res, next)=>{
    const currPass = req.body.currentPassword;
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        User.getUserPassById(decoded._id, (err, user)=>{
            if(err) throw err;
            User.comparePasswords(currPass, user.password, (err, isMatch)=>{
                if(err) throw err;
                if(!isMatch) return res.json({success:false, error:'Wrong current password'});
                User.setPassword(decoded._id, req.body.newPassword, (err, user)=>{
                    if(err) throw err;
                    res.json({success: true, message: "Password changed successfully"});
                });
            });
        });
    });
});

router.post('/initPassword', (req, res, next)=>{
    User.setPassword(req.body.uId, req.body.newPass, (err, user)=>{
        if(err) return res.json({success: false, message: "Failed to change the Password"});
        User.markEmailVerified(user.email, ()=>{        //verified because they came from email invitation
            Sitelink.deleteSitelinks(user.email, 'activation', (err)=> {
                if(err) throw err;
                const userData = {_id:user._id, name: user.name, access:user.access, email: user.email, DPUrl:user.DP.url};
                const token = jwt.sign(userData, config.secret, {expiresIn: 604800});   //create token with 1 week validity
                res.json({
                    success: true,
                    token: token,
                    userData: userData
                });
            });
        });      
    });
});

router.post('/updateDisplayPic', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        User.getDP(decoded._id, (err, DP) => {
            if(err) return res.json({success: false, error: err});
            if(DP.key){              //if present, delete current DP from AWS S3 
                s3.deleteObject({Bucket: 'piitscrm', Key:DP.key}, (err) => {
                    if(err) return res.json({success: false, error: err});
                    uploadDisplayPic(req, res, (err) => {
                        if(err) return res.json({success: false, error: err});
                        User.updateDisplayPic(decoded._id, req.file.key, req.file.location, (err) => {
                            if(err) return res.json({success: false, error: err});
                            res.json({success: true, newLink: req.file.location});
                        });
                    });
                });
            }
            else{
                uploadDisplayPic(req, res, (err) => {
                    if(err) return res.json({success: false, error: err});
                    User.updateDisplayPic(decoded._id, req.file.key, req.file.location, (err) => {
                        if(err) return res.json({success: false, error: err});
                        res.json({success: true, newLink: req.file.location});
                    });
                });
            }
        });
    });
});

router.post('/suggestions', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let searchTerm = req.body.searchTerm;
        User.getSuggestions(searchTerm, (err, suggestions) => {
            if(err) return res.json({success: false, message:err});
            res.json({success:true, data: suggestions});
        });
    });
});

router.post('/NESuggestions', (req, res, next)=>{           //suggestions of both name and email
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let searchTerm = req.body.searchTerm;
        User.getNESuggestions(searchTerm, (err, suggestions) => {
            if(err) return res.json({success: false, message:err});
            res.json({success:true, data: suggestions});
        });
    });
});

router.post('/getUserIDbyEmail', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let email = req.body.email;
        User.getUserIdByEmail(email, (err, userId) => {
            if(err) return res.json({success: false, message:err});
            res.json({success:true, userId: userId});
        });
    });
});

router.get('/isWLMember', (req ,res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access == 2) return res.json({ success: true, isWLMember: true });
        res.json({ success: true, isWLMember: false });
    });
});

module.exports = router;