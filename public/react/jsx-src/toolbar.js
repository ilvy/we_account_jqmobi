var ButtonGroup = React.createClass({
	getInitialState:function(){
        return {clicked:false};
	},
	handleClick:function(e){
        this.setState({clicked:this.state.clicked ? this.state.clicked : true})
	},
	render:function(){
		var bgColor = this.state.clicked ? "blue-bg" : "";
		return (
                <button onClick={this.handleClick} className={bgColor}>
                    {this.props.name}
                </button>
			)
	}
});

var Toolbar = React.createClass({
	render:function(){
		return (
                <div className={this.props.name}>
                    {
                    	this.props.children.map(function(child){
							return child;
						})
                    }
                </div>
			)
	}
});
React.render(
	<Toolbar name="toolbar">
	    <ButtonGroup name="购买列表"></ButtonGroup>
	    <a>收款列表</a>
	    <a>历史账单</a>
	</Toolbar>
	,
	document.getElementById("toolbar-wrap")
);

