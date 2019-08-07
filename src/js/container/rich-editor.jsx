'use strict';

import React from 'react';
import { connect } from 'react-redux';

import RichEditor from '../component/rich-editor';
import withDevice from '../enhancers/with-device';

const RichEditorContainer = props => <RichEditor { ...props } />;

const mapStateToProps = state => {
	const { tinymceRoot } = state.config;
	return { tinymceRoot };
};


export default withDevice(connect(mapStateToProps)(RichEditorContainer));
