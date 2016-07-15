var redis = require("redis"),
    redisConfig = require("../config/config").redisConfig,
    ip = redisConfig.ip,
    port = redisConfig.port,
    extend = require("extend");

var client = {};//redis.createClient(port,ip);
client.data = {};
client.set = function(key,value,cb){
	this.data[key] = value;
	cb();
}
client.set = function(key,cb){
	
	cb(null,this.data[key]);
}
//错误监听？  
client.on("error", function (err) {  
    console.log("Error " + err);  
});

client = extend(client,{
	exp_setJson:(key,objValue,cb)=>{
        client.set(key,JSON.stringify(objValue),cb);
	},
	exp_getJson:(key,cb)=>{
		client.get(key,function(err,res){
			!err?cb(err,JSON.parse(res)):cb(err,null);
		});
	}
});

exports.client = client;