/**
 * Created by Administrator on 14-12-22.
 */

var dbOperator = require("../../../db/dbOperator"),
    response = require("../response/response"),
    accountInfo = require("../accountInfo"),
    tokenManager = require("../access_token"),
    dataviewConfig = require("../../../config/config").dataviewConfig,
    access_token = require('../access_token'),
    wxsign = require('../sign'),
    util = require("../util/util"),
    pinyinTransfer = require('../util/pinyinTransfer');
var logger = require("log4js").getLogger("publish_account");
var crypto = require('crypto'),
    mailServer = require('./emailCenter');
var redis = require("../../../db/redisOperator").client;
var verifyServerConfig = require("../../../config/config").verifyServerConfig;
logger.setLevel("INFO");

function applyAccount(data,res){

}

/**
 *  TODO 注册使用md5加密密码
 * @param req
 * @param res
 */
function register(req,res){
    var body = req.body;
    var accountName = emailAccount = body.username,
        pwd = body.pwd;

}

function checkUser(open_id,cb){
    var openId = open_id;
    dbOperator.query("call pro_check_register_by_weAccount(?)",[openId],function(err,rows){
        if(err){
            logger.error("call pro_check_register_by_weAccount err:",err);
        }
        cb(err,rows[0]);
    });
}

/**
 * 注册请求 
*/
function register(req,res,next){
    var body = req.body;
    var session = req.session;
    var openId = session.openId;
    var now = new Date().getTime();
    if(!openId){
        openId = ['lopid_',now,Math.random().toString()].join("");
    }
    var email = body.username,
        weixin = body.weixin,
        pwd = body.pwd;
    var md5Args = [email,weixin,pwd];
    //生成邮箱验证激活码,入库redis
    var shaStr = md5Args.concat(now).join("");//TODO 加密
    var actcode = crypto.createHash("sha1").update(shaStr).digest('hex');
    redis.exp_setJson(actcode,{
        email:email,
        weixin:weixin,
        pwd:pwd,
        openId:openId,
        limitAge:now + 900000
    },function(err,rdsres){
        mailServer.sendMail({
            to : email,
            subject: "代go账号注册",
            generateTextFromHTML : true,
            html : "<p>亲爱的代go用户，</p><p>请点击以下链接激活您的账号，</p><a href='http://"+verifyServerConfig.cookieDomain+":"+verifyServerConfig.port+"/we_account/register_mail_verify?acd="+actcode+"'>注册用户激活链接</a><p>如有疑问，请电联客服17722699552，</p><p>感谢您的使用！</p>"
        },function(err,results){
            if(err){
                console.log(err.name);
                if(err.name == 'RecipientError'){
                    res.render("sendMailResult",{code:0,title:"注册账号",result:"代go账号注册确认邮件发送失败，请确认您的邮箱<"+email+">是否正确！！！"});
                }else{
                    res.render("sendMailResult",{code:0,title:"注册账号",result:"账号注册失败，请重试！！！"});
                }
                return;
            }
            res.render("sendMailResult",{code:200,title:"注册账号",result:"感谢您的注册，验证邮件发送成功，请在一个小时内前往验证并修改密码!"});
        });
    });
    
}


/**
 * 注册邮箱验证
 */
function registerMailVerify(req,res){
    var now = new Date().getTime();
    var query = req.query,
        actcode = query.acd;
    redis.exp_getJson(actcode,function(err,rdsres){
        if(!err){
            var username = rdsres.email,
            pwd = rdsres.pwd,
            weixin = rdsres.weixin, 
            openId = rdsres.openId,
            roomId;
            if(now < rdsres.limitAge){
                dbOperator.query('call pro_register(?,?,?,?,?)',[openId,username,username,pwd,weixin],function(err,rows){
                    if(err){
                        logger.error(err);
                        res.redirect("/err.html");
                    }else{
                        logger.info("call pro_register results:",rows);
                        if(rows && rows[0] && (roomId = rows[0][0].room_id)){
                            mailServer.sendMail({
                                to : username,
                                subject: "代go账号",
                                generateTextFromHTML : true,
                                html : "<p>亲爱的代go用户，</p><h3>您的代go登录账号:"+roomId+"</h3><p>感谢您的支持！</p>"
                            },function(err,results){
                                if(err){
                                    logger.error('代go账号发送邮件失败:',err);
                                }
                            });
                        }
                        res.render("sendMailResult",{code:200,title:"注册账号",result:"注册成功，您的代go账号是:"+roomId+",若有遗忘，您也可前往注册邮箱查看，感谢您的使用!"});
                        // res.redirect('/we_account/live-room#billSystem');
            //            asyncAccountInfoFromWeix(openId);
                    }
                });
            }else{
                // 注册邮件超时
                res.render('registerResult',{result:"您的认证邮件已过时，请重新注册"});
            }
            return;
        }
        res.render('registerResult',{result:"系统错误，请重试！(或微信联系478283225，我们技术支持哥哥)"});
    });
    
}

/*
 * 检查目标邮箱是否已经注册过
 */
function checkEmail(req,res){
    var session = req.session,
        openId = session.openId;
    var query = req.query,
        email = query.email;
    dbOperator.query('call pro_check_user_email(?)',[email],function(err,rows){
        if(err){
            logger.error(err);
            response.failed("-1",res,"");
        }else{
            logger.info("call pro_check_user_email results:",rows);
            if(rows[0] && rows[0][0] && rows[0][0].open_id){
                if(openId){
                    response.success(1,res);//注册过且当前在登录状态
                }else{
                    response.success(2,res);//注册过，但是当前不在登录态
                }
                
            }else{
                response.success(0,res);//未注册过
            }
            
        }
    });
}

/*
 * 绑定微信账号和邮箱账号
 */
function bindAccount(req,res){
    var session = req.session,
        openId = session.openId;
    var query = req.query,
        email = query.email;
    if(!openId){
        response.failed("0",res,"");
        return;
    }
    dbOperator.query('call pro_bind_account(?,?)',[openId,email],function(err,rows){
        if(err){
            logger.error(err);
            response.failed("-1",res,"");
        }else{
            logger.info("call pro_bind_account ok");
            if(rows[0] && rows[0][0] && rows[0][0].open_id){
                response.success(1,res);//注册过
            }else{
                response.success(0,res);//未注册过
            }
            
        }
    });
}

/**
 * 同步微信账户信息
 * @param openid
 */
function asyncAccountInfoFromWeix(openid,res){
    accountInfo.getAccountInfo(tokenManager.access_token,openid,function(accountInfo){
        logger.debug(accountInfo);
        accountInfo = JSON.parse(accountInfo);
        if(res){
            response.success(accountInfo,res);
        }
        if(!(accountInfo && accountInfo.nickname)){
            return;
        }
        var args = [openid,accountInfo.nickname,accountInfo.headimgurl,accountInfo.sex,accountInfo.province+accountInfo.city,accountInfo.country,accountInfo.unionid,accountInfo.subscribe_time,pinyinTransfer.toPinyin(accountInfo.nickname)];
        dbOperator.query('call pro_weix_account_info(?,?,?,?,?,?,?,?,?)',args,function(err,rows){
            if(err){
                logger.debug(err);
            }else{
                logger.info(rows);
            }
        });
    });

}

/**
 * 更新微信账号信息
 * @param req
 * @param res
 */
function updatePersonality(req,res){
    var body = req.body;
    var open_id = req.session.openId,
        key = body.key,
        value = body.value;
    var sql = dataviewConfig.personality;
//    console.log(sql+" "+key+" "+value);
    dbOperator.query(sql,[key,value,open_id],function(err,rows){
        if(err){
            logger.error("personality err:"+err);
            response.failed("0",res,"");
        }else{
            logger.debug(rows);
            response.success("1",res,"");
        }
    });
}
/**
 * 更新微信账号信息
 * @param req
 * @param res
 */
function updatePersonality_all(req,res){
    var body = req.body;
    var open_id = req.session.openId||'oxfQVswUSy2KXBPOjNi_BqdNI3aA',
        nickname = body.nickname,
        weixAccount = body.weix_account,
        sex = body.sex,
        city = body.city,
        country = body.country,
        introduce = body.introduce;
    var sql = dataviewConfig.personality;
//    console.log(sql+" "+key+" "+value);
    dbOperator.query('call pro_update_weix_account_info(?,?,?,?,?,?,?)',
        [open_id,weixAccount,nickname,sex,city,country,introduce],function(err,rows){
        if(err){
            logger.error("personality err:"+err);
            response.failed("0",res,"");
        }else{
            logger.info(rows);
            response.success("1",res,"");
        }
    });
}

/**
 * 获取用户个人信息
 * @param req
 * @param res
 * @param isHost
 */
function getPersonalInfo(req,res,isHost){
    var session = req.session;
    var open_id = session.openId||'oxfQVswUSy2KXBPOjNi_BqdNI3aA',
        args = [open_id,null],
        room_id = req.query.room_id;
    if(!isHost){
        args = [open_id,room_id||"888888"];
    }
    dbOperator.query("call pro_weix_account_info_get_new(?,?)",args,function(err,row){
        if(err){
            logger.error("pro_weix_account_info_get:"+err);
        }else{
            var user = row[0][0] || {};
            logger.debug(user);
            if(user.sex){
                user.sex = user.sex[0];
            }
            logger.debug(user);
            if(!isHost){
                response.success({user:user?user:null},res,'');
                return;
            }
            res.render("personality",{user:user?user:null,isHost:isHost});
        }
    });
}

function publishProduct(req,res){
    var body = req.body;
    var products = body.products,
        desc = body.desc,
        title = body.title,
        open_id = req.session.openId,
        params = [products,desc,open_id,title];
    dbOperator.query("call pro_publish(?,?,?,?)",params,function(err,row){
        if(err){
            logger.error(err);
            response.failed("",res,err);
        }else{
            logger.debug(row);
            if(row[0][0] && row[0][0]['publish_res'] != 0){
                logger.info("call pro_publish results:",row[0]['publish_res']);
                var product_id = row[0][0]["curr_id"];
                response.success({id:product_id},res);
            }else{
                response.failed("",res);
            }
        }
    });
}

/**
 * 微信jssdk初始化配置获取
 * @param req
 * @param res
 */
function wxJssdkInit(req,res){
    var ticket = access_token.jsapi_ticket;
    var url = req.body.url;
    var ret = wxsign(ticket,url);
    response.success(ret,res,1);
}

/**
 * 用户关注
 * @param args
 */
function follow(openId,timestamp){
    var create_time = util.formatDate(new Date(Number(timestamp+"000")),true);
    var args = [openId,create_time,1];
    asyncAccountInfoFromWeix(openId);
//    dbOperator.query("call pro_follow(?,?,?)",args,function(err,rows){
//        if(err){
//            console.log('关注失败');
//        }else{
//            console.log(openId," 关注成功");
//        }
//    });
}

exports.applyAccount = applyAccount;
exports.publishProduct = publishProduct;
exports.checkUser = checkUser;
exports.register = register;
exports.getPersonalInfo = getPersonalInfo;
exports.updatePersonality = updatePersonality;
exports.updatePersonality_all = updatePersonality_all;
exports.asyncAccountInfoFromWeix = asyncAccountInfoFromWeix;
exports.wxJssdkInit = wxJssdkInit;
exports.follow = follow;
exports.registerMailVerify = registerMailVerify;
exports.checkEmail = checkEmail;
exports.bindAccount = bindAccount;