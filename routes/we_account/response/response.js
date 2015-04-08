/**
 * Created by Administrator on 14-12-22.
 */

function response(data,res){
    var replyXml = '<xml>' +
        '<ToUserName><![CDATA['+data["FromUserName"]+']]></ToUserName>' +
        '<FromUserName><![CDATA['+data["ToUserName"]+']]></FromUserName>' +
        '<CreateTime>'+new Date().getTime()+'</CreateTime>' +
        '<MsgType><![CDATA[text]]></MsgType>' +
        '<Content><![CDATA['+data.replyContent+']]></Content>' +
        '</xml>';
    console.log(replyXml);
    res.write(replyXml);
    res.end();
}

function success(data,res,msg){
    res.send({
        flag:1,
        data:data,
        msg:msg || ""
    });
}
function failed(data,res,msg){
    res.send({
        flag:0,
        data:data,
        msg:msg || ""
    });
}

exports.response = response;
exports.success = success;
exports.failed = failed;