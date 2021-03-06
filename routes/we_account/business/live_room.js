/**
 * Created by Administrator on 2015/1/3.
 */

var dbOperator = require("../../../db/dbOperator"),
    urlencode = require('urlencode'),
    response = require("../response/response"),
    async = require("async"),
    http = require("http"),
    formidable = require("formidable"),
    path = require("path"),
    fs = require("fs"),
    we_auth = require("../we_auth"),
    querystring = require("querystring"),
    util = require("../util/util");


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
        session.isLoadOver = false;
        response.success(-1,res,"加载未完");
        return;
    }
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
    var open_id = req.session.openId||'oxfQVswUSy2KXBPOjNi_BqdNI3aA';//;
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
    var dir = '/mnt/projects/we_account_jqmobi/public/images/';
    var post_data = querystring.stringify({
        fileDir:dir,
        fileName:req.body.filePath
    });
    var req = http.request({
        host:"localhost",
        port:"8080",
        method:"post",
        path:"/MsecondaryServer/compressPic?fileDir="+dir+"&fileName="+req.body.filePath
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
    var dir = '/mnt/projects/we_account_jqmobi/public/images/';
//    var path = 'F:/weAccount_test/weAccountServerTest/public'+req.body.filePath;
    var post_data = querystring.stringify({
//        fileDir:dir,
    });
    var req = http.request({
        host:"localhost",
        port:"8080",
        method:"post",
        path:"/MsecondaryServer/img_rotate?fileDir="+dir+"&fileName="+req.body.filePath+"&rotate_type="+req.body.type
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

/**
 * 模糊匹配商品名
 * @param req
 * @param res
 * 需要验证openId
 */
function vagueSearchProduct(req,res){
    var roomId = req.query.room_id,
        productName = req.query.product_name;
    dbOperator.query('call pro_vague_match_product(?,?)',['%'+productName+'%',roomId],function(err,rows){
        if(err){
            response.failed(-1,res,'');
        }else{
            response.success(rows[0],res,0);
        }
    });
}

/**
 *
 * @param req
 * @param res
 */
function searchProductByName(req,res){
    var productName = req.query.product_name,
        roomId = req.query.room_id;
    dbOperator.query('call pro_search_product_by_name(?,?)',['%'+productName+'%',roomId],function(err,rows){
        if(err){
            response.failed(-1,res,0);
        }else{
            var products = rows[0];
            products.forEach(function(item,i){
                item.image_url = item.image_url.split(";");
            });
            response.success({products:rows[0]},res,0);
        }
    });
}



/**
 * 模糊匹配商品名
 * @param req
 * @param res
 * 需要验证openId
 */
function vagueSearchProduct(req,res){
    var openId = req.session.openId;
    var roomId = req.query.room_id,
        productName = req.query.product_name;
    dbOperator.query('call pro_vague_match_product(?,?)',['%'+productName+'%',openId],function(err,rows){
        if(err){
            response.failed(-1,res,'');
        }else{
            response.success(rows[0],res,0);
        }
    });
}

/**
 * 修改产品信息
 * @param req
 * @param res
 */
function editProduct(req,res){
    var openId = req.session.openId;//||'oxfQVswUSy2KXBPOjNi_BqdNI3aA',
        body = req.body,
        roomId = body.room_id,
        product_id = body.product_id,
        title = body.title,
        text = body.desc,
        image_url = body.products;
    dbOperator.query('call pro_edit_product(?,?,?,?,?,?)',[roomId,openId,product_id,title,text,image_url],function(err,rows){
        if(err){
            response.failed(-1,res,0);
        }else{
            console.log("call pro_edit_product:",rows[0][0]);
            //if(rows && rows.affectedRows > 0){
                response.success(rows[0][0]["existpid"],res,0);
            //}else{
            //    response.failed(0,res,0);
            //}
        }
    });
}

function uploadQrcode(req,res){
    var openId = req.session.openId;//||'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    //console.log(req);
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname+'';
    console.log(process.cwd()+" ******** "+__dirname);
    var newFileName = "qrcode_"+new Date().getTime();//test换成用户的唯一识别

    form.on('file', function(field, file) {
        //rename the incoming file to the file's name
        var originNameParts =  file.name.split(".");
        newFileName = newFileName + "." +originNameParts[originNameParts.length - 1];
        console.log( "detail-info:",file);
        console.log( "origin-name:"+path.normalize(process.cwd()+"/public/images/" + file.name));
        console.log( "rename:"+path.normalize(process.cwd()+"/public/images/" + newFileName));
        fs.rename(file.path, path.normalize(process.cwd()+"/public/images/" + newFileName),function(err){
            console.log("newPath:"+file.path);
//            live_room.compressImg(res,newFileName);
        });
    })
        .on('error', function(err) {
            console.log("an error has occured with form upload");
            console.log(err);
//            request.resume();
        })
        .on('aborted', function(err) {
            console.log("user aborted upload");
        })
        .on('end', function() {
            console.log('-> upload done');
//            live_room.compressImg(res,newFileName);
        });

    form.parse(req,function(err,fields,files){
//            fs.renameSync(files.upload.path,"/image/test.png");
        if(err){
            console.log(err);
            res.send("err");
        }
        dbOperator.query('call pro_add_qrcode(?,?)',[openId,newFileName],function(err,results){
            if(err){
                console.log('pro_add_qrcode err',err);
            }
        });
//        response.success({qrcode:newFileName},res);
        res.send(newFileName);
//        live_room.compressImg(res,newFileName);
    });
}

/**
 * 砍价信息页面
 * @param req
 * @param res
 */
function cut(req,res){
    //req.session.openId = 'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    var cut_id = req.query.cutserial,
        room_id = req.query.room_id;
    if(req.session.openId){
        getCutInfo(cut_id,res)();
        return;
    }
    if(!req.session.authority){
        req.session.authority = true;
        var redirect_uri = "http://www.daidai2u.com/we_account/cut?cutserial="+cut_id+"&room_id="+room_id+"#"+room_id;
        we_auth.getWeAuth(redirect_uri,res,"snsapi_userinfo");
    }else{
        we_auth.redirectToUrl(req,res,function(err,results,requ,resp,nocode){
            if(err){
                console.log('getAuth snsapi_userinfo failed:',err);
            }else if(nocode){
                delete req.session.authority;
                return;
            }else if(results){
                var openId = req.session.openId = results.openid;
                var accessToken = results.access_token;
                console.log("get openId:"+results.openid);
                we_auth.getSnsapi_userinfo(req,res,accessToken,openId,function(err,userInfo){
                    async.series([
                        helpCut(cut_id,openId,0,userInfo.nickname,userInfo.sex,userInfo.headimgurl),
                        getCutInfo(cut_id,res)
                    ],function(err,results){
                        if(err){
                            res.render("error",{});
                        }
                    });
                });

            }
        });
    }
}

/**
 * 进入帮帮砍的页面，尚未开砍，建立t_cutlist_detail基本信息
 * @param cut_id
 * @param openId
 * @param cutMoney
 * @param nicknam
 * @param sex
 * @param headimgurl
 * @returns {Function}
 */
var helpCut = function(cut_id,openId,cutMoney,nicknam,sex,headimgurl){
    var args = [cut_id,openId,cutMoney,nicknam,sex,headimgurl];//cut_id,open_id,cut_money,nicknam,sex,headimgurl
    return function(cb){
        dbOperator.query("call pro_ready_help_cut(?,?,?,?,?,?)",args,function(err,rows){
            if(err){
                console.log("pro_ready_help_cut error");
            }
            cb(err,rows);
        })
    }
};
/**
 * 砍价信息页面
 * @param cut_id
 * @param res
 * @returns {Function}
 */
var getCutInfo = function(cut_id,res){
    return function(cb){
        dbOperator.query("call pro_get_cut_info(?)",[cut_id],function(err,rows){
            if(err){
                res.render("error",{});
            }else{
                if(rows && rows[0] && rows[0][0]){
                    res.render("cut_off",rows[0][0]);
                }else{
                    res.render("error",{});
                }
                cb?cb(null,rows):"";
            }
        });
    }
}

/**
 * 砍一刀咯
 * @param req
 * @param res
 */
function helpCutOff(req,res){
    var openId = req.session.openId;
    var cutId = req.query.cut_id;
    dbOperator.query("call pro_help_cut(?,?,?)",[cutId,openId,1],function(err,rows){
        if(err){
            console.log("call pro_help_cut err:",err);
            response.failed(-1,res,"");
        }else{
            if(rows && rows[0] && rows[0][0]){
                var alreadyCut = rows[0][0].alreadyCut;
                if(alreadyCut){
                    response.success(2,res,"");//已经砍过了
                }else{
                    response.success(1,res,"");//没砍过，成功了
                }
            }
        }
    });
}

/**
 * 获取砍价列表
 * @param req
 * @param res
 */
function getCutList(req,res){
    //req.session.openId = 'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    var openId = req.session.openId;
    dbOperator.query("call pro_get_cut_list(?)",[openId],function(err,rows){
        if(err){
            console.log("call pro_get_cut_list err");
            res.render("error",{});
        }else{
            if(rows && rows[0]){
                res.render("cut_list",{datalist:rows[0]});
            }else{
                res.render("error",{});
            }
        }
    });
}

/**
 *
 * @param req
 * @param res
 */
function create_cut_info(req,res){
    var openId = req.session.openId;
    var query = req.query;
    var username = query.username,
        productName = query.product_name,
        price = query.price,
        create_time = util.formatDate(new Date(),1),
        product_img = query.product_img,
        activity_duration = query.activity_duration;
    dbOperator.query("call pro_create_cut_info(?,?,?,?,?,?,?)",[openId,username,productName,price,create_time,product_img,activity_duration], function (err,rows) {
        if(err){
            console.log("call pro_create_cut_info err:"+err);
            response.failed(-1,res,"")
        }else{
            if(rows && rows[0] && rows[0][0]){
                response.success(rows[0][0],res,"");
            }else{
                response.success(2,res,"")
            }
        }
    })
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
exports.vagueSearchProduct = vagueSearchProduct;
exports.searchProductByName = searchProductByName;
exports.editProduct = editProduct;
exports.uploadQrcode = uploadQrcode;
exports.cut = cut;
exports.helpCutOff = helpCutOff;
exports.getCutList = getCutList;
exports.create_cut_info = create_cut_info;