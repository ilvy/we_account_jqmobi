/**
 * 汉字转拼音
 */
var pinyin = require('pinyin'),
    dbOperator = require('../../../db/dbOperator');

var toPinyin = (sourceStr) => {
   var pyArray = pinyin(sourceStr,{
   	   style: pinyin.STYLE_NORMAL
   });
   var paLen = pyArray.length,
       words,
       result = '';
   for(var j = 0; j < paLen; j++){
       words = pyArray[j];
       // console.log(words)
       for (var i = 0; i < words.length; i++) {
       	   result += words[i];
       }
   }
   return result;
}

// dbOperator.query('select * from t_weix_account_info',[],function(err,rows){
//     // console.log(rows[0])
//     for (var i = rows.length - 1; i >= 0; i--) {
//     	// console.log(rows[i].c_nickname,toPinyin(rows[i].c_nickname));
//     	dbOperator.query('update t_weix_account_info set nickname_pinyin = ? where id = ?',[toPinyin(rows[i].nickname),rows[i].id],function(err,results){})
//     }
// });

// console.log(toPinyin('是我的，mine'))
// 
exports.toPinyin = toPinyin;