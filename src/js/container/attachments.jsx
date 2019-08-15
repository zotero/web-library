'use strict';

import React from 'react';
import { connect } from 'react-redux';

import Attachments from '../component/attachments';
import { deleteItem, createItem, uploadAttachment, fetchChildItems, fetchItemTemplate } from '../actions/';
import { get } from '../utils';

const AttachmentsContainer = props => <Attachments { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const { relations } = get(state, ['libraries', libraryKey, 'items', itemKey], {});
	const childItems = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey, 'keys'], [])
			.map(key => get(state, ['libraries', libraryKey, 'items', key], {}));
	const totalResults = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey, 'totalResults']);
	const isFetching = get(
		state, ['libraries', libraryKey, 'itemsByParent', itemKey, 'isFetching'], true
	);
	const uploads = get(state, ['libraries', libraryKey, 'updating', 'uploads'], []);
	const hasMoreItems = totalResults > childItems.length || typeof(totalResults) === 'undefined';
	const isFetched = !isFetching && !hasMoreItems;

	return { childItems, libraryKey, itemKey, isFetched, isFetching, uploads, relations, totalResults };
}

export default connect(mapStateToProps, { deleteItem, createItem, uploadAttachment, fetchChildItems, fetchItemTemplate })(AttachmentsContainer)
