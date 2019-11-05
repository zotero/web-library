import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import Button from '../ui/button';
import Editable from '../editable';
import Icon from '../ui/icon';
import withDevice from '../../enhancers/with-device';
import withEditMode from '../../enhancers/with-edit-mode';
import { deduplicateByKey, sortByKey } from '../../utils';
import { fetchTagSuggestions } from '../../actions';
import { pick } from '../../common/immutable';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { pluralize } from '../../common/format';

var nextId = 0;

const Tags = props => {
	const { device, tagColors, itemKey, tags: initalTags, isActive, isReadOnly, updateItem } = props;
	const [tags, setTags] = useState(initalTags.map(t => ({ ...t, id: ++nextId })));
	const [tagRedacted, setTagRedacted] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const dispatch = useDispatch();
	const requestId = useRef(1);


	const handleCommit = async (newTagValue, hasChanged, ev) => {
		const tag = (ev.currentTarget || ev.target).closest('[data-tag]').dataset.tag;
		setTagRedacted(null);
		setSuggestions([]);
		requestId.current += 1;

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
		setSuggestions([]);
		requestId.current += 1;
		setTags(tags.filter(t => t.tag !== ''));
	}

	const handleEdit = ev => {
		if(isReadOnly) {
			return false;
		}
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

	const handleChange = async newValue => {
		requestId.current += 1;
		const currentRequest = requestId.current;
		if(newValue.length > 0) {
			const rawSuggestions = await dispatch(fetchTagSuggestions(newValue));
			if(currentRequest !== requestId.current) {
				// These suggestions are now outdated as the input has been changed, commited or cancelled, discard...
				return;
			}
			const processedSuggestions = [...(new Set(rawSuggestions.map(s => s.tag)))];
			const filteredSuggestions = processedSuggestions.filter(s => !tags.some(t => t.tag === s));
			setSuggestions(filteredSuggestions);
		} else {
			setSuggestions([]);
		}
	}

	return (
		<TabPane
			className="tags"
			isActive={ isActive }
		>
			<h5 className="h2 tab-pane-heading hidden-mouse">Tags</h5>
			<div className="scroll-container-mouse">
				{ !device.isTouchOrSmall && (
					<Toolbar>
						<div className="toolbar-left">
							<div className="counter">
								{ `${tags.length} ${pluralize('tag', tags.length)}` }
							</div>
							<ToolGroup>
								<Button
									disabled={ isReadOnly || tagRedacted !== null }
									className="btn-default"
									onClick={ handleAddTag }
								>
										Add Tag
								</Button>
							</ToolGroup>
						</div>
					</Toolbar>
				) }
				<nav>
					<ul className="details-list tag-list">
						{
							tags.map(tag => {
								return (
									<li
										className="tag"
										data-key={ tag.id }
										data-tag={ tag.tag }
										key={ tag.id }
									>
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
											onCancel={ handleCancel }
											onChange={ handleChange }
											onClick={ handleEdit }
											onCommit={ handleCommit }
											onFocus={ handleEdit }
											selectOnFocus
											suggestions={ suggestions }
											value={ tag.tag }
										/>
										{ !(tag.tag === tagRedacted && tagRedacted === '') && !isReadOnly && (
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
				{ device.isTouchOrSmall && !isReadOnly && (
					<Button
						onClick={ handleAddTag }
						className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
					>
						<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
						Add Tag
					</Button>
				)}
			</div>
		</TabPane>
	)
}

Tags.propTypes = {
	device: PropTypes.object,
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	itemKey: PropTypes.string,
	tagColors: PropTypes.object,
	tags: PropTypes.array,
	updateItem: PropTypes.func.isRequired,
}

export default withDevice(withEditMode(Tags));
