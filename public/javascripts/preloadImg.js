/**
 * Created by Administrator on 14-12-12.
 */
// imgReady event - 2011.04.02 - TangBin - MIT Licensed

var imgReady = (function () {
    var list = [], intervalId = null,

    //
        tick = function () {
            var i = 0;
            for (; i < list.length; i++) {
                list[i].end ? list.splice(i--, 1) : list[i]();
            };
            !list.length && stop();
        },

    //
        stop = function () {
            clearInterval(intervalId);
            intervalId = null;
        };

    return function (img, ready, load, error) {
        var check, width, height, newWidth, newHeight;
//            img = new Image();

//        img.src = url;
        if (img.complete) {
            ready(img.width, img.height);
            load && load(img.width, img.height);
            return;
        };

        //
        width = img.width;
        height = img.height;
        console.log("origin:w_"+width+"h_"+height);
        check = (function(){
            var imgObj = img,
                listObj = list;
            return function() {
                newWidth = imgObj.width;
                newHeight = imgObj.height;
                if (newWidth !== width || newHeight !== height
//                ||newWidth * newHeight > 1024
                    ) {
                    width = newWidth;
                    height = newHeight;
                    listObj.push(check);
//                    ready(newWidth, newHeight);
//                    check.end = true;
                }else if(newWidth == width && newHeight == height && width != 0){
                    ready(newWidth, newHeight);
                    check.end = true;
                }
            }
        })();
        check();

        //
        img.onerror = function () {
            error && error();
            console.log("error:"+img.getAttribute("src"));
            check.end = true;
            img = img.onload = img.onerror = null;
        };

        //
        img.onload = function () {
            load && load(img.width, img.height);
            !check.end && check();
            //
            img = img.onload = img.onerror = null;
        };

        //
        if (!check.end) {
            list.push(check);
            if (intervalId === null) intervalId = setInterval(tick, 40);
        };
    };
})();


function preloadImgs(urlArray,ready,onload,error){
    for(var i = 0; i < urlArray.length; i++){
        (function(){
            var url = urlArray[i];
            imgReady(url,ready,onload,error);
        })();

    }
}