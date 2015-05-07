/**
 * Created by man on 15-4-3.
 */
define(['router','jqmobiTouch','preloadImg','waterfall','ajaxupload'],function(router){
    var disableClick = false;
    function LiveRoom(){
        this.hasSetToolBox = 0;//标记是否已经初始化toolbox
        this.init();
    }

    LiveRoom.prototype = {
        init:function(){
            this.do();
            var that = this;
            $(document).ready(function(){
                that.addListener();
            });
            return this;
        },
        do:function(){
            this.flushPage();
        },
        flushPage:function(){
            var room_id = globalVar.room_id;
            var url = '/we_account/live_room?room_id='+room_id;
            console.log("live_room request:"+url);
            var that = this;
            $.ajax({
                url:url,
                type:'post',
                success:function(result){
                    if(result.flag == 1){
                        var data = result.data;
                        if(data.publisher){
                            window.sessionStorage.setItem('moment_publisher',1);
                            $("title").text(data.publisher.nickname + '的momenT');
                        }else{
                            window.sessionStorage.setItem('moment_publisher',0);
                            $("title").text(data.host + '的momenT');
                            var favHeart = '';
                            if(data.isFavorite){
                                favHeart = '<div class="favorite"><i class="fa fa-heart"></i></div>';
                            }else{
                                favHeart = '<div class="favorite"><i class="fa fa-heart-o"></i></div>';
                            }
                        }
                        that.setToolBox(data);
                        $('.room_num').html(' 直播号:'+data.room);
                        currentPage = 0;
                        totalPage = -1;
                        waterfall.cleanWaterfall();
                        waterfall.asyncLoader();
                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        },
        setToolBox : function(data){
            if(this.hasSetToolBox){
                return;
            }
            if(data.publisher){
    //                $("#tools-box").html('<div id="upload-div-box"><div id="upload-div"><div id="upload"><i class="fa fa-plus"></i></div></div></div>');
                $("#upload-div-box").siblings().remove();
            }else{
                var favHeart = '';
                if(data.isFavorite){
                    favHeart = '<i class="fa fa-heart"></i>';
                }else{
                    favHeart = '<i class="fa fa-heart-o"></i>';
                }
    //                $("#tools-box").html('<a id="toMyFav"><div class="myfavorites"><i class="fa fa-folder"></i></div></a>' +
    //                    '<a id="toRoomDoor"><div class="changeRoom"><i class="fa fa-exchange"></i></div></a>'+favHeart);
    //                $("#tools-box").html('<div id="upload-div-box"><div id="upload-div"><div id="upload"><i class="fa fa-plus"></i></div></div></div>');

                    $("#tools-box .favorite").html(favHeart);
                    $("#upload-div-box").remove();
//                $("#upload-div-box").siblings().remove();
            }
            this.hasSetToolBox = 1;
            this.initToolsPosition();
        },
        initToolsPosition : function(){
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
            $("#tools-box").css({
                visibility:'visible'
            });
        },
        addListener:function(){
            $("#tools-btn").on("click",function(event){
                if(event.stopPropagation){
                    event.stopPropagation();
                }else{
                    event.cancelBubble = true;
                }
                if($("#tools-panel").css("display") == 'none'){
                    $("#tools-panel").css("display","block");
                }else{
                    $("#tools-panel").css("display","none");
                }
            });
            $("#tools-panel").on("click",function(event){
                if(event.stopPropagation){
                    event.stopPropagation();
                }else{
                    event.cancelBubble = true;
                }
                $("#tools-panel").css("display","none");
            });

            $(document).on("vclick","#disableClick-mask",function(event){
                stopPropagation(event);
                $("#disableClick-mask").css("display","none");
                console.log("stop click");
            });
            var currLen,currNum,$currImgAlbum;
            $(document).on("click",".img-display img",function(){
                if(disableClick){
                    return;
                }
                currNum = $(this).data("num");
                $currImgAlbum = $(this).parents(".img-display").find("img");
                currLen = $(this).parents(".img-display").data("imgnum");
                var product_id = $(this).parents(".box").data("id"),
                    type = $(".waterfall").data("type");
                type?type = "&u_type=" + type:"";
//        window.location.href = '/we_account/product_display?product_id='+product_id+type;
//                globalVar.product_id = product_id;
                router.changeHash("product_display-"+product_id+'-'+globalVar.room_id,1);
//                window.location.hash = "#product_display-"+product_id;//'/we_account/product_display?product_id='+product_id+type;
            });
            //收藏直播间
            $(document).on("vclick",".favorite",function(){
                var url = '/we_account/favourite';
                if($(this).find('i').hasClass("fa-heart")){
                    if(!confirm("是否取消关注")){
                        return;
                    }
                    url = '/we_account/favourite_cancel';
                }
                $.ajax({
                    url:url,
                    type:"post",
                    success:function(result){
                        if(result.flag == 1){
                            if(result.data == 1){
                                $(".favorite .fa-heart-o").removeClass("fa-heart-o").addClass("fa-heart");
                                alert("收藏成功");
                            }else if(result.data == 10){
                                $(".favorite .fa-heart").removeClass("fa-heart").addClass("fa-heart-o");
                            }
                        }else if(result.data == 0){
                            alert("房间不存在");
                        }else if(result.data == -2){
                            window.location.href = '/follow_account.html';
                        }else if(result.data == -10){
                            alert("取消关注失败");
                        }
                    },
                    error:function(err){
                        console.log(err);
                    }
                })
            });

            $(document).on("vclick",'#toMyFav',function(){
                router.changeHash('myFavorite',1);
            });
            $(document).on("vclick",'#toRoomDoor',function(){
                router.changeHash('room_door',1);
            });

            var waterfallHeight,
                scrollTop;
            $(document).on("scroll",function(){
//        alert("test");
                $("#disableClick-mask").css("display","none");
//        if(!waterfallHeight){
//            waterfallHeight = waterfall.min(waterfall.h_weights);//绝对布局方式瀑布流
                waterfallHeight = waterfall.getMinHeight();//相对布局方式瀑布流
//        }
                scrollTop = $("body").scrollTop();
                if(window.location.hash == '' || window.location.hash.split('-')[0] == '#live_room'){
                    globalVar.lv_scroll_top = scrollTop;
                }
                if(scrollTop + $(window).height() > 0.9 * waterfallHeight){
                    waterfall.asyncLoader();
                }
            });

            /**
             * 删除商品信息
             */
            $(document).on("vclick",".delete-product .fa-times-circle",function(event){
                if(!confirm("确定删除该商品?")){
                    return;
                }
                var product_id = $(this).parents(".box").data("id");
                var $this = $(this);
                var data = {
                    id:product_id
                }
                $.ajax({
                    url:"/we_account/delete_product",
                    data:data,
                    type:"post",
                    success:function(results){
                        if(results.flag == 1){
                            console.log("删除成功");
                            $this.parents(".box").remove();
                        }else{
                            alert("删除失败");
                        }
                    },
                    error:function(err){
                        console.log(err);
                    }
                })
            });
            if($("#upload-div-box").length > 0){
                $(function(){
                    new AjaxUpload("#upload-div-box",{
                        action:"/we_account/upload",
//                action:"http://120.24.224.144:80/we_account/upload",
                        name:'file',
                        onSubmit:function(file,ext){
                            console.log(file +" "+ ext);
                            if(filterFile(ext)){
                                $("#uploading-mask").css("display","block");
                                router.changeHash('publish',0);
                            }else{
                                return false;
                            }
                        },
                        onComplete:function(file,res){
                            compress(res,function(err,result){
                                if(result.flag == 1){
                                    $("#image_content").append('<div class="upload-display"><img  src="/images/'+res+'"/><a id="delete-img"><div class="delete-img"><i class="fa fa-times-circle"></i></div></a>' +
                                        '<div class="adjustImg"><i class="fa fa-rotate-right"></i></div></div>');//×
                                }else{
                                    alert("上传失败");
                                    router.changeHash('live_room-'+globalVar.room_id,0);
                                }
                                $("#uploading-mask").css("display","none");
                            });
                            console.log(res);
                            globalVar.productArray.push(res);
//                    products?products  += ";"+ res:products += res;
                        }
                    })
                });
                $(document).on("vclick","#upload-div-box",function(event){
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
            }
        }
    }

    /**
     *
     * @param fileName
     * @param callback
     */
    function compress(fileName,callback){
        var data = {
            filePath:fileName//"/mnt/projects/weAccount_git/we_account/public/images/"+fileName
        };
        $.ajax({
            url:"/we_account/compressPic",
            data:data,
            type:"post",
            success:function(result){//不需要响应
                console.log(result);
                callback(null,result);
            },
            error:function(err){
                console.log(err);
                callback(err,{});
            }
        })
    }
    /**
     * 限制文件格式
     * @param ext
     * @returns {boolean}
     */
    function filterFile(ext){
        var exceptExts = ['avi','mp4','wmv','3gp','flv','mkv','txt','js'];
        for(var i = 0; i < exceptExts.length; i++){
            if(ext == exceptExts[i]){
                return false;
            }
        }
        return true;
    }

    globalVar.modules['live_room'] = new LiveRoom();
});