var redis = require("../../../db/redisOperator").client;

redis.set('key1',new Date().getTime(),function(err,res){
	console.log(res);
});
redis.get('key1',function(err,res){
	console.log(res);
});
// console.log(redis);
// redis.end(true)

var obj = {
	param1 : 1,
	param2 : 2 
}
function log(param1,param2){
	console.log(param1,param2);
}
log(obj);