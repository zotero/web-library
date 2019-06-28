/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import cx from 'classnames';

import tinymce from 'tinymce';
import 'tinymce/themes/modern';

import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';
import { Toolbar, ToolGroup } from './ui/toolbars';
import Button from './ui/button';

window.tinymce = tinymce;

class RichEditor extends React.PureComponent {
	state = { content: this.props.value };


	handleEditorInit = (ev, editor) => {
		this.editor = editor;
	}

	handleEditorChange = newContent => {
		const { onChange } = this.props;
		const { content } = this.state;
		if(newContent === content) {
			return;
		}
		this.setState({ content: newContent });

		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			onChange(newContent);
		}, 500);
	}

	handleButtonClick(command) {
		this.editor ? this.editor.editorCommands.execCommand(command) : null;
	}

	isEditorCommandState(command) {
		return this.editor && this.editor.editorCommands.queryCommandState(command);
	}

	renderEditor() {
		if(process.env.NODE_ENV !== 'test') {
			return (
				<Editor
					disabled={ this.props.isReadOnly }
					value={ this.state.content }
					init={{
						skin_url: '/static/other/lightgray',
						branding: false,
						toolbar: false,
						menubar: false,
						statusbar: false,
					}}
					onEditorChange={ this.handleEditorChange }
					onInit={ this.handleEditorInit }
				/>
			);
		} else return null;
	}

	render() {
		const { isReadOnly } = this.props;
		return (
			<div className="rich-editor">
				{ !isReadOnly && (
						<Toolbar>
						<div className="toolbar-left">
							<ToolGroup>
								<Button
									icon
									className={ cx({
										active: this.isEditorCommandState('BOLD')
									})}
									onClick={ this.handleButtonClick.bind(this, 'BOLD') }>
									B
								</Button>
								<Button
									icon
									className={ cx({
										active: this.isEditorCommandState('ITALIC')
									})}
									onClick={ this.handleButtonClick.bind(this, 'ITALIC') }>
									I
								</Button>
								<Button
									icon
									className={ cx({
										active: this.isEditorCommandState('UNDERLINE')
									})}
									onClick={ this.handleButtonClick.bind(this, 'UNDERLINE') }>
									U
								</Button>
							</ToolGroup>
						</div>
					</Toolbar>
				)}
				<div className="editor-container">
					{ this.renderEditor() }
				</div>
			</div>
		);
	}
}

RichEditor.propTypes = {
	isReadOnly: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string,
};

RichEditor.defaultProps = {};

export default RichEditor;
