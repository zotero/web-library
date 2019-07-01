'use strict';

import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

const withFocusManager = Component => {
	class EnhancedComponent extends React.PureComponent {
		lastFocused = null;

		handleNext = ev => {
			const tabbables = Array.from(
				this.ref.querySelectorAll('[tabIndex="-2"]:not([disabled])')
			).filter(t => t.offsetParent);
			const nextIndex = tabbables.findIndex(t => t === ev.currentTarget) + 1;
			ev.preventDefault();
			if(nextIndex < tabbables.length) {
				tabbables[nextIndex].focus();
				this.lastFocused = tabbables[nextIndex];
			} else {
				tabbables[0].focus();
				this.lastFocused = tabbables[0];
			}
		}

		handlePrevious = ev => {
			const tabbables = Array.from(
				this.ref.querySelectorAll('[tabIndex="-2"]:not([disabled])')
			).filter(t => t.offsetParent);
			const prevIndex = tabbables.findIndex(t => t === ev.currentTarget) - 1;
			ev.preventDefault();
			if(prevIndex >= 0) {
				tabbables[prevIndex].focus();
				this.lastFocused = tabbables[prevIndex];
			} else {
				tabbables[tabbables.length - 1].focus();
				this.lastFocused = tabbables[0];
			}
		}

		handleDrillDownNext = ev => {
			const drillables = Array.from(
				ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
			).filter(t => t.offsetParent);
			const nextIndex = drillables.findIndex(t => t === ev.currentTarget) + 1;
			if(nextIndex < drillables.length) {
				drillables[nextIndex].focus();
			}
		}
		handleDrillDownPrev = ev => {
			const drillables = Array.from(
				ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
			).filter(t => t.offsetParent);
			const prevIndex = drillables.findIndex(t => t === ev.currentTarget) - 1;
			if(prevIndex >= 0) {
				drillables[prevIndex].focus();
			} else {
				ev.currentTarget.focus();
			}
		}

		handleFocus = ev => {
			if(ev.target !== ev.currentTarget) {
				return;
			}
			this.ref.tabIndex = -1;
			const candidates = Array.from(this.ref.querySelectorAll('[tabIndex="-2"]:not([disabled])'));
			if(this.lastFocused !== null && candidates.includes(this.lastFocused)) {
				this.lastFocused.focus();
			} else {
				candidates[0].focus();
			}
		}

		handleBlur = ev => {
			if(ev.relatedTarget &&
				(ev.relatedTarget === this.ref || ev.relatedTarget.closest('[data-focus-root]') === this.ref)
			) {
				return;
			}
			ev.currentTarget.tabIndex = 0;
		}

		registerFocusRoot = ref => {
			this.ref = ref;
			if(ref) {
				ref.dataset.focusRoot = '';
			}
		}

		render() {
			return <Component
				{...this.props }
				onFocusNext={ this.handleNext }
				onFocusPrev={ this.handlePrevious }
				onFocus={ this.handleFocus }
				onBlur={ this.handleBlur }
				onDrillDownNext={ this.handleDrillDownNext }
				onDrillDownPrev={ this.handleDrillDownPrev }
				registerFocusRoot={ this.registerFocusRoot }
			/>;
		}

		static displayName = `withFocusManager(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
	}
	hoistNonReactStatic(EnhancedComponent, Component);
	return EnhancedComponent;
}

export default withFocusManager;
