var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    console.log(req.query.name);
  res.render('index', { title: 'Express' });
});

router.get('/test',function(req,res){
    res.send("test");
});

module.exports = router;
