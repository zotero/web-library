'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { get } from '../utils';
import ItemsActions from '../component/item/actions';
import withSelectMode from '../enhancers/with-select-mode';
import withDevice from '../enhancers/with-device';
import withItemsActions from '../enhancers/with-items-actions';
import withSortItems from '../enhancers/with-sort-items';
import { toggleModal } from '../actions';

const ItemsActionsContainer = props => <ItemsActions { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, collectionKey, itemsSource, itemKey, itemKeys, tags,
		search } = state.current;
	const { isReadOnly } = (state.config.libraries.find(l => l.key === libraryKey) || {});

	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);

	return { collectionKey, item, itemKey, itemKeys, itemsSource, isReadOnly, search, tags };
}

export default withSortItems(withItemsActions(withSelectMode(withDevice(
	connect(mapStateToProps, { toggleModal })(ItemsActionsContainer)
))));
