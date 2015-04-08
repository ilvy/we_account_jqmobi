/**
 * Created by Administrator on 14-12-10.
 *
 */

var express = require("express"),
    router = express.Router(),
    https = require("https"),
    crypto = require("crypto"),
    checkWeAuth = require("./we_account/wexin_check").check,
    xmlParser = require("./we_account/util/xml_parser"),
    formidable = require("formidable"),
    path = require("path"),
    fs = require("fs"),
    dispatcher = require("./we_account/business/dispatcher"),
    urlencode = require("urlencode"),
    appConfig = require("../config/config").appConfig,
    async = require("async"),
    session = require("express-session");
var publish_account = require("./we_account/business/publish_account"),
    checkUser = publish_account.checkUser,
    register = publish_account.register,
    live_room = require("./we_account/business/live_room"),
    gotoLiveRoom = live_room.renderLiveRoom_new,
    knockDoor = live_room.knockDoor,
//    knocktoLiveRoom = live_room.knocktoLiveRoom ,
    loadMoreProducts = live_room.loadMoreProducts_new;

var TOKEN = 'jxfgx_20140526';
router.get("/",function(req,res){
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
        res.send(echostr);
    }else{
        console.log("check failed：生成signature:"+sign+",微信signature:"+signature);
        console.log("weixin_sign:"+signature);
        console.log("my_sign:"+sign);
    }
});

router.post("/",function(req,res){
    var xmlData = "",resultObj = {};
//    if(checkWeAuth(req)){
    console.log("get normal message from weixin user");
    req.on("data",function(data){
        xmlData += data;
    });
    req.on("end",function(){
        console.log("req end:"+xmlData);
        xmlParser.parseXml(xmlData,function(result){
            console.log("*****************************");
            for(var key in result){
                console.log(key+": "+result[key]);
            }
            console.log("----------------"+result["ToUserName"]);
            console.log("in argument result:"+resultObj);
            var replyXml = '<xml>' +
                '<ToUserName><![CDATA['+result["FromUserName"]+']]></ToUserName>' +
                '<FromUserName><![CDATA['+result["ToUserName"]+']]></FromUserName>' +
                '<CreateTime>'+new Date().getTime()+'</CreateTime>' +
                '<MsgType><![CDATA['+result["MsgType"]+']]></MsgType>' +
                '<Content><![CDATA['+"请求已接收，处理中，请稍后..."+']]></Content>' +
                '</xml>';//result["FromUserName"];
//                res.write(replyXml);
//                res.end();
            dispatcher.dispatch(result,res);
        },resultObj);
    });
//    }else{
//        res.send("");
//        console.log("get normal message ,authority check failed");
//    }

});

//console.log(crypto.createHmac("sha1","21212121212hahahhehe").digest().toString('base64'));
//字典序排列
//[0,1,5,10,15].sort().forEach(function(item){
//    console.log(item);
//});

router.get("/register",function(req,res){

});

router.get("/writeSession",function(req,res){
    var session = req.session;
    console.log("****"+session.name+"***"+session.openId);
    session.openId = Math.random()*100;
    console.log("req.session.openId");
    console.log(session);
    res.redirect("/register.html");
})

router.post("/register",function(req,res){
//    var session = req.session;
//    var body = req.body;
//    var openId = session.openId,
//        username = body.username,
//        pwd = body.pwd;
//    console.log(session);
//    console.log("**************"+session.name+"*********openId:"+openId);
//    res.send("**************"+session.name+"*********openId:"+openId);
    register(req,res);
});

//AUTH2.0 网页获取用户权限
router.get("/publish",function(req,res){
    var type = req.query.type;
    req.session.isPublisher = type==1 ? 1:0;
    //判断用户是否存在账号，若无，返回注册界面，若已有账号，直接登录即可
    var redirect_uri;// = urlencode("http://120.24.224.144/we_account/goto_publish");
    redirect_uri = urlencode("http://120.24.224.144/we_account/goto_publish?type="+type);
//    if(type == 1){//发布者进入
//    }else if(type == 2){//普通浏览者进入
//        redirect_uri = urlencode("http://120.24.224.144/we_account/goto_publish?type="+type);
//    }

    res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?" +
        "appid="+appConfig.appId+"&redirect_uri="+redirect_uri+"&response_type=code&scope=snsapi_base&state=123#wechat_redirect");
});

router.get("/goto_publish",function(req,resp){
    var session = req.session;
    var query = req.query;
    var code = query.code,
        status = query.status,
        appId = appConfig.appId,
        appSecret = appConfig.appSecret,
        type = query.type;
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appId+'&secret='+appSecret+'' +
        '&code='+code+'&grant_type=authorization_code';
    https.get(url,function(res){
        var chunks = "";
        res.on("data",function(data){
            chunks += data;
        });
        res.on('end',function(){
//            console.log(chunks.toString());
            var userInfo = JSON.parse(chunks);
            var openId = userInfo.openid;// || 'oHbq1t0enasGWD7eQoJuslZY6R-4';
            session.openId = openId;
            session.type = type;
            if(type == 1){//发布者登录
                checkUser(openId,function response(err,results){
                    if(err){
                        resp.redirect("err.html");
                        return;
                    }
                    if(results[0]&&results[0]["count(1)"]){
                        resp.redirect("/we_account/live-room?room_id="+results[0]["room_id"]);
                    }else{
                        resp.redirect("/register.html");
                    }
                });
            }else if(type == 2){//普通用户登录
                live_room.renderRoom_door(req,resp);//返回room_door
            }else if(type == 3){//进入收藏页面
                live_room.myFavorite(req,resp);
            }else if(type == 4){//进入个人信息页面
                publish_account.getPersonalInfo(req,resp,1);
            }
        })
    }).on("error",function(e){
            console.log("get error:"+ e.message);
        });
});

router.get("/fav",live_room.myFavorite);
router.get("/live-room",gotoLiveRoom);//带上参数room_id

router.post("/publish",publish_account.publishProduct);

router.post("/upload",function(req,res){
    //console.log(req);
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname+'';
    console.log(process.cwd()+" ******** "+__dirname);
    var newFileName = "test_"+new Date().getTime();//test换成用户的唯一识别

    form.on('file', function(field, file) {
        //rename the incoming file to the file's name
        newFileName = newFileName + "." +file.name.split(".")[1];
        console.log( "rename:"+path.normalize(process.cwd()+"/public/images/" + newFileName));
        fs.rename(file.path, path.normalize(process.cwd()+"/public/images/" + newFileName),function(err){
            console.log("newPath:"+file.path);
//            live_room.compressImg(res,newFileName);
        });
    })
        .on('error', function(err) {
            console.log("an error has occured with form upload");
            console.log(err);
//            request.resume();
        })
        .on('aborted', function(err) {
            console.log("user aborted upload");
        })
        .on('end', function() {
            console.log('-> upload done');
//            live_room.compressImg(res,newFileName);
        });

    form.parse(req,function(err,fields,files){
//            fs.renameSync(files.upload.path,"/image/test.png");
        if(err){
            console.log(err);
            res.send("err");
        }
        res.send(newFileName);
//        live_room.compressImg(res,newFileName);
    });
});

router.post("/compressPic",live_room.compressPic);

/**
 *
 */
router.get("/room_door",live_room.renderRoom_door);//返回room_door
/**
 * 输入门牌号，敲门进入
 */
router.post("/knock_door",knockDoor);

router.get("/load_more",loadMoreProducts);

router.post("/favourite",live_room.addFavourite);

router.post("/favourite_cancel",live_room.cancelFavorite);

router.post("/delete_product",live_room.delete_product);

router.get("/product_display",live_room.displayProduct);

router.post("/rotateImg",live_room.rotateImg);

router.get("/personalInfo",function(req,res){
    publish_account.getPersonalInfo(req,res,0);//买家查看卖家信息
});

router.post("/update_personality",publish_account.updatePersonality);

router.post("/asyncAccountInfoFromWeix",function(req,res){
    publish_account.asyncAccountInfoFromWeix(req.session.openId,res);
});

router.get("/xml",function(req,res){
    xmlParser.parseXml("<xml><ToUserName><![CDATA[gh_d28b25ec1197]]></ToUserName>" +
        "<FromUserName><![CDATA[oHbq1t0enasGWD7eQoJuslZY6R-4]]></FromUserName>" +
        "<CreateTime>1418886322</CreateTime>" +
        "<MsgType><![CDATA[text]]></MsgType>" +
        "<Content><![CDATA[Tygfguhhbdddghjj]]></Content>" +
        "<MsgId>6094070349933832851</MsgId>" +
        "</xml>",function(result){
        console.log("*****************************");
        for(var key in result){
            console.log(key+": "+result[key]);
        }
    });
    res.send("OK");
});


module.exports = router;
