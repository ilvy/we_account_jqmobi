/**
 * Created by Administrator on 15-3-3.
 */

var https = require("https");

function getAccountInfo(access_token,openid,callback){
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
        })
    }).on("error",function(e){
            console.log("get error:"+ e.message);
        });
}

//getAccountInfo("h8_jbKsP3KIqGSX-wBGF9LD1qnvXvRHU95WjyohDLIoLdCStPJh421YTIsONxwNExb5WYZkBOA5bY141H7g7rVPN9KDxlvH-7SrBJCxxI9A","oHbq1t0enasGWD7eQoJuslZY6R-4",function(accountInfo){
//    console.log(accountInfo);
//});

exports.getAccountInfo = getAccountInfo;
