import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import Search from '../../component/search';
import Button from '../ui/button';

class SearchBar extends React.PureComponent {
	handleCancelSearchClick = () => {
		const {
			collectionKey, isMyPublications, isTrash, libraryKey, navigate, searchState,
			triggerSearchMode, view, itemKey
		} = this.props;
		triggerSearchMode(false);

		navigate({
			library: view === 'libraries' ? null : libraryKey,
			collection: collectionKey,
			items: searchState.triggerView === 'item-details' && searchState.triggerItem ? searchState.triggerItem : itemKey,
			trash: isTrash,
			publications: isMyPublications,
			view: searchState.triggerView ?
				searchState.triggerView === 'item-details' ?
					searchState.triggerItem ? 'item-details' : 'item-list'
					: searchState.triggerView
				: view
		}, true);
	}

	render() {
		const { isSearchMode, view, itemsSource } = this.props;
		return (
			<CSSTransition
				in={ isSearchMode && ((view === 'item-details' && itemsSource !== 'query') || view !== 'item-details') }
				timeout={ 250 }
				classNames="fade"
				unmountOnExit
			>
				<div className="searchbar">
					<Search autoFocus />
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
		itemKey: PropTypes.string,
		itemsSource: PropTypes.string,
		libraryKey: PropTypes.string,
		navigate: PropTypes.func,
		searchState: PropTypes.object,
		triggerSearchMode: PropTypes.func.isRequired,
		view: PropTypes.string,
	}
}

export default SearchBar;
