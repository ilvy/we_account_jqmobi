/**
 * Created by jiangxuefeng1 on 2015/10/22.
 */
var dbOperator = require("../../../db/dbOperator"),
    accountInfo = require("../accountInfo"),
    tokenManager = {
        access_token:""
    };


function asyncAccountInfoFromWeix(openids){
    var funs = [];
    for(var i = 0; i < openids.length; i++){
        funs.push((function(){
            var openid = openids[i];
            return function(cb){
                accountInfo.getAccountInfo(tokenManager.access_token,openid,function(accountInfo){
                    console.log(accountInfo);
                    accountInfo = JSON.parse(accountInfo);
                    if(!(accountInfo && accountInfo.nickname)){
                        return;
                    }
                    var args = [openid,accountInfo.nickname,accountInfo.headimgurl,accountInfo.sex,accountInfo.province+accountInfo.city,accountInfo.country,accountInfo.unionid,accountInfo.subscribe_time];
                    dbOperator.query('call pro_weix_account_info(?,?,?,?,?,?,?,?)',args,function(err,rows){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(rows);
                        }
                        cb(err,rows);
                    });
                });
            }
        })());
    }


}

function getOpenids(){
    dbOperator.query("pro_test()",[],function(err,rows){
        if(err){
            console.log("get from wx err:"+err);
        }else{
            console.log(rows[0]);
        }
    })
}

getOpenids();