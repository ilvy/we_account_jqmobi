/**
 * Created by Administrator on 2015/8/29.
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
                        alert("牛气，帮他砍�?1个大�?");
                    }else if(results.data == 2){
                        alert("您太客气了，已经砍过�?�?�?");
                    }
                    window.location.href = "/we_account/live-room#live_room-"+roomId;
                }else if(results.flag == 0){
                    if(results.data == 0){//说明未授�?
                        alert("您尚未授权，无法正常操作");
                    }
                }
            })
            .error(function(err){
                console.log(err)
            });
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
    $('.sex').text(userInfo.sex ? '��':'Ů');
    $('.host-intro').text(userInfo.introduce||"����̫������·̫����ɶ����û����");
    $('.attention-num').text(userInfo.favcount);
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构�?�一个含有目标参数的正则表达式对�?
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数�?
}