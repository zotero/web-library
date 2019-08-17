'use strict';

import React from 'react';
import { connect } from 'react-redux';

import StandaloneNote from '../component/standalone-note';
import { updateItem } from '../actions/';
import { get } from '../utils';

const StandaloneNoteContainer = props => <StandaloneNote { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], {});

	return { item };
}

export default connect(mapStateToProps, { updateItem })(StandaloneNoteContainer)
