/**
 * Created by Administrator on 15-3-3.
 * 个人信息页面 js
 */
$(document).ready(function(){

    $(document).on("vclick",".cell",function(event){
        var $this = $(this);
//            if($this.find(".btn-group").is(":visible")){
//                $this.find(".btn-group").css("display","none");
//            }else{
        $this.find(".btn-group").css("display","block");
        $this.find(".value").attr("contenteditable",true).focus();
        $this.siblings(".cell").find(".btn-group").css("display","none");
//            }

    });
    $(document).on("click",".sure,.cancel",function(event){
        stopPropagation(event);
        var $this = $(this);
        var $obj = $this.parents(".btn-group").siblings(".value");
        if($this.hasClass("sure")){
            var value = $obj.text(),
                type = $obj.data("type");
            var data = {
                key:type,
                value:value
            }
            $.ajax({
                url:'/we_account/update_personality',
                type:"post",
                data:data,
                success:function(results){
                    if(results.flag == 1){
                        $obj.attr("data-value",$obj.text()).attr("contenteditable",false);
                        $this.parents(".btn-group").css("display","none");
                        alert("修改成功");
                    }else{
                        alert("失败，请重试");
                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        }else{
            $this.parents(".btn-group").css("display","none").siblings(".value").attr("contenteditable",false).html($obj.data("value"));
        }
    });
    $(document).on("click","#asyncWeiAccount",function(){
        $.ajax({
            url:'/we_account/asyncAccountInfoFromWeix',
            type:"post",
            success:function(result){
                if(result.flag == 1){
                    var accountInfo = result.data;
                    $(".head img").attr("src",accountInfo.headimgurl);
                    $(".nickname .value").html(accountInfo.nickname).attr("data-value",accountInfo.nickname);
                    $(".weix_account .value").html(accountInfo.weix_account).attr("data-value",accountInfo.weix_account);
                    if(accountInfo.sex){
                        $(".sex .value").html("男").attr("data-value","男");
                    }else{
                        $(".sex .value").html("女").attr("data-value","女");
                    }
                    $(".city .value").html(accountInfo.city).attr("data-value",accountInfo.city);
                }else{
                    alert("wrong");
                }
            },
            error:function(err){
                alert("err:"+err);
            }
        })
    });
});
function stopPropagation(event){
    if(event.stopPropagation){
        event.stopPropagation();
    }else if(event.cancelBubble){
        event.cancelBubble = true;
    }
}