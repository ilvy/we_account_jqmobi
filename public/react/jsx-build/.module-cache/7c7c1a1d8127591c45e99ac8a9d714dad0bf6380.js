var Toolbar = React.createClass({displayName: "Toolbar",
	render:function(){
		return (
                React.createElement("div", {className: "{this.props.name}"}, 
                    
                    	this.props.children.map(function(child){
							return child;
						})
                    
                )
			)
	}
});
React.render(
	React.createElement(Toolbar, {name: "toolbar"}, 
	    React.createElement("a", null, "购买列表"), 
	    React.createElement("a", null, "收款列表"), 
	    React.createElement("a", null, "历史账单")
	)
	,
	document.getElementById("toolbar")
);