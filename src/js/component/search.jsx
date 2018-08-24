'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { DebounceInput } = require('react-debounce-input');
const { noop } = require('../utils');

class Search extends React.Component {
	render() {
		return (
			<div className="search-container">
				<DebounceInput
					type="search"
					debounceTimeout={ 300 }
					value={ this.props.search }
					onChange={ ev => this.props.onSearch(ev.target.value) }
					className="search"
				/>
			</div>
		);
	}

	static propTypes = {
		onSearch: PropTypes.func,
		search: PropTypes.string,
	};

	static defaultProps = {
		onSearch: noop,
		search: '',
	};
}

module.exports = Search;
