import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from './ui/button';
import Editable from './editable';
import Icon from './ui/icon';
import { Toolbar, ToolGroup } from './ui/toolbars';
import { deduplicateByKey, sortByKey } from '../utils';
import { pick } from '../common/immutable';
import { TabPane } from './ui/tabs';

var nextId = 0;

const Tags = ({ tagColors, itemKey, tags: initalTags, isActive, isReadOnly, updateItem }) => {
	const [tags, setTags] = useState(initalTags.map(t => ({ ...t, id: ++nextId })));
	const [tagRedacted, setTagRedacted] = useState(null);

	const handleCommit = async (newTagValue, hasChanged, ev) => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		setTagRedacted(null);

		if(!hasChanged) {
			setTags(tags.filter(t => t.tag !== ''));
			return;
		}

		const updatedTags = deduplicateByKey(
			newTagValue === '' ?
				tags.filter(t => t.tag !== tag) :
				tags.map(t => t.tag === tag ? { tag: newTagValue, id: ++nextId } : t),
			'tag'
		);

		sortByKey(updatedTags, 'tag');
		updateItem(itemKey, { tags: updatedTags.map(t => pick(t, ['tag'])) });

		if(tag === '') {
			// if adding a new tag, automatically create input for another one
			updatedTags.push({ tag: '', id: ++nextId });
			setTagRedacted('');
		}

		setTags(updatedTags);
	}

	const handleCancel = () => {
		setTagRedacted(null);
		setTags(tags.filter(t => t.tag !== ''));
	}

	const handleEdit = ev => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		setTagRedacted(tag);
	}

	const handleDelete = ev => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		const updatedTags = tags.filter(t => t.tag !== tag);
		setTags(updatedTags);
		updateItem(itemKey, { tags: updatedTags.map(t => pick(t, ['tag'])) });
	}

	const handleAddTag = () => {
		setTags([...tags.filter(t => t.tag !== ''), { tag: '', id: ++nextId }]);
		setTagRedacted('');
	}

	return (
		<TabPane
			className="tags"
			isActive={ isActive }
		>
			<div className="scroll-container-mouse">
				<h5 className="h2 tab-pane-heading hidden-mouse">Tags</h5>
				<nav>
					<ul className="details-list tag-list">
						{
							tags.map(tag => {
								return (
									<li className="tag" data-tag={ tag.tag } data-key={ tag.id } key={ tag.id } >
										<Icon
											color={ tag.tag in tagColors ? tagColors[tag.tag] : null }
											height="12"
											symbol={ tag.tag in tagColors ? 'circle' : 'circle-empty' }
											type="12/circle"
											width="12"
										/>
										<Editable
											autoFocus
											isActive={ tag.tag === tagRedacted }
											value={ tag.tag }
											onCommit={ handleCommit }
											onCancel={ handleCancel }
											onClick={ handleEdit }
											onFocus={ handleEdit }
										/>
										{ !isReadOnly && (
											<Button
												icon
												onClick={ handleDelete }
											>
												<Icon type="16/minus-circle" width="16" height="16" />
											</Button>
										)}
									</li>
								);
							})
						}
					</ul>
				</nav>
				{ !isReadOnly && (
					<Toolbar>
						<div className="toolbar-left">
							<ToolGroup>
								<Button
									disabled={ tagRedacted !== null }
									className="btn-link icon-left"
									onClick={ handleAddTag }
								>
									<span className="flex-row align-items-center">
										<Icon type={ '16/plus' } width="16" height="16" />
										Add Tag
									</span>
								</Button>
							</ToolGroup>
						</div>
					</Toolbar>
				)}
			</div>
		</TabPane>
	)
}

Tags.propTypes = {
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	itemKey: PropTypes.string,
	tagColors: PropTypes.object,
	tags: PropTypes.array,
	updateItem: PropTypes.func.isRequired,
}

export default Tags;
