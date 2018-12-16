'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const { bindActionCreators } = require('redux');
const { deduplicateByKey, get } = require('../utils');
const TagSelector = require('../component/tag-selector.jsx');
const { fetchTagsInCollection, fetchTagsInLibrary } = require('../actions');
const { makePath } = require('../common/navigation');

class TagSelectorContainer extends React.PureComponent {
	state = {
		searchString: ''
	}

	handleSearch(searchString) {
		this.setState({ searchString })
	}

	handleSelect(tagName) {
		const { libraryKey: library, itemsSource, collectionKey, selectedTags, push } = this.props;
		const index = selectedTags.indexOf(tagName)
		if(index > -1) {
			selectedTags.splice(index, 1);
		} else {
			selectedTags.push(tagName);
		}

		switch(itemsSource) {
			case 'top':
				push(makePath({ library, tags: selectedTags }));
			break;
			case 'trash':
				push(makePath({ library, trash: true }));
			break;
			case 'publications':
				push(makePath({ library, publications: true }));
			break;
			case 'collection':
				push(makePath({ library, tags: selectedTags, collection: collectionKey }));
			break;
			case 'query':
				push(makePath({ library, tags: selectedTags, collection: collectionKey }));
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
	}
}

const mapStateToProps = state => {
	const {
		libraryKey,
		collectionKey,
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
		case 'query':
		case 'trash':
		case 'publications':
			//@TODO: these requires a special request
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
		isReady: true, libraryKey, tags, totalTagCount, sourceTagsCount, itemsSource,
		collectionKey, selectedTags
	}

};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push }, dispatch) });

module.exports = connect(mapStateToProps, mapDispatchToProps)(TagSelectorContainer);
