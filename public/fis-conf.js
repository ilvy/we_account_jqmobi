// 清除其他配置，只保留如下配置
//fis.match('modules/bill/bill.js', {
//  // fis-optimizer-uglify-js 插件进行压缩，已内置
//  optimizer: fis.plugin('uglify-js')
//});

//fis.match('*.css', {
//  // fis-optimizer-clean-css 插件进行压缩，已内置
//  optimizer: fis.plugin('clean-css')
//});
//
//fis.match('modules/**.js',{
//    isMod:true
//})
fis.config.set('project.include',['jqr.js']);
fis.config.merge({
  roadmap : {
    path : [
      {
        //所有的js文件
        reg : '**.js',
        //发布到/static/js/xxx目录下
//                release : 'static/$&',
        url:"$&"
      }
//            ,
//            {
//                //所有image目录下的.png，.gif文件
//                reg : /(.*\.(?:png|gif))/i,
//                //发布到/static/pic/xxx目录下
//                release : 'try/static/pic/$1',
//                useDomain:true
//            }
    ]
//        project:{
//           fileType:{
//               text:'phtml'
//           }
//        },
  }
});