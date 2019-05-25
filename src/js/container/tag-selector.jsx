'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import TagSelector from '../component/tag-selector.jsx';
import { deduplicateByKey, get } from '../utils';
import { fetchTagsInCollection, fetchTagsInLibrary } from '../actions';
import { makePath } from '../common/navigation';

class TagSelectorContainer extends React.PureComponent {
	state = {
		searchString: ''
	}

	handleSearch(searchString) {
		this.setState({ searchString })
	}

	handleSelect(tagName) {
		const { libraryKey: library, itemsSource, collectionKey: collection, selectedTags: tags,
			makePath, push, search } = this.props;
		const index = tags.indexOf(tagName)
		if(index > -1) {
			tags.splice(index, 1);
		} else {
			tags.push(tagName);
		}

		switch(itemsSource) {
			case 'top':
				push(makePath({ library, tags }));
			break;
			case 'trash':
				push(makePath({ library, trash: true, tags }));
			break;
			case 'publications':
				push(makePath({ library, publications: true, tags }));
			break;
			case 'collection':
				push(makePath({ library, collection, tags }));
			break;
			case 'query':
				push(makePath({ library, collection, search, tags }));
			break;
		}
	}

	async handleLoadMore(start, limit) {
		const { itemsSource, dispatch, collectionKey } = this.props;

		switch(itemsSource) {
			case 'top':
				return await dispatch(fetchTagsInLibrary({ start, limit }));
			case 'trash':
				//@TODO;
				return;
			case 'publications':
				//@TODO
				return;
			case 'collection':
				return await dispatch(fetchTagsInCollection(collectionKey, { start, limit }));
			case 'query':
				//@TODO;
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
		search
	} = state.current;
	if(!libraryKey) { return {}; }

	const tagsFromSettings = [...get(state, ['libraries', libraryKey, 'tagsFromSettings'], [])];
	var tagsData;

	switch(itemsSource) {
		case 'query':
		case 'trash':
		case 'publications':
			//@TODO: these requires a special request
			tagsData = {}
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
		libraryKey, sourceTags, search, tags, totalTagCount, itemsSource,
		makePath: makePath.bind(null, state.config), collectionKey,
		selectedTags, isFetching
	}

};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push }, dispatch) });

export default connect(mapStateToProps, mapDispatchToProps)(TagSelectorContainer);
