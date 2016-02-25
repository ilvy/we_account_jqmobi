// module.exports = {
// 	entry:"./jsx-src/toolbar.js",
// 	output:{
// 		filename:"toolbar.js"
// 	},
// 	module:{
// 		loaders:[
//             {
//             	test:/\.js$/,
//             	loader:'babel-loader',
//             	query:{
//                     presets:["react"]
//             	}
//             }
// 		]
// 	}
// }

module.exports = {
  entry: './jsx-src/toolbar.js',
  output: {
    filename: 'toolbar.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // use ! to chain loaders
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // inline base64 URLs for <=8k images, direct URLs for the rest
    ]
  }
};
