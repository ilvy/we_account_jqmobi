/**
 * Created by Administrator on 15-3-3.
 */

var https = require("https");
var accoutniIntervals = {};
var tokenManager = require("./access_token");

function getAccountInfo(access_token,openid,callback,isInterval){
    if(!isInterval){
        var key = openid + '_'+new Date().getTime()+'_'+Math.random()*100;//确保生成定时器的唯一key
        accoutniIntervals[key] = setInterval(function(){
            console.log('get wx account info again:',openid);
            getAccountInfo(access_token,openid,callback,1);
        },1000 * 30);
    }
        var url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token="+access_token+"&openid="+openid+"&lang=zh_CN";
        console.log("---------------------$$$$$$$$$$$$$$$$$$$$"+url);
        https.get(url,function(res){
            var chunks = "";
            res.on("data",function(data){
                chunks += data;
            });
            res.on('end',function(){
//            console.log(chunks.toString());
                callback(chunks);
                console.log('clear get wx account interval:',key);
                clearInterval(accoutniIntervals[key]);
                delete  accoutniIntervals[key];
            })
        }).on("error",function(e){
            console.log("get accountinfo error:"+ e.message);
        });

}

var dbOperator = require("../../db/dbOperator"),
    async = require('async');

function fixAccountInfo(){
    async.waterfall([getNullAccountInfo,fix],function(err,results){
        if(err){
            console.log('fixAccountInfo waterfall err:',err);
        }else{
            console.log('success');
        }
    })
}

function getNullAccountInfo(cb){
    dbOperator.query('SELECT * from t_customer c where c.c_nickname is NULL OR c.c_nickname = \'null\' ' +
        'and c_openid is not NULL and seller_room_id is not NULL',[],function(err,rows){
        if(err){
            console.log('getNullAccountInfo failed:',err);
            cb('getNullAccountInfo failed',null)
        }else{
//            console.log(rows);
            cb(null,rows);
        }
    });
}

function fix(data,cb){
    if(!(data && data.length)){
        return;
    }
    for(var i = 0; i < data.length; i++){
        (function(){
            var openId = data[i].c_openid,
                roomId = data[i].seller_room_id;
            getAccountInfo(tokenManager.access_token,openId,function(accountInfo){
                console.log(accountInfo);
                accountInfo = JSON.parse(accountInfo);
                var args = [openId,roomId,accountInfo.nickname];
                console.log(openId,roomId);
                dbOperator.query('call pro_set_customer_nickname(?,?,?)',args,function(err,rows){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(rows);
                    }
                });
            });
        })();

    }

}
setTimeout(function(){
    fixAccountInfo();
},1000 * 3);


//getAccountInfo("h8_jbKsP3KIqGSX-wBGF9LD1qnvXvRHU95WjyohDLIoLdCStPJh421YTIsONxwNExb5WYZkBOA5bY141H7g7rVPN9KDxlvH-7SrBJCxxI9A","oHbq1t0enasGWD7eQoJuslZY6R-4",function(accountInfo){
//    console.log(accountInfo);
//});

exports.getAccountInfo = getAccountInfo;
