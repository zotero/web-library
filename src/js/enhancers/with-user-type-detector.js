'use strict';

import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { getScrollbarWidth } from '../utils';

const withUserTypeDetection = Component => {
	class EnhancedComponent extends React.PureComponent {
		state = {
			isKeyboardUser: null,
			isMouseUser: typeof(matchMedia) === 'function'
				? matchMedia('(pointer:fine)').matches : null,
			isTouchUser: typeof(matchMedia) === 'function'
				? matchMedia('(pointer:coarse)').matches : null,
			userType: matchMedia('(pointer:coarse)').matches ? 'touch' : null,
			scrollbarWidth: getScrollbarWidth()
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
				});
			}
		}

		handleMouse(ev) {
			// prevent simulated mouse events triggering mouse user
			if(!this.lastTouchStartEvent || ev.timeStamp - this.lastTouchStartEvent > 500) {
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
			return <Component {...this.props } user={ this.state } />;
		}

		static displayName = `userTypeDetector(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
	}

	hoistNonReactStatic(EnhancedComponent, Component);
	return EnhancedComponent;
}


export default withUserTypeDetection;
