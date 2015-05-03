/**
 * Created by Administrator on 2015/4/30.
 */
var dbOperator = require("../../../db/dbOperator"),
    express = require("express"),
    router = express.Router();

var count = 12;
router.post('/mysql',function(req,res){
    dbOperator.query('select sleep(?);',[5],function(err,rows){
        console.log("count:"+count++);
        console.log(rows);
        if(err){
            res.send({flag:0,err:err});
            return;
        }
        res.send({flag:1});
    });
});

module.exports = router;