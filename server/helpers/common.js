const User = require('../models/user');

module.exports.authenticate = (req, res, next) => {
    let token = req.headers['x-access-token'];
    User.validateToken(token, (err, serverStatus, decoded) => {
        if (err) {
            return res.status(serverStatus).json({ success: false, message: err });
        } else {
            req.decoded = decoded;
            next();
        }
    });
};


module.exports.sendError = (res, errMsg, serverStatus) => {
    if(serverStatus) {
        return res.status(serverStatus).json({ success: false, message: errMsg });
    }
    return res.json({ success: false, message: errMsg });
}