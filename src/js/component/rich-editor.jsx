/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import cx from 'classnames';

import tinymce from 'tinymce';
import 'tinymce/themes/modern';

import TinyMCE from 'react-tinymce';
import PropTypes from 'prop-types';
import { Toolbar, ToolGroup } from './ui/toolbars';
import Button from './ui/button';

window.tinymce = tinymce;

class RichEditor extends React.PureComponent {
	componentWillReceiveProps(props) {
		if(this.editor && (this.props.value !== props.value)) {
			this.editor.setContent(props.value);

			// tinymce insists on focusing when switching readonly off
			// it's is hardcoded with no opt out.
			// below is a hack to prevent it from happening
			let focus = this.editor.focus;
			this.editor.focus = () => {};
			this.editor.setMode('design');
			this.editor.focus = focus;
		}
	}

	handleEditorInit(ev, editor) {
		this.editor = editor;
	}

	handleEditorInteraction() {
		this.forceUpdate();
	}

	handleEditorFocus() {
		clearTimeout(this.timeout);
	}

	handleEditorUpdate() {
		this.timeout = setTimeout(() => {
			this.editor.setMode('readonly');
			this.props.onChange(this.editor.getContent());
		}, 50);
	}

	buttonHandler(command) {
		this.editor ? this.editor.editorCommands.execCommand(command) : null;
	}

	isEditorCommandState(command) {
		return this.editor && this.editor.editorCommands.queryCommandState(command);
	}

	renderEditor() {
		if(process.env.NODE_ENV !== 'test') {
			return (
				<TinyMCE
					content={ this.props.value }
					config={{
						skin_url: '/static/other/lightgray',
						branding: false,
						toolbar: false,
						menubar: false,
						statusbar: false
					}}
					onInit={ this.handleEditorInit.bind(this) }
					onChange={ this.handleEditorInteraction.bind(this) }
					onKeyup={ this.handleEditorInteraction.bind(this) }
					onMouseup={ this.handleEditorInteraction.bind(this) }
					onFocus={ this.handleEditorFocus.bind(this) }
					onBlur={ this.handleEditorUpdate.bind(this) }
				/>
			);
		} else return null;
	}

	render() {
		return (
			<div className="rich-editor">
				<Toolbar>
					<div className="toolbar-left">
						<ToolGroup>
							<Button
								className={ cx("btn-icon", {
									active: this.isEditorCommandState('BOLD')
								})}
								onClick={ this.buttonHandler.bind(this, 'BOLD') }>
								B
							</Button>
							<Button
								className={ cx("btn-icon", {
									active: this.isEditorCommandState('ITALIC')
								})}
								onClick={ this.buttonHandler.bind(this, 'ITALIC') }>
								I
							</Button>
							<Button
								className={ cx("btn-icon", {
									active: this.isEditorCommandState('UNDERLINE')
								})}
								onClick={ this.buttonHandler.bind(this, 'UNDERLINE') }>
								U
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
				<div className="editor-container">
					{ this.renderEditor() }
				</div>
			</div>
		);
	}
}

RichEditor.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired
};

RichEditor.defaultProps = {};

export default RichEditor;
