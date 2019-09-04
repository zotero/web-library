'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { sourceFile } from '../actions';
import RichEditor from '../component/rich-editor';
import withDevice from '../enhancers/with-device';

const RichEditorContainer = React.forwardRef(
	(props, ref) => <RichEditor { ...props } ref={ ref } />
);

RichEditorContainer.displayName = 'RichEditorContainer';

const mapStateToProps = state => {
	const { tinymceRoot } = state.config;
	const isTinymceFetched = state.sources.fetched.includes('tinymce');
	const isTinymceFetching = state.sources.fetching.includes('tinymce');

	return { tinymceRoot, isTinymceFetched, isTinymceFetching };
};


export default withDevice(connect(mapStateToProps, { sourceFile }, null, { forwardRef: true })(RichEditorContainer));
