// var require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
console.log(1111);
// var Tappable = require('react-tappable');

var React = require("react");
var ReactDOM = require("react-dom");

var ButtonGroup = React.createClass({displayName: "ButtonGroup",
	getInitialState:function(){
        return {clicked:false};
	},
	handleClick:function(e){
        this.setState({clicked : true});
        // this.props.onClick.apply(this);
	},
	handleTapEvent:function(){
		// alert(666);
		console.log("start");
	},
	handleEndEvent:function(){
		// alert(666);
		console.log("end");
	},
	componentWillUnmount:function(){
        console.log("componentWillunMount ButtonGroup");
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
                React.createElement("input", {type: "button", value: this.props.value, onClick: this.handleClick, onTouchStart: this.handleTapEvent, onTouchEnd: this.handleEndEvent})
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

var Toolbar = React.createClass({displayName: "Toolbar",
	getInitialState:function(){
        return {clicked_index:0};
	},
	handleClick:function(i){
		if(i == this.state.clicked_index){
			return;
		}
        this.setState({clicked_index : i})
	},
	componentDidMount:function(){
        console.log("componentDidMount");
	},
	componentWillMount:function(){
        console.log("componentWillMount");
	},
	componentWillUpdate:function(){
        var index = this.state.clicked_index;
        var otherLists = document.getElementsByClassName("current-list");
        for(var item,li = 0; li < otherLists.length; li++){
            item = otherLists[li];
            item.className = item.className.replace(/(\s|^)current-list(\s|$)/,' ');
		}
        var btnObj = ReactDOM.findDOMNode(this.refs["btn"+index]);
        this.newClass = (btnObj && btnObj.className ? btnObj.className : "") + (btnObj && btnObj.className && btnObj.className.match(/(\s|^)current-list(\s|$)/) ? "" : " current-list");
        console.log("componentWillUpdate");
	},
	componentDidUpdate:function(){
        console.log("componentDidUpdate");
        // this.componentWillunMount();
	},
	componentWillUnmount:function(){
        console.log("componentWillunMount");
	},
	// componentDidUnmount:function(){
 //        console.log("componentDidunMount");
	// },
	render:function(){
        var index = this.state.clicked_index;
        var _this = this;
        if(index == 0){
        	return (
                React.createElement("div", {className: this.props.name}, 
                    
                    	this.props.items.map(function(child,i){
							return React.createElement("input", {type: "button", ref: ["btn",i].join(""), className: i == index ? _this.newClass : "", value: child, onClick: _this.handleClick.bind(_this,i)});
						}), 
                    
                    React.createElement(ButtonGroup, {value: "button-group"}), 
                    React.createElement("input", {type: "text", value: "ceshi"})
                )
			)
        }
		return (
                React.createElement("div", {className: this.props.name}, 
                    
                    	this.props.items.map(function(child,i){
							return React.createElement("input", {type: "button", ref: ["btn",i].join(""), className: i == index ? _this.newClass : "", value: child, onClick: _this.handleClick.bind(_this,i)});
						})
                    
                )
			)
	}
});


ReactDOM.render(
	React.createElement(Toolbar, {name: "toolbar", items: ["购买列表","收款列表","历史账单"]}
	)
	,
	document.getElementById("toolbar-wrap")
);

// React.render(
//     <Tappable onTap={this.handleTapEvent}>Tap me</Tappable>,
//     document.getElementById("main-content")
// );

// },{"react":undefined,"react-dom":undefined,"react-tappable":undefined}]},{},[1]);