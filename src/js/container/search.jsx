'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Search from '../component/search.jsx';
import { makePath } from '../common/navigation';

class SearchContainer extends React.PureComponent {
	state = { search: '' }

	handleSearch(search, qmode) {
		const { libraryKey: library, collectionKey: collection, tags,
			isTrash: trash, isMyPublications: publications, searchState,
			makePath, push,  } = this.props;
		var view = 'item-list';
		var items = null;

		if(!search) {
			// if search is not empty, go back to the view that triggered the search
			view = searchState.triggerView ?
				searchState.triggerView === 'item-details' ?
					searchState.triggerItem ? 'item-details' : 'item-list'
					: searchState.triggerView
				: view
			items = searchState.triggerView === 'item-details' && searchState.triggerItem ?
				searchState.triggerItem : null;
		}

		push(makePath({ library, tags, collection, items, trash, publications, search, qmode, view }));
	}

	render() {
		return <Search
			{ ...this.props }
			onSearch={ this.handleSearch.bind(this) }
			search={ this.props.search }
			qmode={ this.props.qmode }
			itemsSource={ this.props.itemsSource }
		/>;
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		isMyPublications: PropTypes.bool,
		isTrash: PropTypes.bool,
		itemsSource: PropTypes.string,
		libraryKey: PropTypes.string,
		makePath: PropTypes.func.isRequired,
		push: PropTypes.func.isRequired,
		qmode: PropTypes.oneOf(['titleCreatorYear', 'everything']),
		search: PropTypes.string,
		tags: PropTypes.oneOfType([ PropTypes.string, PropTypes.array]),
		view:  PropTypes.string,
	}
	static defaultProps = {
		view: 'library'
	}
}

const mapStateToProps = state => {
	const { libraryKey, collectionKey, itemKey, itemsSource, tags, search, searchState,
		isTrash, isMyPublications, view, qmode } = state.current;
	return { libraryKey, collectionKey, itemsSource,
		makePath: makePath.bind(null, state.config), tags, searchState, search,
		itemKey, isTrash, isMyPublications, view, qmode }
};

export default connect(mapStateToProps, { push })(SearchContainer);
