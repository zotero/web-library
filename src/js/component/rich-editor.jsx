/* eslint-disable react/no-deprecated */
'use strict';

import { Editor } from '@tinymce/tinymce-react';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import Button from './ui/button';
import Icon from './ui/icon';
import { Toolbar, ToolGroup } from './ui/toolbars';
import ColorPicker from './ui/color-picker';
import Spinner from './ui/spinner';
import { loadJs } from '../utils';

const formatBlocks = [
	{ value: 'p', Tag: 'p', label: 'Paragraph' },
	{ value: 'h1', Tag: 'p', label: 'Heading 1' },
	{ value: 'h2', Tag: 'p', label: 'Heading 2' },
	{ value: 'h3', Tag: 'p', label: 'Heading 3' },
	{ value: 'h4', Tag: 'p', label: 'Heading 4' },
	{ value: 'h5', Tag: 'p', label: 'Heading 5' },
	{ value: 'h6', Tag: 'p', label: 'Heading 6' },
	{ value: 'pre', Tag: 'pre', label: 'Preformatted' },
];

const dropdowns = {
	forecolor: false,
	hilitecolor: false,
	formatblock: false,
};

class RichEditor extends React.PureComponent {
	state = {
		hilitecolor: null,
		content: this.props.value,
		forecolor: null,
		dropdowns,
	};

	handleEditorInit = (ev, editor) => {
		this.editor = editor;
	}

	async componentDidMount() {
		if(!window.tinymce) {
			await loadJs('/static/other/tinymce/tinymce.min.js');
			this.forceUpdate();
		}
	}

	handleEditorChange = newContent => {
		const { onChange } = this.props;
		const { content } = this.state;

		// force re-render so that formatting buttons are correctly highlighted
		this.forceUpdate();

		if(newContent === content) {
			return;
		}
		this.setState({ content: newContent });

		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			onChange(newContent);
		}, 500);
	}

	handleButtonClick = ev => {
		if(!this.editor) { return; }
		const { command, value } = ev.currentTarget.dataset;

		if(command === 'forecolor' || command === 'hilitecolor') {
			this.setColor(command, this.state[command]);
		} else {
			this.editor.editorCommands.execCommand(command, undefined, value);
		}
	}

	handleFocus = () => {
		this.setState({ dropdowns });
	}

	handleForeColorPicked = color => {
		this.setState({ forecolor: color });
		this.setColor('forecolor', color);
	}

	handleHiLiteColorPicked = color => {
		this.setState({ hilitecolor: color });
		this.setColor('hilitecolor', color);
	}

	handleDropdownToggle = ev => {
		const dropdown = 'closest' in ev.currentTarget && ev.currentTarget.closest('[data-dropdown]');
		if(dropdown) {
			const dropdownName = ev.currentTarget.closest('[data-dropdown]').dataset.dropdown;
			this.setState({ dropdowns: {
				...dropdowns,
				[dropdownName]: !this.state.dropdowns[dropdownName]
			}});
		} else {
			this.setState({ dropdowns });
		}
	}

	handleDropdownKeyDown = ev => {
		if(ev.key === 'Escape') {
			this.setState({ dropdowns });
			ev.stopPropagation();
		}
	}

	setColor = (which, color) => {
		if(!color) {
			this.editor.editorCommands.execCommand('mceRemoveTextcolor', which);
		} else {
			this.editor.editorCommands.execCommand(which, undefined, color);
		}

	}

	isEditorCommandState(command) {
		return this.editor && this.editor.editorCommands.queryCommandState(command);
	}

	queryFormatBlock() {
		const formatBlock = this.editor && this.editor.editorCommands.queryCommandValue('formatblock') || 'p';
		return formatBlocks.find(fb => fb.value === formatBlock).label;
	}

	refreshEditor = () => this.forceUpdate();

	renderEditor() {
		if(process.env.NODE_ENV !== 'test') {
			return (
				<Editor
					disabled={ this.props.isReadOnly }
					value={ this.state.content }
					init={{
						height: '100%',
						base_url: '/static/other/tinymce',
						plugins: 'link searchreplace',
						branding: false,
						toolbar: false,
						menubar: false,
						statusbar: false,
						theme: 'silver',
						mobile: { theme: 'silver' }
					}}
					onClick={ this.refreshEditor }
					onEditorChange={ this.handleEditorChange }
					onFocus={ this.handleFocus }
					onInit={ this.handleEditorInit }
				/>
			);
		} else return null;
	}

	render() {
		const { isReadOnly } = this.props;
		if(!window.tinymce) {
			return <Spinner />;
		}
		return (
			<div className="rich-editor">
				{ !isReadOnly && (
					<React.Fragment>
						<Toolbar className="dense">
							<div className="toolbar-left">
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('bold')
										})}
										title="Bold"
										data-command="bold"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/b" className="touch" width="24" height="24" />
										<Icon type="16/editor/b" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('italic')
										})}
										title="Italic"
										data-command="italic"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/i" className="touch" width="24" height="24" />
										<Icon type="16/editor/i" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('underline')
										})}
										title="Underline"
										data-command="underline"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/u" className="touch" width="24" height="24" />
										<Icon type="16/editor/u" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('strikethrough')
										})}
										title="strikethrough"
										data-command="strikethrough"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/s" className="touch" width="24" height="24" />
										<Icon type="16/editor/s" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('subscript')
										})}
										title="Subscript"
										data-command="subscript"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/sub" className="touch" width="24" height="24" />
										<Icon type="16/editor/sub" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('superscript')
										})}
										title="Superscript"
										data-command="superscript"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/sup" className="touch" width="24" height="24" />
										<Icon type="16/editor/sup" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Dropdown
										isOpen={ this.state.dropdowns['forecolor'] }
										toggle={ this.handleDropdownToggle }
										data-dropdown="forecolor"
										className="dropdown-wrapper btn-group"
									>
										<Button
											icon
											data-command="forecolor"
											onClick={ this.handleButtonClick }
										>
											<Icon type="24/editor/fore-color" className="touch" width="24" height="24" />
											<Icon type="16/editor/fore-color" className="mouse" width="16" height="16" />
											<Icon
												type="24/editor/color-swatch"
												className="touch"
												color={ this.state.forecolor }
												width="24"
												height="24"
											/>
											<Icon
												type="16/editor/color-swatch"
												className="mouse"
												color={ this.state.forecolor }
												width="16"
												height="16"
											/>
										</Button>
										<DropdownToggle
											color={ null }
											onKeyDown={ this.handleDropdownKeyDown }
											className="btn-icon dropdown-toggle"
										>
											<Icon type="16/chevron-9" className="touch" width="16" height="16" />
											<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
										</DropdownToggle>
										<ColorPicker onColorPicked={ this.handleForeColorPicked } />
									</Dropdown>
									<Dropdown
										isOpen={ this.state.dropdowns['hilitecolor'] }
										toggle={ this.handleDropdownToggle }
										data-dropdown="hilitecolor"
										className="dropdown-wrapper btn-group"
									>
										<Button
											icon
											data-command="hilitecolor"
											onClick={ this.handleButtonClick }
										>
											<Icon type="24/editor/hilite-color" className="touch" width="24" height="24" />
											<Icon type="16/editor/hilite-color" className="mouse" width="16" height="16" />
											<Icon
												type="24/editor/color-swatch"
												className="touch"
												color={ this.state.hilitecolor }
												width="24"
												height="24"
											/>
											<Icon
												type="16/editor/color-swatch"
												className="mouse"
												color={ this.state.hilitecolor }
												width="16"
												height="16"
											/>
										</Button>
										<DropdownToggle
											color={ null }
											onKeyDown={ this.handleDropdownKeyDown }
											className="btn-icon dropdown-toggle"
										>
											<Icon type="16/chevron-9" className="touch" width="16" height="16" />
											<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
										</DropdownToggle>
										<ColorPicker onColorPicked={ this.handleHiLiteColorPicked } />
									</Dropdown>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										title="Clear formatting"
										data-command="removeformat"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/remove-format" className="touch" width="24" height="24" />
										<Icon type="16/editor/remove-format" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('mceblockquote')
										})}
										title="Blockquote"
										data-command="mceblockquote"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/blockquote" className="touch" width="24" height="24" />
										<Icon type="16/editor/blockquote" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										title="Insert/edit link"
										data-command="mceLink"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/link" className="touch" width="24" height="24" />
										<Icon type="16/editor/link" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<DropdownToggle
										color={ null }
										className="btn-icon dropdown-toggle"
									>
										<Icon type="24/options" width="24" height="24" />
									</DropdownToggle>
								</ToolGroup>
							</div>
						</Toolbar>
						<Toolbar className="dense">
							<div className="toolbar-left">
								<ToolGroup>
								<Dropdown
									isOpen={ this.state.dropdowns['formatblock'] }
									toggle={ this.handleDropdownToggle }
									data-dropdown="formatblock"
									className="dropdown-wrapper"
								>
										<DropdownToggle
											color={ null }
											onKeyDown={ this.handleDropdownKeyDown }
											className="dropdown-toggle btn-icon format-block"
										>
											{ this.queryFormatBlock() }
											<Icon type="16/chevron-9" className="touch" width="16" height="16" />
											<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
										</DropdownToggle>
										<DropdownMenu>
											{
												formatBlocks.map(({ value, label, Tag }) => (
													<DropdownItem
														onClick={ this.handleButtonClick }
														data-command="formatblock"
														data-value={ value }
														key={ value }
													>
														<Tag>{ label }</Tag>
													</DropdownItem>
												))
											}
										</DropdownMenu>
								</Dropdown>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('justifyleft')
										})}
										title="Align left"
										data-command="justifyleft"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/align-left" className="touch" width="24" height="24" />
										<Icon type="16/editor/align-left" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('justifycenter')
										})}
										title="Align center"
										data-command="justifycenter"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/align-center" className="touch" width="24" height="24" />
										<Icon type="16/editor/align-center" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('justifyright')
										})}
										title="Align right"
										data-command="justifyright"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/align-right" className="touch" width="24" height="24" />
										<Icon type="16/editor/align-right" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('insertunorderedlist')
										})}
										title="Bullet list"
										data-command="insertunorderedlist"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/bullet-list" className="touch" width="24" height="24" />
										<Icon type="16/editor/bullet-list" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('insertorderedlist')
										})}
										title="Numbered list"
										data-command="insertorderedlist"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/numbered-list" className="touch" width="24" height="24" />
										<Icon type="16/editor/numbered-list" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										title="Decrease indent"
										data-command="outdent"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/outdent" className="touch" width="24" height="24" />
										<Icon type="16/editor/outdent" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										title="Increase indent"
										data-command="indent"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/indent" className="touch" width="24" height="24" />
										<Icon type="16/editor/indent" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										title="Find and replace"
										data-command="searchreplace"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/magnifier" className="touch" width="24" height="24" />
										<Icon type="16/magnifier" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<DropdownToggle
										color={ null }
										className="btn-icon dropdown-toggle"
									>
										<Icon type="24/options" width="24" height="24" />
									</DropdownToggle>
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
