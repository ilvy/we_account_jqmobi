/**
 * Created by man on 15-4-3.
 */
//define(['router','util','wxAPI','preloadImg','waterfall','ajaxupload','touchEvent','jpopup'],function(router,util,wx){
define(['router','util','wxAPI','preloadImg','waterfall','ajaxupload','touchEvent','jpopup'],function(router,util,wx){
    var disableClick = false;
    function LiveRoom(){
        this.hasSetToolBox = 0;//标记是否已经初始化toolbox
        this.init();
    }

    LiveRoom.prototype = {
        init:function(){
            this.do();
            var that = this;
            this.setVagueBox();
            $('.split-part .text').css({
                left:($('.split-part').outerWidth() - $('.split-part .text').outerWidth() - $('.split-part').position().left) / 2
            });
            $(document).ready(function(){
                that.addListener();
            });
            return this;
        },
        do:function(){
            this.flushPage();
            this.getHostInfo();
            //$('title').text('代代');
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
//                            $("title").text(data.publisher.nickname + '的代代');
                        }else{
                            window.sessionStorage.setItem('moment_publisher',0);
//                            $("title").text(data.host + '的代代');
                            var favHeart = '';
                            if(data.isFavorite){
                                favHeart = '<div class="favorite"><i class="fa fa-heart"></i></div>';
                            }else{
                                favHeart = '<div class="favorite"><i class="fa fa-heart-o"></i></div>';
                            }
                        }
                        that.setToolBox(data);

                        $('.room-num').html(' 代袋号:'+data.room);

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
        setVagueBox:function(){
            var $searchInput = $('.search-product'),
                offset = $searchInput.offset(),
                left = $searchInput.position().left + 8,
                top = offset.top,
                height = $searchInput.outerHeight(),
                width = $searchInput.width();
            $("#vagueProduct").css({
                left:left,
                top:top + height + 10,
                width:width + $('.search-btn').width()
            });
        },
        setQrcodeBox:function(userInfo){
            if(userInfo.ishost){
                $('.customer').removeClass('customer');
                $('.qr-code-btn').text('二维码');
                $('.no-upload-qrcode').removeClass('visible');
                if(userInfo.qrcode){
                    $('.qr-code-img').addClass('visible-inline').attr('src','/images/'+userInfo.qrcode);
                    $('.upload-qr-code').removeClass('visible');
                    $(".re-upload").addClass('visible');
                }else{
                    $('.upload-qr-code').addClass('visible');
                    $('.qr-code-img').removeClass('visible-inline');
                    $(".re-upload").removeClass('visible');
                }
            }else{
                $('.upload-qr-code').removeClass('visible');
                $('.customer').addClass('customer');
                $('.qr-code-btn').text('加TA微信');
                $(".re-upload").removeClass('visible');
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

        },
        setToolBox : function(data){
            if(data.publisher){
//                alert(data.publisher)
    //                $("#tools-box").html('<div id="upload-div-box"><div id="upload-div"><div id="upload"><i class="fa fa-plus"></i></div></div></div>');
                $("#upload-div-box").removeClass('remove').siblings().addClass('remove');
                $('.edit-personality').removeClass('remove');
                $(".spread-btn").attr("href","http://www.daidai2u.com/we_account/cut-list#"+globalVar.room_id).css("display","initial");
            }else{
//                alert('hehe')
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
                    $("#upload-div-box").addClass('remove').siblings().removeClass('remove');
//                $("#upload-div-box").siblings().remove();
                $(".spread-btn").css("display","none");
            }
            if(this.hasSetToolBox){
                return;
            }
            this.hasSetToolBox = 1;
            this.initToolsPosition();
        },
        getHostInfo:function(){
            var _this = this;
            var roomId = globalVar.room_id;
            var url = '/we_account/personalInfo?room_id='+roomId;
            $.ajax({
                url:url,
                type:'get',
                success:function(results){
                    if(results.flag == 1){
                        var userInfo = results.data.user;

                        if(userInfo.ishost){
                            $('.nick-name,.room-num,.host-intro').touch('click',function(event){
                                if(!confirm("进入个人主页修改？")){
                                    return;
                                }
                                $('#host-info').pop();
//                    alert('host info')
                                $('#host-info [type=text]').each(function(){
                                    var type = $(this).data('type');
                                    var userInfo = _this.userInfo;
                                    $(this).val(userInfo[type]);
                                });
                                if($('.sex select').val() == 0){
                                    $('select#sex').html('<option value="0">女</option><option value="1">男</option>');
                                }else{
                                    $('select#sex').html('<option value="0">女</option><option value="1" selected>男</option>');
                                }

                            },true);
                        }
                        console.log(userInfo);
                        globalVar.userInfo = _this.userInfo = userInfo;
                        util.dealForCompactShare(userInfo.nickname);
                        _this.setHostInfo(userInfo);
                        _this.wxShare();
                        _this.setQrcodeBox(userInfo);
                    }
                }
            });
        },
        /**
         * 兼容分享处理
         */
        dealForCompactShare:function(){
            $('title').text(this.userInfo.nickname + '的代袋');
            $('#for-share').attr('src',"http://www.daidai2u.com/images/logo.jpg");
        },
        setHostInfo:function(userInfo){
            this.userInfo = $.extend({},this.userInfo,userInfo);
            $('.region_desc').html('<span class="country">'+(userInfo.country||'')+'</span><span class="city">'+(userInfo.city||'')+'</span>');
            $('.nick-name').text(userInfo.nickname||'');
            $('.account_num').text(userInfo.weix_account||'');
            userInfo.headimgurl ? $('.head img').attr('src',userInfo.headimgurl) : '';
            $('.sex').text(userInfo.sex ? '男':'女');
            $('.host-intro').text(userInfo.introduce||"主人太懒，走路太急，啥话都没留下");
            $('.attention-num').text(userInfo.favcount);
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
            var _this = this;
            $(document).touch('click',function(event){
                $('#vagueProduct').css('display','none');
            });
            var currLen,currNum,$currImgAlbum;
            $(".img-display img,.wanttobuy").touch("click",function(event){
                var $this = event.$this;
//                currNum = $this.data("num");
//                $currImgAlbum = $this.parents(".img-display").find("img");
//                currLen = $this.parents(".img-display").data("imgnum");
                var product_id = $this.parents(".box").data("id"),
                    type = $(".waterfall").data("type");
                type?type = "&u_type=" + type:"";
//        window.location.href = '/we_account/product_display?product_id='+product_id+type;
//                globalVar.product_id = product_id;
                router.changeHash("product_display-"+product_id+'-'+globalVar.room_id,1);
//                window.location.hash = "#product_display-"+product_id;//'/we_account/product_display?product_id='+product_id+type;
            });
            //收藏直播间
            $(".favorite").touch("click",function(event){
                var $this = event.$this;
                var url = '/we_account/favourite';
                if($this.find('i').hasClass("fa-heart")){
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

            $(document).on("click",'#toMyFav input',function(event){
//                alert('to my fav')
                util.stopPropagation(event);
                router.changeHash('myFavorite',1);
            });
            $(document).on("click",'#toRoomDoor input',function(event){
//                alert('to my fav')
                util.stopPropagation(event);
                router.changeHash('room_door',1);
            });
//            $('#toMyFav').touch("click",function(){
////                alert('to my fav')
//                router.changeHash('myFavorite',1);
//            },1);
//            $('#toRoomDoor').touch("click",function(){
//                router.changeHash('room_door',1);
//            },1);

            var waterfallHeight,
                scrollTop;
            $(document).on("scroll",function(){
                if(window.location.hash.indexOf('#live_room') == -1){
                    return;
                }
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
            $(".delete-product .fa-times").touch("click",function(event){
                if(!confirm("确定删除该商品?")){
                    return;
                }
                var $this = event.$this;
                var product_id = $this.parents(".box").data("id");
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
                            if(util.filterFile(ext)){
                                $("#uploading-mask").css("display","block");
                                $('#submit').attr('data-type','1');//修改商品
                                router.changeHash('publish',0);
                            }else{
                                return false;
                            }
                        },
                        onComplete:function(file,res){
                            $('#image_content').html("");
                            util.compress(res,function(err,result){
                                if(result.flag == 1){
                                    $("#image_content").append('<div class="upload-display" style="background:url(http://120.24.224.144/images/thumb/'+res+') center no-repeat;background-size:100%;">' +
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
                $("#upload-div-box").touch("click",function(event){
//        alert("upload:"+$(this).attr("id"));
                    var $this = event.$this;
                    var btn_id = $this.attr("id");
                    $("#"+btn_id+"_file_type").click();
                },true);
                $(document).on('input','.search-group .search-product',function(event){
                    var $this = $(this);
                    var roomId = globalVar.room_id,
                        value = $this.val();
//                    var url = '/we_account/vagueSearchProduct?room_id='+roomId+'&product_name='+value;
                    var url = '/we_account/vagueSearchProduct?product_name='+value;
                    $.ajax({
                        url:url,
                        type:'get',
                        success:function(results){
                            if(results.flag == 1){
                                _this.renderVagueProductBox(results.data);
                            }
                        },
                        error:function(err){
                            console.log('search err');
                        }
                    });
                });
                $('#vagueProduct li,.search-btn').touch('click',function(event){
//                    alert(event.originalEvent.type)
                    var $this = event.$this;
                    var roomId = globalVar.room_id;
                    if(!$this.hasClass('search-btn')){
                        var product_name = $this.text(),
                            pId = $this.data('id');
                        console.log(''+pId);
                        $('.search-product').val(product_name);
                        $this.parent().css('display','none');
                    }else{
                        product_name = $('.search-product').val();
                    }
                    if(!product_name){
                        globalVar.showLoading();
                        currentPage = 0;
                        totalPage = -1;
                        waterfall.cleanWaterfall();
                        waterfall.asyncLoader(function(){
                            globalVar.hideLoading();
                        });
                        return;
                    }

                    var url = '/we_account/searchProductByName?product_name='+product_name+'&room_id='+roomId;
                    $.ajax({
                        url:url,
                        type:'get',
                        success:function(results){
                            waterfall.cleanWaterfall();
                            currentPage = 0;
                            waterfall.renderWaterfall(results);
                        },
                        error:function(err){
                            console.log(err);
                        }
                    })
                },true);

                $('.light-popup').touch('click',function(){},true);//弹出框防止穿透
                $('.input-cancel').touch('click',function(){
                    $('#host-info').pop({hidden:true,callback:function(){
                        $('#host-info input[type=text]').each(function(){
                            $(this).val('');
                        });
                    }});
                },true);
                $('.input-sure').touch('click',function(event){
                    var data = {};
                    $('#host-info [type=text]').each(function(){
                        var type = $(this).data('type');
                        data[type] = $(this).val();
                    });
                    data.sex = $('select#sex').val();
                    var url = '/we_account/update_personality_all';
                    $.ajax({
                        url:url,
                        type:'post',
                        data:data,
                        success:function(results){
                            if(results.flag == 1){
                                _this.setHostInfo(data);
                                $('#host-info').pop({hidden:true,callback:function(){
                                    $('#host-info input[type=text]').each(function(){
                                        $(this).val('');
                                    });
                                }});
                                console.log('update_personality_all success');
                            }
                        }
                    })
                });
                $('.qr-code-btn').touch('click',function(){
                    $('#qr-code').pop();
                },true);
                $('.re-upload,.upload-qr-code').touch('click',function(event){
                    var $this = event.$this;
                    var btn_id = $this.attr("id");
                    $("#"+btn_id+"_file_type").click();
                },true);
                if($('#upload-qr-code').length){
                    $(function(){
                        new AjaxUpload("#upload-qr-code",{
                            action:"/we_account/upload_qrcode",
//                action:"http://120.24.224.144:80/we_account/upload",
                            name:'file',
                            onSubmit:function(file,ext){
                                console.log(file +" "+ ext);
                                if(util.filterFile(ext)){
                                    $("#uploading-mask").css("display","block");
                                }else{
                                    return false;
                                }
                            },
                            onComplete:function(file,res){
                                $('img.qr-code-img').addClass('visible-inline').attr('src','/images/thumb/'+res);
                                $('.upload-qr-code').remove();
                                $('.re-upload').addClass('visible');
                                $("#uploading-mask").css("display","none");
                                console.log(res);
                            }
                        })
                    });
                }
                if($('#re-upload').length){
                    $(function(){
                        new AjaxUpload("#re-upload",{
                            action:"/we_account/upload_qrcode",
//                action:"http://120.24.224.144:80/we_account/upload",
                            name:'file',
                            onSubmit:function(file,ext){
                                console.log(file +" "+ ext);
                                if(util.filterFile(ext)){
                                    $("#uploading-mask").css("display","block");
                                }else{
                                    return false;
                                }
                            },
                            onComplete:function(file,res){
                                $('img.qr-code-img').addClass('visible-inline').attr('src','/images/thumb/'+res);
                                $('.upload-qr-code').remove();
                                $('.re-upload').addClass('visible');
                                $("#uploading-mask").css("display","none");
                                console.log(res);
                            }
                        })
                    });
                }
            }
        },
        renderVagueProductBox:function(datas){
            var liStr = '';
            for(var i = 0; i < datas.length; i++){
                var record = datas[i];
                liStr += '<li data-id="'+record.id+'">'+record.product_name+'</li>';
            }
            $('#vagueProduct').html(liStr).css('display','block');
//            alert($('#vagueProduct').offset().left);
        },
        wxShare:function(){
            var _this = this;
            setTimeout(function(){
                var title = $('.nick-name').text();
                title = title ? title + "的代袋" : ' 代袋号:'+globalVar.room_id;
                wx.onMenuShareAppMessage({
                    title:title,
                    desc:_this.userInfo.introduce,
                    imgUrl:$('#header img').attr('src'),
                    success:function(){
                        alert('分享成功');
                    },
                    cancel:function(){
                        alert("取消分享");
                    },
                    error:function(){
                        alert('分享失败，请重试！');
                    }
                });
                wx.onMenuShareTimeline({
                    title:$(".nick-name").text()+'的代袋',
                    imgUrl:'http://www.daidai2u.com/images/logo.jpg',
                    success:function(){
                        alert('分享成功');
                    },
                    cancel:function(){
                        alert("取消分享");
                    },
                    error:function(){
                        alert('分享失败，请重试！');
                    }
                });
            },3000);
        }
    };


    globalVar.modules['live_room'] = new LiveRoom();
});

