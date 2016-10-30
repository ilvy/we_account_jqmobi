var express = require('express');
var router = express.Router();

/* GET home page. */

router.all('*.[eot|svg|ttf|woff|woff2]', function(req, res, next) {
	console.log("&&&&&&&&&&&&&&&&&&****************************")
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Methods","PUT,POST,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
router.get('/', function(req, res) {
    console.log(req.query.name);
  res.render('index', { title: 'Express' });
});

router.get('/test',function(req,res){
    res.send("test");
});

module.exports = router;
