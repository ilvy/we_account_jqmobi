/**
 * Created by man on 15-4-3.
 */
define([],function(){
    var url = 'product_display?product_id='+globalVar.product_id;
    require(['text!'+url],function(html){
        document.getElementById("product").innerHTML = html;
    });

});