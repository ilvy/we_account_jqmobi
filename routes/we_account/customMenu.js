/**
 * Created by Administrator on 14-12-19.
 */

var token_access = require("./access_token").access_token;

function setMenu(){
    var option = {
        host:" api.weixin.qq.com",
        method:"post",
        path:"/cgi-bin/menu/create?"
    };
    getAccess_token(function(data){
        data = JSON.parse(data);
        console.log(data);

    });

}
