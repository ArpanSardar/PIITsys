const express = require('express');
const router = express.Router();

//models
const User = require('../models/user');
const CvBuilder = require('../models/cvbuilder');
const ListCandidate = require('../models/listCandidate');

const validateWLMember = (req, res, next) => {
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded)=>{
        if(err) return res.status(serverStatus).json({ success: false, message: err });
        if(decoded.access != 2) return res.status(500).json({ success: false, message: 'not authorised' });
        next();
    });
}

router.get('/getSeasons', validateWLMember, (req, res) => {
    ListCandidate.getSeasons((err, seasons) => {
        if(err) return res.json({success: false, error: err});
        res.json({success: true, seasons: seasons});
    });
});

router.post('/createSeason', validateWLMember, (req, res) => {
    let seasonYr = req.body.year;
    User.getLastYearRegistrants(seasonYr, (err, entries) => {              //{year, _id, skypeId}
        if(err) return res.json({success: false, error: err});
        ListCandidate.addSeason(entries, (err) => {
            if(err) return res.json({success: false, error: err});
            res.json({success: true, message: 'season created successfully'});
        });
    });
});

router.post('/addCandidate', validateWLMember, (req, res) => {
    const userId = req.body.candidateId;
    const year = req.body.year; 
    User.getListCandidateDetails(userId, year, (err, listEntry) => {
        if(err) return res.json({success: false, error: err});
        ListCandidate.addCandidate(listEntry, (err) => {
            if(err) return res.json({success: false, error: err});
            res.json({success: true, message: 'candidate added successfully'});
        });
    });
});

router.post('/removeCandidate', validateWLMember, (req, res) => {
    ListCandidate.removeCandidate(req.body.candidateId, err => {
        if(err) return res.json({success: false, error: err});
        res.json({success: true, message: 'candidate removed successfully'});
    });
});

router.post('/updateCandidate', validateWLMember, (req, res)=>{
    ListCandidate.updateCandidate(req.body.candidate, (err) => {
        if(err) return res.json({success: false, error: err});
        res.json({success: true, message: 'candidate information updated successfully'});
    });
});

router.post('/getListOfYear', validateWLMember, (req, res) => {
    let seasonYr = req.body.year;
    ListCandidate.getCandidatesOfYear(seasonYr, (err, candidates) =>{
        if(err) return res.json({success: false, error: err});
        res.json({success: true, candidates: candidates});
    });
});

module.exports = router;
