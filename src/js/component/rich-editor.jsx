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
import Icon from './ui/icon';

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
					<React.Fragment>
						<Toolbar>
							<div className="toolbar-left">
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('BOLD')
										})}
										onClick={ this.handleButtonClick.bind(this, 'BOLD') }>
										<Icon type="16/editor/b" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('ITALIC')
										})}
										onClick={ this.handleButtonClick.bind(this, 'ITALIC') }>
										<Icon type="16/editor/i" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('UNDERLINE')
										})}
										onClick={ this.handleButtonClick.bind(this, 'UNDERLINE') }>
										<Icon type="16/editor/u" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('STRIKETHROUGH')
										})}
										onClick={ this.handleButtonClick.bind(this, 'STRIKETHROUGH') }>
										<Icon type="16/editor/s" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('SUBSCRIPT')
										})}
										onClick={ this.handleButtonClick.bind(this, 'SUBSCRIPT') }>
										<Icon type="16/editor/sub" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('SUPERSCRIPT')
										})}
										onClick={ this.handleButtonClick.bind(this, 'SUPERSCRIPT') }>
										<Icon type="16/editor/sup" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('FORECOLOR')
										})}
										onClick={ this.handleButtonClick.bind(this, 'FORECOLOR') }>
										<Icon type="16/editor/fore-color" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('BACKCOLOR')
										})}
										onClick={ this.handleButtonClick.bind(this, 'BACKCOLOR') }>
										<Icon type="16/editor/back-color" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('REMOVEFORMAT')
										})}
										onClick={ this.handleButtonClick.bind(this, 'REMOVEFORMAT') }>
										<Icon type="16/editor/remove-format" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('BLOCKQUOTE')
										})}
										onClick={ this.handleButtonClick.bind(this, 'BLOCKQUOTE') }>
										<Icon type="16/editor/blockquote" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('LINK')
										})}
										onClick={ this.handleButtonClick.bind(this, 'LINK') }>
										<Icon type="16/editor/link" width="16" height="16" />
									</Button>

								</ToolGroup>
							</div>
						</Toolbar>
						<Toolbar>
							<div className="toolbar-left">
								<ToolGroup>
									<div className="dropdown dropdown-wrapper">
										Paragraph
									</div>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('ALIGNLEFT')
										})}
										onClick={ this.handleButtonClick.bind(this, 'ALIGNLEFT') }>
										<Icon type="16/editor/align-left" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('ALIGNCENTER')
										})}
										onClick={ this.handleButtonClick.bind(this, 'ALIGNCENTER') }>
										<Icon type="16/editor/align-center" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('ALIGNCENTER')
										})}
										onClick={ this.handleButtonClick.bind(this, 'ALIGNRIGHT') }>
										<Icon type="16/editor/align-right" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('BULLIST')
										})}
										onClick={ this.handleButtonClick.bind(this, 'BULLIST') }>
										<Icon type="16/editor/bullet-list" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('NUMLIST')
										})}
										onClick={ this.handleButtonClick.bind(this, 'NUMLIST') }>
										<Icon type="16/editor/numbered-list" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('INDENT')
										})}
										onClick={ this.handleButtonClick.bind(this, 'INDENT') }>
										<Icon type="16/editor/indent" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('OUTDENT')
										})}
										onClick={ this.handleButtonClick.bind(this, 'OUTDENT') }>
										<Icon type="16/editor/indent" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('SEARCHREPLACE')
										})}
										onClick={ this.handleButtonClick.bind(this, 'SEARCHREPLACE') }>
										<Icon type="16/magnifier" width="16" height="16" />
									</Button>
								</ToolGroup>
							</div>
						</Toolbar>
					</React.Fragment>
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
