/**
 * Created by Administrator on 2015/8/29.
 */
var margin = 8;
var roomId = window.location.hash;
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

    });
}

/**
 * 获取卖家信息
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
}