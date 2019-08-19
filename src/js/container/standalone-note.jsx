'use strict';

import React from 'react';
import { connect } from 'react-redux';

import StandaloneNote from '../component/standalone-note';
import { sourceFile, updateItem } from '../actions/';
import { get } from '../utils';

const StandaloneNoteContainer = props => <StandaloneNote { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], {});
	const isTinymceFetched = state.sources.fetched.includes('tinymce');
	const isTinymceFetching = state.sources.fetching.includes('tinymce');

	return { item, isTinymceFetched, isTinymceFetching, sourceFile };
}

export default connect(mapStateToProps, { updateItem, sourceFile })(StandaloneNoteContainer)
