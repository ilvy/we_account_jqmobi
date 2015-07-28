/**
 * Created by Administrator on 14-12-22.
 */

function response(data,res,type){
    var replyXml = '<xml>' +
        '<ToUserName><![CDATA['+data["FromUserName"]+']]></ToUserName>' +
        '<FromUserName><![CDATA['+data["ToUserName"]+']]></FromUserName>' +
        '<CreateTime>'+new Date().getTime()+'</CreateTime>' +
        '<MsgType><![CDATA[text]]></MsgType>' +
        '<Content><![CDATA['+data.replyContent+']]></Content>' +
        '</xml>';
    switch (type){
        case 6:
            replyXml = getResponseImageText(data);
            break;
        default :
            break;
    }
    console.log(replyXml);
    res.write(replyXml);
    res.end();
}

/**
 * 回复图文消息
 */
function getResponseImageText(data){
    var replyXml = '<xml>' +
        '<ToUserName><![CDATA['+data["FromUserName"]+']]></ToUserName>' +
        '<FromUserName><![CDATA['+data["ToUserName"]+']]></FromUserName>' +
        '<CreateTime>'+new Date().getTime()+'</CreateTime>' +
        '<MsgType><![CDATA[news]]></MsgType>' +
        '<ArticleCount>'+data.imageTexts.length+'</ArticleCount>' +
        '<Articles>';
    var imageTexts = data.imageTexts;
    var itemStr = '';
    for(var i = 0; i < imageTexts.length; i++){
        var obj = imageTexts[i];
        itemStr +=  '<item><Title><![CDATA['+obj.title+']]></Title>' +
            '<Description><![CDATA['+obj.description+']]></Description>' +
            '<PicUrl><![CDATA['+obj.picUrl+']]></PicUrl>' +
            '<Url><![CDATA['+obj.url+']]></Url>' +
            '</item>';
    }
    replyXml += itemStr + '</Articles></xml>';
    return replyXml;
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