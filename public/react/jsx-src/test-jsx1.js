
var TestEl2 = React.createClass({
	render:function(){
		return (<div></div>);
	}
});
var testElStr = <TestEl2 />;
// var [a,b,c] = [1,2,3];
// console.log(a,b);
React.render(testElStr,document.getElementById("example2"));

var TestEl = React.createClass({
	render:function(){
		return (<p className="pp">this is a p,called {this.props.name}
	{	
		this.props.children.map(function(child){
			return <p>{child}</p>;
		})
	}
		</p>)
	}
});
React.render(
	<TestEl name="pp" >
	    <h name="h1">wo shi h1</h>
	    <h name="h2">wo shi h2</h>
	</TestEl>
	,
	document.getElementById("example")
);
React.render(<h3>hello,world</h3>,document.getElementById("example2"));