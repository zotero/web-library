'use strict';

const React = require('react');

var UserTypeDetector = ComposedComponent => class extends React.PureComponent {
	state = { 
		isKeyboardUser: null,
		isMouseUser: null,
		isTouchUser: null
	};

	componentDidMount() {
		this._keyboardListener = this.handleKeyboard.bind(this);
		this._mouseListener = this.handleMouse.bind(this);
		this._touchListener = this.handleTouch.bind(this);
		document.addEventListener('keyup', this._keyboardListener);
		document.addEventListener('mousedown', this._mouseListener);
		document.addEventListener('touchstart', this._touchListener);
	}

	componentWillUnmount() {
		document.removeEventListener('keyup', this._keyboardListener);
		document.removeEventListener('mousedown', this._mouseListener);
		document.removeEventListener('touchstart', this._touchListener);
	}

	handleKeyboard(ev) {
		if(ev.key === 'Tab') {
			this.setState({
				'isKeyboardUser': true,
				'isMouseUser': false,
				'isTouchUser': false
			});
		}
	}

	handleMouse(ev) {
		// prevent simulated mouse events triggering mouse user
		if(!this.lastTouchStartEvent || ev.timeStamp - this.lastTouchStartEvent > 300) {
			this.setState({
				'isKeyboardUser': false,
				'isMouseUser': true,
				'isTouchUser': false
			});
		}
	}

	handleTouch(ev) {
		this.lastTouchStartEvent = ev.timeStamp;
		this.setState({
			'isKeyboardUser': false,
			'isMouseUser': false,
			'isTouchUser': true
		});
	}

	render() {
		return <ComposedComponent {...this.props } { ...this.state } />;
	}
};

module.exports = UserTypeDetector;