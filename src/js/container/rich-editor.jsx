'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { sourceFile } from '../actions';
import RichEditor from '../component/rich-editor';
import withDevice from '../enhancers/with-device';

const RichEditorContainer = props => <RichEditor { ...props } />;

const mapStateToProps = state => {
	const { tinymceRoot } = state.config;
	const isTinymceFetched = state.sources.fetched.includes('tinymce');
	const isTinymceFetching = state.sources.fetching.includes('tinymce');

	return { tinymceRoot, isTinymceFetched, isTinymceFetching };
};


export default withDevice(connect(mapStateToProps, { sourceFile })(RichEditorContainer));
