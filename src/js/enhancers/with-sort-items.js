'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { preferenceChange, sortItems, updateItemsSorting } from '../actions';

//@NOTE: legacy enhancer component, updateItemsSorting directly
var withSortItems = Component => {
	class EnhancedComponent extends React.PureComponent {
		handleSort = async ({ sortBy, sortDirection }) => {
			return updateItemsSorting(sortBy, sortDirection);
		}

		render() {
			return <Component
				{...this.props }
				onSort={ this.handleSort }
				preferences={ this.props.preferences }
			/>;
		}

		static displayName = `withSortItems(${Component.displayName || Component.name})`
		static WrappedComponent = Component;
		static propTypes = {
			preferenceChange: PropTypes.func.isRequired,
			preferences: PropTypes.object,
			sortItems: PropTypes.func.isRequired,
		}
	}

	return connect(
			mapStateToProps, { preferenceChange, sortItems, updateItemsSorting }
		)(hoistNonReactStatic(EnhancedComponent, Component));
}

const mapStateToProps = state => {
	const { preferences } = state;

	return { preferences };
}

export default withSortItems;
