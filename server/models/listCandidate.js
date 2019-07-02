const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listCandidateSchema = Schema({
    year: { type:Number, index: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    education: {
        schoolName: String,
        fieldOfStudy: String,
        grade: String,
        startDate: Date,
        endDate: Date
    },
    isVeg: String,
    IntnshpExp: String,
    skls: [String],
    skypeId: String,
    cmt: String,             //interviewer comment
    aval: String,            //availability for internship
    tchScr: String,           //technical assessment score
    homeTown: String,
    familyBack: String,
    hobbies: String            //hobbies and interests
});

const ListCandidate = module.exports = mongoose.model('ListCandidate', listCandidateSchema);

module.exports.getCandidatesOfYear = function(year, callback){
    ListCandidate.find({year: year}, {lean: true}, callback);
}

module.exports.addSeason = function(candidates, callback){
    ListCandidate.insertMany(candidates, callback);
}

module.exports.removeSeason = function(year){
    ListCandidate.deleteMany({year: year}, callback);
}

module.exports.addCandidate = function(candidate, callback){
    newCandi = new ListCandidate(candidate);
    newCandi.save(callback);
}

module.exports.removeCandidate = function(candidateId, callback){
    ListCandidate.deleteOne({candidate: candidateId}, callback);
}

module.exports.updateCandidate = function(candidate, callback){
    ListCandidate.findOneAndUpdate(
        {candidate: candidate._id},
        {$set:{
            education:{},
            isVeg: candidate.isVeg,
            IntnshpExp: candidate.IntnshpExp,
            skls: candidate.skls,
            skypeId: candidate.skypeId,
            cmt: candidate.cmt,             //interviewer comment
            aval: candidate.aval,            //availability for internship
            tchScr: candidate.tchScr,           //technical assessment score
            homeTown: candidate.homeTown,
            familyBack: candidate.familyBack,
            hobbies: candidate.hobbies
        }},
        callback);
}

module.exports.getSeasons = function(callback){
    ListCandidate.distinct(year, callback);
}

/*Functions to take care of updates in the cvBuilder*/
module.exports.updateEducation = function(candidateId, education){
    delete education._id;
    delete education.isLatest;
    ListCandidate.findOneAndUpdate({candidate: candidateId}, { $set: { education: education }}, (err)=>{
        if(err) throw err;
    });
}

module.exports.updateSkills = function(candidateId, skills){
    ListCandidate.findOneAndUpdate({candidate: candidateId}, { $set: { skls: skills }}, (err)=>{
        if(err) throw err;
    });
}

module.exports.updateSkype = function(candidateId, skypeId){
    ListCandidate.findOneAndUpdate({candidate: candidateId}, { $set: { skypeId: skypeId }}, (err)=>{
        if(err) throw err;
    });
}