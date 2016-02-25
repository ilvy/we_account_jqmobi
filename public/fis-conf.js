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

'use strict';

fis.set("project.ignore",['fis-conf.js','output/**']);

fis
    .match("**",{
      useHash:false
    })
    .match("{static,static-wap}/*.js",{
      optimizer:fis.plugin('uglify-js')
    })
    .match("**/*.js",{
      optimizer:fis.plugin('uglify-js')
    })
    .match("{static,static-wap}/*.css",{
      optimizer:fis.plugin('clean-css'),
      domain:"http://b.qikucdn.com/qlive/0114/output/"
    })
  // .match("static/(*.css)",{
  //     optimizer:fis.plugin('clean-css'),
  //     release:"pc-css/$0"
  // })
    .match("**/*.png",{
      optimizer: fis.plugin('png-compressor')
    })
  // .match("::package",{
  // 	postpackager:fis.plugin("loader")
  // })
  // .match("static/*.js",{
  // 	pakeTo:"static/all.min.js"
  // })
    .match("**",{
      deploy:[
        fis.plugin("replace",{
          from:"b.qikucdn.com/qlive/0114/",
          to:"b.qikucdn.com/qlive/0114/output/"
        }),
        fis.plugin('local-deliver')//must add a deliver, such as http-push, local-deliver
      ]
    })
//    .media('debug').match('**.js', {
//   optimizer: null
// })
// .match("../../../../activity/src/application/modules/Admin/views/live/template/0114/(*.php)",{
// 	release:"php/$1",
// 	deploy:[
//         fis.plugin("replace",{
//         	from:"b.qikucdn.com/qlive/0114/",
//         	to:"b.qikucdn.com/qlive/0114/product/"
//         }),
//         fis.plugin('local-deliver')
// 	]
// })
//    .match('static-wap/*.js', {
//   deploy: fis.plugin('http-push', {
//     receiver: 'http://www.daidai2u.com:8999/receiver',
//     to: '/mnt/projects/we_account_jqmobi/release' // 注意这个是指的是测试机器的路径，而非本地机器
//   })
// })