var ToolbarEle = React.createClass({displayName: "ToolbarEle",
	render:function(){
		return (
                React.createElement("a", null, 
                    
                    	this.props.children.map(function(child){
							return child;
						})
                    
                )
			)
	}
});
React.render(
	React.createElement(ToolbarEle, null, 
	    React.createElement("span", null, "购买列表")
	)
	,
	document.getElementById("toolbar")
);