// import dbOperator from '../../../db/dbOperator';
// import response from '../response/response';
var dbOperator = require("../../../db/dbOperator"),
    urlencode = require('urlencode'),
    response = require("../response/response"),
    crypto = require('crypto'),
    util = require('../util/util');
var redis = require("../../../db/redisOperator").client;
var mailServer = require('./emailCenter');

var tokenManager = {};
var login = (req,res)=>{
	// setCookie(res,'localhost',req.query.username,3600 * 1000);
 //    res.render('loginRedirect');return;
	//TODO 验证登录信息
	validateLogin(req,function(err,results){
        if(!err){
            if(results[0] && results[0][0] && results[0][0].open_id){
            	req.session.open_id = results[0][0].open_id;
            	setCookie(res,'localhost',req.query.username,3600);
            	res.render('loginRedirect',{redirectLink:'/we_account/live-room#billSystem'});
            }else{
            	res.render('login',{loginError:"用户名密码不匹配"});
            }
        }else{
            if(err.errorCode == -1){
            	res.render('')
            }
        }
	});
}

var validateLogin = (req,cb)=>{
    var query = req.query,
        username = query.username,
        pwd = query.pwd;
    if(!username || !pwd){
    	cb({errorCode:-1})
    	return;
    }
    dbOperator.query('call pro_login(?,?)',[username,pwd],function(err,results){
        cb(err,results);
    });
}

/**
 * 设置cookie
 * @param  {[type]} res          [description]
 * @param  {[type]} domain       [description]
 * @param  {[type]} account_name [description]
 * @param  {[type]} maxAge       [description]
 * @return {[type]}              [description]
 */
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
    //生成邮箱验证激活码,入库redis
    var shaStr = [timestamp,account_name,Math.random().toString().split(".")[1]].join("");//TODO 加密
    var actcode = crypto.createHash("sha1").update(shaStr).digest('hex');
    var now = new Date().getTime();
    redis.exp_setJson(['acd',actcode].join(""),{accountName:account_name,limitAge:now+3600},function(err,res){
    	if(!err){
    		//TODO 发送邮件
		    mailServer.sendMail({
			    to : email,
			    subject: "找回密码",
			    generateTextFromHTML : true,
			    html : "<a href='http://www.daidai2u.com/we_account/verify?acd="+actcode+"'>激活链接</a>"
			});
    	}
    });
    
}

/**
 * 验证邮箱激活邮件
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var verifyEmailActive = (req,res)=>{
    var actcode = req.query.actcode;
    if(!actcode){
    	//TODO 验证失败
    	res.render('acdInvalide',{error:"您的验证码有误或不存在"});
    	return;
    }
    //根据激活码从redis读取缓存信息
    redis.exp_getJson(['acd',actcode].join(""),function(err,res){
    	var acd_account = res.accountName,
    	    acd_limitAge = res.limitAge;
        var now = new Date().getTime();
        if(now <= acd_limitAge){//激活码未过期
        	res.render('modifyPsword',{accountName:acd_account});
        }else{//验证码已过期
        	res.render('acdInvalide',{error:"验证码已过期"});
        }
    });
    
}

/**
 * 退出登录，清理cookie
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var logout = (req,res)=>{

}

exports.login = login;
exports.checkToken = checkToken;
exports.verifyEmailActive = verifyEmailActive;
exports.forgetPwd = forgetPwd;