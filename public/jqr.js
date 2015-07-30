/**
 * Created by man on 15-4-3.
 */

requirejs.config({
    baseUrl:'/',
    paths:{
        text:'javascripts/libs/require/text',
        jquery:'javascripts/jquery',
        router:'javascripts/router',
        routerConfig:'javascripts/routerConfig',
        'room-door':'javascripts/room-door',
        touchEvent:'touchUtil',
        laydate:'Jplugin/laydate/laydate',
        util:'util/util',
        jqmobiTouch:"javascripts/libs/jquery.mobile.custom",
        preloadImg:"javascripts/preloadImg",
        waterfall:"javascripts/waterfall_relative",
        ajaxupload:"javascripts/ajaxupload",
        jpopup:'Jplugin/jquery.light-popup/jquery.light-popup',
        wxAPI:'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    },
    shim:{
        jquery:{
            exports:'jquery'
        },
        'room-door':{
            exports:'room_door'
        },
        touchEvent:{
            exports:'touchEvent'
        },
        laydate:{
            exports:'laydate'
        }
//        ,
//        jqmobiTouch:{
//            exports:'jqmobiTouch'
//        },
//        preloadImg:{
//            exports:'preloadImg'
//        },
//        ajaxupload:{
//            exports:'ajaxupload'
//        },
//        waterfall:{
//            exports:'waterfall'
//        }
    }
});

/**
 * 全局变量
 */
var globalVar = {
    scrollTop:0,
    live_room:'',
    reload:{},//标示模块是否重新加载
    modules: {},
    productArray : [],
    hashFrom:'',
    nickname:'',//当前账单用户昵称
    showLoading:function(){
        $("#loading").css('display','block');
    },
    hideLoading:function(){
        $("#loading").css('display','none');
    }
};

define(['text','router','wxAPI'],function(text,router,wx){
    wxjssdkInit(function(err,results){
        var config;
        if(results.flag == 1){
            var data = results.data;
//            alert(data.url);
            config = {
//                debug:true,
                appId:"wx2f81c72f4e91b732",
                jsapi_ticket: data.jsapi_ticket,
                nonceStr: data.nonceStr,
                timestamp: data.timestamp,
                signature:data.signature,
                url: data.url,
                jsApiList: ['onMenuShareAppMessage','scanQRCode']
            };
            wx.config(config);
            wx.ready(function(){
//                alert("wxjssdkinit success");
                wx.checkJsApi({
                    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline','scanQRCode','startRecord','stopRecord','onVoiceRecordEnd','translateVoice'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                    success: function(res) {
                        // 以键值对的形式返回，可用的api值true，不可用为false
                        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
//                        (res.checkResult.onMenuShareAppMessage);
                    }
                });
            });
            wx.error(function(res){
                alert("wxjssdkinit failed");
            });
        }
    })
});

function wxjssdkInit(callback){
    var data = {
        url:window.location.href.split("#")[0]
    };
    $.ajax({
        url:'/we_account/wxjssdkinit',
        type:'post',
        data:data,
        success:function(results){
            if(results.flag == 1){
                callback(null,results);
            }else{

            }
        },
        error:function(err){
            if(err){
                console.log("wxjssdkinit err:",err);
            }
        }
    });
}

