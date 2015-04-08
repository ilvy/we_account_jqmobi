/**
 * Created by Administrator on 14-12-17.
 */
var grant_type = "jxfgx_20140526",
    https = require("https"),
    access_token = "";//自定义

function getAccess_token(callback){
    var options = {
        host:""
    }
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential" +
        "&appid=wxaef4aefd905a4662&secret=ca038c00a3764885a2d18b53d47f8282";
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

exports.getAccess_token = getAccess_token;
exports.access_token = access_token;
/**
 * 定时1.5h更新access_token
 */
setInterval(function(){
    getAccess_token(function(data){
        data = JSON.parse(data);
        console.log(data);
        exports.access_token = data.access_token;
    });
},1000*3600*1.5);
getAccess_token(function(data){
    data = JSON.parse(data);
    console.log(data);
    exports.access_token = data.access_token;
});