/**
 * Created by man on 15-4-15.
 */
define([],function(){

    function Product(){
        this.init = function(){
            this.do();
            return this;
        }
        this.do = function(){
            var url = 'product_display?product_id='+globalVar.product_id;
            $.ajax({
                url:url,
                type:'get',
                success:function(result){
                    if(result.flag == 1){
                        var product = result.data;
                        $(".product_display .desc").html(product.text);
                        $(".product_display img").attr("src",'http://120.24.224.144/images/'+product.image_url[0]);
                    }
                },
                error:function(err){
                    console.log(err);
                }
            });
        }
    }
    modules['product_display'] = new Product().init();
});