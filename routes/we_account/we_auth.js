/**
 * Created by Administrator on 2015/5/1.
 */

var urlencode = require('urlencode'),
    appConfig = require('../../config/config').appConfig,
    https = require('https');

function getWeAuth(redirect_uri,res){
    redirect_uri = urlencode(redirect_uri);
    res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?" +
        "appid="+appConfig.appId+"&redirect_uri="+redirect_uri+"&response_type=code&scope=snsapi_base&state=123#wechat_redirect");
}

function redirectToUrl(req,resp,callback){
    var session = req.session;
    var query = req.query;
    var code = query.code,
        status = query.status,
        appId = appConfig.appId,
        appSecret = appConfig.appSecret,
        type = query.type;
    console.log('weixin auth code:'+code);
    if(!code){
        callback(null,null,null,resp,1);
        return;
    }
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appId+'&secret='+appSecret+'' +
        '&code='+code+'&grant_type=authorization_code';
    https.get(url,function(res){
        var chunks = "";
        res.on("data",function(data){
            chunks += data;
        });
        res.on('end',function(){
//            console.log(chunks.toString());
            callback(null,JSON.parse(chunks),req,resp);
        })
    }).on("error",function(e){
        console.log("get error:"+ e.message);
        callback(e,null);
    });
}

exports.getWeAuth = getWeAuth;
exports.redirectToUrl = redirectToUrl;