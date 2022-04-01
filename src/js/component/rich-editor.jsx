'use strict';

import { Editor } from '@tinymce/tinymce-react';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { default as Dropdown } from 'reactstrap/lib/Dropdown';
import { default as DropdownToggle } from 'reactstrap/lib/DropdownToggle';
import { default as DropdownMenu } from 'reactstrap/lib/DropdownMenu';
import { default as DropdownItem } from 'reactstrap/lib/DropdownItem';

import Button from './ui/button';
import Icon from './ui/icon';
import { Toolbar, ToolGroup } from './ui/toolbars';
import ColorPicker from './ui/color-picker';
import Spinner from './ui/spinner';
import { sourceFile } from '../actions';
import { useFocusManager, useForceUpdate } from '../hooks';
import { noop } from '../utils';

const formatBlocks = [
	{ value: 'p', Tag: 'p', label: 'Paragraph' },
	{ value: 'h1', Tag: 'h1', label: 'Heading 1' },
	{ value: 'h2', Tag: 'h2', label: 'Heading 2' },
	{ value: 'h3', Tag: 'h3', label: 'Heading 3' },
	{ value: 'h4', Tag: 'h4', label: 'Heading 4' },
	{ value: 'h5', Tag: 'h5', label: 'Heading 5' },
	{ value: 'h6', Tag: 'h6', label: 'Heading 6' },
	{ value: 'pre', Tag: 'pre', label: 'Preformatted' },
];

const defaultDropdowns = {
	forecolor: false,
	hilitecolor: false,
	formatblock: false,
};

const validElements = '@[id|class|style|title|dir<ltr?rtl|lang|xml::lang],'
	+ 'a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class],'
	+ 'strong/b,'
	+ 'em/i,'
	+ 'strike,'
	+ 'u,'
	+ '#p,'
	+ '-ol[type|compact],'
	+ '-ul[type|compact],'
	+ '-li,'
	+ 'br,'
	+ 'img[longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],'
	+ '-sub,-sup,'
	+ '-blockquote[cite],'
	+ '-table[border=0|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],'
	+ '-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],'
	+ 'tbody,thead,tfoot,'
	+ '#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],'
	+ '#th[colspan|rowspan|width|height|align|valign|scope],'
	+ 'caption,'
	+ '-div,'
	+ '-span,'
	+ '-code,'
	+ '-pre,'
	+ 'address,'
	+ '-h1,-h2,-h3,-h4,-h5,-h6,'
	+ 'hr[size|noshade],'
	+ '-font[face|size|color],'
	+ 'dd,dl,dt,'
	+ 'cite,'
	+ 'abbr,'
	+ 'acronym,'
	+ 'del[datetime|cite],ins[datetime|cite],'
	+ 'bdo,'
	+ 'col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|valign|width],'
	+ 'dfn,'
	+ 'kbd,'
	+ 'label[for],'
	+ 'legend,'
	+ 'q[cite],'
	+ 'samp,'
	+ 'var,';

const invalidElements = 'iframe';

const colors = [
"#111111", "#993300", "#333300", "#003300", "#003366", "#000080", "#333399", "#333333",
"#800000", "#ff6600", "#808000", "#008000", "#008080", "#0000ff", "#666699", "#808080",
"#ff0000", "#ff9900", "#99cc00", "#339966", "#33cccc", "#3366ff", "#800080", "#999999",
"#ff00ff", "#ffcc00", "#ffff00", "#00ff00", "#00ffff", "#00ccff", "#993366", "#ffffff",
"#ff99cc", "#ffcc99", "#ffff99", "#ccffcc", "#ccffff", "#99ccff", "#cc99ff", null];

const setColor = (editorRef, which, color) => {
	if(!color) {
		editorRef.editorCommands.execCommand('mceRemoveTextcolor', which);
	} else {
		editorRef.editorCommands.execCommand(which, undefined, color);
	}
}

const isEditorCommandState = (editorRef, command) => {
	return editorRef && editorRef.editorCommands.queryCommandState(command);
}

const queryFormatBlock = (editorRef) => {
	const formatBlock = editorRef && editorRef.editorCommands.queryCommandValue('formatblock') || 'p';
	return [formatBlock, (formatBlocks.find(fb => fb.value === formatBlock) || {}).label];
}

const RichEditor = React.memo(React.forwardRef((props, ref) => {
	const { autoresize, id, isReadOnly, onChange, onEdit = noop, value } = props;
	const [hilitecolor, setHilitecolor] = useState(null);
	const [content, setContent] = useState(value);
	const [forecolor, setForecolor] = useState(null);
	const [dropdowns, setDropdowns] = useState(defaultDropdowns);
	const editor = useRef(null);
	const wantsFocus = useRef(false);
	const timer = useRef(null);
	const toolbarRef = useRef(null);
	const dispatch = useDispatch();
	const forceUpdate = useForceUpdate();
	const tinymceRoot = useSelector(state => state.config.tinymceRoot);
	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const isTinymceFetched = useSelector(state => state.sources.fetched.includes('tinymce'));
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [currentFormatBlock, currentFormatBlockLabel] = queryFormatBlock(editor.current);
	const { receiveFocus, receiveBlur, focusNext, focusPrev, focusDrillDownPrev,
	focusDrillDownNext } = useFocusManager(toolbarRef);

	useImperativeHandle(ref, () => ({
		focus: () => {
			if(editor.current) {
				editor.current.focus();
			} else {
				wantsFocus.current = true;
			}
		}
	}));

	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			dispatch(sourceFile('tinymce'));
		}
	}, []);

	useEffect(() => {
		// only reset content on "id" change, (not on "value" change which we actually use)
		// normally we would key RichEditor with the value of id but this triggers TinyMCE
		// to reinitialize which is costly. Thus instead we take id property and update
		// content only when id changes. This allows us to re-use RichEditor but avoid
		// updating content mid-edit (See #333)
		setContent(value);
	}, [id]);

	const handleEditorInit = useCallback((ev, editorRef) => {
		editor.current = editorRef;
		if(wantsFocus.current) {
			editorRef.focus();
			wantsFocus.current = false;
		}
	});

	const handleEditorChange = useCallback(newContent => {
		if(newContent === content) {
			return;
		}

		if(isReadOnly) {
			return;
		}

		setContent(newContent);
		onEdit(newContent, id);

		clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			onChange(newContent, id);
		}, 500);
	}, [content, isReadOnly, id, onChange, onEdit]);

	const handleButtonClick = useCallback(ev => {
		if(!editor.current) { return; }
		const { command, value } = ev.currentTarget.dataset;

		if(command === 'forecolor') {
			setColor(editor.current, command, forecolor);
		} else if(command === 'hilitecolor') {
			setColor(editor.current, command, hilitecolor);
		} else {
			editor.current.editorCommands.execCommand(command, undefined, value);
		}
	});

	const handleEditorFocus = useCallback(() => {
		setDropdowns(defaultDropdowns);
	});

	const handleForeColorPicked = useCallback(color => {
		setForecolor(color);
		setColor(editor.current, 'forecolor', color);
	});

	const handleHiLiteColorPicked = useCallback(color => {
		setHilitecolor(color);
		setColor(editor.current, 'hilitecolor', color);
	});

	const handleDropdownToggle = useCallback(ev => {
		const dropdown = 'closest' in ev.currentTarget && ev.currentTarget.closest('[data-dropdown]');
		if(dropdown) {
			const dropdownName = ev.currentTarget.closest('[data-dropdown]').dataset.dropdown;
			setDropdowns({
				...defaultDropdowns,
				[dropdownName]: !dropdowns[dropdownName]
			});
		} else {
			setDropdowns(defaultDropdowns);
		}
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Meta' && editor.current) {
			editor.current.iframeElement.contentDocument.body.classList.add('meta-key');
		}
	});

	const handleKeyUp = useCallback(ev => {
		if(ev.key === 'Meta' && editor.current) {
			editor.current.iframeElement.contentDocument.body.classList.remove('meta-key');
		}
	});

	const handleToolbarButtonKeyDown = ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			focusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			focusPrev(ev);
		} else if(ev.key === 'Escape') {
			setDropdowns(defaultDropdowns);
			ev.stopPropagation();
		}
	}

	if(!isTinymceFetched) {
		return <Spinner />;
	}

	return (
		<div className="rich-editor">
			{ isSingleColumn || !isReadOnly && (
				<div
					className="toolbar-container"
					onBlur={ receiveBlur }
					onFocus={ receiveFocus }
					ref={ toolbarRef }
					tabIndex={ 0 }
				>
					<Toolbar className="dense">
						<div className="toolbar-left">
							<ToolGroup>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'bold')
									})}
									title="Bold"
									data-command="bold"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/b" className="touch" width="24" height="24" />
									<Icon type="16/editor/b" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'italic')
									})}
									title="Italic"
									data-command="italic"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/i" className="touch" width="24" height="24" />
									<Icon type="16/editor/i" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'underline')
									})}
									title="Underline"
									data-command="underline"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/u" className="touch" width="24" height="24" />
									<Icon type="16/editor/u" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'strikethrough')
									})}
									title="strikethrough"
									data-command="strikethrough"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/s" className="touch" width="24" height="24" />
									<Icon type="16/editor/s" className="mouse" width="16" height="16" />
								</Button>
							</ToolGroup>
							<ToolGroup>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'subscript')
									})}
									title="Subscript"
									data-command="subscript"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/sub" className="touch" width="24" height="24" />
									<Icon type="16/editor/sub" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'superscript')
									})}
									title="Superscript"
									data-command="superscript"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/sup" className="touch" width="24" height="24" />
									<Icon type="16/editor/sup" className="mouse" width="16" height="16" />
								</Button>
							</ToolGroup>
							<ToolGroup>
								<Dropdown
									isOpen={ dropdowns['forecolor'] }
									toggle={ handleDropdownToggle }
									data-dropdown="forecolor"
									className="btn-group"
								>
									<Button
										icon
										data-command="forecolor"
										onClick={ handleButtonClick }
										onKeyDown={ handleToolbarButtonKeyDown }
										tabIndex={ -2 }
									>
										<Icon type="24/editor/fore-color" className="touch" width="24" height="24" />
										<Icon type="16/editor/fore-color" className="mouse" width="16" height="16" />
										<Icon
											type="24/editor/color-swatch"
											className="touch"
											color={ forecolor }
											width="24"
											height="24"
										/>
										<Icon
											type="16/editor/color-swatch"
											className="mouse"
											color={ forecolor }
											width="16"
											height="16"
										/>
									</Button>
									<DropdownToggle
										color={ null }
										className="btn-icon dropdown-toggle"
										onKeyDown={ handleToolbarButtonKeyDown }
										tabIndex={ -2 }
									>
										<Icon type="16/chevron-9" className="touch" width="16" height="16" />
										<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
									</DropdownToggle>
									<ColorPicker
										colors={ colors }
										gridCols={ 8 }
										onColorPicked={ handleForeColorPicked }
										onDrillDownNext={ focusDrillDownNext }
										onDrillDownPrev={ focusDrillDownPrev }
									/>
								</Dropdown>
								<Dropdown
									isOpen={ dropdowns['hilitecolor'] }
									toggle={ handleDropdownToggle }
									data-dropdown="hilitecolor"
									className="btn-group"
								>
									<Button
										icon
										data-command="hilitecolor"
										onClick={ handleButtonClick }
										onKeyDown={ handleToolbarButtonKeyDown }
										tabIndex={ -2 }
									>
										<Icon type="24/editor/hilite-color" className="touch" width="24" height="24" />
										<Icon type="16/editor/hilite-color" className="mouse" width="16" height="16" />
										<Icon
											type="24/editor/color-swatch"
											className="touch"
											color={ hilitecolor }
											width="24"
											height="24"
										/>
										<Icon
											type="16/editor/color-swatch"
											className="mouse"
											color={ hilitecolor }
											width="16"
											height="16"
										/>
									</Button>
									<DropdownToggle
										color={ null }
										className="btn-icon dropdown-toggle"
										onKeyDown={ handleToolbarButtonKeyDown }
										tabIndex={ -2 }
									>
										<Icon type="16/chevron-9" className="touch" width="16" height="16" />
										<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
									</DropdownToggle>
									<ColorPicker
										colors={ colors }
										gridCols={ 8 }
										onColorPicked={ handleHiLiteColorPicked }
										onDrillDownNext={ focusDrillDownNext }
										onDrillDownPrev={ focusDrillDownPrev }
									/>
								</Dropdown>
							</ToolGroup>
							<ToolGroup>
								<Button
									icon
									title="Clear formatting"
									data-command="removeformat"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/remove-format" className="touch" width="24" height="24" />
									<Icon type="16/editor/remove-format" className="mouse" width="16" height="16" />
								</Button>
							</ToolGroup>
							<ToolGroup>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'mceblockquote')
									})}
									title="Blockquote"
									data-command="mceblockquote"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/blockquote" className="touch" width="24" height="24" />
									<Icon type="16/editor/blockquote" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									title="Insert/edit link"
									data-command="mceLink"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/link" className="touch" width="24" height="24" />
									<Icon type="16/editor/link" className="mouse" width="16" height="16" />
								</Button>
							</ToolGroup>
							<ToolGroup>
								<Dropdown
									isOpen={ dropdowns['overflow-1'] }
									toggle={ handleDropdownToggle }
									data-dropdown="overflow-1"
								>
									<DropdownToggle
										color={ null }
										className="btn-icon dropdown-toggle"
										onKeyDown={ handleToolbarButtonKeyDown }
										tabIndex={ -2 }
									>
										<Icon type="24/options" width="24" height="24" />
									</DropdownToggle>
									<DropdownMenu right>
										<DropdownItem
											tag={ Button }
											title="Subscript"
											data-command="subscript"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/sub" className="touch" width="24" height="24" />
											Subscript
										</DropdownItem>
										<DropdownItem
											tag={ Button }
											title="Superscript"
											data-command="superscript"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/sup" className="touch" width="24" height="24" />
											Superscript
										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem
											tag={ Button }
											className="remove-format"
											title="Clear formatting"
											data-command="removeformat"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/remove-format" className="touch" width="24" height="24" />
											Clear Formatting
										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem
											tag={ Button }
											className="blockquote"
											title="Blockquote"
											data-command="mceblockquote"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/blockquote" className="touch" width="24" height="24" />
											Blockquote
										</DropdownItem>
										<DropdownItem
											tag={ Button }
											className="link"
											title="Insert/edit link"
											data-command="mceLink"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/link" className="touch" width="24" height="24" />
											Insert&#8202;/&#8202;Edit Link
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</ToolGroup>
						</div>
					</Toolbar>
					<Toolbar className="dense">
						<div className="toolbar-left">
							<ToolGroup>
							<Dropdown
								isOpen={ dropdowns['formatblock'] }
								toggle={ handleDropdownToggle }
								data-dropdown="formatblock"
							>
									<DropdownToggle
										color={ null }
										className="dropdown-toggle btn-icon format-block"
										onKeyDown={ handleToolbarButtonKeyDown }
										tabIndex={ -2 }
									>
										{ currentFormatBlockLabel }
										<Icon type="16/chevron-9" className="touch" width="16" height="16" />
										<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
									</DropdownToggle>
									<DropdownMenu>
										{
											formatBlocks.map(({ value, label, Tag }) => (
												<DropdownItem
													onClick={ handleButtonClick }
													data-command="formatblock"
													data-value={ value }
													key={ value }
													className={ cx({ selected: value === currentFormatBlock })}
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
										active: isEditorCommandState(editor.current, 'justifyleft')
									})}
									title="Align left"
									data-command="justifyleft"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/align-left" className="touch" width="24" height="24" />
									<Icon type="16/editor/align-left" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'justifycenter')
									})}
									title="Align center"
									data-command="justifycenter"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/align-center" className="touch" width="24" height="24" />
									<Icon type="16/editor/align-center" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'justifyright')
									})}
									title="Align right"
									data-command="justifyright"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/align-right" className="touch" width="24" height="24" />
									<Icon type="16/editor/align-right" className="mouse" width="16" height="16" />
								</Button>
							</ToolGroup>
							<ToolGroup>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'insertunorderedlist')
									})}
									title="Bullet list"
									data-command="insertunorderedlist"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/bullet-list" className="touch" width="24" height="24" />
									<Icon type="16/editor/bullet-list" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									className={ cx({
										active: isEditorCommandState(editor.current, 'insertorderedlist')
									})}
									title="Numbered list"
									data-command="insertorderedlist"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/numbered-list" className="touch" width="24" height="24" />
									<Icon type="16/editor/numbered-list" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									title="Decrease indent"
									data-command="outdent"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/outdent" className="touch" width="24" height="24" />
									<Icon type="16/editor/outdent" className="mouse" width="16" height="16" />
								</Button>
								<Button
									icon
									title="Increase indent"
									data-command="indent"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/indent" className="touch" width="24" height="24" />
									<Icon type="16/editor/indent" className="mouse" width="16" height="16" />
								</Button>
							</ToolGroup>
							<ToolGroup>
								<Button
									icon
									title="Find and replace"
									data-command="searchreplace"
									onClick={ handleButtonClick }
									onKeyDown={ handleToolbarButtonKeyDown }
									tabIndex={ -2 }>
									<Icon type="24/editor/magnifier" className="touch" width="24" height="24" />
									<Icon type="16/magnifier" className="mouse" width="16" height="16" />
								</Button>
							</ToolGroup>
							<ToolGroup>
								<Dropdown
									isOpen={ dropdowns['overflow-2'] }
									toggle={ handleDropdownToggle}
									data-dropdown="overflow-2"
								>
									<DropdownToggle
										color={ null }
										className="btn-icon dropdown-toggle"
										onKeyDown={ handleToolbarButtonKeyDown }
										tabIndex={ -2 }
									>
									<Icon type="24/options" width="24" height="24" />
									</DropdownToggle>
									<DropdownMenu right>
										<DropdownItem
											tag={ Button }
											className="bullet-list"
											title="Bullet list"
											data-command="insertunorderedlist"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/bullet-list" className="touch" width="24" height="24" />
											Bullet List
										</DropdownItem>
										<DropdownItem
											tag={ Button }
											className="numbered-list"
											title="Numbered list"
											data-command="insertorderedlist"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/numbered-list" className="touch" width="24" height="24" />
											Numbered List
										</DropdownItem>
										<DropdownItem
											tag={ Button }
											className="outdent"
											title="Decrease indent"
											data-command="outdent"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/outdent" className="touch" width="24" height="24" />
											Decrease Indent
										</DropdownItem>
										<DropdownItem
											tag={ Button }
											className="indent"
											title="Increase indent"
											data-command="indent"
											onClick={ handleButtonClick }
										>
											<Icon type="24/editor/indent" className="touch" width="24" height="24" />
											Increase Indent
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</ToolGroup>
						</div>
					</Toolbar>
				</div>
			)}
			<div className={ cx('editor-container', { autoresize }) } >
				{
					process.env.NODE_ENV === 'test' ? null : (
						<Editor
							disabled={ isReadOnly }
							value={ content }
							init={{
								base_url: tinymceRoot,
								body_class: cx({ 'touch': isTouchOrSmall }),
								branding: false,
								content_css: '/static/tinymce-content.css',
								height: autoresize ? 'auto' : '100%',
								autoresize_bottom_margin: 0,
								invalid_elements: invalidElements,
								link_context_toolbar: true,
								menubar: false,
								mobile: { theme: 'silver' },
								plugins: cx('link', 'searchreplace', { autoresize }),
								statusbar: false,
								theme: 'silver',
								toolbar: false,
								valid_elements: validElements,
							}}
							onEditorChange={ handleEditorChange }
							onFocus={ handleEditorFocus }
							onInit={ handleEditorInit }
							onKeyDown={ handleKeyDown }
							onKeyUp={ handleKeyUp }
							onSelectionChange={ forceUpdate }
						/>
					)
				}
			</div>
		</div>
	);
}));

RichEditor.propTypes = {
	autoresize: PropTypes.bool,
	id: PropTypes.string,
	isReadOnly: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string,
};

RichEditor.displayName = 'RichEditor';

export default RichEditor;
