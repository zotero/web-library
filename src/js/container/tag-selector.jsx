'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TagSelector from '../component/tag-selector.jsx';
import { deduplicateByKey, get } from '../utils';
import { fetchTagsInCollection, fetchTagsForTopItems, fetchTagsForTrashItems,
	fetchTagsForPublicationsItems, fetchTagsForItemsByQuery, navigate } from '../actions';

class TagSelectorContainer extends React.PureComponent {
	state = {
		searchString: ''
	}

	handleSearch(searchString) {
		this.setState({ searchString })
	}

	handleSelect(tagName) {
		const { libraryKey: library, collectionKey: collection, selectedTags: tags = [],
			search, qmode, isTrash: trash, isMyPublications: publications, view,
			navigate } = this.props;

		const index = tags.indexOf(tagName);
		if(index > -1) {
			tags.splice(index, 1);
		} else {
			tags.push(tagName);
		}

		navigate({ library, tags, collection, trash,
			publications, search, view, qmode });
	}

	async handleLoadMore(start, limit) {
		const { collectionKey, dispatch, itemsSource, isMyPublications,
			isTrash, selectedTags, search, qmode } = this.props;

		switch(itemsSource) {
			case 'top':
				return await dispatch(fetchTagsForTopItems({ start, limit }));
			case 'trash':
				return await dispatch(fetchTagsForTrashItems({ start, limit }));
			case 'publications':
				return await dispatch(fetchTagsForPublicationsItems({ start, limit }));
			case 'collection':
				return await dispatch(fetchTagsInCollection(collectionKey, { start, limit }));
			case 'query':
				return await dispatch(fetchTagsForItemsByQuery({
					isTrash,
					isMyPublications,
					collectionKey,
					itemQ: search,
					itemQMode: qmode,
					itemTag: selectedTags
				}, { start, limit }));
		}
	}

	render() {
		let { tags, ...props } = this.props;

		if(this.state.searchString !== '') {
			tags = this.props.tags.filter(
				t => t.tag.toLowerCase().includes(this.state.searchString.toLowerCase())
			)
		}

		return <TagSelector
			onSearch={ this.handleSearch.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
			onSelect={ this.handleSelect.bind(this) }
			tags={ tags }
			searchString={ this.state.searchString }
			{ ...props }
		/>;
	}
}

const mapStateToProps = state => {
	const {
		libraryKey,
		collectionKey,
		tags: selectedTags,
		itemsSource,
		search,
		isMyPublications,
		isTrash,
		qmode,
	} = state.current;
	if(!libraryKey) { return {}; }

	const tagsFromSettings = [...get(state, ['libraries', libraryKey, 'tagsFromSettings'], [])];
	var tagsData;

	switch(itemsSource) {
		case 'query':
			tagsData = state.query.tags;
		break;
		case 'trash':
			tagsData = get(state, ['libraries', libraryKey, 'tagsInTrashItems'], []);
		break;
		case 'publications':
			tagsData = get(state, ['libraries', libraryKey, 'tagsInPublicationsItems'], []);
		break;
		case 'collection':
			tagsData = get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey], []);
		break;
		case 'top':
		default:
			tagsData = get(state, ['libraries', libraryKey, 'tagsTop'], []);
		break;
	}

	const { isFetching = false, tags: sourceTags = [], totalResults: totalTagCount = null } = tagsData;
	const sourceTagsFiltered = sourceTags.filter(t => !tagsFromSettings.includes(t));
	const tags = [ ...tagsFromSettings, ...sourceTagsFiltered ].map(tag => ({
		...state.libraries[libraryKey].tags[tag],
		disabled: tagsFromSettings.includes(tag) && !sourceTags.includes(tag),
		selected: selectedTags.includes(state.libraries[libraryKey].tags[tag].tag)
	}));

	deduplicateByKey(tags, 'tag');

	return {
		isReady: totalTagCount !== null,
		libraryKey, sourceTags, search, tags, totalTagCount, itemsSource, collectionKey,
		selectedTags, isFetching, isMyPublications, isTrash, qmode
	}

};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ navigate }, dispatch) });

export default connect(mapStateToProps, mapDispatchToProps)(TagSelectorContainer);
