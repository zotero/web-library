'use strict';

import React from 'react';
import { connect } from 'react-redux';

import RichEditor from '../component/rich-editor';

const RichEditorContainer = props => <RichEditor { ...props } />;

const mapStateToProps = state => {
	const { tinymceRoot } = state.config;
	return { tinymceRoot };
};


export default connect(mapStateToProps)(RichEditorContainer);
