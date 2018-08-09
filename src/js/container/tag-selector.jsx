'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const { get } = require('../utils');
const TagSelector = require('../component/tag-selector.jsx');

class TagSelectorContainer extends React.PureComponent {
	render() {
		return <TagSelector { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemKey = state.current.item;
	const collectionKey = state.current.collection;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);

	if(item) {
		// @TODO: display tags for this item + colored tags (disabled if not present)
		return { tags: item.tags.map(({ tag: name }) => ({ name })) }
	}

	switch(state.current.itemsSource) {
		case 'trash':
			// @TODO: display tags for all items in trash + colored tags (disabled if not present)
			return { tags: [] }
		case 'collection':
			// @TODO: display tags for all items in collection + colored tags (disabled if not present)
			return { tags: [] }
		case 'top':
		default:
			// @TODO: display all tags
			return { tags: [] }
	}
};

module.exports = withRouter(connect(mapStateToProps)(TagSelectorContainer));
