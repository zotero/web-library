'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const Search = require('../component/search.jsx');
const { makePath } = require('../common/navigation');

class SearchContainer extends React.PureComponent {
	state = { search: '' }

	handleSearch(search) {
		const { collection, tags, history } = this.props;
		history.push(makePath({ search, tags, collection }));
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
	return { library, collection, tags, search }
};

module.exports = withRouter(connect(mapStateToProps)(SearchContainer));
