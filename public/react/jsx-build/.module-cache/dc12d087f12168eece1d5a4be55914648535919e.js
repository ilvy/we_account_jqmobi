
var TestEl2 = React.createClass({displayName: "TestEl2",
	render:function(){
		return (React.createElement("div", null, "the second tag"));
	}
});
var testElStr = React.createElement(TestEl2, null);
var [a,b,c] = [1,2,3];
console.log(a,b);
React.render(testElStr,document.getElementById("example2"));