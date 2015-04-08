/**
 * Created by Administrator on 14-12-22.
 */

var dbOperator = require("../../../db/dbOperator"),
    response = require("../response/response"),
    accountInfo = require("../accountInfo"),
    tokenManager = require("../access_token"),
    dataviewConfig = require("../../../config/config").dataviewConfig;

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
            console.log(err);
        }
        cb(err,rows[0]);
    });
}

function register(req,res){
    var session = req.session;
    var body = req.body;
    var openId = session.openId,
        username = body.username,
        pwd = body.pwd;
    if(!openId){
        res.redirect("/err.html");
        return;
    }
//    console.log(session);
//    console.log("**************"+session.name+"*********openId:"+openId);
//    res.send("**************"+session.name+"*********openId:"+openId);
    dbOperator.query('call pro_register(?,?,?,?)',[openId,username,username,pwd],function(err,rows){
        if(err){
            console.log(err);
            res.redirect("/err.html");
        }else{
            console.log(rows);
            res.redirect('/we_account/live-room?room_id='+rows[0][0].room_id);
            asyncAccountInfoFromWeix(openId);
        }
    });
}
/**
 * 同步微信账户信息
 * @param openid
 */
function asyncAccountInfoFromWeix(openid,res){
    accountInfo.getAccountInfo(tokenManager.access_token,openid,function(accountInfo){
        console.log(accountInfo);
        accountInfo = JSON.parse(accountInfo);
        if(res){
            response.success(accountInfo,res);
        }
        var args = [openid,accountInfo.nickname,accountInfo.headimgurl,accountInfo.sex,accountInfo.province+accountInfo.city,accountInfo.country,accountInfo.unionid,accountInfo.subscribe_time];
        dbOperator.query('call pro_weix_account_info(?,?,?,?,?,?,?,?)',args,function(err,rows){
            if(err){
                console.log(err);
            }else{
                console.log(rows);
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
            console.log("personality err:"+err);
            response.failed("0",res,"");
        }else{
            console.log(rows);
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
    var open_id = session.openId,
        args = [open_id,null],
        room_id = session.room;
    if(!isHost){
        args = [null,room_id||"888888"];
    }
    dbOperator.query("call pro_weix_account_info_get(?,?)",args,function(err,row){
        if(err){
            console.log("pro_weix_account_info_get:"+err);
        }else{
            var user = row[0][0] || {};
            console.log(user);
            if(user.sex){
                user.sex = user.sex[0];
            }
            console.log(user);
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
            console.log(err);
            response.failed("",res,err);
        }else{
            console.log(row);
            if(row[0][0] && row[0][0]['publish_res'] != 0){
                console.log(row[0]['publish_res']);
                var product_id = row[0][0]["curr_id"];
                response.success({id:product_id},res);
            }else{
                response.failed("",res);
            }
        }
    });
}


exports.applyAccount = applyAccount;
exports.publishProduct = publishProduct;
exports.checkUser = checkUser;
exports.register = register;
exports.getPersonalInfo = getPersonalInfo;
exports.updatePersonality = updatePersonality;
exports.asyncAccountInfoFromWeix = asyncAccountInfoFromWeix;