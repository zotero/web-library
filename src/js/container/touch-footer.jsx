'use strict';

const React = require('react');
const { connect } = require('react-redux');
const { get } = require('../utils');
const withSelectMode = require('../enhancers/with-select-mode');
const TouchFooter = require('../component/touch-footer');

const {	toggleModal } = require('../actions');

class ItemsActionsContainer extends React.PureComponent {

	render() {
		return <TouchFooter { ...this.props } />
	}
}

const mapStateToProps = state => {
	const { libraryKey, collectionKey, itemsSource, itemKey, itemKeys, tags,
		search } = state.current;

	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const itemTypes = state.meta.itemTypes;

	return { collectionKey, item, itemKey, itemKeys, itemsSource, itemTypes,
		search, tags
	}
}

module.exports = withSelectMode(
	connect(mapStateToProps, { toggleModal })(ItemsActionsContainer)
);
