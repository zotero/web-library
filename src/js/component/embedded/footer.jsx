import React, { useCallback, memo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import { toggleTouchTagSelector } from '../../actions';
import { pluralize } from '../../common/format';
import { makePath } from '../../common/navigation';
import { websiteUrl } from '../../constants/defaults';

const EmbeddedTagSelector = () => {
	const dispatch = useDispatch();
	const isOpen = useSelector(state => state.current.isTouchTagSelectorOpen);
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual);

	const handleClick = useCallback(() => {
		dispatch(toggleTouchTagSelector(!isOpen));
	}, [dispatch, isOpen]);

	return (
		<div className="embedded-tag-selector">
			<Button className="btn-icon" onClick={ handleClick }>
				<Icon
					className="touch"
					type="24/tag"
					symbol={ selectedTagNames.length === 0 ? 'tag' : 'tag-block' }
					width="24"
					height="24"
				/>
				<Icon
					className="mouse"
					type="16/tag"
					symbol={ selectedTagNames.length === 0 ? 'tag' : 'tag-block' }
					width="16"
					height="16"
				/>
			</Button>
			<div className="tag-summary">
				{ selectedTagNames.length != 0 &&
					`${selectedTagNames.length} ${pluralize('Tag', selectedTagNames.length)} Selected`
				}
			</div>
		</div>
	);
}

const EmbeddedSeeOnZotero = () => {
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const view = useSelector(state => state.current.view);
	const qmode = useSelector(state => state.current.qmode);
	const search = useSelector(state => state.current.search);
	const tags = useSelector(state => state.current.tags);
	const noteKey = useSelector(state => state.current.noteKey);
	const config = useSelector(state => state.config);
	const path = makePath(config, {
		library: libraryKey,
		collection: collectionKey,
		items: itemKey ? [itemKey] : null,
		attachmentKey: attachmentKey,
		view: view,
		qmode: qmode,
		search: search,
		tags: tags,
		noteKey: noteKey,
	});
	const url = `${websiteUrl}${path.slice(1)}`;

	return (
		<div className="embedded-see-on-zotero">
			<a href={ url }>View on zotero.org</a>
		</div>
	)
}

const EmbeddedFooter = () => {
	const view = useSelector(state => state.current.view);

	return (
		<div className="embedded-footer">
		{ ['libraries', 'library', 'collection', 'item-list'].includes(view) && (
			<React.Fragment>
				<EmbeddedTagSelector />
			</React.Fragment>
		)}
			<EmbeddedSeeOnZotero />
		</div>
	);
}

export default memo(EmbeddedFooter);
