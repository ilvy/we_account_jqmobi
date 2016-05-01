var redis = require("../../../db/redisOperator").client;

redis.set('key1',JSON.stringify({
	param1 : 1,
	param2 : 2 
}),function(err,res){
	console.log(res);
});
redis.get('acd97d31165c799e1db044558291bd9b654710f2f13',function(err,res){
	console.log(res);
});

// 
// console.log(redis);
// redis.end(true)

// var obj = {
// 	param1 : 1,
// 	param2 : 2 
// }
// function log(param1,param2){
// 	console.log(param1,param2);
// }
// log(obj);
// var crypto = require('crypto');
// var shaStr = [new Date().getTime(),'account_name',Math.random().toString().split(".")[1]].join("");//TODO 加密
// var sign = crypto.createHash("sha1").update(shaStr).digest('hex');
// console.log(sign);
// 

// var testParams = {
// 	error:10
// };
// var promise = new Promise(function(resolve,reject){
//     if(testParams.error == 1){
//     	resolve('value');
//     }else{
//     	reject({error:-100})
//     }
// });

// promise.then(function(value){
//     return true;
// },function(value){
//     console.log(value);
// }).then(function(value){
//     if(value){
//     	console.log("resolve");
//     	resolve(value);
//     }else{
//     	console.log("reject");
//     	reject(value);
//     }
// }).then(function(value){
//     console.log(value?"haha":"nope")
// },function(value){
//     console.log(value?"haha1":"nope1")
// })
// 

