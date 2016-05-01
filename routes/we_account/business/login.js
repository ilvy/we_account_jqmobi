// import dbOperator from '../../../db/dbOperator';
// import response from '../response/response';
var dbOperator = require("../../../db/dbOperator"),
    urlencode = require('urlencode'),
    response = require("../response/response"),
    crypto = require('crypto'),
    util = require('../util/util');
var redis = require("../../../db/redisOperator").client;
var mailServer = require('./emailCenter');

var cookieDomain = '10.22.0.36';
var tokenManager = {};
var login = (req,res,type)=>{
	// setCookie(res,'10.22.0.36',req.query.username,3600 * 1000);
 //    res.render('loginRedirect');return;
    if(type == 'get'){
    	res.render('login',{error:""});
    	return;
    }
    console.log("testetestsettet");
	//TODO 验证登录信息
	validateLogin(req,function(err,results){
        if(!err){
            if(results[0] && results[0][0] && results[0][0].open_id){
            	req.session.open_id = results[0][0].open_id;
            	setCookie(res,cookieDomain,req.query.username,3600 * 1000);
            	res.render('loginRedirect',{redirectLink:'/we_account/live-room#billSystem'});
            }else{
            	res.redirect('login?lerr=1');//用户名密码不匹配
            }
        }else{
            if(err.errorCode == -1){
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
	    		//TODO 发送邮件
			    mailServer.sendMail({
				    to : email,
				    subject: "找回密码",
				    generateTextFromHTML : true,
				    html : "<a href='http://"+cookieDomain+":870/we_account/verify?acd="+actcode+"'>激活链接</a>"
				},function(err,results){
					if(err){
						res.render("sendMailResult",{result:"找回密码邮件发送失败，请重试！！！"});
						return;
					}
					res.render("sendMailResult",{result:"找回密码邮件发送成功，请在一个小时内前往验证并修改密码"});
				});
	    	}
	    });
    },function(error){
    	if(error.code == 1){
    		res.render('sendMailResult',{result:"对不起，您输入的邮箱有误"});
    	}else if(error.code == -1){
			res.render('sendMailResult',{result:"对不起，系统有误，请重试！！！"});
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
    	res.render('acdVerifyResult',{error:"您的验证码有误或不存在"});
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
        	res.render('acdVerifyResult',{error:"验证码已过期"});
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
                res.render('acdVerifyResult',{error:"对不起，您的验证时间已过期，请重新申请！！！"});
            }
        })
    }else{
        res.render('acdVerifyResult',{error:"对不起，您没有修改密码的权限！！！"});
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
 * 退出登录，清理cookie
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var logout = (req,res)=>{

}

exports.login = login;
exports.checkToken = checkToken;
exports.verify = verifyEmailActive;
exports.findPwd = findPwd;
exports.beforeResetPwd = beforeResetPwd;
exports.resetPwd = resetPwd;