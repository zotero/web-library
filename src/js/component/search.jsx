'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { DebounceInput } from 'react-debounce-input';
import { noop } from '../utils';
import Button from './ui/button';
import Icon from './ui/icon';

class Search extends React.PureComponent {
	render() {
		return (
				<div className="search">
					<div className="dropdown">
						<Button icon className="dropdown-toggle">
							<Icon type={ '24/search-options' } width="24" height="24" />
						</Button>
					</div>
					<DebounceInput
						type="search"
						debounceTimeout={ 300 }
						value={ this.props.search }
						onChange={ ev => this.props.onSearch(ev.target.value) }
						className="form-control search-input"
					/>
					<Button icon className="clear">
						<Icon type={ '8/x' } width="8" height="8" />
					</Button>
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
