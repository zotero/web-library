'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from '../utils';
import ItemsActions from '../component/item/actions';
import withSelectMode from '../enhancers/with-select-mode';
import withDevice from '../enhancers/with-device';
import withItemsActions from '../enhancers/with-items-actions';

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
	const { isReadOnly } = (state.config.libraries.find(l => l.key === libraryKey) || {});

	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const itemTypes = state.meta.itemTypes;

	return { collectionKey, item, itemKey, itemKeys, itemsSource, itemTypes,
		isReadOnly, search, tags
	}
}

export default withItemsActions(withSelectMode(withDevice(
	connect(mapStateToProps)(ItemsActionsContainer)
)));
