'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { get } = require('../utils');
const ItemsActions = require('../component/item/actions');
const withSelectMode = require('../enhancers/with-select-mode');
const withDevice = require('../enhancers/with-device');
const withItemsActions = require('../enhancers/with-items-actions');

class ItemsActionsContainer extends React.PureComponent {
	render() {
		return <ItemsActions { ...this.props } />
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		device: PropTypes.object,
		isSelectMode: PropTypes.bool,
		itemKeys: PropTypes.array,
		itemsSource: PropTypes.string,
		itemTypes: PropTypes.array,
		libraryKey: PropTypes.string,
		onSelectModeToggle: PropTypes.func,
		search: PropTypes.string,
		tags: PropTypes.array,
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

module.exports = withItemsActions(withSelectMode(withDevice(
	connect(mapStateToProps)(ItemsActionsContainer)
)));
