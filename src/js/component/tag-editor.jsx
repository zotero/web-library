'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const { get } = require('../utils');

const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

class TagEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: null,
			virtual: null,
			editing: null,
			editingValue: ''
		};
	}

	componentWillReceiveProps(props) {
		const itemKey = get(props, 'item.key');
		if(itemKey && get(this.props, 'item.key') !== itemKey) {
			this.setState({
				selected: null,
				virtual: null,
				editing: null,
				editingValue: ''
			});
		}

		if(!props.tags.find(t => t.tag == this.state.selected)) {
			this.setState({
				selected: null,
				virtual: null,
				editing: null,
				editingValue: ''
			});
		}
	}

	handleAddTag() {
		this.setState({
			virtual: ''
		});
	}

	handlePersistAddTag(ev) {
		this.props.onAddTag(ev.target.value);
	}

	handleDelete(tag) {
		this.props.onDeleteTag(tag);
	}

	handleUpdate(tag, newTag) {
		this.props.onUpdateTag(tag, newTag);
	}

	handleEdit(tag) {
		this.setState({
			editing: tag,
			editingValue: tag
		});
	}

	handleChange(ev) {
		this.setState({
			editingValue: ev.target.value
		});
	}

	render() {
		return (
			<div className="tag-editor">
				<nav>
					<ul className="nav list">
						{
							this.props.tags.map(tag => {
								return (
									<li 
										className={ cx('item', {'selected': this.state.selected == tag.tag }) }
										key={ tag.tag } 
									>
										<Icon type={ '16/tag' } width="16" height="16" />
											{ this.state.editing == tag.tag ? (
												<input 
													value={ this.state.editingValue }
													onChange={ this.handleChange.bind(this) }
													onBlur={ ev => this.handleUpdate(tag.tag, ev.target.value) }
												/>
											) : (
												<span onClick={ () => this.handleEdit(tag.tag) }>
													{ tag.tag }
												</span>
											)}
										<Button className="btn-icon" onClick={ () => this.handleDelete(tag.tag) }>
											<Icon type={ '16/minus' } width="16" height="16" />
										</Button>
									</li>
								);
							})
						}
						{
							this.state.virtual !== null && (
								<li className="item virtual">
									<Icon type={ '16/tag' } width="16" height="16" />
									<input onBlur={ this.handlePersistAddTag.bind(this) } />
								</li>
							)
						}
					</ul>
				</nav>

				<Toolbar>
					<div className="toolbar-left">
						<ToolGroup>
							<Button onClick={ this.handleAddTag.bind(this) }>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
			</div>
		);
	}
}

TagEditor.propTypes = {
	onAddTag: PropTypes.func.isRequired,
	onDeleteTag: PropTypes.func.isRequired,
	onUpdateTag: PropTypes.func.isRequired,
	isProcessingTags: PropTypes.bool,
	tags: PropTypes.array,
};

TagEditor.defaultProps = {
	tags: []
};

module.exports = TagEditor;