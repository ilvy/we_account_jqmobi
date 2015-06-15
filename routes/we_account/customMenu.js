/**
 * Created by Administrator on 14-12-19.
 */

//var token = require("./access_token"),
var    config = require('../../config/config'),
    menuConfig = config.menusObj;
var https = require('https');

var accessTokenArg = process.argv[process.argv.length - 1];

/**
 * 设置菜单
 */
function setMenu(method){
    var token_access = accessTokenArg;//token.access_token;
    var option = {
        host:"api.weixin.qq.com",
        method:"post",
        path:"/cgi-bin/menu/"+method+"?access_token="+token_access
    };
    var paraBody = JSON.stringify(menuConfig);
    var req = https.request(option,function(res){
        var result = "";
        res.on("data",function(chunk){
            result += chunk;
        }).on("end",function(){
                console.log(result);
            }).on("error",function(err){
                console.log('create menu',err);
            });
    });
    req.on('error',function(err){
        console.log('request error:',err);
    });
    if(method == 'create'){
        req.write(paraBody);
    }
    req.end();

}

//setTimeout(function(){
    setMenu('create');
//},5 * 1000);