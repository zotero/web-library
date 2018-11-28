'use strict';

const React = require('react');
const { connect } = require('react-redux');
const hoistNonReactStatic = require('hoist-non-react-statics');
const { triggerSelectMode } = require('../actions');

var withSelectMode = Component => {
	class EnhancedComponent extends React.PureComponent {
		onSelectModeToggle(isSelectMode) {
			this.props.dispatch(
				triggerSelectMode(isSelectMode)
			);
		}

		render() {
			return <Component
				onSelectModeToggle={ this.onSelectModeToggle.bind(this) }
				{...this.props }
			/>;
		}

		static displayName = `withSelectMode(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
	}

	return connect(mapStateToProps)(hoistNonReactStatic(EnhancedComponent, Component));
}

const mapStateToProps = state => ({
	isSelectMode: state.current.isSelectMode,
})

module.exports = withSelectMode;
