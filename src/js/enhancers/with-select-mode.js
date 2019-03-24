'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { triggerSelectMode } from '../actions';
import { makePath } from '../common/navigation';

var withSelectMode = Component => {
	class EnhancedComponent extends React.PureComponent {
		onSelectModeToggle(isSelectMode) {
			const { collectionKey: collection, libraryKey: library,
				itemsSource, push, triggerSelectMode, tags, search, view } = this.props;

			const trash = itemsSource === 'trash';
			const publications = itemsSource === 'publications';
			const items = [];
			push(makePath({ library, search, tags, trash, publications, collection, items, view }));
			triggerSelectMode(isSelectMode);
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

	return connect(
			mapStateToProps, { push, triggerSelectMode }
		)(hoistNonReactStatic(EnhancedComponent, Component));
}

const mapStateToProps = state => {
	const { collectionKey, isSelectMode, itemsSource, libraryKey, search,
		tags, view, itemKeys } = state.current;

	return { collectionKey, isSelectMode, itemsSource, libraryKey, search,
		tags, view, itemKeys };
}

export default withSelectMode;
