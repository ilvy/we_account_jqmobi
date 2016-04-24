var redis = require("redis"),
    redisConfig = require("../config/config").redisConfig,
    ip = redisConfig.ip,
    port = redisConfig.port;

var client = redis.createClient(port,ip);

//错误监听？  
client.on("error", function (err) {  
    console.log("Error " + err);  
});

exports.client = client;