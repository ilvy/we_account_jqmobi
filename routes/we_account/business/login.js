// import dbOperator from '../../../db/dbOperator';
// import response from '../response/response';
var dbOperator = require("../../../db/dbOperator"),
    urlencode = require('urlencode'),
    response = require("../response/response");

var login = (req,res,next)=>{
    res.redirect('/we_account/live-room#billSystem');
}

exports.login = login;