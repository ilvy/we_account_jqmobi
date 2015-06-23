/**
 * Created by man on 15-4-15.
 */
define(['router','util','wxAPI','jqmobiTouch','ajaxupload'],function(router,util,wx){

    function Product(){
        this.newImgName = '';
        this.init = function(){
            this.do();
            this.addListener();
            this.generateNumSelect(100,0);
            return this;
        }
        this.do = function(){
            var _this = this;
            var url = 'product_display?product_id='+globalVar.product_id;
            if(!globalVar.room_id){

            }
            this.cleanEditInfo();
            globalVar.showLoading();
            $.ajax({
                url:url,
                type:'get',
                success:function(result){
                    if(result.flag == 1){
                        globalVar.hideLoading();
                        var product = result.data;
                        $(".product_display .desc").html(product.text);
                        $(".product_display img").attr("src",'http://120.24.224.144/images/'+product.image_url[0]);
                        wx.onMenuShareAppMessage({
                            title:product.title+',要不要',
                            desc:product.text,
                            imgUrl:'http://120.24.224.144/images/thumb/'+product.image_url[0],
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
                        var isPublisher = window.sessionStorage.getItem('moment_publisher');
                        if(isPublisher != 1){
                            $("#take_order").remove();
                            $("#edit_product").addClass('visible');
                        }else{
                            $("#edit_product").remove();
                            $("#take_order").addClass('visible');
                        }
                    }
                },
                error:function(err){
                    console.log(err);
                }
            });
            $("title").html("要么，在这里告诉我");
        }
        this.cleanEarlierInputs = function(){
            $(".order_quantity .qtt_num option[selected=true]").attr('selected',false);
            $(".order_quantity .qtt_num option").eq(1).attr('selected',true);
//            $(".order_remark textarea").val("");
            $("#take_order").removeClass('ready').text("下单");
            $("#order_info").css('display','none');
        }
        this.addListener = function(){
            var _this = this;
            $(document).on("vclick","#back-live-room",function(){
                if(globalVar.room_id){
                    router.changeHash('live_room-'+globalVar.room_id,0);
                }else{
                    $('title').text("代代");
                    router.changeHash("billSystem",0);
                }
                _this.cleanEarlierInputs();
                $(".img-box img").attr('src',"http://120.24.224.144/images/default.jpg");
            });
            $(document).on('vclick',"#take_order",function(){
                var $this = $(this);
                if(!$this.hasClass("ready")){
                    $this.addClass('ready').text("提交订单");
                    $("#order_info").slideToggle();
                }else{
                    var quantity = Number($(".order_quantity .qtt_num").val()),
                        remark = '';//$(".order_remark textarea").val();
                    if(quantity == 0){
                        alert('请选择购买数量！');
                        return;
                    }
                    globalVar.showLoading();
                    var isWeChat = _this.checkUserAgent();
                    var data = {
                        room_id:globalVar.room_id,
                        remark:remark,
                        product_id:globalVar.product_id,
                        quantity:quantity
                    };
                    $.ajax({
                        url:'/we_account/take_order',
                        type:'post',
                        data:data,
                        success:function(results){
                            globalVar.hideLoading();
                            if(results.flag == 1){
                                _this.cleanEarlierInputs();
                                alert('订单确定，请联系卖家！')
                                router.changeHash('live_room-'+globalVar.room_id,0);
                            }else if(results.flag == 0 && results.data == 0){//订单失败且openId为null,微信客户端打开
                                window.location.href = '/we_account/live-room?room_id='+data.room_id+'&remark='+data.remark+'' +
                                    '&product_id='+data.product_id+'&quantity='+data.quantity+window.location.hash;
                            }
                        },
                        error:function(err){
                            console.log(err);
                        }
                    });
                }
            });
            $(document).on("vclick",".sub-order .fa-minus,.add-order .fa-plus",function(){
                var $this = $(this);
                var quantity = Number($(".order_quantity .qtt_num").text());
                if($this.hasClass('fa-minus')){
                    if(quantity > 0){
                        $(".order_quantity .qtt_num").text(--quantity);
                    }
                }else if($this.hasClass('fa-plus')){
                    $(".order_quantity .qtt_num").text(++quantity);
                }
            });

            $(document).on('vclick','#edit_product',function(){
                $('.desc').addClass('hide');
                $('textarea.edit-desc').addClass('visible');
                $('.product-photo').addClass('edit-display-img');
                $('#edit_product_btn_group .edit-desc').val($('.desc').text());
                $('#edit_product_btn_group').addClass('visible');
                $(this).removeClass('visible');
            });

            $(document).on('vclick','.edit-display-img',function(){
                $('#product-photo-edit_file_type').click()
            });

            $(document).on('vclick','#edit_product_btn_group .edit-sure',function(){
                var newImg = _this.newImgName;
                var desc = $('textarea.edit-desc').val();
                var data = {
                    imageUrl:newImg,
                    desc:desc
                };
                $.ajax({
                    url:'/account/edit-product',
                    type:'post',
                    data:data,
                    success:function(results){
                        console.log(results);
                    },
                    error:function(err,status){
                        console.log(err,status);
                    }
                })
            });

            if($("#edit_product").length > 0){
                $(function(){
                    new AjaxUpload("#product-photo-edit",{
                        action:"/we_account/upload",
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
//                            util.compress(res,function(err,result){
//                                if(result.flag == 1){
                                _this.newImgName = res;
                                    $('.img-box img').attr('src','http://120.24.224.144/images/'+res+'?v='+(Math.random()+"").replace(/0./,""));
//                                }else{
//                                    alert("上传失败");
//                                }
                                $("#uploading-mask").css("display","none");
//                            });
                            console.log(res);
                            globalVar.productArray.push(res);
//                    products?products  += ";"+ res:products += res;
                        }
                    })
                });
            }

        };

        this.cleanEditInfo = function(){
            $('.desc').removeClass('hide');
            $('textarea.edit-desc').removeClass('visible');
            $('.product-photo').removeClass('edit-display-img');
            $('#edit_product_btn_group .edit-desc').val("");
            $('#edit_product_btn_group').removeClass('visible');
            $('#edit_product').addClass('visible');
        };
        this.checkUserAgent = function(){
            var userAgent = navigator.userAgent,
                isOnline = navigator.onLine;
            if(userAgent.toLowerCase().indexOf('qqbrowser') > -1){
                return true;
            }
            return false;
        };

        this.generateNumSelect = function(optionNum,currentNum){
//            optionNum = Math.max(optionNum,currentNum>1000?1000:currentNum);
            var selectStr = '';
            currentNum = currentNum?currentNum:1;
            var selectClass = '';
            for(var i = 0; i <= optionNum; i++){
                if(i == currentNum){
                    selectClass = 'selected='+true;
                }else{
                    selectClass = '';
                }
                selectStr += '<option value="'+i+'" '+selectClass+'>'+i+'</option>';
            }
            $(".order_quantity .qtt_num").html(selectStr);
        }
    }
    globalVar.modules['product_display'] = new Product().init();
});