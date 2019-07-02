const nodemailer = require('nodemailer');
const config = require('../config/config');

module.exports.sendActivationMail = function(recipient, link, callback){
    if(!recipient || !link) return callback('Missing data');
    
    let htmlBody = `
        ${recipient.companyName}<br>
        ${recipient.name}様<br>
        <br>
        お世話になっております。<br>
        WillingsのPIITsチームでございます。<br>
        <br>
        表題の件でご連絡させていただきました。<br>
        <br>
        PIITs2019の候補学生のご紹介に関しまして、<br>
        専用のオンラインポーターにて詳細をご共有させていただきます。<br>
        <br>
        こちらのポーターからは、<br>
        ・学生の1分間自己紹介動画<br>
        ・過去のインターンシップ/経験プロジェクト<br>
        ・使用可能言語<br>
        上記3点をご確認いただけます。<br>
        <br>
        こちらのメールにて貴社のアドミン設定を行っていただけたらと思います。<br>
        <br>
        使用方法に関しましては下記まとめさせていただきましたので、ご確認くださいませ。<br>
        <br>
        ---アカウント設定→学生プロフィール確認方法---<br>
        ① 下記リンクをクリック<br>
        <a href='${link}'>${link}</a><br><br>
        ② 自身のパスワードを設定<br>
        ③ システムにログインした状態で、先程お送りさせていただきました「PIITs2019_StudentList」のPISYS列に記載されているリンクをクリック<br>
        ④リンクから学生の詳細情報を確認することができます<br>
        ※ログイン後、貴社内でご自由にアドミン設定していただくことも可能です<br>
        <br>
        ご使用いただく際にご不明点等ございましたら、<br>
        お気軽にお申し付けくださいませ。<br>
        <br>
        引き続きどうぞよろしくお願いいたします。<br>
        </p>
    `;  //es6 template String with back ticks
    let mailOptions = {
        from: '"PIITs Team" <piits@willings.co.jp>',
        to: recipient.email,
        cc: '"members" <members@willings.co.jp>',
        subject: '【Willings】PIITs2019ポータルサイトへのご案内',
        text: '',
        html: htmlBody
    };
    config.nodemailerTransporter.sendMail(mailOptions, (err, info) => {
        if (err) return callback(err);
        callback(null);
    });
}

module.exports.sendPasswordResetMail = function(recipient, link, callback){
    if(!recipient || !link) return callback('Missing data');
    let htmlBody = `
        <p>Hi ${recipient.name},<br>
        <br>
        We received a Password reset request from this email id.<br>
        Kindly Inform us immediately if you think this wasn't you. otherwise please go through the link to reset your password.<br>
        kindly node that this link will only be active for 12 hours.<br>
        <br>
        <a href='${link}'>${link}</a><br>
        <br>
        Thank you.<br>    
    `;  //es6 template String with back ticks
    let mailOptions = {
        from: '"PIITs Team" <piits@willings.co.jp>',
        to: recipient.email,
        subject: 'Link to resting your Password',
        text: '',
        html: htmlBody
    };
    config.nodemailerTransporter.sendMail(mailOptions, (err, info) => {
        if (err) return callback(err);
        callback(null);
    });
}

module.exports.sendEmailVerificationMail = function(recipient, link, callback){
    if(!recipient || !link) return callback('Missing data');
    let htmlBody = `
        <p>Hi ${recipient.name},<br>
        <br>
        We received a email verification request for this email id.<br>
        Kindly Inform us immediately if you think this wasn't you. otherwise please go through the link to verify your email address.<br>
        <br>
        <a href='${link}'>${link}</a><br>
        <br>
        Thank you.<br>    
    `;  //es6 template String with back ticks
    let mailOptions = {
        from: '"PIITs Team" <piits@willings.co.jp>',
        to: recipient.email,
        subject: 'Link to verifying your email address on Pisys',
        text: '',
        html: htmlBody
    };
    config.nodemailerTransporter.sendMail(mailOptions, (err, info) => {
        if (err) return callback(err);
        callback(null);
    });
}


module.exports.initiateInternshipMails = function(admins, link, callback){       //callback(success, err)
    let errArr=[];
    for(let admin of admins) {
        let htmlBody = `
            <p>Hi ${admin.name},<br>
            <br>
            We have added a new intership associated with your company.<br>
            Kindly visit the internship page here:<br>
            <br>
            <a href='${link}'>${link}</a><br>
            <br>
            We request you to fill in all the necessary basic details for the internship.
            Thank you.<br>
        `;  //es6 template String with back ticks
        let mailOptions = {
            from: '"PIITs Team" <piits@willings.co.jp>',
            to: admin.email,
            subject: 'Invitation to edit basic details of newly added Internship',
            text: '',
            html: htmlBody
        };
        config.nodemailerTransporter.sendMail(mailOptions, (err, info) => {
            if (err)  errArr.push({error: err, mail: admin.mail});
        });
    }
    if(errArr.length == admins.length) return callback(false, 'email sending failed to all the admins');
    else if(errArr.length) return callback(true, 'Email sending failed to some of the admins')
    callback(true , null);
}

module.exports.notifyCandidateBasicInfo = function(candidate, link, callback){         //callback(err)
    if(!candidate.email) return callback('Missing candidate Email');
    let htmlBody = `
        <p>Hi ${candidate.name},<br>
        <br>
        The basic info of your intership has just been updated.<br>
        Check it out here:<br>
        <br>
        <a href='${link}'>${link}</a><br>
        <br>
        Thank you.<br>    
    `;  //es6 template String with back ticks
    let mailOptions = {
        from: '"PIITs Team" <piits@willings.co.jp>',
        to: candidate.email,
        subject: 'Basic details of you intership have been updated',
        text: '',
        html: htmlBody
    };
    config.nodemailerTransporter.sendMail(mailOptions, (err, info) => {
        if (err) return callback(err);
        callback(null);
    });
}

module.exports.sendcmtTagmails = function(cmtData, taggedBy, recipients, callback){         //callback(err)
    let link = 'https://pisys.willings.co.jp/internship' + camtdata.id + '/weeklyReports';
    let errStack = []
    let htmlBody = `
        You were tagged in comment by ${taggedBy} :<br>
        ${cmtData.htmlBody}<br><br>
        Check it out here:<br>
        <br>
        <a href='${link}'>${link}</a><br>  
    `;  //es6 template String with back ticks
    recipients.forEach(mailId => {
        let mailOptions = {
            from: '"PIITs Team" <piits@willings.co.jp>',
            to: mailId,
            subject: 'tagged in comment by ' + taggedBy,
            text: '',
            html: htmlBody
        };
        config.nodemailerTransporter.sendMail(mailOptions, (err, info) => {
            if (err) errStack.push(err);
        }); 
    });
    if(errStack.length == recipients.length) return callback('Email sending failed for all the tags');
    if(errStack.length) return callback('Email sending failed for some of the tags');
    callback(null);
}
