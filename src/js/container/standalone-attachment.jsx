'use strict';

import React from 'react';
import { connect } from 'react-redux';

import StandaloneAttachment from '../component/standalone-attachment';
import { get } from '../utils';

const StandaloneAttachmentContainer = props => <StandaloneAttachment { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], {});

	return { item };
}

export default connect(mapStateToProps)(StandaloneAttachmentContainer)
