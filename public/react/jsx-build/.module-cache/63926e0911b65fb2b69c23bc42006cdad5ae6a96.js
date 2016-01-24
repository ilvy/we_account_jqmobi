
var TestEl2 = React.createClass({displayName: "TestEl2",
	render:function(){
		return (React.createElement("div", null, "the second tag"));
	}
});
var TestElStr = React.createElement(TestEl2, null);
React.render(TestElStr,document.getElementById("example2"));