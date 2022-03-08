import React, { useCallback, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { pluralize } from '../../common/format';
import { useItemsCount } from '../../hooks';
import ColumnSelector from '../item/items/column-selector';
import Search from '../search';
import { navigate } from '../../actions';
import Icon from '../ui/icon';
import Button from '../ui/button';
import Libraries from '../libraries';

const EmbeddedCollectionPicker = () => {
	const libraryName = useSelector(state => state.config.libraries?.[0].name);
	const collectionKey = useSelector(state => state.current.collectionKey)
	const collectionName = useSelector(state => state.libraries[state.current.libraryKey]?.collections?.data?.[state.current.collectionKey]?.name);
	const [isCollectionTreeOpen, setIsCollectionTreeOpen] = useState(false);

	const handleClick = useCallback(() => {
		setIsCollectionTreeOpen(true);
	}, []);

	const handleNodeSelected = useCallback(() => {
		setIsCollectionTreeOpen(false);
	}, []);

	const handleClose = useCallback(() => {
		setIsCollectionTreeOpen(false);
	}, []);

	return (
		<div className="embedded-collection-picker">
			<Button className="item-container" onClick={ handleClick } >
				{ collectionKey ? (
					<React.Fragment>
						<Icon type="28/folder" className="touch" width="28" height="28" />
						<Icon type="16/folder" symbol="folder" className="mouse" width="16" height="16" />
						<div className="truncate" title={ collectionName } >{ collectionName }</div>
					</React.Fragment>
				) : (
				<React.Fragment>
					<Icon type="32/library-read-only" className="touch" width="32" height="32" />
					<Icon type="20/library-read-only" className="mouse" width="20" height="20" />
					<div className="truncate" title={ libraryName }>{ libraryName }</div>
				</React.Fragment>
				)}
				<Icon type="16/chevron-9" width="16" height="16" />
			</Button>
			{ isCollectionTreeOpen && (
				<div className="embedded-collection-tree">
					<Button icon className="close" onClick={ handleClose } >
						<Icon type={ '16/close' } width="16" height="16" />
					</Button>
					<Libraries onNodeSelected={ handleNodeSelected } />
				</div>
			)}
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
	const view = useSelector(state => state.current.view);
	const dispatch = useDispatch();
	const backLabel = useSelector(state =>
		state.current.collectionKey ?
			state.libraries[state.current.libraryKey]?.collections?.data?.[state.current.collectionKey]?.name :
			state.config.libraries?.[0].name
	);

	const handleBackClick = useCallback(() => {
		dispatch(navigate({ items: [], view: 'item-list' }));
	}, [dispatch]);

	return (
		<div className="embedded-header">
			{ view !== 'item-details' && (
				<React.Fragment>
					<EmbeddedCollectionPicker />
					<EmbeddedInfoView />
					<Search />
					<ColumnSelector />
				</React.Fragment>
			)}
			{ view === 'item-details' && (
				<React.Fragment>
					<a className="btn back" onClick={ handleBackClick }>
						<Icon type="16/chevron-9" width="16" height="16" />
						{ backLabel }
					</a>
				</React.Fragment>
			)}
		</div>
	);
}

export default memo(EmbeddedHeader);
