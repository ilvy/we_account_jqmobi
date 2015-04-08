/**
 * Created by Administrator on 14-12-17.
 */
var util = require("util"),
    xml = require("node-xml");
var resultObj = {},isCdata = false;
var callback = null;
var parser = new xml.SaxParser(function(cb) {
    cb.onStartDocument(function() {

    });
    cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
//            console.log(elem);
        currEle = elem;
        isCdata = false;
//            resultObj[currEle] = 'test';
    });
    cb.onEndElementNS(function(elem, prefix, uri) {
//        util.log("<= End: " + elem + " uri="+uri + "\n");
//            parser.pause();// pause the parser
//            setTimeout(function (){parser.resume();}, 200); //resume the parser
        console.log("onEndElementNS--"+elem+":"+resultObj[elem])
    });
    cb.onCharacters(function(chars) { // linux 上chars也是进了两次
        console.log("*************************");
        if(!isCdata){
            resultObj[currEle] = chars.toString();
        }
        isCdata = true;
        console.log(currEle+":"+resultObj[currEle]);
        util.log('<CHARS>'+chars+"</CHARS>");
    });
    cb.onCdata(function(cdata) {
        console.log("++++++++++++++++++++++++");
        isCdata = true;
        resultObj[currEle] = cdata.toString();
        console.log(currEle+":"+resultObj[currEle]);
        util.log('<CDATA>'+cdata+"</CDATA>");
    });
    cb.onComment(function(msg) {
        util.log('<COMMENT>'+msg+"</COMMENT>");
    });
    cb.onWarning(function(msg) {
        util.log('<WARNING>'+msg+"</WARNING>");
    });
    cb.onError(function(msg) {
        util.log('<ERROR>'+JSON.stringify(msg)+"</ERROR>");
    });
    cb.onEndDocument(function() {
        console.log("the end of xml");
        console.log(resultObj);
        callback(resultObj);
        resultObj = {};
    });
});
function xmlParse(dataString,cb){
    var currEle = '';
    callback = cb;
    parser.parseString(dataString);
}
//xmlParse("<xml><ToUserName><![CDATA[gh_d28b25ec1197]]></ToUserName>" +
//    "<FromUserName><![CDATA[oHbq1t0enasGWD7eQoJuslZY6R-4]]></FromUserName>" +
//    "<CreateTime>1418886322</CreateTime>" +
//    "<MsgType><![CDATA[text]]></MsgType>" +
//    "<Content><![CDATA[Tygfguhhbdddghjj]]></Content>" +
//    "<MsgId>6094070349933832851</MsgId>" +
//    "</xml>",function(resultObj){
//    console.log("*****************************");
//    for(var key in resultObj){
//        console.log(key+": "+resultObj[key]);
//    }
//})

exports.parseXml = xmlParse;