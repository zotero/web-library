import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import { useDispatch, useSelector } from 'react-redux';

import { makeChildMap } from '../../common/collection';
import Libraries from '../../component/libraries';
import Modal from '../ui/modal';
import Button from '../ui/button';
import Spinner from '../ui/spinner';
import TouchHeader from '../touch-header.jsx';
import { COLLECTION_SELECT } from '../../constants/modals';
import { chunkedCopyToLibrary, chunkedAddToCollection, toggleModal, triggerSelectMode } from '../../actions';
import { get } from '../../utils';
import Icon from '../ui/icon';

const AddItemsToCollectionsModal = () => {
	const dispatch = useDispatch();

	const device = useSelector(state => state.device);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const libraries = useSelector(state => state.config.libraries.filter(l => !l.isReadOnly));
	const isOpen = useSelector(state => state.modal.id === COLLECTION_SELECT);
	const sourceItemKeys = useSelector(state => state.modal.items);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const collections = useSelector(state => libraries.reduce((aggr, library) => {
		aggr[library.key] = Object.values(
			get(state, ['libraries', library.key, 'collections', 'data'], {})
		);
		return aggr;
	}, {}));

	const [isBusy, setBusy] = useState(false);
	const [view, setView] = useState('libraries');
	const [pickedLibraryKey, setPickedLibraryKey] = useState('');
	const [pickedCollectionKey, setPickedCollectionKey] = useState('');
	const [path, setPath] = useState([]);
	const [picked, setPicked] = useState([]);

	const collectionsSource = collections[pickedLibraryKey];

	useEffect(() => {
		setView('libraries');
		setPickedLibraryKey('');
		setPath([]);
		setPicked([]);
	}, [isOpen]);

	// @TODO: merge functions navigateLocal* below (renamed from legacy functions) into a single "navigateLocal"
	const navigateLocalFromCollectionTree = ({ library = null, collection = null } = {}) => {
		if(library) {
			if(collection) {
				const childMap = library in collections ? makeChildMap(collections[library]) : {};
				const hasChildren = collection in childMap;
				const newPath = [...path];
				if(hasChildren) {
					newPath.push(collection);
				}
				setView('collection');
				setPickedLibraryKey(library);
				setPickedCollectionKey(collection);
				setPath(newPath);
			} else {
				setView('library');
				setPickedLibraryKey(library);
				setPickedCollectionKey(null);
			}
		}
	}

	const navigateLocalFromTouchHeader = navigationData => {
		if('collection' in navigationData) {
			const targetIndex = path.indexOf(navigationData.collection);
			setPickedCollectionKey(navigationData.collection);
			setPath(path.slice(0, targetIndex + 1));
		} else if(navigationData.view === 'library') {
			setPickedCollectionKey(null);
			setPath([]);
		} else if(navigationData.view === 'libraries') {
			setPickedCollectionKey(null);
			setPickedLibraryKey(null);
			setPath([]);
			setView('libraries');
		}
	}

	const pickerPick = newPicked => {
		if(deepEqual(picked, newPicked)) {
			setPicked([]);
		} else {
			setPicked([newPicked]);
		}
	}

	const handleAddItems = useCallback(async () => {
		if(picked.length === 0) {
			return;
		}

		const { libraryKey: targetLibraryKey, collectionKey: targetCollectionKey } = picked[0];

		setBusy(true);

		if(targetLibraryKey === libraryKey) {
			await dispatch(
				chunkedAddToCollection(sourceItemKeys, targetCollectionKey)
			);
		} else {
			await dispatch(
				chunkedCopyToLibrary(sourceItemKeys, libraryKey, targetLibraryKey, targetCollectionKey)
			);
		}
		setBusy(false);
		dispatch(toggleModal(null, false));
		dispatch(triggerSelectMode(false, true));
	}, [sourceItemKeys, libraryKey, picked]);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(null, false));
	}, [dispatch]);



	const touchHeaderPath = path.map(key => ({
		key,
		type: 'collection',
		label: collectionsSource.find(c => c.key === key).name,
		path: { library: pickedLibraryKey, collection: key },
	}));

	if(view !== 'libraries') {
		const libraryConfig = libraries.find(l => l.key === pickedLibraryKey) || {};
		touchHeaderPath.unshift({
			key: libraryKey,
			type: 'library',
			path: { library: pickedLibraryKey, view: 'library' },
			label: libraryConfig.name
		});
	}

	touchHeaderPath.unshift({
		key: 'root',
		type: 'root',
		path: { view: 'libraries' },
		label: 'Libraries'
	});

	return (
		<Modal
			isOpen={ isOpen }
			contentLabel="Select Collection"
			className="modal-touch modal-centered collection-select-modal"
			onRequestClose={ handleCancel }
			closeTimeoutMS={ 200 }
			overlayClassName={ "modal-slide" }
		>
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-body">
					{
						isBusy ? <Spinner className="large" /> : (
							<React.Fragment>
							{ isTouchOrSmall ? (
								<TouchHeader
									className="darker"
									device={ device }
									path={ touchHeaderPath }
									navigate={ navigateLocalFromTouchHeader }
								/>
							) : (
								<React.Fragment>
									<div className="modal-header">
									<h4 className="modal-title truncate">
										Select target library or collection
									</h4>
									<Button
										icon
										className="close"
										onClick={ handleCancel }
									>
										<Icon type={ '16/close' } width="16" height="16" />
									</Button>
								</div>
								</React.Fragment>
							) }
							<Libraries
								isPickerMode={ true }
								pickerPick={ pickerPick }
								picked={ picked }
								pickerNavigate={ navigateLocalFromCollectionTree }
								pickerState= { { view, libraryKey: pickedLibraryKey, collectionKey: pickedCollectionKey, path, picked } }
							/>
							</React.Fragment>
						)
					}
				</div>
				{ isTouchOrSmall ? (
					<React.Fragment>
						<div className="modal-footer">
							<div className="modal-footer-left">
								<Button
									className="btn-link"
									onClick={ () => dispatch(toggleModal(null, false)) }
								>
									Cancel
								</Button>
							</div>
							<div className="modal-footer-center">
								<h4 className="modal-title truncate">
									{
										picked.length > 0 ?
										'Confirm Add to Collection?' :
										'Select a Collection'
									}
								</h4>
							</div>
							<div className="modal-footer-right">
								<Button
									disabled={ picked.length === 0}
									className="btn-link"
									onClick={ handleAddItems }
								>
									Add
								</Button>
							</div>
						</div>
					</React.Fragment>
				) : (
					<React.Fragment>
						<div className="modal-footer justify-content-end">
							<Button
								disabled={ picked.length === 0}
								className="btn-link"
								onClick={ handleAddItems }
							>
								Add
							</Button>
						</div>
					</React.Fragment>
				) }
			</div>
		</Modal>
	);
}

AddItemsToCollectionsModal.propTypes = {
	items: PropTypes.array,
}

export default AddItemsToCollectionsModal;
