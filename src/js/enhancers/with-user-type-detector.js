'use strict';

const React = require('react');
const hoistNonReactStatic = require('hoist-non-react-statics');

const withUserTypeDetection = Component => {
	class EnhancedComponent extends React.PureComponent {
		state = {
			isKeyboardUser: null,
			isMouseUser: null,
			isTouchUser: null,
			userType: null
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
					'userType': 'keyboard'
				});
			}
		}

		handleMouse(ev) {
			// prevent simulated mouse events triggering mouse user
			if(!this.lastTouchStartEvent || ev.timeStamp - this.lastTouchStartEvent > 300) {
				this.setState({
					'isKeyboardUser': false,
					'isMouseUser': true,
					'isTouchUser': false,
					'userType': 'mouse'
				});
			}
		}

		handleTouch(ev) {
			this.lastTouchStartEvent = ev.timeStamp;
			this.setState({
				'isKeyboardUser': false,
				'isMouseUser': false,
				'isTouchUser': true,
				'userType': 'touch'
			});
		}

		render() {
			return <Component {...this.props } { ...this.state } />;
		}

		static displayName = `userTypeDetector(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
	}

	hoistNonReactStatic(EnhancedComponent, Component);
	return EnhancedComponent;
}


module.exports = withUserTypeDetection;
