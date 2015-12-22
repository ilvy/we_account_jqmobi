/**
 * Created by Administrator on 14-12-29.
 */
var mysql = require("mysql"),
    dbPoolConfig = require("../config/config").dbPoolConfig,
    urlencode = require("urlencode");
var logger = require("log4js").getLogger("dbOperator");
logger.setLevel("INFO");

var pool = mysql.createPool(dbPoolConfig);

//var query = function(sql,posts,callback){
//    sql = mysql.format(sql,posts);
//    console.log("sql:\n"+sql);
//    pool.getConnection(function(err,connection){
//        if(err){
//            console.log(err);
//            return;
//        }
//        connection.query(sql,posts,function(err,rows){
//            callback(err,rows);
//            connection.release();
//        });
//    })
//}

var query = function(sql,posts,callback){
    sql = mysql.format(sql,posts);
    logger.info("sql:\n",sql);
    pool.query(sql,function(err,rows,fields){
        callback(err,rows);
    });
};

exports.query = query;

//console.log(urlencode("http://120.24.224.144/we_account"));
//query("select * from ?? where id = ?",['user',1],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//});

/**
 * 调用存储过程测试
 */
//query("call pro_test()",[],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//});


//query("call pro_publish(?,?,?)",["img1.jpg;img2.jpg",'hhhhhhhhhhaaaaaaa','oHbq1t0enasGWD7eQoJuslZY6R-4'],function(err,row){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(row);
//    }
//});

//query("call pro_check_register_by_weAccount(?)",['fdsfdfdsfdsfdsfdsfdfs'],function(err,rows){
//    if(err){
//        console.log(err);
//    }
//    console.log(rows);
//});

//query('call pro_register(?,?,?,?)',['1111110','222222222222','11111111111','1111111111111'],function(err,rows) {
//    if (err) {
//        console.log(err);
//    } else {
//        console.log(rows);
//    }
//});

//query("call pro_select_products(?,?,?)",['oHbq1t0enasGWD7eQoJuslZY6R-4','888888',0],function(err,results){
//    if(err){
//        console.log(err);
//    }
//    console.log(results);
////    cb(err,results[0][0]);
//});
//call pro_check_register_by_weAccount('oHbq1t_wYiRebu6m8Qy8zF2ztreM')
//query("call pro_check_register_by_weAccount(?)",['oHbq1t0enasGWD7eQoJuslZY6R-4'],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows)
//    }
//})


//query("call pro_check_user_favorite_room(?,?)",['oHbq1t0enasGWD7eQoJuslZY6R-4','999999'],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows)
//    }
//})

//query("call pro_check_publisher_knock(?,?)",['999999','oHbq1t0enasGWD7eQoJuslZY6R-4'],function(err,results){
//    if(err){
//        console.log(err);
//    }
//    console.log(results);
//});
//var http = require("http");
//var querystring = require('querystring');
//var path = '/mnt/projects/weAccount_git/we_account/public/images/test_1423127310729.jpg';//"F:/learn/compress/2.jpg";//
//var post_data = querystring.stringify({
//    filePath:path
//});
//var req = http.request({
//    host:"120.24.224.144",//"localhost",//
//    port:"8080",
//    method:"post",
//    path:"/MsecondaryServer/compressPic?filePath="+path
//},function(res){
//    var result = "";
//    res.on("data",function(chunk){
//        result += chunk;
//    }).on("end",function(){
//            console.log(result);
//        }).on("error",function(err){
//            console.log(err);
//        });
//});
////req.write(post_data+"\n");
//req.end();


//query("UPDATE t_weix_account_info set ?? = ? where open_id = ?;",["weix_account","weix_test","oHbq1t0enasGWD7eQoJuslZY6R-4"],function(err,rows){
//    if(err){
//        console.log("personality err:"+err);
//    }else{
//        console.log(rows);
//    }
//});

//query("call pro_weix_account_info_get(?,?)",[null,'20003'],function(err,row){
//    if(err){
//        console.log("pro_weix_account_info_get:"+err);
//    }else{
//        console.log(row);
//        var user = row[0][0];
//        console.log(user);
//        user.sex = user.sex[0];
//        console.log(user);
////        res.render("personality",{user:user?user:null,isHost:isHost});
//    }
//});

//var paras = ['oHbq1t0enasGWD7eQoJuslZY6R-4','666666','没啥事',135,3,'2014-04-24 18:04:36'];
//query('call pro_take_order(?,?,?,?,?,?)',paras,function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//});

//query('call pro_get_order_info(?,?)',['oHbq1ty6M1x1NgUVM8wQukbhmTZU',1],function(err,rows) {
//    if (err) {
//        console.log(err);
//    } else {
//        console.log(rows);
//    }
//});
//query('call pro_select_product_by_id(?)',['474'],function(err,rows) {
//    if (err) {
//        console.log(err);
//    } else {
//        console.log(rows);
//    }
//});

//query('call pro_set_customer_nickname(?,?,?)',['oHbq1t0enasGWD7eQoJuslZY6R-4','666666','SHU'],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//});

//query('SELECT * from t_order o WHERE o.id IN ('+'55,56'+')',[],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//});

//query('call pro_vague_match_customer(?,?)',['%nik%','oHbq1t0enasGWD7eQoJuslZY6R-4'],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//});

//console.log(new Buffer([01])[0]);
//for(var i = 0; i < 12;i++){
//    (function(){
//        var k = i;
//        query('select sleep(?);',[5],function(err,rows){
//            console.log("count:"+k);
//            console.log(rows);
//        });
//    })();
//
//}

//query('SELECT * from t_customer c where c.c_nickname is NULL OR c.c_nickname = \'null\' ' +
//    'and c_openid is not NULL and seller_room_id is not NULL',[],function(err,rows){
//    if(err){
//        console.log('getNullAccountInfo failed:',err);
////        cb('getNullAccountInfo failed',null)
//    }else{
//        console.log(rows);
////        cb(null,rows[0]);
//    }
//});

//query('call pro_edit_product(?,?,?,?,?)',['888888','oxfQVswUSy2KXBPOjNi_BqdNI3aA',2,'test','test_1420352079715.jpg;test_1420352084239.jpg;'],function(err,rows){
//    if(err){
//        response.failed(-1,res,0);
//    }else{
//        console.log(rows)
//    }
//});

//query("call pro_help_cut(?,?,?)",[1,"oxfQVs4zCT1ZW0XJysajkbL9CIrY",1],function(err,rows){
//    if(err){
//        console.log("call pro_help_cut err:",err);
//
//    }else{
//        console.log(rows);
//    }
//});

//in cnickname varchar(50),in title varchar(40),in text varchar(600),in image_urls varchar(200),
// in sell_open_id varchar(16),in remark varchar(60),in productid int,in in_quantity int,in create_time datetime
//query("call pro_add_order_by_seller(?,?,?,?,?,?,?,?)",['GOer','GOer buy title','后台上传测试text','','888888','',-1,2],function(err,rows){
//    if(err){
//        console.log("call pro_add_order_by_seller err:",err);
//    }else{
//        console.log(rows);
//    }
//});

//query("call pro_bought(?,?)",['705,706,707,710','2015-10-16 14:12:00'],function(err,rows){
//    if(err){
//        console.log("call pro_bought err:",err);
//    }else{
//        console.log(rows);
//    }
//});

//query("call pro_add_order_by_seller(?,?,?,?,?,?,?,?,?,?)",['杜立','123','','','oxfQVs6SQx04a_kN-zf9CZFXIyII','','-1','1','-1','-1'],function(err,rows){
//    if(err){
//        console.log("call pro_add_order_by_seller err:",err);
//    }else{
//        console.log(rows);
//    }
//});

//query("select * from t_customer where c_nickname = '张姐' and seller_room_id = '20003'",[],function(err,rows){
//    console.log(rows);
//})


//query("select distinct open_id from t_weix_account_info where nickname = '张姐'",[],function(err,rows){
//    console.log(rows);
//})



//query("call pro_add_order_by_seller_new('张姐','koji包包小号318','','','oxfQVs6ds6dBEan1paynrNM80UYo','','1192','1','269','318')",[],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//})



//query("select o.id from t_order o , t_customer c" +
//    " where o.c_id = c.id AND o.product_id = 1192 AND c.c_openid = 'oxfQVs8Um5S4Fx87reqxLV3kqkvw'  AND c.seller_room_id = '20003' AND STATUS = 3 ",[],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//})


//query("SELECT * from t_customer c JOIN user u" +
//    " ON c.seller_room_id = u.room_id " +
//    " WHERE c.seller_room_id = '20003' AND c.c_openid = 'oxfQVs8Um5S4Fx87reqxLV3kqkvw'and c.c_status = 1",[],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//})
query("call pro_add_category(1,'钵兰街',@test)",[],function(err,rows){
    if(err){
        console.log(err);
    }else{
        console.log(rows);
    }
})
//query("select c.* from t_customer c join t_weix_account_info w " +
//    "on c.c_openid = w.open_id " +
//    "where (c.c_nickname = '鷠皇Niklaus' or w.nickname = '鷠皇Niklaus') and c.seller_room_id = '888888';",[],function(err,rows){
//    if(err){
//        console.log(err);
//    }else{
//        console.log(rows);
//    }
//})
