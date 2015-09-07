/**
 * Created by gogo on 2015/8/29.
 */
var margin = 8;
var roomId = window.location.hash.substring(1),
    productImg = "";
$(document).ready(function(){
    var headerW = this.win_w - 2 * margin;
    $("#header").css({
        //width:headerW,
        'padding-left':margin,
        'padding-right':margin,
        //"height":$('.head').width() + margin * 2
    });
    getHostInfo();
    addListener();
    wxInit();
});

function addListener(){
    $(document).on("click",".plus-btn",function(event){
        var $this = $(this);
        $this.parents(".page").removeClass("visible-block").siblings(".page").addClass("visible-block");
        if(!$("#product-img_file_type").length){
                new AjaxUpload("#product-img",{
                    action:"/we_account/upload",
//                action:"http://120.24.224.144:80/we_account/upload",
                    name:'file',
                    onSubmit:function(file,ext){
                        $("#uploading-mask").css("display","block");
                        console.log(file +" "+ ext);
                    },
                    onComplete:function(file,res){
                        //alert(res);
                        util.compress(res,function(err,result){
                            alert(JSON.stringify(result)+" "+res+" "+err);
                            if(result.flag == 1){
                                $("#product-img").attr("src","http://120.24.224.144/images/"+res);
                                productImg = res;
                            }else{
                                alert("上传失败");
                            }
                            $("#uploading-mask").css("display","none");
                        });
                        console.log(res);
//                    products?products  += ";"+ res:products += res;
                    }
                })
        }
    });
    $(document).on("click","#submit-btn",function(){
        var username = $("input.obj").val(),
            product_name = $("input.product-name").val(),
            price = $("input.price").val(),
            activity_duration = $("input.many-days").val();
        if(!validateInput(["input[type='text']","#product-img"])){
            alert("信息录入未完，请继续");
            return;
        }
        var url = "/we_account/create_cut_info?username="+username+"&product_name="+product_name+"&price="+price+"&product_img="+productImg+"&activity_duration="+activity_duration;
        $.ajax({
            url:url,
            type:"post",
            success:function(results){
                if(results.flag == 1){
                    if(typeof results.cut_id != 'undefined')
                    util.wxShare("帮帮忙咯","我是"+$(".help-who .obj").val()+",快来帮我砍一刀!",
                            "http://www.daidai2u.com/we_account/cut?cutserial="+results.cut_id+"&room_id="+roomId+"#"+roomId,
                            'http://www.daidai2u.com/images/logo.jpg');
                    alert("添加成功");
                }
            },
            error:function(err){
                console.log(err);
            }
        });
    });
    $(document).on("click","#product-img",function(){
        $("#product-img_file_type").click();
    });
    $(document).on("click","#back-cutlist-btn",function(event){
        var $this = $(this);
        $this.parents(".page").removeClass("visible-block").siblings(".page").addClass("visible-block");
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

var validateInput = function(input_selectors){
    var $validateObj ,
        isValidate = true;
    for(var i = 0; i < input_selectors.length; i++){
        $validateObj = $(input_selectors[i]);
        $validateObj.each(function(){
            var tagName = $(this)[0].tagName.toLocaleLowerCase(),
                value;
            switch (tagName){
                case 'input':
                    value = $(this).val();
                    break;
                case 'img':
                    value = productImg;
                    break;
                default :
                    break;
            }
            if(!value){
                isValidate = false;
//                $(this).addClass("input-invalidate");
            }
        });
    }
    return isValidate;

};