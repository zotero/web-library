import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, TabPane } from 'web-common/components';
import { useFocusManager } from 'web-common/hooks';
import { isTriggerEvent, noop, pick } from 'web-common/utils';

import { fetchRelatedItems, navigate, removeRelatedItem, toggleModal } from '../../actions';
import { getItemTitle } from '../../common/item';
import { Toolbar, ToolGroup } from 'component/ui/toolbars';
import { get, getScrollContainerPageCount, getUniqueId, mapRelationsToItemKeys, sortItemsByKey, } from '../../utils';
import { ADD_RELATED } from '../../constants/modals';
import { pluralize } from '../../common/format';


const RelatedItem = memo(props => {
	const { parentItemKey, relatedItem, onKeyDown } = props;
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const mappings = useSelector(state => state.meta.mappings);
	const colorScheme = useSelector(state => state.preferences.colorScheme);
	const iconSize = isTouchOrSmall ? '28' : '16';
	const id = useRef(getUniqueId());
	const ref = useRef(null);
	const { focusNext, focusPrev, receiveFocus, receiveBlur } = useFocusManager(
		ref, { targetTabIndex: -3, isFocusable: true, isCarousel: false }
	);

	const handleSelect = useCallback(ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		dispatch(navigate({
			library: libraryKey,
			items: relatedItemKey
		}, true, true));
	}, [dispatch, libraryKey]);

	const handleDelete = useCallback(ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		dispatch(removeRelatedItem(parentItemKey, relatedItemKey));
	}, [dispatch, parentItemKey]);

	const handleKeyDown = useCallback(ev => {
		if (ev.key === "ArrowLeft") {
			focusPrev(ev, { useCurrentTarget: false });
		} else if (ev.key === "ArrowRight") {
			focusNext(ev, { useCurrentTarget: false });
		}
		onKeyDown(ev);
	}, [focusNext, focusPrev, onKeyDown]);

	const getItemIcon = item => {
		const { iconName } = item[Symbol.for('derived')];
		return isTouchOrSmall ? `28/item-type/${iconName}` : `16/item-type/${iconName}`;
	}

	return (
			<li
				aria-labelledby={ id.current }
				className="related"
				data-key={ relatedItem.key }
				key={ relatedItem.key }
				onKeyDown={ handleKeyDown }
				role="listitem button"
				tabIndex={ -2 }
				ref={ ref }
				onFocus={ receiveFocus }
				onBlur={ receiveBlur }
			>
				<Icon
					type={ getItemIcon(relatedItem) }
					useColorScheme={ true }
					colorScheme={ colorScheme }
					usePixelRatio={ !isTouchOrSmall }
					width={ iconSize }
					height={ iconSize }
				/>
				<a id={ id.current } onClick={ handleSelect }>
					{ getItemTitle(mappings, relatedItem) }
				</a>
				<Button icon
					aria-label="remove related"
					onClick={ handleDelete }
					tabIndex={ -3 }
				>
					<Icon type={ '16/minus-circle' } width="16" height="16" />
				</Button>
			</li>
		)
});

RelatedItem.displayName = 'RelatedItem';

RelatedItem.propTypes = {
	parentItemKey: PropTypes.string,
	relatedItem: PropTypes.object,
	onKeyDown: PropTypes.func,
}

const Related = ({ id, isActive, isReadOnly, ...rest }) => {
	const dispatch = useDispatch();
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], {}));
	const relations = item.relations;
	const relatedKeys = mapRelationsToItemKeys(relations || {}, libraryKey);
	const isFetching = useSelector(state => get(state, ['libraries', libraryKey, 'itemsRelated', itemKey, 'isFetching'], false));
	const isFetched = useSelector(state => get(state, ['libraries', libraryKey, 'itemsRelated', itemKey, 'isFetched'], false));
	const allItems = useSelector(state => state.libraries[libraryKey].items);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const mappings = useSelector(state => state.meta.mappings);
	const relatedItems = (relatedKeys || [])
		.map(relatedKey => allItems[relatedKey])
		.filter(Boolean);

	const sortedRelatedItems = [...relatedItems];
	sortItemsByKey(mappings, sortedRelatedItems, 'title');

	const addRelatedRef = useRef(null);
	const scrollContainerRef = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev, focusBySelector } = useFocusManager(scrollContainerRef, { isCarousel: false });

	const handleAddRelated = useCallback(async () => {
		await dispatch(toggleModal(ADD_RELATED, true));
	}, [dispatch]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowDown') {
			ev.target === ev.currentTarget && focusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && focusPrev(ev);
		} else if(ev.key === 'Home' && scrollContainerRef.current) {
			addRelatedRef.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End' && scrollContainerRef.current) {
			focusNext(ev, { offset: Infinity });
			ev.preventDefault();
		} else if(ev.key === 'PageDown' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.related');
			focusNext(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'PageUp' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.related');
			focusPrev(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(isTriggerEvent(ev)) {
			ev.target.querySelector('a').click();
			ev.preventDefault();
		}
	}, [focusNext, focusPrev]);

	const handleButtonKeyDown = useCallback(ev => {
		if (ev.key === 'ArrowDown') {
			scrollContainerRef.current.focus();
			ev.preventDefault();
		} else if (ev.key === 'End') {
			focusBySelector('.related:last-child');
			ev.preventDefault();
		}
	}, [focusBySelector]);


	useEffect(() => {
		if(!isFetching && !isFetched) {
			dispatch(fetchRelatedItems(itemKey));
		}
	}, [dispatch, isFetching, isFetched, itemKey]);

	return (
		<TabPane
			id={ id }
			className="related"
			isActive={ isActive }
			isLoading={ shouldUseTabs && !isFetched }
			{...pick(rest, p => p === 'role' || p.startsWith('data-') || p.startsWith('aria-'))}
		>
			<h5 className="h2 tab-pane-heading hidden-mouse">Related</h5>
			{!isTouchOrSmall && (
				<Toolbar>
					<div className="toolbar-left">
						<div className="counter">
							{`${sortedRelatedItems.length} related ${pluralize('item', sortedRelatedItems.length)}`}
						</div>
						{!isReadOnly && (
							<ToolGroup>
								<Button
									className="btn-default"
									disabled={isReadOnly}
									onClick={handleAddRelated}
									onKeyDown={handleButtonKeyDown}
									ref={addRelatedRef}
									tabIndex="0"
								>
									Add Related Item
								</Button>
							</ToolGroup>
						)}
					</div>
				</Toolbar>
			)}
			<div
				className="scroll-container-mouse"
				onBlur={ isTouchOrSmall ? noop : receiveBlur }
				onFocus={ isTouchOrSmall ? noop : receiveFocus }
				ref={ scrollContainerRef }
				tabIndex={ 0 }
			>
				{ sortedRelatedItems.length > 0 && (
					<nav>
						<ul className="details-list related-list">
							{
								sortedRelatedItems.map(relatedItem => (
									<RelatedItem
										key={ relatedItem.key }
										parentItemKey={ itemKey }
										relatedItem={ relatedItem }
										onKeyDown={ handleKeyDown }
									/>
								))
							}
						</ul>
					</nav>
				) }
				{ isTouchOrSmall && !isReadOnly && (
					<Button
						onClick={ handleAddRelated }
						className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
						tabIndex={ -1 }
					>
						<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
						Add Related Item
					</Button>
				)}
			</div>
		</TabPane>
	);
}

Related.propTypes = {
	id: PropTypes.string,
	isActive: PropTypes.bool
}

export default memo(Related);
