'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Search from '../component/search.jsx';
import { makePath } from '../common/navigation';

class SearchContainer extends React.PureComponent {
	state = { search: '' }

	handleSearch(search) {
		const { libraryKey: library, collectionKey: collection, tags,
			itemsSource, makePath, push } = this.props;

		switch(itemsSource) {
			case 'top':
				push(makePath({ library, search }));
			break;
			case 'trash':
				push(makePath({ library, trash: true, search }));
			break;
			case 'publications':
				push(makePath({ library, publications: true, search }));
			break;
			case 'collection':
				push(makePath({ library, collection, search }));
			break;
			case 'query':
				push(makePath({ library, tags, collection, search }));
			break;
		}
	}

	render() {
		return <Search
			onSearch={ this.handleSearch.bind(this) }
			search={ this.props.search }
		/>;
	}
}

const mapStateToProps = state => {
	const { libraryKey, collectionKey, itemsSource, tags, search } = state.current;
	return { libraryKey, collectionKey, itemsSource,
		makePath: makePath.bind(null, state.config), tags, search }
};

export default connect(mapStateToProps, { push })(SearchContainer);
