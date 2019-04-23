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
			isTrash: trash, isMyPublications: publications,
			makePath, push, view } = this.props;

		push(makePath({ library, tags, collection, trash, publications, search, view }));
	}

	render() {
		return <Search
			onSearch={ this.handleSearch.bind(this) }
			search={ this.props.search }
		/>;
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		isMyPublications: PropTypes.bool,
		isTrash: PropTypes.bool,
		libraryKey: PropTypes.string,
		makePath: PropTypes.func.isRequired,
		push: PropTypes.func.isRequired,
		search: PropTypes.string,
		tags: PropTypes.oneOfType([ PropTypes.string, PropTypes.array]),
		view:  PropTypes.string,
	}
	static defaultProps = {
		view: 'library'
	}
}

const mapStateToProps = state => {
	const { libraryKey, collectionKey, itemsSource, tags, search, isTrash,
	isMyPublications, view } = state.current;
	return { libraryKey, collectionKey, itemsSource,
		makePath: makePath.bind(null, state.config), tags, search, isTrash,
		isMyPublications, view }
};

export default connect(mapStateToProps, { push })(SearchContainer);
