'use strict';

import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

const withFocusManager = Component => {
	class EnhancedComponent extends React.PureComponent {
		handleNext = ev => {
			const tabbables = Array.from(
				this.ref.querySelectorAll('[tabIndex="-2"]')
			).filter(t => t.offsetParent);
			const nextIndex = tabbables.findIndex(t => t === ev.currentTarget) + 1;
			ev.preventDefault();
			if(nextIndex < tabbables.length) {
				tabbables[nextIndex].focus();
			}
		}

		handlePrevious = ev => {
			const tabbables = Array.from(
				this.ref.querySelectorAll('[tabIndex="-2"]')
			).filter(t => t.offsetParent);
			const prevIndex = tabbables.findIndex(t => t === ev.currentTarget) - 1;
			ev.preventDefault();
			if(prevIndex >= 0) {
				tabbables[prevIndex].focus();
			}
		}

		handleFocus = ev => {
			if(ev.target !== ev.currentTarget) {
				return;
			}
			this.ref.tabIndex = -1;
			this.ref.querySelector('[tabIndex="-2"]').focus();
		}

		handleBlur = ev => {
			if(ev.relatedTarget &&
				(ev.relatedTarget === this.ref || ev.relatedTarget.closest('[data-focus-root]'))
			) {
				return;
			}
			this.ref.tabIndex = 0;
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
