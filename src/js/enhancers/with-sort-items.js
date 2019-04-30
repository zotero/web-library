'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { preferenceChange, sortItems } from '../actions';
import { omit } from '../common/immutable';

var withSortItems = Component => {
	class EnhancedComponent extends React.PureComponent {
		handleSort = async ({ sortBy, sortDirection }) => {
			const { preferences, preferenceChange, sortItems } = this.props;
			preferenceChange('columns', preferences.columns.map(column => {
				if(column.field === sortBy) {
					return { ...column, sort: sortDirection }
				} else {
					return omit(column, 'sort');
				}
			}));
			await sortItems(
				sortBy, sortDirection.toLowerCase() // react-virtualised uses ASC/DESC, zotero asc/desc
			);
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
			mapStateToProps, { preferenceChange, sortItems }
		)(hoistNonReactStatic(EnhancedComponent, Component));
}

const mapStateToProps = state => {
	const { preferences } = state;

	return { preferences };
}

export default withSortItems;
