var ButtonGroup = React.createClass({
	getInitialState:function(){
        return {clicked:false};
	},
	handleClick:function(e){
        this.setState({clicked : true});
        this.props.onClick.apply(this);
	},
	render:function(){
		console.log(this.props.className);
		// var otherLists = document.getElementsByClassName("current-list");
		// for(var item,li = 0; li < otherLists.length; li++){
  //           item = otherLists[li];
  //           item.className = item.className.replace(/(\s|^)current-list(\s|$)/,' ');
		// }
		// var newClass = this.state.clicked ? [this.props.btnClass,"current-list"].join(" ") : this.props.btnClass;
		return (
                <input type="button" ref={this.props.ref} refid={this.props.ref} className={this.props.className} value={this.props.value} onClick={this.handleClick}/>
			)
	}
});

// var Toolbar = React.createClass({
// 	getInitialState:function(){
//         return {clicked_index:0};
// 	},
// 	handleClick:function(i){
//         this.setState({clicked_index : i})
// 	},
// 	render:function(){
//         var index = this.state.clicked_index;
//         var otherLists = document.getElementsByClassName("current-list");
//         for(var item,li = 0; li < otherLists.length && li != index; li++){
//             item = otherLists[li];
//             item.className = item.className.replace(/(\s|^)current-list(\s|$)/,' ');
// 		}
//         var btnObj = this.refs["btn"+index];
//         var newClass = (btnObj ? btnObj.className : "") + " current-list";
//         var _this = this;
// 		return (
//                 <div className={this.props.name}>
//                     {
//                     	this.props.items.map(function(child,i){
// 							return <input ref={["btn",i].join("")} className={i == index ? newClass : ""} value={child} onClick={_this.handleClick.bind(_this,i)} />;
// 						})
//                     }
//                 </div>
// 			)
// 	}
// });

var Toolbar = React.createClass({
	getInitialState:function(){
        return {clicked_index:0};
	},
	handleClick:function(i){
		if(i == this.state.clicked_index){
			return;
		}
        this.setState({clicked_index : i})
	},
	render:function(){
        var index = this.state.clicked_index;
        var otherLists = document.getElementsByClassName("current-list");
        for(var item,li = 0; li < otherLists.length; li++){
            item = otherLists[li];
            item.className = item.className.replace(/(\s|^)current-list(\s|$)/,' ');
		}
        var btnObj = React.findDOMNode(this.refs["btn"+index]);
        var newClass = (btnObj && btnObj.className ? btnObj.className : "") + (btnObj && btnObj.className && btnObj.className.match(/(\s|^)current-list(\s|$)/) ? "" : " current-list");
        var _this = this;
		return (
                <div className={this.props.name}>
                    {
                    	this.props.items.map(function(child,i){
							return <input type="button" ref={["btn",i].join("")} className={i == index ? newClass : ""} value={child} onClick={_this.handleClick.bind(_this,i)} />;
						})
                    }
                </div>
			)
	}
});

React.render(
	<Toolbar name="toolbar" items={["购买列表","收款列表","历史账单"]}>
	</Toolbar>
	,
	document.getElementById("toolbar-wrap")
);
