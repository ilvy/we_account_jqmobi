/**
 * Created by Administrator on 14-12-19.
 */
var menusObj = {
    "button": [
        {
            type:"view",
            name:"我的代袋",
            //url:"http://www.daidai2u.com/we_account/publish?type=1"
            url:"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2f81c72f4e91b732&redirect_uri=http://www.daidai2u.com/we_account/goto_publish?type=1" +
            "&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
        },
        {
            name:"我要代带",
            sub_button:[
//                {
//                    type:"click",
//                    name:"输入直播号",
//                    key:"input_room_num"
//                },
                {
                    type:"view",
                    name:"我的收藏",
                    //url:"http://www.daidai2u.com/we_account/publish?type=3"
                    url:"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2f81c72f4e91b732&redirect_uri=http://www.daidai2u.com/we_account/goto_publish?type=3" +
                    "&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
                },
                {
                    type:"view",
                    name:"寻找代手",
                    //url:"http://www.daidai2u.com/we_account/publish?type=2"
                    url:"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2f81c72f4e91b732&redirect_uri=http://www.daidai2u.com/we_account/goto_publish?type=2" +
                    "&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
                }
            ]
        },
        {
//            name:"代代账单",
//            sub_button:[
//                {
//                    type:"view",
//                    name:"个人信息",
//                    url:"http://www.daidai2u.com/we_account/publish?type=4"
//                },
//                {
                    type:"view",
                    name:"账单系统",
                    //url:"http://www.daidai2u.com/we_account/publish?type=5"
                    url:"https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2f81c72f4e91b732&redirect_uri=http://www.daidai2u.com/we_account/goto_publish?type=5" +
                    "&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
//                }
//            ]

        }
    ]
};

var dataviewConfig = {
    personality:"UPDATE t_weix_account_info set ?? = ? where open_id = ?;"
}

//        ,
//        {
//            type:"click",
//            name:"进入直播间",
//            key:"enter-live-room"
//        }

var dbPoolConfig = {
    host     : '120.24.224.144',
    user     : 'root',
    password : 'root@123',
    database:'moment',
    connectionLimit:10,
    multipleStatements:true
//    ,queueLimit:5
};

var serverConfig =  {
    ip:"120.24.224.144",
    port:'80'
};

var redisConfig = {
    ip:"127.0.0.1",
    port:'6379'
};

var appConfig = {
    appId:"wxaef4aefd905a4662",
    appSecret:"ca038c00a3764885a2d18b53d47f8282"
};
var appConfigForm = { //正式公众号配置
    appId:'wx2f81c72f4e91b732',
    appSecret:'a5b090f83fc6ef595084fe3f8a789ce3'
};

var verifyServerConfig = {
    cookieDomain : '10.22.0.51',//'www.daidai2u.com',
    port : 870
};

var verifyServerConfigForm = {
    cookieDomain : 'www.daidai2u.com',
    port : 80
};

exports.menusObj = menusObj;
exports.dbPoolConfig = dbPoolConfig;
exports.serverConfig = serverConfig;
exports.appConfig = appConfigForm;
exports.dataviewConfig = dataviewConfig;
exports.redisConfig = redisConfig;
exports.verifyServerConfig = verifyServerConfigForm;
if(process.argv[2] == 'test'){
    exports.appConfig = appConfig;
    exports.verifyServerConfig = verifyServerConfig;
}