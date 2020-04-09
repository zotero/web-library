'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { fetchRelatedItems, navigate, removeRelatedItem } from '../../actions';
import { get, mapRelationsToItemKeys } from '../../utils';
import Related from '../../component/item-details/related';

const RelatedContainer = props => <Related { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const { relations } = get(state, ['libraries', libraryKey, 'items', itemKey], {});
	const relatedKeys = mapRelationsToItemKeys(relations || {}, libraryKey);
	const { isFetching, isFetched } = get(state, ['libraries', libraryKey, 'itemsRelated', itemKey], {});
	const relatedItems = (relatedKeys || [])
		.map(relatedKey => get(state, ['libraries', libraryKey, 'items', relatedKey], null))
		.filter(Boolean);
	return { libraryKey, itemKey, isFetched, isFetching, relations, relatedKeys, relatedItems };
}

export default connect(mapStateToProps, { fetchRelatedItems, navigate, removeRelatedItem })(RelatedContainer)
