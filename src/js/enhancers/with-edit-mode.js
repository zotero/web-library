'use strict';

const React = require('react');
const { connect } = require('react-redux');
const { triggerEditingItem } = require('../actions');

var withEditMode = Component => connect(mapStateToProps)(
	class extends React.PureComponent {
		onEditModeToggle(isEditing) {
			this.props.dispatch(
				triggerEditingItem(this.props.itemKey, isEditing)
			);
		}

		render() {
			return <Component
				onEditModeToggle={ this.onEditModeToggle.bind(this) }
				{...this.props }
			/>;
		}

		static displayName = `withEditMode(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
	}
);

const mapStateToProps = state => ({
	itemKey: state.current.item,
	isEditing: state.current.item ? state.current.editing === state.current.item : false,
})

module.exports = withEditMode;
