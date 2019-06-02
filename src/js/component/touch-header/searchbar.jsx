import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import SearchContainer from '../../container/search';
import Button from '../ui/button';

class SearchBar extends React.PureComponent {
	handleCancelSearchClick = () => {
		const {
			collectionKey, isMyPublications, isTrash, libraryKey, navigate, triggerSearchMode,
		} = this.props;
		triggerSearchMode(false);
		navigate({
			library: libraryKey,
			collection: collectionKey,
			trash: isTrash,
			publications: isMyPublications,
		});
	}

	render() {
		const { isSearchMode, view } = this.props;
		return (
			<CSSTransition
				in={ isSearchMode && view !== 'item-details' }
				timeout={ 250 }
				classNames="fade"
				unmountOnExit
			>
				<div className="searchbar">
					<SearchContainer autoFocus />
					<Button onClick={ this.handleCancelSearchClick } className="btn-link">
						Cancel
					</Button>
				</div>
			</CSSTransition>
		);
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		isMyPublications: PropTypes.bool,
		isSearchMode: PropTypes.bool,
		isTrash: PropTypes.bool,
		libraryKey: PropTypes.string,
		navigate: PropTypes.func,
		triggerSearchMode: PropTypes.func.isRequired,
		view: PropTypes.string,
	}
}

export default SearchBar;
