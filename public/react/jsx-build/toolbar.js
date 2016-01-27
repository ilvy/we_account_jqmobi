var ButtonGroup = React.createClass({displayName: "ButtonGroup",
	getInitialState:function(){
        return {clicked:false};
	},
	handleClick:function(e){
        this.setState({clicked:this.state.clicked ? this.state.clicked : true})
	},
	render:function(){
		var bgColor = this.state.clicked ? "blue-bg" : "";
		return (
                React.createElement("input", {onClick: this.handleClick, className: bgColor, value: this.props.name})
			)
	}
});

var Toolbar = React.createClass({displayName: "Toolbar",
	render:function(){
		return (
                React.createElement("div", {className: this.props.name}, 
                    
                    	this.props.children.map(function(child){
							return child;
						})
                    
                )
			)
	}
});
React.render(
	React.createElement(Toolbar, {name: "toolbar"}, 
	    React.createElement(ButtonGroup, {name: "购买列表"}), 
	    React.createElement(ButtonGroup, {name: "收款列表"}), 
	    React.createElement(ButtonGroup, {name: "历史账单"})
	)
	,
	document.getElementById("toolbar-wrap")
);

