'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const { deduplicateByKey, get } = require('../utils');
const TagSelector = require('../component/tag-selector.jsx');
const { fetchTagsInCollection, fetchTagsInLibrary } = require('../actions');

class TagSelectorContainer extends React.PureComponent {
	state = {
		searchString: ''
	}

	handleSearch(searchString) {
		this.setState({ searchString })
	}

	handleSelect(tagName) {
		const { itemsSource, collectionKey, selectedTags, history } = this.props;
		const index = selectedTags.indexOf(tagName)
		if(index > -1) {
			selectedTags.splice(index, 1);
		} else {
			selectedTags.push(tagName);
		}

		selectedTags.sort();

		if(selectedTags.length) {
			switch(itemsSource) {
				case 'top':
					history.push(`/tags/${selectedTags.join(',')}`);
				break;
				case 'collection':
					history.push(`/collection/${collectionKey}/tags/${selectedTags.join(',')}`);
				break;
			}
		} else {
			switch(itemsSource) {
				case 'top':
					history.push('/');
				break;
				case 'collection':
					history.push(`/collection/${collectionKey}`);
				break;
			}
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
			case 'collection':
				return await dispatch(fetchTagsInCollection(collectionKey, { start, limit }));
		}
	}

	render() {
		if(this.props.isReady) {
			let { tags, totalTagCount, ...props } = this.props;

			if(this.state.searchString !== '') {
				let prefilterTagsLength = tags.length;
				tags = this.props.tags.filter(
					t => t.tag.toLowerCase().includes(this.state.searchString.toLowerCase())
				)

				// it's not possible to filter tags via api so we always pretend
				// there are few more matching tags until all possible tags are fetched
				if(prefilterTagsLength < totalTagCount) {
					totalTagCount = tags.length + 3;
				} else {
					totalTagCount = tags.length;
				}

			}
			return <TagSelector
				onSearch={ this.handleSearch.bind(this) }
				onLoadMore={ this.handleLoadMore.bind(this) }
				onSelect={ this.handleSelect.bind(this) }
				tags={ tags }
				totalTagCount={ totalTagCount }
				searchString={ this.state.searchString }
				{ ...props }
			/>;
		} else {
			return null;
		}
	}
}

const mapStateToProps = state => {
	const {
		library: libraryKey,
		item: itemKey,
		collection: collectionKey,
		tags: selectedTags,
		itemsSource
	} = state.current;
	if(!libraryKey) {
		return { isReady: false }
	}
	const tagsFromSettings = [...get(state, ['libraries', libraryKey, 'tagsFromSettings'], [])];
	var totalTagCount;
	var sourceTags;

	switch(itemsSource) {
		case 'trash':
			//@TODO: this requires a special requst
			sourceTags = [];
			totalTagCount = 0;
		break;
		case 'collection':
			sourceTags = get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey], []);
			totalTagCount = get(state, ['libraries', libraryKey, 'tagCountByCollection', collectionKey], null);
		break;
		case 'top':
		default:
			sourceTags = get(state, ['libraries', libraryKey, 'tagsTop'], []);
			totalTagCount = get(state, ['tagCountByLibrary', libraryKey], null);
		break;
	}

	if(totalTagCount === null) {
		// number of tags for this source is unknown.
		// We pretend it's 30 and display placeholders
		// until we know how many it is truly
		totalTagCount = 30;
	}

	const sourceTagsFiltered = sourceTags.filter(t => !tagsFromSettings.includes(t));
	const tags = [ ...tagsFromSettings, ...sourceTagsFiltered ].map(tag => ({
		...state.libraries[libraryKey].tags[tag],
		disabled: tagsFromSettings.includes(tag) && !sourceTags.includes(tag),
		selected: selectedTags.includes(state.libraries[libraryKey].tags[tag].tag)
	}));

	const duplicatesFound = deduplicateByKey(tags, 'tag');
	const sourceTagsCount = sourceTags.length - duplicatesFound;
	totalTagCount -= duplicatesFound;

	return {
		isReady: true,
		tags, totalTagCount, sourceTagsCount, itemsSource, collectionKey, selectedTags
	}

};

module.exports = withRouter(connect(mapStateToProps)(TagSelectorContainer));
