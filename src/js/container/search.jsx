'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const Search = require('../component/search.jsx');
const { makePath } = require('../common/navigation');
const { getCurrent } = require('../common/state');

class SearchContainer extends React.PureComponent {
	state = { search: '' }

	handleSearch(search) {
		const { library, collection, tags, push } = this.props;
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
	const { library, collection, tags, search } = getCurrent(state);
	return { library, collection, tags, search }
};

module.exports = connect(mapStateToProps, { push })(SearchContainer);
