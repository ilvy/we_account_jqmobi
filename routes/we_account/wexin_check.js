/**
 * Created by Administrator on 14-12-17.
 */
crypto = require("crypto");
var TOKEN = 'jxfgx_20140526';
function check(req){
    var query = req.query;
    var signature = query.signature,
        timestamp = query.timestamp,
        nonce = query.nonce,
        echostr = query.echostr;
    var array = [TOKEN,timestamp,nonce];
    array.sort();
    array.forEach(function(item){
        console.log(item);
    });
    var shaStr = "";
    array.forEach(function(item){
        shaStr += item;
    })
//    var sign = crypto.createHmac("sha1",shaStr).digest().toString('base64');
    var sign = crypto.createHash("sha1").update(shaStr).digest('hex');

    if(sign == signature){
        return true;
    }else{
        console.log("check failed：生成signature:"+sign+",微信signature:"+signature)
        console.log("weixin_sign:"+signature);
        console.log("my_sign:"+sign);
        return false;
    }
}

exports.check = check;