const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = Schema({
    isActive: Boolean,
    name: { type: String, required: true, index: true, unique: true, dropDups: true },
    est: {
        type: Date
    },
    address: String,
    admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
    adminsArcv: [{type: Schema.Types.ObjectId, ref: 'User'}],
    internships: [{type: Schema.Types.ObjectId, ref: 'Internship'}],
    logo: { key: String, url: String },
    phNum: String,
    website: String,
    abtUs: String,
    openings: [{
        title: String,
        sklRq: [String],        // Skill required max 5
        sklOp: [String],        // optional skills max 5
        descrip: String,        //  Project and dept description
        rspably: String,      // list of responsibilities
        pblshed: { type: Boolean, default: false },   // is a published opening
        achivd: { type: Boolean, default: false },   //is  an archived opening  
        likes: [{type: Schema.Types.ObjectId, ref: 'User'}]
    }],
    empSize: String
});

const Company = module.exports = mongoose.model('Company', companySchema);

module.exports.getCompanyInfoById = function(id, callback){
    Company.findById(id, "name est address admins adminsArcv logo phNum website empSize", { lean: true })
        .populate('admins', 'name email')
        .populate('adminsArcv', 'name email')
        .exec(callback);
}

module.exports.getCompanyNames = function (callback){
    Company.find({ isActive: true, name: { $ne: 'Willings, Inc.' } }, "name" , callback);
}

module.exports.getCompanyNameById = function (cmpId, callback){
    Company.findById( cmpId, "name", {lean: true} , (err, cmp)=>{
        if(err) return callback(err, null);
        callback(null, cmp.name);
    });
}

module.exports.updateCmpInfoById = function(cmpId, decodedToken, cmpInfo, callback){
    Company.findById(cmpId, (err, company) =>{
        if(err) return callback(err);
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            company.name = cmpInfo.name;
            company.est = cmpInfo.est;
            company.phNum = cmpInfo.phNum;
            company.address = cmpInfo.address;
            company.website = cmpInfo.website;
            company.empSize = cmpInfo.empSize;
            company.save(callback);
        }
        else return callback('not authorised', null);
    });
}

module.exports.addAdmin = function(companyId, newAdmin, callback){
    newAdmin.save((err, admin)=>{
        if (err) throw err;
        Company.findById(companyId, (err, company)=>{
            if(err) throw err;
            company.admins.push(admin._id);
            company.save(callback);
        })
    }); 
}

module.exports.addInternshipAndGetAdmins = function(companyId, InternshipId, callback){
    let admins = [];
    Company.findById(companyId)
    .populate({ path: 'admins', select: 'name email' })
    .exec((err, company)=>{
        if(err) return callback(err, null);
        admins = company.admins;
        company.internships.push(InternshipId);
        company.save((err)=>{
            if(err) return callback(err, null);
            callback(null, admins);
        });
    });
}

module.exports.getLogo = function(id, callback){
    Company.findById(id, 'logo', {lean: true}, (err, company) => {
        if(err) return callback(err, null);
        return callback(null, company.logo);
    });
}

module.exports.updateLogo = function(companyId, awsKey, awsUrl, callback){
    Company.findByIdAndUpdate(companyId, { $set: { logo: { key: awsKey, url: awsUrl } }}, callback);
}

module.exports.getSuggestions = function(searchTerm, callback){
    let query = { name: { $regex : searchTerm , $options: 'i' }};
    Company.find(query).select('name logo').limit(10).lean().exec((err, companies)=>{
        if(err) return callback(err, null);
        data = {};
        for( let company of companies){
            data[company.name] = company.logo.url
        }
        callback(null, data);
    });
}

module.exports.getCompanyIdByName = function(name, callback){
    Company.findOne({name:name}, '_id', {lean: true}, (err, company) =>{
        if(err) callback(err, null);
        callback(null, company._id);
    });
}

module.exports.getRecruitmentPage = function(companyId, decodedToken, callback){           //callback(err, cmpProfile, editRights)
    Company.findById(companyId, 'name est address logo website abtUs admins', (err, company) => {
        if(err) return callback(err, null, null);
        let editRights = false;
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            editRights = true;
        }
        else{
            company = {name:'', est:'', logo:{key:'', url:''}, website: '', abtUs: company.abtUs};
        }
        delete company.admins;
        callback(null, company, editRights);
    });
}

module.exports.getInternshipOpenings = function(companyId, decodedToken, callback){           //callback(err, cmpProfile, editRights)
    Company.findById(companyId, 'admins openings', (err, company)=>{
        if(err) return callback(err, null);
        if(!company.openings) company.openings=[];
        let editRights = false;
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            editRights = true;
        }
        else{
            //filter out non-active openings 
            company.openings = company.openings.filter(opening=> (!opening.achivd && opening.pblshed));
        }
        callback(null, company.openings, editRights);
    });
}

module.exports.getOpeningDetails = function(companyId, decodedToken, openingId, callback){
    Company.findById(companyId, 'openings admins', (err, company) =>{
        if(err) callback(err, null);
        let editRights = false;
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            editRights = true;
        }
        callback(null, company.openings.id(openingId), editRights);
    });
}

module.exports.upsertOpening = function(companyId, decodedToken, action, newOpening, callback){
    Company.findById(companyId, 'admins', {lean: true}, (err, company) => {
        if(err) return callback(err);
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            if(action == 'insert'){
                Company.findByIdAndUpdate(companyId, { $push:{ openings: newOpening} }, callback);
            }
            else {            //action == 'update'
                Company.findOneAndUpdate(
                    { '_id': companyId, 'openings._id': newOpening._id},
                    { $set:{ 
                        'openings.$.title': newOpening.title,
                        'openings.$.sklRq': newOpening.sklRq,
                        'openings.$.sklOp': newOpening.sklOp,
                        'openings.$.descrip': newOpening.descrip,
                        'openings.$.rspably': newOpening.rspably,
                        'openings.$.pblshed': newOpening.pblshed,
                        'openings.$.achivd': newOpening.achivd
                    } },
                    callback
                );
            }
        }
        else callback('not authorised');
    });
}

module.exports.addOpeningLiker = function(companyId, openingId, userId, callback){
    Company.findById(companyId, 'openings', (err, company) =>{
        if(err) return callback(err);
        company.openings.id(openingId).likes.push(userId);
        company.save(callback);
    });
}

module.exports.removeOpeningLiker = function(companyId, openingId, userId, callback){
    Company.findById(companyId, 'openings', (err, company) => {
        if(err) return callback(err);
        let index =  company.openings.id(openingId).likes.indexOf(userId);
        if(index != -1){
            company.openings.id(openingId).likes.splice(index, 1);
        }
        company.save(callback);
    });
}

module.exports.getAllPublicOpenings = function(callback){           //callback(err, companies)
    Company.aggregate(
        [
            { $match: {'openings.pblshed': true, 'openings.achivd': false} },
            { $project: {
                openings: { 
                    $filter: {
                        input: '$openings',
                        as: 'opening',
                        cond: {
                            $and:[
                                { $eq: ['$$opening.pblshed', true] },
                                { $eq: ['$$opening.achivd', false] }
                            ]
                        }
                    }
                }
            }}
        ],
        callback
    );
}

module.exports.updateAboutUs = function(cmpId, decodedToken, abtUs, callback){      //callback(err)
    Company.findById(cmpId, 'abtUs admins', (err, company) =>{
        if(err) return callback(err);
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            company.abtUs = abtUs;
            company.save(callback);
        }
        else return callback('not authorised');
    });
}

module.exports.archiveAdmin = function(cmpId, decodedToken, adminId, callback){             //callback(err, cmpInfo)
    Company.findById(cmpId, 'name est address admins adminsArcv logo phNum website empSize', (err, company) =>{
        if(err) return callback(err);
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            if(company.admins.indexOf(adminId)!= -1){
                company.adminsArcv.push(adminId);
                company.admins.remove(adminId);
                company.save(err => {
                    if(err) return callback(err, null);
                    const populateOpts = [{ path:'admins', select: 'name email' }, { path:'adminsArcv', select: 'name email' }]
                    Company.populate(company, populateOpts, callback);
                });
            }
            else return callback('no such admin present', null);
        }
        else return callback('not authorised', null);
    });
}

module.exports.restoreAdmin = function(cmpId, decodedToken, adminId, callback){            //callback(err, cmpInfo)
    Company.findById(cmpId, 'name est address admins adminsArcv logo phNum website empSize', (err, company) =>{
        if(err) return callback(err);
        if(decodedToken.access == 2 || company.admins.indexOf(decodedToken._id)!= -1){
            if(company.adminsArcv.indexOf(adminId)!= -1){
                company.admins.push(adminId);
                company.adminsArcv.remove(adminId);
                company.save(err => {
                    if(err) return callback(err, null);
                    const populateOpts = [{ path:'admins', select: 'name email' }, { path:'adminsArcv', select: 'name email' }]
                    Company.populate(company, populateOpts, callback);
                });
            }
            else return callback('no such admin present', null);
        }
        else return callback('not authorised', null);
    });
}

module.exports.getCmpIDbyName = function(cmpName, callback){
    Company.findOne({name: cmpName}, {lean:true}, callback);
}

module.exports.getCompaniesList = function(perPage, pageNumber, callback){
    Company.find({}, 'name', {lean:true})
    .populate({path: 'admins', select: 'name email'})
    .sort('-_id').skip((pageNumber-1)*perPage).limit(perPage)
    .exec(callback);
}