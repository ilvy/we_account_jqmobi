// import dbOperator from '../../../db/dbOperator';
// import response from '../response/response';
var dbOperator = require("../../../db/dbOperator"),
    urlencode = require('urlencode'),
    response = require("../response/response"),
    crypto = require('crypto'),
    util = require('../util/util');
var redis = require("../../../db/redisOperator").client;
var mailServer = require('./emailCenter');
var verifyServerConfig = require("../../../config/config").verifyServerConfig;
var operateLogger = require("../util/logUtil");
operateLogger = new operateLogger.Logger("operate");
var cookieDomain = verifyServerConfig.cookieDomain,
    port = verifyServerConfig.port;
var tokenManager = {};
var login = (req,res,type)=>{
	// setCookie(res,'10.22.0.36',req.query.username,3600 * 1000);
 //    res.render('loginRedirect');return;
    var isFromApp = req.query.fromapp;
    if(type == 'get'){
    	res.render('login',{error:"",fromapp:(isFromApp ? "?fromapp=1" : "")});
    	return;
    }
    // console.log("testetestsettet");
	//TODO 验证登录信息
	validateLogin(req,function(err,results){
        var now = new Date().getTime();
        if(!err){
            if(results[0] && results[0][0] && results[0][0].open_id){
            	req.session.openId = results[0][0].open_id;
            	setCookie(res,cookieDomain,req.query.username,3600 * 1000);
                operateLogger.logging([req.body.username,now,isFromApp,0],"info","login");
            	res.render('loginRedirect',{redirectLink:'/live-room.html'+(isFromApp ? "?fromapp=1" : "")+'#billSystem'});//{redirectLink:'/we_account/live-room.html'+(isFromApp ? "?fromapp=1" : "")+'#billSystem'}
            }else{
                operateLogger.logging([req.body.username,now,isFromApp,1],"error","login");//roomid-datetime-(device)-visitway-errorcode
            	res.redirect('login?lerr=1');//用户名密码不匹配fregt54re ccxaaasqw		
            }
        }else{
            if(err.errorCode == -1){
                operateLogger.logging([req.body.username,now,isFromApp,-1],"error","login");
            	res.redirect('login?lerr=2');//用户名密码不能为空
            }
        }
	});
}
/**
 * 验证登陆信息
 * @param  {[type]}   req [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
var validateLogin = (req,cb)=>{
    var body = req.body,
        username = body.username,
        pwd = body.pwd;
    if(!username || !pwd){
        console.log(username,pwd);
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
	token = crypto.createHash("sha1").update(token).digest('hex');
	tokenManager[token] = {
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

var findPwd = (req,res)=>{
    var roomId = req.body.username,
        email = req.body.email;
    //生成邮箱验证激活码,入库redis
    var timestamp = new Date().getTime();
    var shaStr = [timestamp,roomId,Math.random().toString().split(".")[1]].join("");//TODO 加密
    var actcode = crypto.createHash("sha1").update(shaStr).digest('hex');
    var now = new Date().getTime();
    var promise = new Promise(function(resolve,reject){
        dbOperator.query("call pro_verify_email(?,?)",[roomId,email],function(err,results){
        	if(!err){
                if(results[0] && results[0][0] && results[0][0].open_id){
                	resolve(results);
                }else{
                	reject({code:1});//失败原因：邮箱跟room_id不匹配
                }
        	}else{
        		reject({code:-1});//db执行失败
        	}
        })
    });
    promise.then(function(value){
		redis.exp_setJson(['acd',actcode].join(""),{accountName:roomId,limitAge:now+3600*1000},function(err,result){
	    	if(!err){
			    mailServer.sendMail({
				    to : email,
				    subject: "找回密码",
				    generateTextFromHTML : true,
				    html : "<p>亲爱的代go用户，</p><p>请点击以下链接找回您的密码，</p>"
                    +"<a href='http://"+cookieDomain+":"+port+"/we_account/verify?acd="+actcode+"'>激活链接</a>"
                    +"<p>如有疑问，请电联客服17722699552,</p><p>感谢您的使用!</p>"
				},function(err,results){
					if(err){
						res.render("sendMailResult",{code:0,title:"找回密码",result:"找回密码邮件发送失败，请重试！！！"});
						return;
					}
					res.render("sendMailResult",{code:200,title:"找回密码",result:"找回密码邮件发送成功，请在一个小时内前往验证并修改密码"});
				});
	    	}
	    });
    },function(error){
    	if(error.code == 1){
    		res.render('sendMailResult',{code:1,title:"找回密码",result:"对不起，您输入的邮箱有误，请查证后重试！"});
    	}else if(error.code == -1){
			res.render('sendMailResult',{code:-1,title:"找回密码",result:"对不起，系统有误，请重试！！！"});
    	}
    })
    
    
}

/**
 * 验证邮箱激活邮件
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var verifyEmailActive = (req,res)=>{
    var actcode = req.query.acd;
    if(!actcode){
    	//TODO 验证失败
    	res.render('acdVerifyResult',{code:0,error:"您的验证码有误或不存在"});
    	return;
    }
    //根据激活码从redis读取缓存信息
    redis.exp_getJson(['acd',actcode].join(""),function(err,result){
    	var acd_account = result.accountName,
    	    acd_limitAge = result.limitAge;
        var now = new Date().getTime();
        console.log(result.limitAge,now);
        if(now <= acd_limitAge){//激活码未过期
            res.cookie("actcode",actcode,{domain:cookieDomain,maxAge:acd_limitAge - now})
        	res.render('loginRedirect',{redirectLink:"/resetpwd.html?u="+acd_account});
        }else{//验证码已过期
        	res.render('acdVerifyResult',{code:-1,error:"验证码已过期"});
        }
    });
}

/**
 * 修改密码时检查凭据
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var beforeResetPwd = (req,res,next)=>{
    var actcode = req.cookies["actcode"];
    var now = new Date().getTime();
    if(actcode){
        redis.exp_getJson(['acd',actcode].join(""),function(err,result){
            var acd_limitAge = result.limitAge;
            var now = new Date().getTime();
            if(now <= acd_limitAge){
                next();
            }else{
                res.render('acdVerifyResult',{code:-1,error:"对不起，您的验证时间已过期，请重新申请！！！"});
            }
        })
    }else{
        res.render('acdVerifyResult',{code:-2,error:"对不起，您没有修改密码的权限！！！"});
    }
}

/**
 * 修改密码
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var resetPwd = (req,res)=>{
    var body = req.body;
    var accountName = body.account_name,
        pwd = body.pwd,
        confirmPwd = body.confirm_pwd;
    if(confirmPwd != pwd){
    	res.redirect("/resetpwd.html?u="+accountName+"&errcode=1");//密码不一致
    }else{
        dbOperator.query('call pro_reset_pwd(?,?)',[accountName,pwd],function(err,results){
            if(err){
                res.redirect("/resetpwd.html?u="+accountName+"&errcode=-1");//密码设置失败
            }else{//密码修改成功
                res.redirect("/we_account/login");
            }
        });
    }
}

/**
 * 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var getUserInfo = (req,res) =>{
    var session = req.session;
    var openId = session.openId;
    var userInfo;
    dbOperator.query('call pro_get_user_info(?)',[openId],function(err,rows){
        if(err){
            response.failed(-1,res,'系统错误，稍后重试！');
        }else{
            if(rows && rows[0] && (userInfo = rows[0][0])){
                response.success(userInfo,res,'');
            }else{
                response.failed(0,res,"当前用户为空");
            }
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
    var session = req.session;
    var openId = session.openId;
    session.openId = '';
    response.success(1,res,"");
}

exports.login = login;
exports.checkToken = checkToken;
exports.verify = verifyEmailActive;
exports.findPwd = findPwd;
exports.beforeResetPwd = beforeResetPwd;
exports.resetPwd = resetPwd;
exports.getUserInfo = getUserInfo;
exports.logout = logout;