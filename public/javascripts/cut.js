/**
 * Created by gogo on 2015/8/29.
 */
var margin = 8;
var roomId = window.location.hash.substring(1);
$(document).ready(function(){
    var headerW = this.win_w - 2 * margin;
    $("#header").css({
        //width:headerW,
        'padding-left':margin,
        'padding-right':margin,
        "height":$('.head').width() + margin * 2
    });
    getHostInfo();
    addListener();
    wxInit();
});

function addListener(){
    $(document).on("click","#cut-btn",function(){
        var cutId = getUrlParam("cutserial");
        var url = "/we_account/help-cut-off?cut_id="+cutId;
        $.ajax({
            url:url,
            type:"post"
        })
            .success(function(results){
                if(results.flag == 1){
                    if(results.data == 1){
                        alert("牛气，帮他砍了1个大￥");
                    }else if(results.data == 2){
                        alert("您太客气了，已经砍过一次了！！！");
                    }
                    window.location.href = "/we_account/live-room#live_room-"+roomId;
                }else if(results.flag == 0){
                    if(results.data == 0){//说明未授权
                        alert("您尚未授权，无法正常操作");
                    }
                }
            })
            .error(function(err){
                console.log(err)
            });
    });
    $(".qr-code-btn").on("click",function(event){
        if(event.stopPropagation){
            event.stopPropagation();
        }else{
            event.cancelBubble = true;
        }
        $("#qr-code").pop();
    });
}

/**
 * ��ȡ������Ϣ
 */
function getHostInfo(){
    var _this = this;
    var url = '/we_account/personalInfo?room_id='+roomId;
    $.ajax({
        url:url,
        type:'get',
        success:function(results){
            if(results.flag == 1){
                var userInfo = results.data.user;
                if(userInfo.ishost){

                }
                console.log(userInfo);
                setHostInfo(userInfo);
            }
        }
    });
}

/**
 *
 * @param userInfo
 */
function setHostInfo(userInfo){
    this.userInfo = $.extend({},this.userInfo,userInfo);
    $('.region_desc').html('<span class="country">'+(userInfo.country||'')+'</span><span class="city">'+(userInfo.city||'')+'</span>');
    $('.nick-name').text(userInfo.nickname||'');
    $('.account_num').text(userInfo.weix_account||'');
    userInfo.headimgurl ? $('.head img').attr('src',userInfo.headimgurl) : '';
    $('.sex').text(userInfo.sex ? '男':'女');
    $('.host-intro').text(userInfo.introduce||"主人太懒，走路太急，啥话都没留下");
    $('.attention-num').text(userInfo.favcount);
    $(".room-num").html("代代号:"+roomId);
    setQrcodeBox(userInfo);
}

function setQrcodeBox(userInfo){
    $('.upload-qr-code').removeClass('visible');
    $('.customer').addClass('customer');
    if(userInfo.qrcode){
        $('.qr-code-img').addClass('visible-inline').attr('src','/images/'+userInfo.qrcode);
        $('.upload-qr-code').removeClass('visible');
        $('.no-upload-qrcode').removeClass('visible');
    }else{
        $('.qr-code-img').removeClass('visible-inline');
        $('.upload-qr-code').addClass('visible');
        $('.no-upload-qrcode').addClass('visible');
    }
}

/**
 * 初始化wx js sdk
 */
function wxInit(){
    util.wxjssdkInit(function(err,results){
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
                jsApiList: ['onMenuShareAppMessage','scanQRCode','onMenuShareTimeline']
            };
            wx.config(config);
            wx.ready(function(){
//                alert("wxjssdkinit success");
                wx.checkJsApi({
                    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                    success: function(res) {
                        // 以键值对的形式返回，可用的api值true，不可用为false
                        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
//                        (res.checkResult.onMenuShareAppMessage);
                        util.wxShare("帮帮忙咯","我是"+$(".help-who .obj").text()+",快来帮我砍一刀!","",
                                'http://www.daidai2u.com/images/logo.jpg');
                    }
                });
            });
            wx.error(function(res){
                alert("wxjssdkinit failed");
            });
        }
    })
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构�?�一个含有目标参数的正则表达式对�?
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数�?
}