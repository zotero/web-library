'use strict';

const React = require('react');
const { connect } = require('react-redux');
const { triggerEditingItem } = require('../actions');

var TriggersEditMode = ComposedComponent => connect(mapStateToProps)(
	class extends React.PureComponent {
		onEditModeToggle(isEditing) {
			this.props.dispatch(
				triggerEditingItem(this.props.itemKey, isEditing)
			);
		}

		render() {
			return <ComposedComponent
				onEditModeToggle={ this.onEditModeToggle.bind(this) }
				{...this.props }
			/>;
		}
	}
);

const mapStateToProps = state => ({
	itemKey: state.current.item,
	isEditing: state.current.item ? state.current.editing === state.current.item : false,
})

module.exports = TriggersEditMode;
