import { Fragment, useCallback, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';
import { useFocusManager } from 'web-common/hooks';
import { isTriggerEvent } from 'web-common/utils';

import { pluralize } from '../../common/format';
import { useItemsCount } from '../../hooks';
import ColumnSelector from '../item/items/column-selector';
import Search from '../search';
import { navigate, toggleModal } from '../../actions';
import { EMBEDDED_LIBRARIES_TREE } from '../../constants/modals';

const EmbeddedCollectionPicker = props => {
	const { tabIndex = -2, onFocusNext, onFocusPrev } = props;
	const libraryName = useSelector(state => state.config.libraries?.[0].name);
	const collectionKey = useSelector(state => state.current.collectionKey)
	const collectionName = useSelector(state => state.libraries[state.current.libraryKey]?.dataObjects?.[state.current.collectionKey]?.name);

	const dispatch = useDispatch();

	const handleClick = useCallback(() => {
		dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, true));
	}, [dispatch]);


	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(isTriggerEvent(ev) || ev.key === 'ArrowDown') {
			dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, true));
			ev.preventDefault();
		} else if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}, [dispatch, onFocusNext, onFocusPrev]);

	return (
        <div className="embedded-collection-picker">
			<Button
				className="item-container"
				onClick={ handleClick }
				onKeyDown={ handleKeyDown }
				tabIndex={ tabIndex }
			>
				{ collectionKey ? (
					<Fragment>
						<Icon type="28/folder" className="touch" width="28" height="28" />
						<Icon type="16/folder" symbol="folder" className="mouse" width="16" height="16" />
						<div className="truncate" title={ collectionName } >{ collectionName }</div>
					</Fragment>
				) : (
				<Fragment>
					<Icon type="32/library-read-only" className="touch" width="32" height="32" />
					<Icon type="20/library-read-only" className="mouse" width="20" height="20" />
					<div className="truncate" title={ libraryName }>{ libraryName }</div>
				</Fragment>
				)}
				<Icon type="16/chevron-9" width="16" height="16" />
			</Button>
		</div>
    );
}

const EmbeddedInfoView = () => {
	const itemsCount = useItemsCount();
	return (
		<div className="embedded-info-view">
		{ itemsCount === null ? '' :
			`${(itemsCount === 0 ? 'No' : itemsCount)} ${pluralize('item', itemsCount)} in this view`
		}
		</div>
	)
}

const EmbeddedHeader = () => {
	const ref = useRef(null);
	const view = useSelector(state => state.current.view);
	const dispatch = useDispatch();
	const backLabel = useSelector(state =>
		state.current.collectionKey ?
			state.libraries[state.current.libraryKey]?.dataObjects?.[state.current.collectionKey]?.name :
			state.config.libraries?.[0].name
	);
	const { receiveFocus, receiveBlur, focusNext, focusPrev } = useFocusManager(ref, { initialQuerySelector: '.search-input' });

	const handleBackClick = useCallback(ev => {
		if(isTriggerEvent(ev)) {
			ev.target.blur();
			dispatch(navigate({ items: [], view: 'item-list' }));
		}
	}, [dispatch]);

	return (
        <div
			className="embedded-header"
			onBlur={ receiveBlur }
			onFocus={ receiveFocus }
			ref={ ref }
			tabIndex={ 0 }
		>
			{ view !== 'item-details' && (
				<Fragment>
					<EmbeddedCollectionPicker tabIndex={ -2 } onFocusNext={ focusNext } onFocusPrev={ focusPrev } />
					<EmbeddedInfoView />
					<Search onFocusNext={ focusNext } onFocusPrev={ focusPrev } />
					<ColumnSelector tabIndex={ -2 } onFocusNext={ focusNext } onFocusPrev={ focusPrev } />
				</Fragment>
			)}
			{ view === 'item-details' && (
				<Fragment>
					<a className="btn btn-default back" onKeyDown={ handleBackClick } onClick={ handleBackClick } tabIndex={ -2 }>
						<Icon type="16/chevron-13" width="16" height="16" />
						{ backLabel }
					</a>
				</Fragment>
			)}
		</div>
    );
}

export default memo(EmbeddedHeader);
