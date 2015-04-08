/**
 * Created by Administrator on 15-1-20.
 */

var query = require("../../db/dbOperator").query;

function generateRooms(startNum,endNum){
    var sqls = [];
    var sql = "insert into room(room_id,status,room_type,special_type) values";
    for(var i = startNum; i <= endNum; i++){
        sql += "('" + i + "',0,0,0),";
        if((i - startNum) % 5000 == 0 && i != startNum){
            sqls.push(sql.substring(0,sql.length - 1));
            sql = "insert into room(room_id,status,room_type,special_type) values";
        }
    }
    if(sql){
        sqls.push(sql.substring(0,sql.length - 1));
    }
    if(sqls.length){
        for(i = 0; i < sqls.length; i++){
            console.log("sql"+i+":"+sqls[i]);
            (function(){
                var icount = i;
                query(sqls[icount],[],function(err,results){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(icount+"生成成功："+results);
                    }
                });
            })();

        }
    }


}

generateRooms(10000,29999);