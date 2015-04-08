/**
 * Created by Administrator on 14-12-19.
 */
var menusObj = {
    "button": [
        {
            type:"view",
            name:"我要发布",
            url:"http://120.24.224.144/we_account/publish?type=1"
        },
        {
            name:"进入直播间",
            sub_button:[
//                {
//                    type:"click",
//                    name:"输入直播号",
//                    key:"input_room_num"
//                },
                {
                    type:"view",
                    name:"我的收藏",
                    url:"http://120.24.224.144/we_account/publish?type=3"
                },
                {
                    type:"view",
                    name:"直播间",
                    url:"http://120.24.224.144/we_account/publish?type=2"
                }
            ]
        },
        {
            type:"view",
            name:"个人信息",
            url:"http://120.24.224.144/we_account/publish?type=4"
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
    connectionLimit:10
};

var serverConfig =  {
    ip:"120.24.224.144",
    port:'80'
};

var appConfig = {
    appId:"wxaef4aefd905a4662",
    appSecret:"ca038c00a3764885a2d18b53d47f8282"
};

exports.menusObj = menusObj;
exports.dbPoolConfig = dbPoolConfig;
exports.serverConfig = serverConfig;
exports.appConfig = appConfig;
exports.dataviewConfig = dataviewConfig;