import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import SearchContainer from '../../container/search';
import Button from '../ui/button';

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
					<SearchContainer />
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
