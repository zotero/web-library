'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import TagSelector from '../component/tag-selector.jsx';
import { deduplicateByKey, get } from '../utils';
import { checkColoredTags, fetchTags, navigate } from '../actions';

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

	render() {
		let { tags, ...props } = this.props;

		if(this.state.searchString !== '') {
			tags = this.props.tags.filter(
				t => t.tag.toLowerCase().includes(this.state.searchString.toLowerCase())
			)
		}

		return <TagSelector
			onSearch={ this.handleSearch.bind(this) }
			onSelect={ this.handleSelect.bind(this) }
			tags={ tags }
			searchString={ this.state.searchString }
			{ ...props }
		/>;
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		isMyPublications: PropTypes.bool,
		isTrash: PropTypes.bool,
		libraryKey: PropTypes.string,
		navigate: PropTypes.func,
		qmode: PropTypes.string,
		search: PropTypes.string,
		selectedTags: PropTypes.array,
		tags: PropTypes.array,
		view: PropTypes.string,
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

	const tagColors = get(state, ['libraries', libraryKey, 'tagColors'], []);
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

	const { isFetching = false, pointer: sourceTagsPointer = 0, tags: sourceTags = [], totalResults: totalTagCount = null } = tagsData;
	const tags = deduplicateByKey([
		...Object.keys(tagColors).map(tag => ({ tag })),
		...sourceTags
	].map(({ tag }) => ({
		tag,
		color: tag in tagColors ? tagColors[tag] : null,
		disabled: tag in tagColors && !sourceTags.some(t => t.tag === tag),
		selected: selectedTags.includes(tag)
	})), 'tag');

	return {
		isReady: totalTagCount !== null,
		libraryKey, sourceTags, search, selectedTags, tags, totalTagCount, itemsSource, collectionKey,
		sourceTagsPointer, isFetching, isMyPublications, isTrash, qmode
	}

};

const mapDispatchToProps = { checkColoredTags, fetchTags, navigate };

export default connect(mapStateToProps, mapDispatchToProps)(TagSelectorContainer);
