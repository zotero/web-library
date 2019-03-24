'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { DebounceInput } from 'react-debounce-input';
import { noop } from '../utils';

class Search extends React.PureComponent {
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

export default Search;
