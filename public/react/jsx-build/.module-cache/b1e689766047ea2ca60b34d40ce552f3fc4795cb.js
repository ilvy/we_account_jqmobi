
var TestEl2 = React.createClass({displayName: "TestEl2",
	render:function(){
		return (React.createElement("div", null));
	}
});
var TestElStr = React.createElement(TestEl2, null, "the second tag");
React.render(TestElStr,document.getElementById("example2"));