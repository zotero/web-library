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
		const { library, collection, tags, makePath, push } = this.props;
		push(makePath({ library, search, tags, collection }));
	}

	render() {
		return <Search
			onSearch={ this.handleSearch.bind(this) }
			search={ this.props.search }
		/>;
	}
}

const mapStateToProps = state => {
	const { library, collection, tags, search } = state.current;
	return { library, collection, makePath: makePath.bind(null, state.config),
		tags, search }
};

export default connect(mapStateToProps, { push })(SearchContainer);
