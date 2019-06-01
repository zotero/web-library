import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import Button from '../ui/button';
import Icon from '../ui/icon';

class SearchBar extends React.PureComponent {

	handleCancelSearchClick = () => {
		this.props.triggerSearchMode(false);
	}

	render() {
		const { isSearchMode } = this.props;
		return (
			<CSSTransition
				in={ isSearchMode }
				timeout={ 250 }
				classNames="fade"
				unmountOnExit
			>
				<div className="searchbar">
					<div className="input-group search">
						<input type="text" className="form-control search-input" placeholder="Search" />
						<Button icon className="clear" onClick={ this.handleSearchClear }>
							<Icon type={ '8/x' } width="8" height="8" />
						</Button>
					</div>
					<Button onClick={ this.handleCancelSearchClick } className="btn-link">
						Cancel
					</Button>
				</div>
			</CSSTransition>
		);
	}

	static propTypes = {
		isSearchMode: PropTypes.bool,
		triggerSearchMode: PropTypes.func.isRequired
	}
}

export default SearchBar;
