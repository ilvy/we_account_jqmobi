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
            price = $("input.price").val();
        var url = "/we_account/create_cut_info?username="+username+"&product_name="+product_name+"&price="+price+"&product_img="+productImg;
        $.ajax({
            url:url,
            type:"post",
            success:function(results){
                if(results.flag == 1){
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
}

//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构�?�一个含有目标参数的正则表达式对�?
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数�?
}