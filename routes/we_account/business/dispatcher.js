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
var niceNums = ['121212','438438','436436'];

function dispatch(data,res){
    switch (data.MsgType){
        case 'text':
            console.log("msgtype:text");
            var text = data.Content.trim();
            var room = text;
            if(text == ''||text.length > 6){
                data.replyContent = '房间号输入不合法';
            }else{
                live_room.checkRoom(room,function(err,room_id){
                    if(err){
                        console.log("");
                        data.replyContent = '该房间不存在';
                    }else{
                        data.replyContent = 'http://www.moment.cn.com/we_account/live-room?room_id='+room_id;
                    }
                    response(data,res);
                });

            }

            break;
        case 'event':
            console.log("msgtype:event");
            if(data.Event == 'CLICK'){
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
