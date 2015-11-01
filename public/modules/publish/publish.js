/**
 * Created by man on 15-4-15.
 */
define(['router','util','touchEvent'],function(router,util){
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
                if($(".page.publish").hasClass("from-product")){
                    $(".page.publish").removeClass("from-product");
                    router.changeHash('product_display-'+globalVar.product_id,0);
                }else{
                    router.changeHash('live_room-'+globalVar.room_id,0);//不重新加载
                }
            });
            $(".adjustImg .fa-rotate-right").touch("click",function(event){
                var $this = event.$this,
                    $uploadBox = $this.parents(".upload-display"),
                    $img;
//                var imgSrc = ($img = $this.siblings("img")).attr("src").split("?")[0];
                var imgSrc = ($img = $this.parents('.upload-display')).css("background-image").split("url(")[1].split(")")[0].split('?')[0];
//                alert('adjustImg',imgSrc);
                var data = {
                    filePath:imgSrc.split('/images/thumb/')[1],//去掉协议以及ip信息
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
            },true);
            $("#submit").touch("click",function(event){
                var $this = event.$this;
                var desc = $(".product-desc").val();//TODO 检验字符串合法性
                var title = $(".product-title").val();
                if(!title){
                    $("#warn").fadeInAndOut("商品名称不能为空！");
                    return;
                }
                if(util.calcChars(title) > 40){
                    alert('商品名称过长，请重新编辑');
                    return;
                }
                if(productArray.length == 0 || !title){
                    $("#warn").fadeInAndOut('至少需要发布一张图片');
                    return;
                }
                $("#uploading-mask").css("display","block");
                var submitType = $this.attr('data-type');
//                alert(submitType)
                var url = "/we_account/publish",
                    postData = {
                        products:getProducts(),
                        desc:desc,
                        title:title
                    };
                if(submitType == 2){
                    url = '/we_account/edit-product';
                    postData.room_id = globalVar.room_id;
                    postData.product_id = globalVar.product_id;
                }
                $.ajax({
                    url:url,
                    type:"post",
                    data:postData,
                    success:function(data){
                        console.log(data);
                        if(data && data.flag == 1){
                            cleanPosition();
                            if($(".page.publish").hasClass("from-product")){
                                $(".page.publish").removeClass("from-product");
                                router.changeHash('product_display-'+globalVar.product_id,0);
                            }else{
                                showNewUploadImg(data.data.id || postData.product_id,productArray,title,submitType);
                                router.changeHash('live_room-'+globalVar.room_id,0);//不重新加载
                            }
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
            },true);

            $(".delete-img").touch("click",function(event){
                var $this = event.$this;
                var delIndex = $this.parents(".upload-display").index();
                setTimeout(function(){
                    $this.parents(".upload-display").remove();
                },200);
                productArray.splice(delIndex,1);
            },true);

            $('.upload-display').touch('click',function(event){
                $('#product-photo-edit_file_type').click();
            });

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
                        util.compress(res,function(err,result){
                            if(result.flag == 1){
//                                setTimeout(function(){
                                    $('.upload-display').css("background-image",'url(http://120.24.224.144/images/thumb/'+res + '?v='+ new Date().getTime()+')');
//                                },200);
                            }else{
                                alert("上传失败");
                            }
                            $("#uploading-mask").css("display","none");
                        });
                        console.log(res);
                        productArray = [res];
                    }
                })
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
     * @param title
     */
    function showNewUploadImg(product_id,productArray,title,submitType){
        var minColIndex = waterfall.getMinHeightColumnIndex();
//    alert(minColIndex);
        var imgstr = '';
        if(submitType == 2){
            var $product = $("#"+product_id);
//            alert(productArray[0]+" "+title+" "+"#"+product_id);
            $product.find('img').attr('src','http://120.24.224.144/images/'+productArray[0]+'?v='+new Date().getTime());
            $product.find('.desc').text(title).attr('data-desc',title);
            return;
        }
        productArray.forEach(function(item,i){
            if(i == 0){
                imgstr += '<img class="lazy" src="http://120.24.224.144/images/'+item+'" data-num="'+i+'">';
            }else{
                imgstr += '<img class="lazy" src="http://120.24.224.144/images/'+item+'" data-num="'+i+'"  style="height:'+waterfall.smallH+'px;width:'+waterfall.smallH+'px;">';
            }
        });
        if(title){
            var descStr = '<div class="desc" style="'+("border-bottom:1px solid #e6e6e6;")+'" data-desc="'+title+'">'+(title?title:"") +'</div>';
        }
        var deleteProductBtn = '<div class="delete-product"><i class="fa fa-times"></div>';
        var bottomStr = '<div class="product-footer"><div class="publish-time">'+(util.formatTime(new Date()))+'</div>'+deleteProductBtn+'</div>';//;
//        $(".column").eq(minColIndex).prepend('<div class="box" data-id="'+product_id+'">' +
//            '<div class="img-display" data-imgnum="'+productArray.length+'">' +imgstr+
//            '</div><div class="desc" style="border-bottom:1px solid #e6e6e6;" data-desc="'+desc+'">'+desc+'</div><div class="delete-product"><i class="fa fa-times-circle"></div></div>');
        $(".column").eq(minColIndex).prepend('<div id="'+product_id+'" class="box" data-id="'+product_id+'">' +
            '<div class="img-display"">'+ imgstr+
            '</div>'+descStr+bottomStr+'</div>');
    }

    /**
     * 渐入渐出
     * @returns {*|jQuery}
     */
    $.fn.fadeInAndOut = function(title){
        if(title){
            $('#warn').text(title);
        }
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