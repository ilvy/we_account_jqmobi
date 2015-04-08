/**
 * Created by Administrator on 14-12-26.
 * 瀑布流相对布局
 *
 */
var boxes = [],
    waterfall,
    asyncLoader,
    totalPage,currentPage = 0;

$(document).ready(function(){
    boxes = $(".box");//sorted date source
    waterfall = new Waterfall();
    asyncLoader = new AsyncLoader();
    waterfall.asyncLoader();
})
$(window).on("load",function(){

});
$(window).on("resize",function(){
//    waterfall.init();
});

var Waterfall = function(){
    this.displayWay = '';//1.image size,2.self defined
    this.margin = 8;
    this.box_w = 200;
    this.h_weights = [];//weight of height,including prices,img size and so on 每列的高度
    this.isLoadOver = true;//上一次加载事件是否已经完毕,第一次加载默认为true
    this.init();
}

Waterfall.prototype.init = function(){
    var win_w = this.win_w = $(window).width(),
        win_H = this.win_H =  $(window).height();
    if(isPC()){
        win_w -= 20;
        this.win_w = win_w;
    }
    if(win_w <= 360){
        this.min_col_num = 2;
    }else if(win_w <= 560){
        this.min_col_num = 3;
    }else if(win_w <= 768){
        this.min_col_num = 4;
    }else if(win_w <= 921){
        this.min_col_num = 5;
    }else if(win_w <= 1366){
        this.min_col_num = 5;
    }else if(win_w <= 1440){
        this.min_col_num = 6;
    }else{
        this.min_col_num = 8;
    }
    this.box_w = Math.floor((win_w - (this.min_col_num +1) * this.margin) / this.min_col_num);
//    $(".box").css("width",this.box_w);
    var smallH = this.smallH = Math.floor((this.box_w - 3.5*4) / 3);//Math.floor(this.box_w * 0.3);
    this.generateColumn();
    this.setHeader();
    $(".box").each(function(){
        $(this).find("img:first-child").siblings("img").css({
            width:smallH,
            "height":smallH
        });
    });
//    this.setPosition(boxes);
}

Waterfall.prototype.generateColumn = function(){
    var col_num = this.min_col_num;
    for(var i = 0; i < 8; i++){
        if(i < col_num){
            $(".waterfall .column").eq(i).css({
                width: this.box_w,
                float: "left",
                'margin-left': this.margin+"px"
            });
        }else{
            $(".waterfall .column").eq(i).css({
                display:"none"
            });
        }

    }
}

Waterfall.prototype.setPosition = function(boxes){
    this.isLoadOver = true;//开始排位说明已经加载完毕
    var colNum = this.min_col_num,
        hs = this.h_weights,
        box_h,
        box_w = this.box_w,
        margin = this.margin,
        left,
        min_H,
        minKey,
        _this = this,
        i = 0;
    for(var ib = 0; ib < boxes.length; ib++){
//        $(".column").eq(ib % colNum).append(boxes.eq?boxes.eq(ib).removeClass("unvisible"):boxes[ib]);
        $(".column").eq((ib + this.getMinHeightColumnIndex()) % colNum).append(boxes[ib]); 
    }
};

Waterfall.prototype.setHeader = function(){
    var headerW = this.win_w - 2 * this.margin;
    $("#header").css({
        width:headerW,
        'margin-left':this.margin
    });
}

Waterfall.prototype.asyncLoader = function(){
    if(!this.isLoadOver){
        return;
    }
    this.isLoadOver = false;
    var _this = this;
    var productsStrs = [],imgstr = '',isPublisher = "";
    asyncLoader.load(function(results){
        if(results.flag != 1){
            return;
        }
        var loadDatas;
        var urlArray = [],lazyImgs;//需要异步加载的图片数组
        if(results.data){
            loadDatas = results.data.products;
            totalPage = results.data.totalPage;
            isPublisher = results.data.isPublisher;
        }
        var deleteProductBtn = "";
        if(!isPublisher){
            deleteProductBtn = '<div class="delete-product"><i class="fa fa-times-circle"></div>';//<input type="button" value="删除"/>
        }else{
            deleteProductBtn = '<a href="/we_account/personalInfo"><div class="contact">联系卖家</div></a>';
        }
        loadDatas.forEach(function(item){
//        $(this).clone().css(_this.lastPosition).appendTo(".waterfall");
            var imgstr = '',descStr;
            imgstr = '<img class="lazy" src="http://120.24.224.144/images/'+item.image_url[0]+'" data-num="0">' + imgstr;
            descStr = '<div class="desc" style="'+("border-bottom:1px solid #e6e6e6;")+'" data-desc="'+item.title+'">'+(item.title?item.title:"") +'</div>';
            productsStrs.push('<div id="'+item.id+'" class="box" data-id="'+item.id+'">' +
                '<div class="img-display" data-imgnum="'+item.image_url.length+'">'+ imgstr+
                '</div>'+descStr+deleteProductBtn+'</div>');
        });
        _this.setPosition(productsStrs);
        var loadImgCount = 0;
//        lazyImgs = document.getElementsByClassName("lazy");
//        preloadImgs(lazyImgs,function ready(width,height){
//
//        },function onload(width,height){
//            loadImgCount++;
//            if(loadImgCount == lazyImgs.length){
//                $(".lazy").removeClass("lazy");
//            }
//        },function error(){
//            loadImgCount++;
//            if(loadImgCount == lazyImgs.length){
//                $(".lazy").removeClass("lazy");
//            }
//        });
    });

}

/**
 * 获取当前图片列的最小高度值，用于滚动加载判断
 * @returns {number}
 */
Waterfall.prototype.getMinHeight = function(){
    var $columns = $(".column"),
        colHeights = [];
    var _this = this;
    $columns.each(function(i){
        if(i < _this.min_col_num){
            colHeights.push($(this).outerHeight());
        }
    });
    return Math.min.apply(null,colHeights);
}

/**
 * 获取当前图片列的最小高度值，用于滚动加载判断
 * @returns {number}
 */
Waterfall.prototype.getMinHeightColumnIndex = function(){
    var $columns = $(".column"),
        colHeights = [];
    var _this = this,minH = $columns.eq(0).outerHeight(),minInd = 0,tmpH;
    $columns.each(function(i){
        if(i == 0 || i >= _this.min_col_num){
            return;
        }else{
            if(minH > (tmpH = $(this).outerHeight())){
                minH = tmpH;
                minInd = i;
            }
        }
    });
    return minInd;
}


/**
 * 异步加载器
 * @type {Loader}
 */
var AsyncLoader = Waterfall.Loader = function(){
    this.loaderData = null;
}

AsyncLoader.prototype.setTheLastPos = function(){

}

AsyncLoader.prototype.load = function(callback){
    if(currentPage + 1 >= totalPage){
        return;
    }
    var url = '/we_account/load_more?page='+currentPage++;
    $.ajax({
        url:url,
        type:"get",
        success:function(results){
            console.log(results);
            callback(results);
        },
        error:function(err){
            console.log(err);
        }
    })
}

function printArray(str,arr){
    var res = '';
    for(var i in arr){
        res += ","+arr[i]
    }
    console.log(str+":"+res);
}


/**
 * 判断是否pc设备
 * @returns {boolean}
 */
function isPC(){
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("android", "iphone", "symbianos", "windows phone", "ipad", "ipod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.toLowerCase().indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}