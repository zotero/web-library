'use strict';

import React from 'react';
import { connect } from 'react-redux';

import Attachments from '../../component/item-details/attachments';
import { deleteItem, createItem, uploadAttachment, fetchChildItems, fetchItemTemplate } from '../../actions';
import { get } from '../../utils';

const AttachmentsContainer = props => <Attachments { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const childItemsData = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey], {});
	const { isFetching, pointer, keys, totalResults } = childItemsData;
	const childItems = (keys || []).map(key => get(state, ['libraries', libraryKey, 'items', key], {}));
	const uploads = get(state, ['libraries', libraryKey, 'updating', 'uploads'], []);
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const isFetched = !isFetching && !hasMoreItems;

	return { childItems, libraryKey, itemKey, isFetched, isFetching, uploads, pointer, totalResults };
}

export default connect(mapStateToProps,
	{ deleteItem, createItem, uploadAttachment, fetchChildItems, fetchItemTemplate }
)(AttachmentsContainer)
