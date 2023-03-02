import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import ItemBox from './box';
import Abstract from './abstract';
import { getBaseMappedValue } from '../../common/item';
import { TabPane } from '../ui/tabs';
import { fetchItemTypeCreatorTypes, fetchItemTypeFields } from '../../actions';
import { get } from '../../utils';
import { useMetaState } from '../../hooks';

const Info = ({ isActive, isReadOnly, id }) => {
	const dispatch = useDispatch();
	const isLibraryReadOnly = useSelector(
		state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly
	);
	const itemType = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey, 'itemType'])
	);
	const abstractNote = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey, 'abstractNote'])
	);
	const title = useSelector(state =>
		getBaseMappedValue(get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey], {}), 'title')
	);
	const isEditing = useSelector(
		state => state.current.itemKey && state.current.editingItemKey === state.current.itemKey
	);

	const { isItemTypeCreatorTypesAvailable, isFetchingItemTypeCreatorTypes,
		isItemTypeFieldsAvailable, isFetchingItemTypeFields, isMetaAvailable } = useMetaState();

	useEffect(() => {
		if(!isItemTypeCreatorTypesAvailable && !isFetchingItemTypeCreatorTypes) {
			dispatch(fetchItemTypeCreatorTypes(itemType))
		}
	}, [dispatch, isFetchingItemTypeCreatorTypes, isItemTypeCreatorTypesAvailable, itemType]);

	useEffect(() => {
		if(!isItemTypeFieldsAvailable && !isFetchingItemTypeFields) {
			dispatch(fetchItemTypeFields(itemType))
		}
	}, [dispatch, isItemTypeFieldsAvailable, isFetchingItemTypeFields, itemType]);

	return (
		<TabPane
			id={ id }
			className="info"
			isActive={ isActive }
			isLoading={ !isMetaAvailable }
		>
			<div className="scroll-container-mouse">
				<div className="row">
					<div className="col">
						{ !isEditing && (
								<h5 className={ cx(
									'h1','item-title', {
										placeholder: title.length === 0
									}
								)}>
									{ title.length === 0 ? 'Untitled' : title }
								</h5>
							)
						}
						<ItemBox
							isActive={ isActive }
							isReadOnly={ isReadOnly }
							hiddenFields={ [ 'abstractNote' ] }
						/>
					</div>
					{ (!isLibraryReadOnly || abstractNote) && (
						<div className="col">
							<section className={ cx({
								'empty-abstract': !abstractNote,
								abstract: true,
								editing: isEditing,
							}) }>
								<h6 id="label-abstract" className="h2 abstract-heading">
									Abstract
								</h6>
								<div className="abstract-body">
									<Abstract
										aria-labelledby="label-abstract"
										isReadOnly={ isReadOnly }
									/>
								</div>
							</section>
						</div>
					) }
				</div>
			</div>
		</TabPane>
	);
}

Info.propTypes = {
	id: PropTypes.string,
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
}

export default memo(Info);

