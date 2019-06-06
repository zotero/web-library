import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import SearchContainer from '../../container/search';
import Button from '../ui/button';

class SearchBar extends React.PureComponent {
	handleCancelSearchClick = () => {
		const {
			collectionKey, isMyPublications, isTrash, libraryKey, navigate, searchTriggerView,
			triggerSearchMode, view, itemKey
		} = this.props;
		triggerSearchMode(false);
		navigate({
			library: view === 'libraries' ? null : libraryKey,
			collection: collectionKey,
			items: itemKey,
			trash: isTrash,
			publications: isMyPublications,
			view: searchTriggerView ? searchTriggerView === 'item-details' && !itemKey ? 'item-list' : searchTriggerView : view
		});
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
		itemKey: PropTypes.string,
		itemsSource: PropTypes.string,
		libraryKey: PropTypes.string,
		navigate: PropTypes.func,
		searchTriggerView: PropTypes.string,
		triggerSearchMode: PropTypes.func.isRequired,
		view: PropTypes.string,
	}
}

export default SearchBar;
