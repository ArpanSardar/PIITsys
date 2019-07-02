


//API routes for the Company (Company Admins info will be embedded in company document)
const express = require('express');
const router = express.Router();

//models
const User = require('../models/user');
const Company = require('../models/company');
const cvBuilder = require('../models/cvbuilder');

const util = require('../helpers/common');
//config

const getUsers = (req, res, next) => {
    const userQuery = { access : 0};
    User.getUsers(userQuery, (err,users) => {
        if(err){
            return res.json({ success: false, message: err});
        }
        if(!users)  return res.json({ success: false, message: 'No users found'});
        users.forEach(user => {
            if(!user.cv.length){
                cvBuilder.createCv(user._id,(err,cv) => {
                    if(err) return res.json({success: false, message: err});
                    // add cv details to user collection
                    User.addCv(cv.user, cv._id, (err) => {
                        if(err) return res.json({success: false, message: err});
                        res.json({users : users});
                    });
                });
            }
        });
    });
}

router.get('/migrateUserCv', util.authenticate, getUsers )

router.get('/migrateCompanyAdminArchive', util.authenticate, (req, res) => {
    Company.find( {}, (err, companies) => {
        if(err) throw err;
        companies.forEach( cmp =>{
            if(!cmp.adminsArcv) cmp.adminsArcv = [];
            cmp.save();
        });
        res.json('all companies updated');
    });
});

router.get('/updateCVPublish', util.authenticate, (req, res) => {
    cvBuilder.find( {}, (err, CVs) => {
        if(err) throw err;
        CVs.forEach( cv =>{
            if(!cv.isProfilePublished) cv.isProfilePublished = false;
            cv.save();
        });
        res.json('all CVs publish status updated');
    });
});

router.get('/updatePassStatus', util.authenticate, (req, res) => {
    cvBuilder.find( {}, (err, CVs) => {
        if(err) throw err;
        CVs.forEach( cv =>{
            if(!cv.personalInterest) cv.isProfilePublished = false;
            cv.save();
        });
        res.json('all CVs publish status updated');
    });
});

module.exports = router;