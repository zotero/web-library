'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { updateItem } from '../actions/';
import { get } from '../utils';
import withEditMode from '../enhancers/with-edit-mode';
import TouchNote from '../component/touch-note';

const TouchNoteContainer = props => <TouchNote { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, noteKey } = state.current;
	const note = get(state, ['libraries', libraryKey, 'items', noteKey], null);
	return { libraryKey, note };
}

export default withEditMode(
	connect(mapStateToProps, { updateItem })(TouchNoteContainer)
);
