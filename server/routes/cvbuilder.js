//API routes for the Company (Company Admins info will be embedded in company document)
const express = require('express');
const moment = require('moment');
const router = express.Router();
const aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
const ListCandidate = require('../models/listCandidate');

//models
const User = require('../models/user');
const cvBuilder = require('../models/cvbuilder');

const util = require('../helpers/common');
//config
const config = require('../config/config');

//setting up AWS authentication and S3
aws.config.update(config.awsAuthObj);
aws.config.update({region: 'ap-northeast-1'});
const s3 = new aws.S3();

const S3_BUCKET_OBJECT = {
    acl: 'authenticated-read',
    region: 'ap-northeast-1',
    s3BucketName: 'piitscrm',
    keyPrefix: 'profileVideos'
}

const CANDIDATE_PER_PAGE = 100;

// superadmin is willings member whose access code is = 2.
const isSuperAdminOrOwner = function (decoded, cvOwnerId) {
    return decoded.access == 2 || decoded._id == cvOwnerId;
}

const hasPermission = (req, res, next) => {
    const cvUserId = req.body.userId;
    isSuperAdminOrOwner(req.decoded, cvUserId) ? next() : util.sendError(res, 'Not authorised for this operation');
}

const isSuperAdmin = (req, res, next) =>{
    req.decoded.access == 2 ? next() : util.sendError(res, 'Not authorised for this operation');
}

const updatePublish = (req, res) => {
    const publishProfile = req.body.publishProfile;
    if(publishProfile){
        User.isHasSkpId(req.body.userId, (err, hasSkpId) =>{
            if (err) return util.sendError(res, err);
            if(!hasSkpId){
                return util.sendError(res, 'Cant publish CV without updating your skypeId');
            }
            cvBuilder.updatePublish(req.tempStore.cv, publishProfile, (err, isUpdated) => {
                if (err) return util.sendError(res, err);
                if (!isUpdated) return util.sendError(res, 'Can not changed the profile status this time.');
                res.json({ success: true, message: 'Your profile status has been changed successfully' });
            });
        });
    }
    else{
        cvBuilder.updatePublish(req.tempStore.cv, publishProfile, (err, isUpdated) => {
            if (err) return util.sendError(res, err);
            if (!isUpdated) return util.sendError(res, 'Can not changed the profile status this time.');
            res.json({ success: true, message: 'Your profile status has been changed successfully' });
        });
    }
}

const getCv = (req, res, next) => {
    var cvUserId = req.body.userId;
    if (!cvUserId) {    cvUserId = req.params.userId;   }
    req.tempStore.userId = cvUserId;
    User.getCv(cvUserId, (err, cv) => {
        if (err) {  return util.sendError(res, err); }
        if (!cv) {  return util.sendError(res, 'Cv details are not available'); }
        req.tempStore.cv = cv;
        next()
    });
}

const getCvById = (req, res, next) => {
    cvBuilder.getCvById(req.tempStore.cv, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Cv details are not available');
        req.tempStore.cvdetails = cvdetails;
        next()
    });
}

const updateProcedureStatus = (req, res) =>{
    let status = req.body.procedureStatus;
    if(!status){
        return util.sendError(res, 'No procedure status provided');
    }
    cvBuilder.updateProcedureStatus(req.tempStore.cv, status, (err)=>{
        if(err) return util.sendError(res, err);
        res.json({success: true, message: 'Candidate selection procedure status updated successfully'})
    });
}

const getSignedUrl = (req, res, next) => {
    const cvdetails = req.tempStore.cvdetails;
    if (cvdetails.profileVideo.key && (moment() > moment(cvdetails.profileVideo.signExpiry))) {
        var params = { Bucket: S3_BUCKET_OBJECT.s3BucketName, Key: cvdetails.profileVideo.key, Expires:  60 * 60 * 24  };
        s3.getSignedUrl('getObject', params, (err, newSignedUrl)=>{
            if(err) return util.sendError(res, 'Failed to get the video.');
            cvBuilder.updateProfileVideo(cvdetails.id, {
                key: cvdetails.profileVideo.key,
                location: newSignedUrl,
                signedOn: moment().toDate(),
                signExpiry: moment().add(24,'hours').toDate()
            }, (err, result) => {
                if (err) return util.sendError('Error saving video details');
                req.tempStore.cvdetails = result.toObject();
                next();
            });
        });
    } else {
        next();
    }
}

const sendCvDetails = (req, res) => {
    if (isSuperAdminOrOwner(req.decoded, req.params.userId)) {
        User.getUserInfoById(req.tempStore.userId, (err, user) => {
            if(err) return util.sendError('Error getting user details');
            res.json({ success: true, canEdit: true, cvdetails: req.tempStore.cvdetails, profileData: user });
        });
    } else {
        res.json({ success: true, canEdit: false, cvdetails: req.tempStore.cvdetails });
    }
}


/**
 *  if new education is latest then it will change existing latest educations as false.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const updateAllEducations = (req, res, next) => {
    const education = req.body.education;
    if (!education) {
        return util.sendError(res, 'Please provide all parameters', 400);
    }
    if(education.isLatest){
        cvBuilder.updateAllEducations(req.tempStore.cv, (err, cvdetails) => {
            if(err) return util.sendError(res, err);
            ListCandidate.updateEducation(req.tempStore.userId, education);
            next();
        })
    }else{
        next();
    }
}

const addEducation = (req, res) => {
    const education = req.body.education;
    if (!education) {
        return util.sendError(res, 'Please provide all parameters', 400)
    }
    cvBuilder.addEducation(req.tempStore.cv, education, (err, cvdetails) => {
        if (err) {  return util.sendError(res, err); }
        if (!cvdetails) return util.sendError(res, 'Cant add the education this time!.');
        res.json({ success: true, message: 'New Education has been added successfully', educations: cvdetails.educations });
    });
}

const checkIfLatestExist = (educations = []) => {
    return educations.some(record => record.isLatest === true);
}

/**
 * deletes the education, in remaining records if delete is not exist it will change last record as Latest one.
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deleteEducation = (req, res) => {
    const educationID = req.body.educationID;
    if (!educationID) {
               return util.sendError(res, 'Please provide all parameters', 400)
    }
    cvBuilder.deleteEducation(req.tempStore.cv, educationID, (err, cvdetails) => {
        if (err) {  return util.sendError(res, err); }
        if (!cvdetails) return util.sendError(res, 'Cant delete the education this time!.');
        if(cvdetails.educations.length && !checkIfLatestExist(cvdetails.educations)){
            let lastEducation = cvdetails.educations[cvdetails.educations.length-1].toObject();
            lastEducation.isLatest = true
            cvBuilder.updateEducation(req.tempStore.cv, lastEducation, (err, cvDetails) => {
                if (err) {  return util.sendError(res, 'Please manually set at least one of the education as latest'); }
                if (!cvDetails) return util.sendError(res, 'Please manually set at least one of the education as latest' );
                ListCandidate.updateEducation(req.tempStore.userId, lastEducation);
                res.json({ success: true, message: 'Education has been removed successfully', educations: cvDetails.educations });
            });
        }else{
            res.json({ success: true, message: 'Education has been removed successfully', educations: cvdetails.educations });
        }
    })
}

const updateEducation = (req, res) => {
    const education = req.body.education;
    if (!education) {   return util.sendError(res, 'Please provide all parameters' )   }
    cvBuilder.updateEducation(req.tempStore.cv, education, (err, cvDetails) => {
        if (err) {  return util.sendError(res, err); }
        if (!cvDetails) return util.sendError(res, 'Cant update the education this time!.' );
        res.json({ success: true, message: 'Education has been updated successfully', educations: cvDetails.educations })
    })
}


const addExperience = (req, res) => {
    const experience = req.body.experience;
    if(!experience) {
        return util.sendError(res, 'Please provide all parameters, experience is missing')
    }
    cvBuilder.addExperience(req.tempStore.cv, experience, (err, cvdetails) => {
        if(err){    return util.sendError(res, 'Failed to add experience');  }
        if(!cvdetails) return util.sendError(res, 'Cant update the experience this time!.');
        res.json({ success: true, message : 'New experience has been added successfully', experiences: cvdetails.experience });
    })
}

const updateExperience =(req, res) => {
    const experience = req.body.experience;
    if(!experience){
        return util.sendError(res, 'Please provide all parameters', 422)
    }
    cvBuilder.updateExperience(req.tempStore.cv, experience, (err,cvdetails) => {
        if(err) return util.sendError(res, err);
        if(!cvdetails) return util.sendError(res, 'Cant update the experience!.');
        res.json({ success: true, message : 'Experience has been updated successfully', experiences: cvdetails.experience });
    })
}

const deleteExperience = (req, res) => {
    const experienceId = req.body.experienceId;
    if(!experienceId){
               return util.sendError(res, 'Please provide all parameters', 422)
    }
    cvBuilder.deleteExperience(req.tempStore.cv, experienceId, (err,cvdetails) => {
        if(err) return util.sendError(res, err );
        if(!cvdetails) return util.sendError(res, 'Can not delete the experience');
        return res.json({ success: true, message : 'Experience has been removed successfully', experience: cvdetails.experience });
    })
}

const addProjects = (req, res) => {
    const project = req.body.project;
    if(!project){
               return util.sendError(res, 'Please provide all parameters', 422)
    }
    cvBuilder.addProjects(req.tempStore.cv, project, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not add the project');
        res.json({ success: true, message: 'New project has been added successfully', projects: cvdetails.projects });
    })
}

const deleteProject = (req, res) => {
    const projectId = req.body.projectId;
    if(!projectId){
               return util.sendError(res, 'Please provide all parameters', 422)
    }
    cvBuilder.deleteProject(req.tempStore.cv, projectId, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not delete the project');
        res.json({ success: true, message: 'Project has been removed successfully', projects: cvdetails.projects });
    })
}

const updateProject = (req, res) => {
    const project = req.body.project;
    if(!project){
               return util.sendError(res, 'Please provide all parameters', 422)
    }
    cvBuilder.updateProject(req.tempStore.cv, project, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not update the project');
        res.json({ success: true, message: 'Project has been updated successfully', projects: cvdetails.projects });
    })
}

const addCertificate = (req, res) => {
    const certificate = req.body.certificate;
    if(!certificate){
               return util.sendError(res, 'Please provide all parameters', 422)
    }
    cvBuilder.addCertificate(req.tempStore.cv, certificate, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not add the certificate');
        res.json({ success: true, message: 'New Certificate has been added successfully', certificates: cvdetails.certificates });
    })
}

const deleteCertificate = (req, res) => {
    const certificateId = req.body.certificateId;
    if(!certificateId){
               return util.sendError(res, 'Please provide all parameters', 422);
    }
    cvBuilder.deleteCertificate(req.tempStore.cv, certificateId, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not delete the certificate');
        res.json({ success: true, message: 'Certificate has been removed successfully', certificates: cvdetails.certificates });
    })
}

const updateCertificate = (req, res) => {
    const certificate = req.body.certificate;
    if(!certificate){
        return util.sendError(res, 'Please provide all parameters', 422);
    }
    cvBuilder.updateCertificate(req.tempStore.cv, certificate, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not update the certificate');
        res.json({ success: true, message: 'Certificate has been updated successfully', certificates: cvdetails.certificates });
    })
}

const updateSkills = (req, res) => {
    const skills = req.body.skills;
    if(!skills){
        return util.sendError(res, 'Please provide all parameters', 422);
    }
    cvBuilder.updateSkills(req.tempStore.cv, skills, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not update the skills');
        res.json({ success: true, message: 'Skills has been updated successfully', skills: cvdetails.skills });
        ListCandidate.updateSkills(req.tempStore.userId, skills.techSkills);
    })
}

const updateInterests = (req, res) => {
    const interests = req.body.interests;
    if(!interests){
               return util.sendError(res, 'Please provide all parameters', 422);
    }
    cvBuilder.updateInterests(req.tempStore.cv, interests, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not update the Interests');
        res.json({ success: true, message: 'Interests has been updated successfully', interests: cvdetails.personalInterest });
    })
}

const updateRemarks = (req, res) => {
    const remarks = req.body.remarks;
    cvBuilder.updateRemarks(req.tempStore.cv, remarks, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not update the Remarks');
        res.json({ success: true, message: 'Remarks has been updated successfully', remarks: cvdetails.remarks });
    });
}

const updateForCompanies = (req, res) => {
    const forCompanies = req.body.forCompanies;
    cvBuilder.updateForCompanies(req.tempStore.cv, forCompanies, (err, cvdetails) => {
        if (err) return util.sendError(res, err);
        if (!cvdetails) return util.sendError(res, 'Can not update the for companies section');
        res.json({ success: true, message: 'for Companies has been updated successfully', forCompanies: cvdetails.forCompanies });
    });
}

 const deleteOldIfExist = (req, res, next) => {
    const cvDetails = req.tempStore.cvdetails;
    if (cvDetails.profileVideo && cvDetails.profileVideo.key) {
        s3.deleteObject({ Bucket: S3_BUCKET_OBJECT.s3BucketName, Key: cvDetails.profileVideo.key }, (err)=>{
            if(err) return util.sendError(res, 'Please try later, failed to delete old video');
            next();
        });
    } else {
        next();
    }
}

const updateProfileVideo = (req, res) => {
    let objectKey = req.file ? req.file.key : req.body.videoKey;
    var params = { Bucket: S3_BUCKET_OBJECT.s3BucketName, Key: objectKey, Expires: 60 * 60 * 24 };
    s3.getSignedUrl('getObject', params, (err, newSignedUrl)=>{
        if (err) return util.sendError(res, 'Please try later, failed to upload video');
        cvBuilder.updateProfileVideo(req.tempStore.cvdetails.id, {
            key: objectKey,
            location: newSignedUrl,
            signedOn: moment().toDate(),
            signExpiry: moment().add(24,'hours').toDate()
        }, (err, result) => {
            if (err) return util.sendError(res, 'Failed to save video details');
            res.json({ success: true, profileVideo:  result.profileVideo})
        });
    });
}

//multer setup
const uploadProfileVideo = multer({
    storage: multerS3({
        s3: s3,
        bucket: S3_BUCKET_OBJECT.s3BucketName,
        acl:  S3_BUCKET_OBJECT.acl,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { 'Content-Type': 'video/mp4'});
        },
        key: function (req, file, next) {
            next(null, file.fieldname + '/' + Date.now() + '.mp4');
        }
    }),
    fileFilter: function (req, file, next){
      const filetypes = /mp4/;
      const mimetype = filetypes.test(file.mimetype);
      if(mimetype){
        return next(null,true);
      } else {
        next('Error: Please select an Video!');
      }
    }
}).single('displayVideo');


const getCandidates = (req, res) => {
    let pageNumber = req.body.pageNumber;
    let allowedStatuses = req.body.allowedStatuses;
    User.pullCandidates(allowedStatuses, CANDIDATE_PER_PAGE, pageNumber, (err, users, allCount) => {
        if (err) res.json({ candidates: [], err: "Error" });
        if(pageNumber === 1){
            res.json({ success: true, candidates: users, count: allCount });
        }else{
            res.json({ success: true, candidates: users});
        }
    });
}

router.use(util.authenticate);
router.get('/cvdetails/:userId', getCv, getCvById, getSignedUrl, sendCvDetails);

router.post('/addEducation', hasPermission, getCv, updateAllEducations, addEducation);
router.delete('/deleteEducation', hasPermission, getCv, deleteEducation);
router.put('/updateEducation', hasPermission, getCv, updateAllEducations, updateEducation);

router.post('/addExperience', hasPermission, getCv, addExperience);
router.put('/updateExperience', hasPermission, getCv, updateExperience);
router.delete('/deleteExperience', hasPermission, getCv, deleteExperience);

router.post('/addProjects', hasPermission, getCv, addProjects);
router.put('/updateProject', hasPermission, getCv, updateProject);
router.delete('/deleteProject', hasPermission, getCv, deleteProject);

router.post('/addCertificate', hasPermission, getCv, addCertificate);
router.put('/updateCertificate', hasPermission, getCv, updateCertificate);
router.delete('/deleteCertificate', hasPermission, getCv, deleteCertificate);

router.put('/updateSkills', hasPermission, getCv, updateSkills);
router.put('/updateInterests', hasPermission, getCv, updateInterests);
router.put('/updateRemarks', isSuperAdmin, getCv, updateRemarks);
router.put('/updateForCompanies', isSuperAdmin, getCv, updateForCompanies);

router.put('/updatePublish', hasPermission, getCv, updatePublish);
router.post('/uploadVideo/:userId', getCv, getCvById, deleteOldIfExist, uploadProfileVideo, updateProfileVideo);
router.post('/getSignedUrl', getCv, getCvById, updateProfileVideo );
router.post('/pullCandidates', isSuperAdmin, getCandidates);

router.post('/updateProcedureStatus', isSuperAdmin, getCv, updateProcedureStatus);

module.exports = router;