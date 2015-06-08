/**
 * Created by man on 15-4-15.
 */
define(['router','jqmobiTouch'],function(router){
    var products = '',desc = '',productArray = globalVar.productArray;

    function Publish(){

        this.init = function(){
            this.do();
            this.addListener();
            return this;
        }
        this.do = function(){

        }
        this.addListener = function(){
            var _this = this;
            $("#cancel").on("click",function(){
//        removeUploadPanel();
//                window.location.hash = '#live_room';
                cleanPosition();
                router.changeHash('live_room-'+globalVar.room_id,0);//不重新加载
            });
            $(document).on("vclick",".adjustImg .fa-rotate-right",function(){
                var $this = $(this),
                    $uploadBox = $this.parents(".upload-display"),
                    $img;
//                var imgSrc = ($img = $this.siblings("img")).attr("src").split("?")[0];
                var imgSrc = ($img = $this.parents('.upload-display')).css("background-image").split("url(")[1].split(")")[0].split('?')[0];
//                alert('adjustImg',imgSrc);
                var data = {
                    filePath:'/images/'+imgSrc.split('/images/')[1],//去掉协议以及ip信息
                    type:1
                }
                $.ajax({
                    url:"/we_account/rotateImg",
                    type:"post",
                    data:data,
                    success:function(result){
//                        alert(result.flag)
                        if(result.flag == 1){
//                    $img.remove();
                            setTimeout(function(){
//                                $img.attr("src",imgSrc + '?v='+ new Date().getTime());
                                $img.css("background-image",'url('+imgSrc + '?v='+ new Date().getTime()+')');
//                        $uploadBox.prepend('<img src="'+imgSrc+'?v='+ rotateI++ +'"/>');
                            },200);

                        }
                    },
                    error:function(err){
                        console.log(err);
                    }
                })
            });
            $(document).on("vclick","#submit",function(){
                var desc = $(".product-desc").val();//TODO 检验字符串合法性
                var title = $(".product-title").val();
                if(productArray.length == 0 || !title){
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
                            router.changeHash("live_room-"+globalVar.room_id,0);
                        }else{
                            alert("上传失败，请重试！！");
                        }
                        $("#uploading-mask").css("display","none");
                    },
                    error:function(err){
                        console.log(err);
                        $("#uploading-mask").css("display","none");
                    }
                });
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
        }
    }


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


    function cleanPosition(){
        $(".product-title").val("");
        $(".product-desc").val("");
        productArray = globalVar.productArray = [];
        products = "";
        $("#image_content .upload-display").remove();
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

    globalVar.modules['publish'] = new Publish().init();
});