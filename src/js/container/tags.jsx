'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { updateItem } from '../actions/';
import { get } from '../utils';
import Tags from '../component/tags';

const TagsContainer = props => <Tags { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const { tags } = get(state, ['libraries', libraryKey, 'items', itemKey], {});
	const tagColors = get(state, ['libraries', libraryKey, 'tagColors']);
	return { libraryKey, itemKey, tagColors, tags };
}

export default connect(mapStateToProps, { updateItem })(TagsContainer)
