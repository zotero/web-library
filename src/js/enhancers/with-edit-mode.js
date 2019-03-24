'use strict';

import React from 'react';
import { connect } from 'react-redux';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { triggerEditingItem } from '../actions';

var withEditMode = Component => {
	class EnhancedComponent extends React.PureComponent {
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

	return connect(mapStateToProps)(hoistNonReactStatic(EnhancedComponent, Component));
}

const mapStateToProps = state => {
	const { itemKey, editingItemKey } = state.current;

	return { itemKey, isEditing: itemKey ? editingItemKey === itemKey : false };
}

export default withEditMode;
