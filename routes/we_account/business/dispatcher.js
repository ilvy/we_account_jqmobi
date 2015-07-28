/**
 * Created by Administrator on 14-12-22.
 */

var applyAccount = require("./publish_account").applyAccount,
    response = require("../response/response").response,
    transitionManager = require("./transitionManager"),
    transition = '',//apply_account、enter-live-room、apply_nice_num:申请靓号
    checkUser = require("./publish_account").checkUser,
    async = require("async"),
    live_room = require("./live_room");

function dispatch(data,res){
    switch (data.MsgType){
        case 'text':
            console.log("msgtype:text");
            var text = data.Content.trim();
            data.replyContent = "小主您好，我是小代";
            if(text == 0){
                var imageTexts = [{
                    title:'买家代代使用教程',
                    description:'想用代代找货，下单，不会用？点击查看教程，一分钟就会，就是这么简单',
                    picUrl:'http://www.daidai2u.com/images/replyTutotion.png?v=1',
                    url:'http://www.daidai2u.com/tutorial-buy.html'
                },{
                    title:'卖家看代代使用教程',
                    description:'想用代代管理代购信息，点击查看教程，一分钟就会，就是这么简单',
                    picUrl:'http://www.daidai2u.com/images/replyTutotion.png?v=1',
                    url:'http://www.daidai2u.com/tutorial-sell.html'
                }
                ];
                data.imageTexts = imageTexts;
            }
//            var room = text;
//            if(text == ''||text.length > 6){
//                data.replyContent = '房间号输入不合法';
//            }else{
//                live_room.checkRoom(room,function(err,room_id){
//                    if(err){
//                        console.log("");
//                        data.replyContent = '该房间不存在';
//                    }else{
//                        data.replyContent = 'http://www.moment.cn.com/we_account/live-room?room_id='+room_id;  hh
//                    }
                    response(data,res,6);
//                });
//
//            }

            break;
        case 'event':
            console.log("msgtype:event");
            if(data.Event == 'subscribe'){
                data.replyContent = '欢迎关注代代！\n 回复0查看代代使用教程';
                response(data,res);
            }else if(data.Event == 'CLICK'){
                console.log("event:click");
                if(data.EventKey == 'input_room_num'){
                    console.log("EventKey:input_room_num");
//                    applyAccount(data,res);
                    data.replyContent = "请直接输入直播号,进入直播间";
                    transition = transitionManager.input_room_num;
                    response(data,res);
                }else if(data.EventKey == 'enter-live-room'){

                }else if(data.EventKey == 'publish'){
                    var open_id = data["FromUserName"];
                    var funs = [checkUser(open_id),
                                function response(results,cb){
                                    if(results["count(1)"]){
                                        res.redirect("/live-room-waterfall.html");
                                    }else{
                                        res.redirect("/register.html");
                                    }
                                }
                        ];
                    async.waterfall(funs,function(err,results){

                    })
                }
            }else if(data.Event == 'VIEW'){
                data.replyContent = "这里是moment的代购聚集地，感谢您的关注！！！";
                response(data,res);
                break;
            }
            break;
        default :
            break;

    }
}

exports.dispatch = dispatch;
