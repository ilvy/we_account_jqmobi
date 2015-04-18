/**
 * Created by Administrator on 15-1-12.
 */
var disableClick = false;
$(document).ready(function(){
    addListener();
    initPopPanel();
    initToolsPosition();
    rotateImg();
});

function addListener(){

    $(function(){
        new AjaxUpload("#upload-div-box",{
            action:"/we_account/upload",
//                action:"http://120.24.224.144:80/we_account/upload",
            name:'file',
            onSubmit:function(file,ext){
                console.log(file +" "+ ext);
                if(filterFile(ext)){
                    $("#uploading-mask").css("display","block");
                    hideWaterfallScroll();
                }else{
                    return false;
                }
            },
            onComplete:function(file,res){
//                    alert(res);
//                $("#uploading-mask").css("display","none");
//                    $("#image_content").prepend('<div class="upload-display"><img  src="/images/'+res+'"/><div class="delete-img">×</div>' +
//                        '<div class="adjustImg"><i class="fa fa-rotate-right"></i></div></div>');
//                    showUploadPanel();
                compress(res,function(err,result){
                    $("#uploading-mask").css("display","none");
                    if(result.flag == 1){
                        $("#image_content").append('<div class="upload-display"><img  src="/images/'+res+'"/><a id="delete-img"><div class="delete-img"><i class="fa fa-times-circle"></i></div></a>' +
                            '<div class="adjustImg"><i class="fa fa-rotate-right"></i></div></div>');//×
                        showUploadPanel();
                    }else{
                        alert("上传失败");
                    }
                });
                console.log(res);
                productArray.push(res);
//                    products?products  += ";"+ res:products += res;
            }
        })
    });

    $(document).on("vclick","#upload2",function(event){
        if(event.stopPropagation){
            event.stopPropagation();
        }else if(event.cancelBubble){
            event.cancelBubble = true;
        }
//        alert("upload:"+$(this).attr("id"));
        var $this = $(this);
        var btn_id = $this.attr("id");
        $("#"+btn_id+"_file_type").click();
    });
//    $(document).on("vclick","#upload-div-box",function(event){
//        if(event.stopPropagation){
//            event.stopPropagation();
//        }else if(event.cancelBubble){
//            event.cancelBubble = true;
//        }
////        alert("upload:"+$(this).attr("id"));
//        var $this = $(this);
//        var btn_id = $this.attr("id");
//        $("#"+btn_id+"_file_type").click();
//    });

//    $("#alertTest").on("click",function(){
//        $("#warn").fadeInAndOut();
//    });

    $(document).on("vclick","#submit",function(){
        var desc = $(".product-desc").val();//TODO 检验字符串合法性
        var title = $(".product-title").val();
        if(productArray.length == 0){
            $("#warn").fadeInAndOut();
            return;
        }
        $("#uploading-mask").css("display","block");
        var url = "/we_account/publish",
            postData = {
                products:getProducts(),
                desc:desc,
                title:title
            };
        $.ajax({
            url:url,
            type:"post",
            data:postData,
            success:function(data){
                console.log(data);
                if(data && data.flag == 1){
                    showNewUploadImg(data.data.id,productArray,title);
                    cleanPosition();
                    removeUploadPanel();
//                    alertWithoutClickBubble("alert","上传成功");
                }else{
                    alertWithoutClickBubble("alert","上传失败，请重试！！");
                }
                $("#uploading-mask").css("display","none");
            },
            error:function(err){
                console.log(err);
                $("#uploading-mask").css("display","none");
            }
        });
    });

    $(document).on("taphold",".upload-display",function(event){
        var $this = $(this);
        $this.append('<a id="delete-img"><div class="delete-img">x</div></a>')
    });

    $(document).on("vclick",".delete-img",function(event){
        stopPropagation(event);
        var delIndex = $(this).parents(".upload-display").index();
        var _this = $(this);
        setTimeout(function(){
            _this.parents(".upload-display").remove();
        },200);
        productArray.splice(delIndex,1);
    });

    $("#cancel").on("click",function(){
        removeUploadPanel();
    });
}

function initPopPanel(){
    var w_h = $(window).height(),
        modal_head_h = $(".modal-header").outerHeight();
    $(".modal-body").css({
        'max-height':w_h - 120
    })
}

var products = '',desc = '',productArray = [];

function getProducts(){
    var products = "";
    productArray.forEach(function(item,i){
        if(i != productArray.length - 1){
            products += item  + ";";
        }else{
            products += item;
        }

    });
    return products;
}

function showUploadPanel(){
    $("#upload-panel").css("display","block");
    $("body").css("overflow-y","hidden");
    hideWaterfallScroll();
}

function removeUploadPanel(){
    $("#upload-panel").css("display","none");
    $("body").css("overflow-y","auto");
    showWaterfallScroll();
}

/**
 * 恢复瀑布流
 */
function showWaterfallScroll(){
    $(".waterfall").css({
        height:'initial',
        overflow:"initial"
    });
}
/**
 * 隐藏瀑布流的滚动条，防止在图片上传或者在上传界面被滚动
 */
function hideWaterfallScroll(){
    $(".waterfall").css({
        height:'400px',
        overflow:"hidden"
    });
}

/**
 *
 * @param product_id
 * @param productArray
 * @param desc
 * @param smallH
 */
function showNewUploadImg(product_id,productArray,desc){
    var minColIndex = waterfall.getMinHeightColumnIndex();
//    alert(minColIndex);
    var imgstr = '';
    productArray.forEach(function(item,i){
        if(i == 0){
            imgstr += '<img class="lazy" src="http://120.24.224.144/images/'+item+'" data-num="'+i+'">';
        }else{
            imgstr += '<img class="lazy" src="http://120.24.224.144/images/'+item+'" data-num="'+i+'"  style="height:'+waterfall.smallH+'px;width:'+waterfall.smallH+'px;">';
        }
    });
    $(".column").eq(minColIndex).prepend('<div class="box" data-id="'+product_id+'">' +
        '<div class="img-display" data-imgnum="'+productArray.length+'">' +imgstr+
        '</div><div class="desc" style="border-bottom:1px solid #e6e6e6;" data-desc="'+desc+'">'+desc+'</div><div class="delete-product"><i class="fa fa-times-circle"></div></div>');
}

/**
 * 渐入渐出
 * @returns {*|jQuery}
 */
$.fn.fadeInAndOut = function(){
    return $(this).each(function(){
        var $this = $(this);
        $this.fadeIn(2000,function(){
            setTimeout(function(){
                $this.fadeOut();
            },2000);
        });
    });
}

/**
 * 初始化底部工具栏位置
 */
function initToolsPosition(){
    var $fav = $(".favorite"),
        $upload = $("#upload-div-box"),
        $favBox = $(".myfavorites"),
        $changeRoomBox = $(".changeRoom"),
        f_w = $fav.outerWidth(),
        u_w = $upload.outerWidth(),
        fb_w= $(".myfavorites .fa-folder").outerWidth(),
        crb_w = $changeRoomBox.outerWidth();
    $fav.css({
        left:Math.floor((waterfall.win_w - f_w) / 2)
    });
    $upload.css({
        left:Math.floor((waterfall.win_w - u_w) / 2)
    });
    $favBox.css({
        left:Math.floor((waterfall.win_w) / 4.0 - fb_w / 2.0)
    });
    $changeRoomBox.css({
        left:Math.floor((waterfall.win_w) * 0.75 - crb_w / 2.0)
    });
}

/**
 * 旋转图片
 */
var rotateI = 1000;
function rotateImg(){
    $(document).on("vclick",".adjustImg",function(){
        var $this = $(this),
            $uploadBox = $this.parents(".upload-display"),
            $img;
        var imgSrc = ($img = $this.siblings("img")).attr("src").split("?")[0];
        var data = {
            filePath:imgSrc,
            type:1
        }
        $.ajax({
            url:"/we_account/rotateImg",
            type:"post",
            data:data,
            success:function(result){
                if(result.flag == 1){
//                    $img.remove();
                    setTimeout(function(){
                        $img.attr("src",imgSrc + '?v='+ rotateI++);
//                        $uploadBox.prepend('<img src="'+imgSrc+'?v='+ rotateI++ +'"/>');
                    },200);

                }
            },
            error:function(err){
                console.log(err);
            }
        })
    });
}

/**
 * 弹出框点击防止穿透
 */
function alertWithoutClickBubble(alertType,text){
    $("#disableClick-mask").css("display","block");
    switch (alertType){
        case "alert":
            alert(text);
            break;
        case "confirm":
            return confirm(text);
        case "":
            break;
    }
}

function stopPropagation(event){
    if(event.stopPropagation){
        event.stopPropagation();
    }else if(event.cancelBubble){
        event.cancelBubble = true;
    }
}

//setTimeout(function(){
//    alertWithoutClickBubble("alert","hehe");
//},1000)
