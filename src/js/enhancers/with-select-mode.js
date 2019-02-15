'use strict';

const React = require('react');
const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const hoistNonReactStatic = require('hoist-non-react-statics');
const { triggerSelectMode } = require('../actions');
const { makePath } = require('../common/navigation');

var withSelectMode = Component => {
	class EnhancedComponent extends React.PureComponent {
		onSelectModeToggle(isSelectMode) {
			const { collectionKey: collection, libraryKey: library,
				itemsSource, push, triggerSelectMode, tags, search, view } = this.props;

			triggerSelectMode(isSelectMode)

			if(isSelectMode === false) {
				const trash = itemsSource === 'trash';
				const publications = itemsSource === 'publications';
				const items = [];
				push(makePath({ library, search, tags, trash, publications, collection, items, view }));
			}
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

module.exports = withSelectMode;
