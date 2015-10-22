/**
 * Created by jiangxuefeng1 on 2015/10/22.
 */
var dbOperator = require("../../../db/dbOperator"),
    accountInfo = require("../accountInfo"),
    tokenManager = {
        access_token:"A9JSMD5EH7AVpjs3vGQX4dEIELuFjGsm9ZhFOdpXsFUBXo5GkuzsAbKext_q_oHEEDvwqCUiixfD1x-HHWPZn5NlcEGDZ7vFtxfLvx3Ezg8"
    };
var async = require("async");

function asyncAccountInfoFromWeix(openids){
    var funs = [];
    for(var i = 0; i < openids.length; i++){
        funs.push((function(){
            var openid = openids[i]['c_openid'];
            var count = i;
            return function(cb){
                accountInfo.getAccountInfo(tokenManager.access_token,openid,function(accountInfo){

                    accountInfo = JSON.parse(accountInfo);
//                    if(accountInfo.subscribe == 0){
                        console.log(accountInfo);
//                    }
//                    return;
                    if(!(accountInfo && accountInfo.nickname)){
                        return;
                    }
                    var args = [openid,accountInfo.nickname,accountInfo.headimgurl,accountInfo.sex,accountInfo.province+accountInfo.city,accountInfo.country,accountInfo.unionid,accountInfo.subscribe_time];
                    dbOperator.query('call pro_weix_account_info(?,?,?,?,?,?,?,?)',args,function(err,rows){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("success:",count);
                        }
                        cb(err,rows);
                    });
                });
            }
        })());
    }
    async.parallel(funs,function(err,results){
        console.log(results);
    })
}

function getOpenids(){
    dbOperator.query("select c_openid from t_customer where c_openid not in (select open_id from t_weix_account_info group by open_id) ;",[],function(err,rows){
        if(err){
            console.log("get from wx err:"+err);
        }else{
            console.log(rows);
            asyncAccountInfoFromWeix(rows);
        }
    })
}
//getOpenids();

//asyncAccountInfoFromWeix(["oxfQVs9QvP4aZuk048NlGtAFHttc"]);
getOpenids();