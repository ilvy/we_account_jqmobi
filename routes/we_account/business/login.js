// import dbOperator from '../../../db/dbOperator';
// import response from '../response/response';
var dbOperator = require("../../../db/dbOperator"),
    urlencode = require('urlencode'),
    response = require("../response/response");
var redisClient = require("../../../db/redisOperator").client;

var tokenManager = {};
var login = (req,res,next)=>{
	var token = req.cookies['token'];
	if(req.cookies['token']){
		//TODO 验证cookie

	}else{
	    //TODO 验证登录信息
	}
	res.render("error",{})
}

var validateLogin = (req)=>{

}

var setCookie = (res,domain,account_name,maxAge)=>{
    res.cookie('token',generateToken(account_name,maxAge),{domain:domain,maxAge:maxAge});
}

var generateToken = (account_name,maxAge)=>{
	var timestamp = new Date().getTime();
	var token = [timestamp,account_name,Math.random().toString().split(".")[1]].join("");//TODO 加密
	tokenManager[token] = {
        maxAge:maxAge,
        expireTime:timestamp + maxAge
	}
	return token;
}

var checkToken = (req,res,next)=>{
	var token = req.cookies['token'];
	if(token && tokenManager[token]){
		if(!checkTokenIsExpired(tokenManager[token].expireTime)){
            next();
		}
	}
    res.redirect("/login.html");
}

var checkTokenIsExpired = (expireTime)=>{
    var now = new Date().getTime();
    return (now > expireTime);
}

var forgetPwd = (req,res)=>{
    var account_name = req.query.account_name,
        email = req.query.email;

}

exports.login = login;
exports.checkToken = checkToken;