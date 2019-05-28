'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../utils';
import Button from './ui/button';
import Icon from './ui/icon';

class Search extends React.PureComponent {
	state = { searchValue: this.props.search }

	handleSearchChange = ev => {
		const newValue = ev.currentTarget.value;
		this.setState({ searchValue: newValue });
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.props.onSearch(newValue);
		}, 300);
	}

	handleSearchClear = () => {
		clearTimeout(this.timeout);
		this.setState({ searchValue: '' });
		this.props.onSearch('');
	}

	render() {
		return (
			<div className="search">
				<div className="dropdown">
					<Button icon className="dropdown-toggle">
						<Icon type={ '24/search-options' } width="24" height="24" />
					</Button>
				</div>
				<input
					className="form-control search-input"
					onChange={ this.handleSearchChange }
					type="search"
					value={ this.state.searchValue }
					placeholder="Search"
				/>
				{ this.state.searchValue.length > 0 && (
					<Button icon className="clear" onClick={ this.handleSearchClear }>
						<Icon type={ '8/x' } width="8" height="8" />
					</Button>
				)}
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
