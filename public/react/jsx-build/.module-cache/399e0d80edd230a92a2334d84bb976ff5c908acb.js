var TestEl = React.createClass({displayName: "TestEl",
				render:function(){
					return (React.createElement("p", {className: "pp"}, "this is a p,called ", this.props.name, 
					
					this.props.children.map(function(child){
						return React.createElement("p", null, child);
					})
				
					))
				}
			});
			React.render(
				React.createElement(TestEl, {name: "pp"}, 
				    React.createElement("h", {name: "h1"}, "wo shi h1"), 
				    React.createElement("h", {name: "h2"}, "wo shi h2")
				)
				,
				document.getElementById("example")
			);