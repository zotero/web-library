import { memo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import Libraries from "./libraries"


const CurrentLibraries = () => {
	const ref = useRef();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const currentView = useSelector(state => state.current.view);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const firstCollectionKey = useSelector(state => state.current.firstCollectionKey);
	const firstIsTrash = useSelector(state => state.current.firstIsTrash);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);

	useEffect(() => {
		const selectedLibraryNode = ref?.current?.querySelector(`[data-key="${libraryKey}"]`);
		if (selectedLibraryNode && !isTouchOrSmall && !firstCollectionKey && !firstIsTrash) {
			// wait for other effect to dispatch and process toggleOpen, then scroll on next frame
			setTimeout(() => selectedLibraryNode?.scrollIntoView?.(), 0);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return <Libraries
		libraryKey={libraryKey}
		collectionKey={collectionKey}
		itemsSource={itemsSource}
		view={currentView}
	/>
};

export default memo(CurrentLibraries);
