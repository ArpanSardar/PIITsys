const express = require('express');
const path = require('path');
const router = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mailer = require('../helpers/mailer');
//models
const Internship = require('../models/internship');
const User = require('../models/user');
const Company = require('../models/company');       
//config
const config = require('../config/config');

//setting up AWS authentication and S3
aws.config.update(config.awsAuthObj);
const s3 = new aws.S3();

//multer setup for weekly report image 
const uploadS3WreptImg = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'piitscrm',
        acl: 'public-read',
        key: function (req, file, cb) {
          cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        }
    }),
    fileFilter: function (req, file, cb){
      const filetypes = /png|jpeg|jpg|/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      if(mimetype && extname){
        return cb(null,true);
      } else {
        cb('Error: Please select a valid file');
      }
    }
}).single('weekSnapshot');

//multer setup for offer letter
const uploadS3OfferLetter = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'piitscrm',
        /*acl: 'public-read',*/
        key: function (req, file, cb) {
          cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        }
    }),
    fileFilter: function (req, file, cb){
      const filetypes = /pdf|docx|doc|/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      if(mimetype && extname){
        return cb(null,true);
      } else {
        cb('Error: Please select a valid file');
      }
    }
}).single('offerLetter');

//multer setup for acceptance letter
const uploadS3AcceptanceLetter = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'piitscrm',
        /*acl: 'public-read',*/
        key: function (req, file, cb) {
          cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        }
    }),
    fileFilter: function (req, file, cb){
      const filetypes = /pdf|docx|doc|/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      if(mimetype && extname){
        return cb(null,true);
      } else {
        cb('Error: Please select an Image!');
      }
    }
}).single('acceptanceLetter');

//API routes for Internship data
router.post('/initInternship', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        Company.getCompanyIdByName(req.body.companyName, (err, companyId)=>{
            if(err) return res.json({success: false, message: err});
            User.getUserIdByEmail(req.body.candidateEmail, (err, candidateId) =>{
                if(err) return res.json({success: false, message: err});
                newInternship = new Internship({
                    company: companyId,
                    candidate: candidateId,
                    accommodation: {cost: 0, address: '', agency: { name: '', email: '', phNum: '' }, mIn: '', mOut: '', cmnts: ''},
                    suica : { cardNo: 0, line: '', from: '', to: '', name: '', issued: '', expiry: '', acptd: false, cmnts:'' },
                    wifi: {cost: 0, dId: 0, agency: { name: '', email: '', phNum: '' }, sDate: '', rDate: '', cmnts: '', acptd: false},
                    payments: []
                });
                newInternship.save((err, internship) => {
                    if(err) return res.json({success: false, error: err});
                    let link = 'https://pisys.willings.co.jp/internship/' + internship._id;
                    Company.addInternshipAndGetAdmins(companyId, internship._id, (err, admins)=>{
                        if(err) return res.json({success: false, error: err });
                        User.addInternship(candidateId, internship._id, (err)=>{
                            if(err) return res.json({success: false, error: err });
                            mailer.initiateInternshipMails(admins, link, (success, ErrorMsg)=>{
                                if(!success) return res.json({ success: false, error: ErrorMsg });
                                res.json({ success: true, error: 'Internship created successfully and mail sent to company' });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.get('/dashboardInternships', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        User.getDashBoardInternships(decoded, (err, internships) => {
            if(err) return res.json({success: false, error: err });
            res.json({success: true, internships: internships });
        })
    });
});

router.post('/yearInternships', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    let year = req.body.year;
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        if(year=='' || year==null) return res.status(401).json({ success: false, message: 'No Year provided' });
        Internship.getInternshipsOfYear(year, (err, internships)=>{
            if(err) return res.json({success: false, message: err});
            res.json({success:true, internships: internships});
        });
    });
});

router.post('/upsertBasicInfo', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access==0) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let internshipId = req.body._id;
        let basicInfo = {
            projectName: req.body.projectName,
            designation: req.body.designation,
            supervisors: req.body.supervisors,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            location: req.body.location,
            description: req.body.description,
            cmpGivenEmail: req.body.cmpGivenEmail
        }
        Internship.upsertBasicInfo(internshipId, decoded, basicInfo, (err, candidate)=>{
            if(err) return res.json({success: false, message: err});
            let link = 'https://pisys.willings.co.jp/internship/' + internshipId;
            mailer.notifyCandidateBasicInfo(candidate, link, (err)=>{
                if(err) return res.json({success: false, message: err});
                res.json({success:true, message: 'Internship basic information updated successfully and candidate notified.'});
            });
        });
    });
});

router.post('/info', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        Internship.getInternshipBasicInfo(req.body.internshipId, decoded, (err, internship)=>{
            if(err) throw err;
            res.json({success: true, internship: internship});
        });
    });
});

/*
router.delete('/delete/:id', (req, res, next)=>{
    res.send("Deleting an internship");
});*/

router.post('/getWeeklyReports',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access == 1) return res.status(401).json({ success: false, error: 'Unauthorised' });
        Internship.getWRepts(req.body.intnshpId, decoded, (err, wRepts)=>{
            if(err) throw err;
            res.json({success: true, weeklyReports: wRepts});
        });
    });
});

router.post('/updateCandidateWeeklyReport', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    let internshipId = req.headers['internship-id'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access == 1) return res.status(401).json({ success: false, message: 'Unauthorised' });
        Internship.getCandidateAndWRepts(internshipId, (err, candidateId, Wrepts)=>{
            if(err) return res.json({success: false, error: err});
            if(decoded.access == 0 && candidateId != decoded._id) return res.json({success: false, error: 'Unauthorised'});
            uploadS3WreptImg(req, res, err=>{
                if(err) return res.json({success: false, error: err});
                let reptIndex = req.body.reptIndex;
                let data = {
                    rept: {
                        difficulty: req.body.difficulty,
                        learnt: req.body.learnt,
                        tech: req.body.tech,
                        supQuery: req.body.supQuery,
                        interesting: req.body.interesting,
                        other: req.body.other,
                        img: { key: req.file.key, url: req.file.location }
                    },
                    index: reptIndex,
                    week: { sDate: req.body.sDate, eDate: req.body.eDate }
                }
                if(reptIndex != -1){
                    s3.deleteObject({Bucket: 'piitscrm', Key: Wrepts[reptIndex].rept.img.key}, (err) => {
                        if(err) return res.json({success: false, error: err});
                        Internship.upsertSReport(internshipId, data, (err, wRepts)=>{
                            if(err) return res.json({success: false, error: err});
                            res.json({success: true, weeklyReports: wRepts});
                        });
                    });
                }
                else{
                    Internship.upsertSReport(internshipId, data, (err, wRepts)=>{
                        if(err) return res.json({success: false, error: err});
                        res.json({success: true, weeklyReports: wRepts});
                    });
                }
            });
        });
    });
});

router.post('/updateCompanyWeeklyReport/:id', (req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.upsertCReport(req.params.id, decoded._id, (err)=>{
            if(err) throw err;
            res.json({success: true, msg: 'report updated successfully'});
        });
    });
});

router.post('/updateWeeklyReportComment',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let data = {
            id: req.body.intnshpId,
            reptIndex: req.body.wReptIndex,
            body: req.body.body,
            cmtIndex: req.body.index
        }
        let currWLMembers = { 
            '@Toyoaki': 't_machida@willings.co.jp',
            '@Parikshit': 'parikshitchavan@willings.co.jp',
            '@Yuka': 'yuka.nagasawa@willings.co.jp',
            '@Jun': 'jun.nagase@willings.co.jp',
            '@Tejaswini': 't_barve@webstaff.jp'
        };
        let regEx = /@\w*/gi;
        let matchArr = data.body.match(regEx);
        let availTags = Object.keys(currWLMembers);
        let flrtdTagsMails = [];
        if(matchArr.count){
            matchArr.filter(tag =>{
                if(availTags.indexOf(tag)) flrtdTagsMails.push(currWLMembers.tag);
            })
        }
        mailer.sendcmtTagmails(data, decoded.name, flrtdTagsMails, err=>{
            if(err) throw err;
        });
        Internship.upsertWReportComment(data, decoded._id, (err, comments)=>{
            if(err) return res.json({ success: false, error: err });
            res.json({success: true, comments: comments});
        });
    });
});

router.post('/deleteWeeklyReportComment',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let data = {
            id: req.body.intnshpId,
            reptIndex: req.body.wReptIndex,
            cmtIndex: req.body.cmtIndex
        };
        Internship.deleteWReportComment(data, decoded._id, (err)=>{
            if(err) throw err;
            res.json({success: true, msg: 'report deleted successfully'});
        });
    });
});

router.post('/updateCandidateFeedback/:id',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.upsertSFeedback(req.params.id, decoded._id, feedback, (err)=>{
            if(err) throw err;
            res.json({success: true, msg: 'feedback updated successfully'});
        });
    });
});

router.post('/updateCompanyFeedback/:id',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.upsertCFeedback(req.params.id, decoded._id, feedback, (err)=>{
            if(err) throw err;
            res.json({ success: true, msg: 'feedback updated successfully' });
        });
    });
});

router.post('/updateFeedbackComment/:id',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let commentNumber = req.body.commentNumber ? req.body.commentNumber: null;
        Internship.upsertFeedbackComment(req.params.id, commentNumber, req.body.comment, decoded._id, (err)=>{
            if(err) throw err;
            res.json({success: true, msg: 'Comment updated successfully'});
        });
    });
});

router.delete('/deleteFeedbackComment/:id',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        Internship.deleteFeedbackComment(req.params.id, commentNumber, decoded._id, (err)=>{
            if(err) throw err;
            res.json({success: true, msg: 'Comment deleted successfully'});
        });
    });
});

router.post('/updateOfferLetter/:id',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.getOfferLetter(req.params.id, decoded._id, (err, file) => {
            if(err) return res.json({success: false, msg: err});
            if(file.key){        //if present, delete the current file from AWS S3
                s3.deleteObject({bucket: 'piitscrm', key: file.key}, (err) => {
                    if(err) return res.json({success: false, msg: err});
                });
            }
            uploadS3OfferLetter(req, res, next, (err) => {
                if(err) return res.json({success: false, msg: err});
                Internship.uploadOfferLetter(req.params.id, decoded._id, req.file.originalname, req.file.key, (err)=>{
                    if(err) return res.json({success: false, msg: err});
                    res.json({success: true, msg: 'Offer letter uploaded successfully'});
                });
            });
        });
    });
});

router.get('/downloadOfferLetter/:id', (req, res, next) => {
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        Internship.getOfferLetter(req.params.id, decoded._id, (err, file) => {
            if(err) return res.json({success: false, msg: err});
            if(!file.key) return res.json({success: false, msg: 'no file present'});
            res.attachment(fileKey);
            let fileStream = s3.getObject({bucket: 'piitscrm', key: file.key}).createReadStream();
            fileStream.pipe(res);
        });
    });
});

router.post('/updateAcceptanceLetter/:id',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.getAcceptanceLetter(req.params.id, decoded._id, (err, file) => {
            if(err) return res.json({success: false, msg: err});
            if(file.key){        //if present, delete the current file from AWS S3
                s3.deleteObject({bucket: 'piitscrm', key: file.key}, (err) => {
                    if(err) return res.json({success: false, msg: err});
                });
            }
            uploadS3AcceptanceLetter(req, res, next, (err) => {
                if(err) return res.json({success: false, msg: err});
                Internship.uploadAcceptanceLetter(req.params.id, decoded._id, req.file.originalname, req.file.key, (err)=>{
                    if(err) return res.json({success: false, msg: err});
                    res.json({success: true, msg: 'Comment deleted successfully'});
                });
            });
        });
    });
});

router.get('/downloadAcceptanceLetter/:id', (req, res, next) => {
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.getAcceptanceLetter(req.params.id, decoded._id, (err, file) => {
            if(err) return res.json({success: false, msg: err});
            if(!file.key) return res.json({success: false, msg: 'no file present'});
            res.attachment(fileKey);
            let fileStream = s3.getObject({bucket: 'piitscrm', key: file.key}).createReadStream();
            fileStream.pipe(res);
        });
    });
});

router.post('/updateCandidateValuation/:id',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.upsertValuation(req.params.id, decoded._id, valuation,  (err)=>{
            if(err) throw err;
            res.json({success: true, msg: 'Valuation uploaded successfully'});
        });
    });
});

router.post('/getAccommodationDetails',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        Internship.getAccommodation(req.body.intnshpId, decoded, (err, accommodation)=>{
            if(err) throw err;
            res.json({success: true, accommodation: accommodation});
        });
    });
});

router.post('/updateAccommodationDetails',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let accommodation = req.body.accommodation;
        Internship.upsertAccommodation(req.body.intnshpId, accommodation, (err, newAccommodation)=>{
            if(err) throw err;
            res.json({success: true, accommodation: newAccommodation});
        });
    });
});

router.post('/getSuicaDetails',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access==1) return res.status(401).json({ success: false, error: 'Unauthorised' });
        Internship.getSuica(req.body.intnshpId , decoded, (err, suica)=>{
            if(err) throw err;
            res.json({success: true, suica: suica});
        });
    });
});

router.post('/updateSuicaDetails',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let suica = req.body.suica;
        Internship.upsertSuica(req.body.intnshpId, suica, (err, newSuica)=>{
            if(err) throw err;
            res.json({success: true, suica:newSuica});
        });
    });
});

router.post('/getWiFiDetails',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access==1) return res.status(401).json({ success: false, error: 'Unauthorised' });
        Internship.getWiFi(req.body.intnshpId , decoded, (err, wifi)=>{
            if(err) throw err;
            res.json({success: true, wifi: wifi});
        });
    });
});

router.post('/updateWifiDetails',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, error: 'Unauthorised' });
        let wifi = req.body.wifi;
        Internship.upsertWifi(req.body.intnshpId, wifi, (err, newWifi)=>{
            if(err) throw err;
            res.json({success: true, wifi:newWifi});
        });
    }); 
});

router.post('/getPayments',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access==1) return res.status(401).json({ success: false, error: 'Unauthorised' });
        Internship.getPayments(req.body.intnshpId , decoded, (err, payments)=>{
            if(err) throw err;
            res.json({success: true, payments: payments});
        });
    });
});

router.post('/updatePayment',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    let newPayment = req.body.payment;
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, message: 'Unauthorised' });
        let paymentNumber = req.body.paymentNumber ? req.body.paymentNumber : null;
        Internship.upsertPayment(req.body.intnshpId, newPayment, (err, payments)=>{
            if(err) throw err;
            res.json({success: true, payments: payments});
        });
    });
});

router.post('/deletePayment',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access!=2) return res.status(401).json({ success: false, error: 'Unauthorised' });
        Internship.deletePayment(req.body.intnshpId, req.body.stipendIndex, (err, payments)=>{
            if(err) throw err;
            res.json({success: true, payments: payments});
        });
    }); 
});

router.post('/markPaymentAccepted',(req, res, next)=>{
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, error: err });
        if(decoded.access==1) return res.status(401).json({ success: false, error: 'Unauthorised' });
        Internship.markPaymentAccepted(req.body.intnshpId, decoded,  req.body.stipendIndex, (err, payments)=>{
            if(err) throw err;
            res.json({success: true, payments: payments});
        });
    }); 
});

module.exports = router;