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

function register(req,res){
    var session = req.session;
    var body = req.body;
    var openId = session.openId,
        username = body.username,
        weixin = body.weixin,
        pwd = body.pwd;
    if(!openId){
        res.redirect("/err.html");
        return;
    }
//    console.log(session);
//    console.log("**************"+session.name+"*********openId:"+openId);
//    res.send("**************"+session.name+"*********openId:"+openId);
    dbOperator.query('call pro_register(?,?,?,?,?)',[openId,username,username,pwd,weixin],function(err,rows){
        if(err){
            logger.error(err);
            res.redirect("/err.html");
        }else{
            logger.info("call pro_register results:",rows);
            res.redirect('/we_account/live-room#live_room-'+rows[0][0].room_id);
//            asyncAccountInfoFromWeix(openId);
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
        dbOperator.query('call pro_weix_account_info_test(?,?,?,?,?,?,?,?,?)',args,function(err,rows){
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