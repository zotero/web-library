'use strict';

const React = require('react');
const { connect } = require('react-redux');
const hoistNonReactStatic = require('hoist-non-react-statics');
const { triggerSelectMode } = require('../actions');
const { makePath } = require('../common/navigation');

var withSelectMode = Component => {
	class EnhancedComponent extends React.PureComponent {
		onSelectModeToggle(isSelectMode) {
			const { history, collectionKey: collection, libraryKey: library,
				itemsSource, tags, search } = this.props;

			this.props.dispatch(
				triggerSelectMode(isSelectMode)
			);

			if(isSelectMode === false) {
				const trash = itemsSource === 'trash';
				const publications = itemsSource === 'publications';
				const items = [];
				history.push(makePath({ library, search, tags, trash, publications, collection, items }));
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

	return connect(mapStateToProps)(hoistNonReactStatic(EnhancedComponent, Component));
}

const mapStateToProps = state => ({
	collectionKey: state.current.collection,
	isSelectMode: state.current.isSelectMode,
	itemsSource: state.current.itemsSource,
	libraryKey: state.current.library,
	search: state.current.search,
	tags: state.current.tags,
})

module.exports = withSelectMode;
