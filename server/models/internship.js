const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const internshipSchema = Schema({
    active: Boolean,
    projectName: { type: String, default: '' },
    projectNickName: { type: String, default: '' },
    designation: { type: String, default: '' },
    supervisors: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    location: String,   //Copy Company branch location here...!
    description: { type: String, default: '' },
    cmpGivenEmail: { type: String, default: '' },
    candidate: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    company: {type: Schema.Types.ObjectId, ref: 'Company', required: true},
    startDate: {type: Date, default: Date.now},
    endDate: {type: Date, default: Date.now},
    accommodation: {
        cost: Number,
        address: String,
        mIn: Date,              //move in date.
        mOut: Date,             //move out date.
        agency: {
            name: String,
            email: String,
            phNum: String
        },
        cmnts: String
    },
    payments: [{ amt: Number, date: Date, acptd: Boolean}],
    suica: {
        cardNo: Number,
        line: String,
        from: String,
        to: String,
        name: String,       //issuing company name
        issued: Date,
        expiry: Date,
        acptd: Boolean,
        cmnts: String
    },
    wifi: {
        cost: Number,
        agency: {
            name: String,
            email: String,
            phNum: String
        },
        sDate: Date,                    //Start Date
        rDate: Date,                    //Return Date
        cmnts: String,
        acptd: Boolean
    },
    wRepts: [{                                     //student weekely reports
        rept: {
            difficulty: Number,             // 1 to 10
            learnt: String,                 //what you learnt through week
            tech: String,                   //Technologies Used 
            supQuery: String,                //query for Supervisors
            interesting: String,            //what you found interesting in the week
            other: String,                  //any other question
            img: {key: String, url: String},    // Snapshot of the week 
            updated: {type: Date, default: Date.now}
        },
        cmnts: [{
            body:String,
            by:{type:Schema.Types.ObjectId, ref: 'User'},           //Only WL members allowed to comment for now 
            updated: Date
        }],
        week:{sDate: Date, eDate: Date}         //start and end date
    }],
    herRepts:[{                             //hearing reports to be uploaded by WL members after doing hearing at the company
        rept: String,
        by:{type:Schema.Types.ObjectId, ref: 'User'},
        hearingOn: Date,
        updated: Date
    }],
    valuation: String,
    jobOffer: {
        offered: {status: Boolean, on: Date, file: { name: String, key: String, } },
        accepted: {status: Boolean, on: Date, file: { name: String, key: String, } }
    },
    feedbacks:{
        sFeedback: {body: String, updated: Date},
        cFeedback: {body: String, updated: Date},
        comments: [{
            body:String,
            by:{type:Schema.Types.ObjectId, ref: 'User'},           //Only WL members allowed to comment
            updated: Date
        }]
    }
});

const Internship = module.exports = mongoose.model('Internship', internshipSchema);

function validateEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isValidCandidate(internshipId, candidateId, callback){
    Internship.findById(internshipId, 'candidate', { lean: true }, (err, internship)=>{
        if(err) return callback(err, null);
        if(internship.candidate == candidateId) return callback(null, true);
        callback('Not authorised to access this Internship', false);
    });
}

function isValidAdmin(internshipId, supervisorId, callback){
    Internship.findById(internshipId, 'supervisors', { lean: true }, (err, internship)=>{
        if(err) return callback(err, null);
        if(internship.supervisors.includes(supervisorId)) return callback(null, true);
        callback('Not authorised to access this Internship', false);
    });
}

                                /*=====exported functions=====*/

module.exports.getInternshipBasicInfo = function(internshipId, decoded, callback){              //callback(err, internship)
    Internship.findById(internshipId, "projectName description designation startDate endDate cmpGivenEmail")
    .populate({path: 'candidate', select: '_id name DP'})
    .populate({path: 'company', select: '_id name admins'}).lean().exec((err, internship)=>{
        if(err) callback(err, null);
        if(decoded.access == 0){
            if(decoded._id != internship.candidate._id) return callback('not valid candidate', null);
        }
        if(decoded.access == 1){
            if(!internship.company.admins.some(admin=>{return admin.equals(decoded._id)})) return callback('not valid company admin', null);
        }
        callback(null, internship);
    });
}

module.exports.getInternshipsOfYear = function(year, callback){
    query = {startDate: {$gte: new Date(year, 00, 00), $lt: new Date(year, 11, 32)}};
    Internship.find(query)
    .populate({path: 'candidate', select: 'name'})
    .populate({path: 'company', select: 'name'})
    .exec(callback);
}

module.exports.getCandidateAndWRepts = function(internshipId, callback){            //cb(err, candidateId, Wrepts)
    Internship.findById(internshipId, 'candidate wRepts', { lean: true }, (err, internship)=>{
        if(err) return callback(err, null, null);
        else callback(null, internship.candidate, internship.wRepts);
    });
}

module.exports.upsertSReport = function(internshipId, data, callback){            //cb(err, wRepts)
    Internship.findById(internshipId, 'wRepts', (err, internship)=>{
        if(err) return callback(err, null);
        if(data.index == -1){
            internship.wRepts.push({
                rept: data.rept,
                week: data.week,
                cmnts:[]
            });
        }
        else{
            internship.wRepts[data.index].rept = data.rept;
            internship.wRepts[data.index].week = data.week;
        }
        internship.save((err, newInternship)=>{
            if(err) callback(err, null);
            callback(null, newInternship.wRepts);
        });
    });
}

module.exports.getAcceptanceLetter = function(internshipId, userId, callback){
    isValidCandidate(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err);
        Internship.findById(internshipId, 'jobOffer', { lean: true }, (err, internship) => {
            if(err) return callback(err, null);
            return callback( null, internship.jobOffer.accepted.file);
        });
    });
}

module.exports.uploadAcceptanceLetter = function(internshipId, originalName, awsKey, callback){
    isValidCandidate(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err);
        Internship.findById(internshipId, 'jobOffer', (err, internship)=>{
            if(err) return callback(err);
            internship.jobOffer.accepted = {status: true, on: new Date(), file:  { name: originalName, key: awsKey }};
            internship.save(callback);
        });
    });
}

module.exports.upsertSFeedback = function(internshipId, userId, body, callback){
    isValidCandidate(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err);
        Internship.findById(internshipId, (err, internship)=>{
            if(err) return callback(err);
            internship.feedbacks.sFeedback = {body: body, updated: new Date()};
            internship.save(callback);
        });
    });
}

module.exports.upsertCReport = function(internshipId, userId, week, body, callback){
    isValidAdmin(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err);
        Internship.findById(internshipId, 'wReports', (err, internship)=>{
            if(err) throw err;
            internship.wReports[week-1].cReport = {body: body, updated: new Date()};
            internship.save(callback);
        });
    });
}

module.exports.upsertValuation = function(internshipId, userId, valuation, callback){
    isValidAdmin(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err);
        Internship.findByIdAndUpdate(internshipId, { $set: {valuation: valuation }}, {upsert: true}, callback);
    });
}

module.exports.getOfferLetter = function(internshipId, userId, callback){
    isValidAdmin(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err, null);
        Internship.findById(internshipId, 'jobOffer', { lean: true }, (err, internship) => {
            if(err) return callback(err);
            return callback(null, internship.jobOffer.offered.file);
        });
    });
}

module.exports.uploadOfferLetter = function(internshipId, userId, originalName, awsKey, callback){
    isValidAdmin(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err);
        Internship.findById(internshipId, (err, internship)=>{
            if(err) return callback(err);
            internship.jobOffer.offered = {status: true, on: new Date(), file: { name: originalName, key: awsKey }};
            internship.save(callback);
        });
    });
}

module.exports.upsertCFeedback = function(internshipId, userId, body, callback){
    isValidAdmin(internshipId, userId, (err, isValid)=>{
        if(err) return callback(err);
        Internship.findById(internshipId, (err, internship)=>{
            if(err) throw err;
            internship.feedbacks.cFeedback = {body: body, updated: new Date()};
            internship.save(callback);
        });
    });
}

module.exports.upsertBasicInfo = function(internshipId, decodedToken, basicInfo, callback){         //callback(err, candidate);
    if(decodedToken.access == 2){
        Internship.findById(internshipId)
        .populate({path: 'candidate', select: 'name email', options:{ lean: true}})
        .exec((err, internship)=>{
            if(err) return callback(err, null);
            let candidate = internship.candidate;
            internship.projectName = basicInfo.projectName;
            internship.designation = basicInfo.designation;
            internship.startDate = basicInfo.startDate;
            internship.endDate = basicInfo.endDate;
            internship.supervisors = basicInfo.supervisors;
            internship.location = basicInfo.location;
            internship.description = basicInfo.description;
            internship.cmpGivenEmail = basicInfo.cmpGivenEmail;
            internship.save(err=>{
                if(err) return callback(err, null);
                callback(null, candidate);
            });
        });
    }
    else {
        Internship.findById(internshipId)
        .populate({path: 'company', select: 'admins'})
        .populate({path: 'candidate', select: 'name email', options:{ lean: true}})
        .exec((err, internship)=>{
            if(err) return callback(err, null);
            if(internship.company.admins.indexOf(decodedToken._id) == -1) return callback('Unauthorised', null);
            let candidate = internship.candidate;
            internship.projectName = basicInfo.projectName;
            internship.designation = basicInfo.designation;
            internship.startDate = basicInfo.startDate;
            internship.endDate = basicInfo.endDate;
            internship.supervisors = basicInfo.supervisors;
            internship.location = basicInfo.location;
            internship.description = basicInfo.description;
            internship.cmpGivenEmail = basicInfo.cmpGivenEmail;
            internship.save(err=>{
                if(err) return callback(err, null);
                callback(null, candidate);
            });
        })
    }
}

module.exports.upsertWReportComment = function(data, userId, callback){         //callback(err, updated array of comments)
    Internship.findById(data.id, 'wRepts', (err, internship)=>{
        if(err) return callback (err, null);
        if(data.cmtIndex == -1){                  //new not update
            internship.wRepts[data.reptIndex].cmnts.push({body: data.body, by: userId, updated: new Date()});
        }
        else{
            internship.wRepts[data.reptIndex].cmnts[data.cmtIndex] = {body: data.body, by: userId, updated: new Date()};
        }
        internship.save((err)=>{
            if(err) return callback (err, null);
            Internship.findById(data.id, 'wRepts', {lean:true, populate:{path:"wRepts.cmnts.by", select:'name DP'}}, (err, internship)=>{
                if(err) return callback (err, null);
                callback(null, internship.wRepts[data.reptIndex].cmnts);
            });
        });
    });
}

module.exports.upsertFeedbacksComment = function(internshipId, commentNo, body, memberId, callback){
    Internship.findById(internshipId, 'feedbacks', (err, internship)=>{
        if(err) throw err;
        if(commentNo){
            internship.feedbacks.comments[commentNo] = {body: body, by:memberId, updated: new Date()};
        }
        else{
            internship.feedbacks.comments.push({body: body, by:memberId, updated: new Date()});
        }
        internship.save(callback);
    });
}

module.exports.getAccommodation = function(intnshpId, decodedToken, callback){
    Internship.findById(intnshpId, 'supervisors candidate accommodation', { lean: true })
    .populate({path:'company', select: 'admins'}).exec((err, internship)=>{
        if(err) return callback(err, null);
        let requesterId = decodedToken._id;
        let requesterAccess = decodedToken.access;
        if(requesterAccess == 2) return callback(null, internship.accommodation);
        if(requesterAccess == 0){
            if(requesterId == internship.candidate){
                delete internship.accommodation.cost;
                delete internship.accommodation.cmnts;
                return callback(null, internship.accommodation);
            }
            else return callback('Unauthorized', null);
        }
        if(requesterAccess == 1){
            if(internship.company.admins.some(admin=>{return admin.equals(requesterId)})){
                delete internship.accommodation.cost;
                delete internship.accommodation.cmnts;
                return callback(null, internship.accommodation);
            }
            else return callback('Unauthorized', null);
        }
    });
}

module.exports.upsertAccommodation = function(internshipId, accommodation, callback){
    Internship.findByIdAndUpdate(internshipId, { $set: {accommodation: accommodation}}, { lean: true, new:true }, (err, newInternship)=>{
        if(err) return callback(err, null);
        callback(null, newInternship.accommodation);
    });
}

module.exports.getSuica = function(intnshpId, decodedToken, callback){
    let requesterId = decodedToken._id;
    let requesterAccess = decodedToken.access;
    Internship.findById(intnshpId, 'candidate suica', { lean: true }, (err, internship)=>{
        if(err) return callback(err, null);
        if(requesterAccess == 2) return callback(null, internship.suica);
        if(requesterId == internship.candidate){
            delete internship.suica.cmnts;
            return callback(null, internship.suica);
        }
        callback('Unauthorized', null);
    });
}

module.exports.upsertSuica = function(internshipId, suica, callback){
    Internship.findByIdAndUpdate(internshipId, { $set: { suica: suica }}, { lean: true, new:true }, (err, newInternship)=>{
        console.log(internshipId, suica);
        if(err) return callback(err, null);
        callback(null, newInternship.suica);
    });
}

module.exports.getWiFi = function(intnshpId, decodedToken, callback){
    Internship.findById(intnshpId, 'candidate wifi', { lean: true }, (err, internship)=>{
        if(err) return callback(err, null);
        let requesterId = decodedToken._id; 
        let requesterAccess = decodedToken.access;
        if(requesterAccess == 2) return callback(null, internship.wifi);
        if(requesterId == internship.candidate){
            delete internship.wifi.cmnts;
            return callback(null, internship.wifi);
        }
        callback('Unauthorized', null);
    });
}

module.exports.upsertWiFi = function(internshipId, wifi, callback){
    Internship.findByIdAndUpdate(internshipId, { $set: { wifi: wifi }}, { lean: true, new:true }, (err, newInternship)=>{
        if(err) return callback(err, null);
        callback(null, newInternship.wifi);
    });
}

module.exports.getPayments = function(intnshpId, decodedToken, callback){
    Internship.findById(intnshpId, 'payments', { lean: true }, (err, intnshp)=>{
        if(err) return callback(err, null);
        callback(null, intnshp.payments);
    });
}

module.exports.getWRepts = function(intnshpId, decodedToken, callback){
    let requesterId = decodedToken._id;
    let requesterAccess = decodedToken.access;
    Internship.findById(intnshpId, 'candidate wRepts', { lean: true })
    .populate({path:"wRepts.cmnts.by", select:'name DP'})
    .exec((err, internship)=>{
        if(err) return callback(err, null); 
        if(requesterAccess == 2) return callback(null, internship.wRepts);
        if(requesterId == internship.candidate){
            let count = internship.wRepts.length;
            for(let i=0; i<count; i++){
                delete internship.wRepts[i].cmnts;
            }
            return callback(null, internship.wRepts);
        }
        callback('Unauthorized', null);
    });
}

module.exports.upsertPayment = function(internshipId, data, callback){
    Internship.findById(internshipId, 'payments', (err, internship)=>{
        if(err) return callback(err, null);
        if(data.index!=-1){
            internship.payments[data.index] = { amt: data.amt, date: data.date, acptd: data.acptd };
        }
        else{
            internship.payments.push({ amt: data.amt, date: data.date, acptd: data.acptd });
        }
        internship.save((err, updatedInternship)=>{
            if(err) callback(err, null);
            callback(null, updatedInternship.payments)
        });
    });
}

module.exports.deletePayment = function(internshipId, paymentNo, callback){         //cb(err, payments)
    Internship.findById(internshipId, 'payments', (err, internship)=>{
        if(err) return callback(err);
        internship.payments.splice(paymentNo, 1);
        internship.save((err)=>{
            if(err) throw err;
            callback(null, internship.payments);
        });
    });    
}

module.exports.markPaymentAccepted = function(internshipId, paymentNo, callback){
    Internship.findById(internshipId, 'payments', (err, internship)=>{
        if(err) return callback(err);
        internship.payments[paymentNo].acpted = true;
        internship.save(callback);
    });    
}

module.exports.deleteWReportComment = function(data, userId, callback){
    Internship.findById(data.id, 'wRepts', (err, internship)=>{
        if(err) return callback(err);
        if(internship.wRepts[data.reptIndex].cmnts[data.cmtIndex].by != userId) return callback('not authorised to delete the comment');
        internship.wRepts[data.reptIndex].cmnts.splice(data.cmtIndex, 1);
        internship.save(callback);
    });    
}

module.exports.deleteFeedbackComment = function(internshipId, commentNo, userId, callback){
    Internship.findById(internshipId, 'feedbacks', (err, internship)=>{
        if(err) throw err;
        if(internship.feedbacks.comments[commentNo].by != userId) return callback('not authorised to delete the comment');
        internship.feedbacks.comments.splice(commentNo, 1);
        internship.save(callback);
    });
}