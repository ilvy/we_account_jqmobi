/**
 * Created by man on 15-4-15.
 */
define(['router'],function(router){

    function Product(){
        this.init = function(){
            this.do();
            this.addListener();
            return this;
        }
        this.do = function(){
            var _this = this;
            var url = 'product_display?product_id='+globalVar.product_id;
            $.ajax({
                url:url,
                type:'get',
                success:function(result){
                    if(result.flag == 1){
                        var product = result.data;
                        $(".product_display .desc").html(product.text);
                        $(".product_display img").attr("src",'http://120.24.224.144/images/'+product.image_url[0]);
                        var isPublisher = window.sessionStorage.getItem('moment_publisher');
                        if(isPublisher == 1){
                            $("#take_order").remove();
                        }else{
                            $("#take_order").css("display","block");
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
            $(".order_quantity .qtt_num").text(1);
            $(".order_remark textarea").val("");
            $("#take_order").removeClass('ready').text("下单");
            $("#order_info").css('display','none');
        }
        this.addListener = function(){
            var _this = this;
            $(document).on("vclick","#back-live-room",function(){
                router.changeHash('live_room-'+globalVar.room_id,0);
                $(".img-box img").attr('src',"http://120.24.224.144/images/default.jpg");
            });
            $(document).on('vclick',"#take_order",function(){
                var $this = $(this);
                if(!$this.hasClass("ready")){
                    $this.addClass('ready').text("提交订单");
                    $("#order_info").slideToggle();
                }else{
                    var quantity = Number($(".order_quantity .qtt_num").text()),
                        remark = $(".order_remark textarea").val();
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

        };

        this.checkUserAgent = function(){
            var userAgent = navigator.userAgent,
                isOnline = navigator.onLine;
            if(userAgent.toLowerCase().indexOf('qqbrowser') > -1){
                return true;
            }
            return false;
        }
    }
    globalVar.modules['product_display'] = new Product().init();
});