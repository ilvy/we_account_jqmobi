/**
 * Created by gogo on 2015/11/7.
 */
({
    baseUrl:'./',
    paths:{
        jquery:'javascripts/jquery',
        router:'javascripts/router',
        routerConfig:'javascripts/routerConfig',
        'room-door':'javascripts/room-door',
        touchEvent:'touchUtil',
        laydate:'Jplugin/laydate/laydate',
        util:'util/util',
        jqmobiTouch:"javascripts/libs/jquery.mobile.custom",
        preloadImg:"javascripts/preloadImg",
        waterfall:"javascripts/waterfall_relative",
        ajaxupload:"javascripts/ajaxupload",
        jpopup:'Jplugin/jquery.light-popup/jquery.light-popup',
        wxAPI:'javascripts/jweixin-1.0.0'
    },
    dir:'./output',
    optimize: "uglify",
    optimizeCss: "standard",
    modules: [
        //Just specifying a module name means that module will be converted into
        //a built file that contains all of its dependencies. If that module or any
        //of its dependencies includes i18n bundles, they may not be included in the
        //built file unless the locale: section is set above.
        //{
        //    name: "modules/bill/bill",
        //
        //    //create: true can be used to create the module layer at the given
        //    //name, if it does not already exist in the source location. If
        //    //there is a module at the source location with this name, then
        //    //create: true is superfluous.
        //},
        //{
        //    name:"modules/live_room/live_room"
        //}


    ],
    //name:'jqr',
    //out:'jqr.min.js',
    exclude:['build_bak/*','images/*','css/*','ui/*','plugins/*']
})