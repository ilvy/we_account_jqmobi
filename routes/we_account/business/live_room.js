/**
 * Created by Administrator on 2015/1/3.
 */

var dbOperator = require("../../../db/dbOperator"),
    urlencode = require('urlencode'),
    response = require("../response/response"),
    async = require("async"),
    http = require("http"),
    querystring = require("querystring");


/**
 * 进入直播间页面
 * @param req
 * @param res
 */
function gotoLiveRoom_new(req,res,reqType){//相对布局瀑布流，不加载商品信息
    console.log("***********************gotoLiveRoom");
    var openId = req.session.openId,//||(req.session.openId = 'oHbq1t0enasGWD7eQoJuslZY6R-4'),
        type = req.session.type;
//    var u_type = req.query.u_type;//u_type:用户类型，用于区别 发布者和普通用户 从商品详细页面跳回商品瀑布流展示页面的判断
    var room_id;
    room_id = req.query.room_id;
    req.session.room = room_id;
    var products,totalPage,
        paras1 = [null,null,0];
    req.session.type = 0;
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"+req.session.type);
    checkPublisher(function(err,results){
        var session = req.session;
        var productRes,publisher = results;
        if(publisher.isPublisher){//发布者进入房间
            session.isPublisher = 1;
            if(reqType == 'get'){
                res.render("live_room_rel_layout",{publisher:publisher.isPublisher?publisher:"",room:publisher.room_id});
            }else{
                response.success({publisher:publisher.isPublisher?publisher:"",room:publisher.room_id},res,'');
            }
        }else{
            session.isPublisher = 0;
            if(openId){
                dbOperator.query("call pro_check_user_favorite_room(?,?)",[openId,room_id],function(err,favResult){
                    if(err){
                        console.log("pro_select_favourite_rooms err:");
                        console.log(err);
                    }
                    if(reqType == 'get'){
                        res.render("live_room_rel_layout",{publisher:"",room:publisher.room_id,isFavorite:favResult[0][0]['result'],host:publisher.nickname});
                    }else{
                        response.success({publisher:"",room:publisher.room_id,isFavorite:favResult[0][0]['result'],host:publisher.nickname},res,'');
                    }
                });
            }else{
                if(reqType == 'get'){
                    res.render("live_room_rel_layout",{publisher:"",room:publisher.room_id,isFavorite:0,host:publisher.nickname});
                }else{
                    response.success({publisher:"",room:publisher.room_id,isFavorite:0,host:publisher.nickname},res,'');
                }
            }
        }
//        if(type == 1 || (u_type == 1 && req.session.isPublisher)){//发布者
//            res.render("live_room_rel_layout",{publisher:publisher.isPublisher?publisher:"",room:publisher.room_id,u_type:1});
//        }else if(type > 1){
//            if(openId){
//                dbOperator.query("call pro_check_user_favorite_room(?,?)",[openId,room_id],function(err,favResult){
//                    if(err){
//                        console.log("pro_select_favourite_rooms err:");
//                        console.log(err);
//                    }
//                    res.render("live_room_rel_layout",{publisher:"",room:publisher.room_id,isFavorite:favResult[0][0]['result'],host:publisher.nickname});
//                });
//            }else{
//                res.render("live_room_rel_layout",{publisher:"",room:publisher.room_id,isFavorite:0,host:publisher.nickname});
//            }
//        }else{
//            res.render("live_room_rel_layout",{publisher:"",room:publisher.room_id,isFavorite:0,host:publisher.nickname});
//        }
    });

    //监测是不是发布者自己进入
    function checkPublisher(cb){
        dbOperator.query("call pro_check_publisher_knock(?,?)",[room_id,openId],function(err,results){
            if(err){
                console.log(err);
            }
            cb(err,results[0][0]);
        });
    }

}

/**
 * 进入直播间页面
 * @param req
 * @param res
 */
function gotoLiveRoom_new_bak(req,res){
    console.log("***********************gotoLiveRoom");
    var openId = req.session.openId,
        type = req.session.type;
    var room_id = req.query.room_id;
    req.session.room_id = room_id;
    var products,totalPage,
        paras1 = [null,null,0];
    var funs = [
        function select_product(cb){
            dbOperator.query("call pro_select_products(?,?,?)",paras1,function(err,rows){
                if(err){
                    console.log("select products err");
                    res.redirect("/err.html");
                }
                console.log(rows);
                totalPage = rows[0][0]['totalpage'];
                products = rows[1];
                products.forEach(function(item,i){
                    item.image_url = item.image_url.split(";");
                });
//        console.log("products:"+products);
//                res.render("live-room",{products:products||[],publisher:publisher,totalPage:totalPage});
                cb(err,{products:products||[],totalPage:totalPage})
            });
        }
    ];
    req.session.isPublisher = type==1 ? 1:0;
    if(type == 1){//发布者
        funs.unshift(checkPublisher);
        paras1[0] = openId;
    }else{
        paras1[1] = room_id;
    }
    async.series(funs,function(err,results){
        var productRes,publisher = null;
        if(type == 1){
            productRes = results[1];//商品信息
            publisher = results[0];//发布者信息
        }else{
            productRes = results[0];
        }
        res.render("live_room_rel_layout",{products:productRes["products"]||[],publisher:publisher,totalPage:productRes["totalPage"]});
    });

    //监测是不是发布者自己进入
    function checkPublisher(cb){
        dbOperator.query("call pro_check_publisher_knock(?,?)",[null,openId],function(err,results){
            if(err){
                console.log(err);
            }
            cb(err,results[0][0]);
        });
    }

}


function gotoLiveRoom(req,res){
    console.log("***********************gotoLiveRoom");
    var openId = req.session.openId;
    var products,totalPage;
    var funs = [
        //监测是不是发布者自己进入
        function checkPublisher(cb){
            dbOperator.query("call pro_check_publisher_knock(?,?)",[null,openId],function(err,results){
                if(err){
                    console.log(err);
                }
                cb(err,results[0][0]);
            });
        },
        function select_product(publisher,cb){
            req.session.isPublisher = publisher ? 1:0;
            dbOperator.query("call pro_select_products(?,?,?)",[openId,null,0],function(err,rows){
                if(err){
                    console.log("select products err");
                    res.redirect("/err.html");
                }
                console.log(rows);
                totalPage = rows[0][0]['totalpage'];
                products = rows[1];
                products.forEach(function(item,i){
                    item.image_url = item.image_url.split(";");
                });
//        console.log("products:"+products);
                res.render("live-room",{products:products||[],publisher:publisher,totalPage:totalPage});
            });
        }
    ];
    async.waterfall(funs,function(err,results){});

}

function knocktoLiveRoom(req,res){
    console.log("***********************knocktoLiveRoom");
    var openId = req.session.openId,
        room = req.session.room || '888888';
    if(!room){
        room = null;
        response.failed("",res,"room is null");
        return;
    }
    var products,totalPage;
    var funs = [
        //监测是不是发布者自己进入
        function checkPublisher(cb){
            dbOperator.query("call pro_check_publisher_knock(?,?)",[room,openId],function(err,results){
                if(err){
                    console.log(err);
                }
                cb(err,results[0][0]);
            });
        },
        function select_product(publisher,cb){
            req.session.isPublisher = publisher ? 1:0;
            dbOperator.query("call pro_select_products(?,?,?)",[null,room,0],function(err,rows){
                if(err){
                    console.log("select products err");
                    res.redirect("/err.html");
                }
                console.log(rows);
                totalPage = rows[0][0]['totalpage'];
                products = rows[1];
                products.forEach(function(item,i){
                    item.image_url = item.image_url.split(";");
                });
//        console.log("products:"+products);
                res.render("live-room",{products:products||[],publisher:publisher,totalPage:totalPage});
            });
        }
    ];
    async.waterfall(funs,function(err,results){});

}

/**
 * 顾客（非发布者）输入门牌号，敲门
 */
function knockDoor(req,res){
    var body = req.body,
        room = urlencode(body.room);
    if(!room){
        response.failed("",res,"输入为空");
    }else{
        req.session.room = room;
        dbOperator.query("call pro_customer_knock_door(?)",[room],function(err,results){
            if(results[0][0]['result'] > 0){
                response.success("",res,"有这个门牌号,客人请进!");
            }else{
                response.failed("",res,"没有这个门牌号,客人请确认一下!");
            }
        });
    }

}
/**
 * 顾客（非发布者）直接在微信输入框输入门牌号，敲门，检测是否存在房间
 */
function checkRoom(room,callback){

    dbOperator.query("call pro_customer_knock_door(?)",[room],function(err,results){
        if(results[0][0]['result'] > 0){
            callback(err,room);
        }else{
            callback(err,null);
        }
    });
}

/**
 * 延时加载接口
 * @param req
 * @param res
 */
function loadMoreProducts_new(req,res){
    var session = req.session,
        openId = session.openId,
        type = req.session.type;
    var room_id = session.room;
    if((typeof  session.isLoadOver != 'undefined' && !session.isLoadOver)){
        response.success(-1,res,"加载未完");
    }
    session.isLoadOver = false;
    var query = req.query;
    var paras = [null,null,query.page];
    var products;
    if(session.isPublisher){
        paras[0] = openId;
    }else{
        paras[1] = room_id;
    }
    dbOperator.query("call pro_select_products(?,?,?)",paras,function(err,rows){
        if(err){
            console.log("select products err");
            res.redirect("/err.html");
        }
        console.log(rows);
        products = rows[1];
        products.forEach(function(item,i){
            item.image_url = item.image_url.split(";");
        });
//        console.log("products:"+products);
        session.isLoadOver = true;
        response.success({products:products,totalPage:rows[0][0]['totalpage'],isPublisher/*发布者有删除按钮*/:session.isPublisher},res,"加载成功");
    });
}

/**
 * 延时加载接口
 * @param req
 * @param res
 */
function loadMoreProducts(req,res){
    var session = req.session,
        openId = session.openId,
        room = session.room;
    var query = req.query;
    var paras = [null,null,query.page];
    var products;
    if(session.isPublisher){
        paras[0] = openId;
    }else{
        paras[1] = room;
    }
    dbOperator.query("call pro_select_products(?,?,?)",paras,function(err,rows){
        if(err){
            console.log("select products err");
            res.redirect("/err.html");
        }
        console.log(rows);
        products = rows[1];
        products.forEach(function(item,i){
            item.image_url = item.image_url.split(";");
        });
//        console.log("products:"+products);
        response.success({products:products,totalPage:rows[0][0]['totalpage']},res,"加载成功");
    });
}

/**
 * 添加收藏直播间
 * @param req
 * @param res
 */
function addFavourite(req,res){
    var room = req.session.room,
        open_id = req.session.openId;
    console.log("*****************%%%%%%%%%%%%%%%%%%%%%%%"+room+"            "+open_id);
    var paras = [open_id,room];
    if(room && open_id){
        dbOperator.query('call pro_add_favourite(?,?)',paras,function(err,rows){
            if(err){
                console.log("call pro_add_favourite error:"+err);
                response.failed("-2",res,'');//程序报错
            }else{
                var result = rows[0][0]["res"];
                if(result == 1){//添加收藏成功
                    response.success("1",res,'收藏成功');
                }else if(result == 0){//房间不存在
                    response.failed("0",res,'');
                }else if(result == 2){//已经收藏过
                    response.success("2",res,'是否取消收藏');
                }else if(result == -1){//当前房间发布者不用收藏

                }
            }
        })
    }else if(!open_id){
        response.failed("-2",res,'需要先关注公众号');//当前用户并未关注公众号，无法收藏
    }
}
/**
 * 取消关注直播间
 * @param req
 * @param res
 */
function cancelFavorite(req,res){
    var room = req.query.room_id || req.session.room,
        open_id = req.session.openId;
    var paras = [open_id,room];
    if(open_id){
        dbOperator.query("call pro_cancel_favorite(?,?)",paras,function(err,rows){
            if(err){
                console.log(err);
                response.failed("err",res,"err");
            }else{
                if(rows[0][0] && rows[0][0]['res'] > 0){
                    response.success("10",res,"取消关注成功");//
                }else{
                    response.failed("-10",res,"");//取消失败
                }
            }
        });
    }else{
        response.failed("-11",res,"");//取消失败,请先关注公众号
    }

}

/**
 *
 * @param req
 * @param resp
 */
function renderRoom_door(req,resp){
    var open_id = req.session.openId||'oHbq1t0enasGWD7eQoJuslZY6R-4';
    var paras = [open_id];
    if(open_id){
        dbOperator.query("call pro_select_favourite_rooms(?)",paras,function(err,rows){
            if(err){
                console.log(err);
            }else{
                console.log(rows);
                resp.render('room-door',{favourite_rooms:rows[0]});
            }
        })
    }else{

    }
}

var filePath,
    dirPath = '/mnt/projects/weAccount_git/we_account/public/images/';
function compressImg(res,fileName,callback){
    filePath = dirPath + fileName;
    var data = {
        filePath:filePath
    };
    var req = http.request({
        host:"120.24.224.144",
        port:"8080",
        method:"post",
        path:"/MsecondaryServer/compressPic"
    },function(res){
        var result = "";
        res.on("data",function(chunk){
            result += chunk;
        }).on("end",function(){
            console.log(result);
            result = JSON.parse(result);
//            callback(null,result);
            if(result.code == 1){
                res.send(fileName);
            }else{
                res.send(result.code);
            }
        }).on("error",function(err){
            console.log(err);
//            callback(err,null);
        });
    });
    req.write(querystring.stringify(data));
    req.end();
}

/**
 * 删除商品
 * @param req
 * @param res
 */
function delete_product(req,res){
    var body = req.body;
    var id = body.id,
        openId = req.session.openId;
    dbOperator.query("call pro_delete_product(?,?)",[openId,id],function(err,results){
        if(err){
            console.log("call pro_delete_product err:"+err);
            response.failed("删除失败",res,"删除失败");
            return;
        }
        response.success("删除成功",res,"删除成功");
    });
}

/**
 * 单个商品展示
 * @param req
 * @param res
 */
function displayProduct(req,res){
    var query = req.query;
    var id = query.product_id;
//        u_type = query.u_type;
    dbOperator.query('call pro_select_product_by_id(?)',[id],function(err,results){
        if(err){
            console.log("call pro_select_product_by_id err:"+err);
            response.failed("",res,'');
            return;
        }
        var product = results[0][0];
        product.image_url = product.image_url.split(";");
//        res.render("product",{product:product});
        response.success(product,res,'');
    });
}

/**
 * 获取收藏的房间列表
 * @param req
 * @param res
 */
function myFavorite(req,res){
    var open_id = req.session.openId||'oHbq1t0enasGWD7eQoJuslZY6R-4';//;
    var paras = [open_id];
    if(open_id){
        dbOperator.query("call pro_select_favourite_rooms(?)",paras,function(err,rows){
            if(err){
                console.log(err);
                response.failed('',res,'');
            }else{
                console.log(rows);
//                res.render('myfavorite',{favourite_rooms:rows[0]});
                response.success(rows[0],res,'');
            }
        })
    }else{//需要先关注公众号
        res.redirect("/follow_account.html");
//        res.render('myfavorite',{favourite_rooms:[{nickname:"威廉鸡煲",room_id:"111111"},{nickname:"威廉鸡煲",room_id:"111111"},{nickname:"威廉鸡煲",room_id:"111111"}]});
    }
}

querystring = require('querystring');
/**
 * 图片压缩
 * @param req
 * @param res
 */
function compressPic(req,resp){
    var path = '/mnt/projects/weAccount_git/we_account/public/images/'+req.body.filePath;
    var post_data = querystring.stringify({
        filePath:path
    });
    var req = http.request({
        host:"localhost",
        port:"8080",
        method:"post",
        path:"/MsecondaryServer/compressPic?filePath="+path
    },function(res){
        var result = "";
        res.on("data",function(chunk){
            result += chunk;
        }).on("end",function(){
                console.log(result);
                response.success("",resp,"");
            }).on("error",function(err){
                console.log(err);
                response.failed("",resp,"");
            });
    });
    req.end();
}

/**
 * 旋转图片
 * @param req
 * @param resp
 */
function rotateImg(req,resp){
    var path = '/mnt/projects/weAccount_git/we_account/public'+req.body.filePath;
//    var path = 'F:/weAccount_test/weAccountServerTest/public'+req.body.filePath;
    var post_data = querystring.stringify({
        filePath:path
    });
    var req = http.request({
        host:"localhost",
        port:"8080",
        method:"post",
        path:"/MsecondaryServer/img_rotate?filePath="+path+"&rotate_type="+req.body.type
    },function(res){
        var result = "";
        res.on("data",function(chunk){
            result += chunk;
        }).on("end",function(){
                console.log(result);
                response.success("",resp,"");
            }).on("error",function(err){
                console.log(err);
                response.failed("-10",resp,"");
            });
    });
    req.end();
}

//exports.renderLiveRoom = gotoLiveRoom;
exports.renderLiveRoom_new = gotoLiveRoom_new;
exports.knockDoor = knockDoor;
//exports.knocktoLiveRoom = knocktoLiveRoom;
//exports.loadMoreProducts = loadMoreProducts;
exports.loadMoreProducts_new = loadMoreProducts_new;
exports.addFavourite = addFavourite;
exports.cancelFavorite = cancelFavorite;
exports.renderRoom_door = renderRoom_door;
exports.compressImg = compressImg;
exports.delete_product = delete_product;
exports.displayProduct = displayProduct;
exports.myFavorite = myFavorite;
exports.checkRoom = checkRoom;
exports.compressPic = compressPic;
exports.rotateImg = rotateImg;