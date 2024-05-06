import cx from 'classnames';
import PropTypes from 'prop-types';
import { memo, forwardRef, useCallback, useRef, useState, useImperativeHandle, useEffect, useLayoutEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import { noop } from 'web-common/utils';

import { createAttachments, getAttachmentUrl, navigate, openInReader } from '../actions';
import { getItemFromCanonicalUrl, parseBase64File } from '../utils';
import { extensionLookup  } from '../common/mime';

const RichEditor = memo(forwardRef((props, ref) => {
	const { autoresize, isAttachmentNote = false, id, isReadOnly, onChange, onEdit = noop, value } = props;
	const wantsFocus = useRef(false);
	const editorReady = useRef(false);
	const lastSeenValue = useRef(value);

	const noteEditorURL = useSelector(state => state.config.noteEditorURL);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const colorScheme = useSelector(state => state.preferences.colorScheme);
	const [isInitialised, setIsInitialised] = useState(false);
	const iframeRef = useRef(null);
	const previousID = usePrevious(id);
	const wasReadOnly = usePrevious(isReadOnly);
	const wasTouchOrSmall = usePrevious(isTouchOrSmall);
	const dispatch = useDispatch();

	const focusEditor = useCallback(() => {
		iframeRef.current.focus();
		iframeRef.current.contentWindow.postMessage({ action: 'focus' }, "*");
	}, []);

	// ensure content has actually changed before sending to the API
	// otherwise we hit https://github.com/zotero/dataserver/issues/81
	const changeIfDifferent = useCallback((newContent, id) => {
		if (lastSeenValue.current !== newContent) {
			onChange(newContent, id);
		}
		lastSeenValue.current = newContent;
	}, [onChange]);

	const handleSubscription = useCallback(async subscription => {
		if (subscription && subscription.type === 'image' && subscription.data?.attachmentKey) {
			const { id, data: { attachmentKey } } = subscription;
			const url = await dispatch(getAttachmentUrl(attachmentKey));
			iframeRef.current.contentWindow.postMessage({ action: 'notifySubscription', id, data: { src: url } }, "*");
		}
	}, [dispatch])

	const handleImportImages = useCallback(async (images, parentID) => {
		const filesData = images.map(image => {
			const { src } = image;
			const { mimeType, bytes } = parseBase64File(src);
			const ext = extensionLookup.get(mimeType) ?? '';
			return {
				fileName: `image.${ext}`,
				file: bytes,
				contentType: mimeType,
			}
		});

		const createdItems = await dispatch(createAttachments(
			filesData, { linkMode: 'embedded_image', parentItem: parentID })
		);

		images.forEach((image, index) => {
			const { nodeID } = image;
			const attachmentKey = createdItems?.[index]?.key;

			if(attachmentKey) {
				iframeRef.current.contentWindow.postMessage({ action: 'attachImportedImage', nodeID, attachmentKey }, "*");
			}
		}, []);
	}, [dispatch]);

	const handleShowCitationItem = useCallback(citationItems => {
		const data = citationItems.map(ci => getItemFromCanonicalUrl(ci.uris[0])).filter(i => i !== null);
		const libraryKeys = new Set(data.map(id => id.libraryKey));
		if (libraryKeys.size > 1) {
			console.warn('Show citation items not possible for items in more than one library.', libraryKeys)
		}
		const [libraryKey] = libraryKeys;
		const itemKeys = data.filter(id => id.libraryKey === libraryKey).map(id => id.itemKey);
		dispatch(navigate({ library: libraryKey, items: itemKeys }, true));
	}, [dispatch]);

	const handleIframeMessage = useCallback(async (event) => {
		if (event.source !== iframeRef.current.contentWindow) {
			return;
		}
		switch (event.data?.message?.action) {
			case 'update':
				if (!isReadOnly && editorReady.current) {
					onEdit(event.data?.message.value, event.data?.instanceID);
					changeIfDifferent(event.data?.message.value, event.data?.instanceID);
				}
				break;
			case 'subscribe':
				handleSubscription(event.data?.message?.subscription);
				break;
			case 'importImages':
				handleImportImages(event.data?.message?.images, event.data?.instanceID);
				break;
			case 'initialized':
				editorReady.current = true;
				setIsInitialised(true);
				if (wantsFocus.current) {
					wantsFocus.current = false;
					focusEditor();
				}
				break;
			case 'showCitationItem':
				handleShowCitationItem(event.data?.message?.citation?.citationItems);
				break;
			case 'openCitationPage': {
				const { uris, locator } = event.data?.message?.citation?.citationItems?.[0] || {};
				if(uris?.length === 1) {
					const { libraryKey, itemKey } = getItemFromCanonicalUrl(uris[0]) ?? {};
					if(libraryKey && itemKey) {
						dispatch(openInReader({ items: itemKey, library: libraryKey, location: { pageNumber: locator } }));
					}
				}
				break;
			}
			default:
				break;
		}
	}, [isReadOnly, handleSubscription, handleImportImages, handleShowCitationItem, onEdit, changeIfDifferent, focusEditor, dispatch]);

	// handles iframe loaded once, installed on mount, never updated, doesn't need useCallback deps
	const handleIframeLoaded = useCallback(() => {
		iframeRef.current.contentWindow.postMessage({
			action: 'init',
			instanceID: id,
			readOnly: isReadOnly,
			disableDrag: isTouchOrSmall,
			localizedStrings: [],
			value, isAttachmentNote,
			colorScheme,
		}, "*");
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useImperativeHandle(ref, () => ({
		focus: () => {
			if (editorReady.current) {
				focusEditor();
			} else {
				wantsFocus.current = true;
			}
		}
	}));

	useEffect(() => {
		iframeRef.current.contentWindow.addEventListener('message', handleIframeMessage);
		return () => {
			if(iframeRef.current?.contentWindow) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				iframeRef.current.contentWindow.removeEventListener('message', handleIframeMessage);
			}
		}
	}, [handleIframeMessage]);


	useEffect(() => {
		iframeRef.current.contentWindow.postMessage({
			action: 'setColorScheme',
			colorScheme
		}, '*');
	}, [colorScheme])

	useEffect(() => {
		const hasIDChanged = typeof(previousID) !== 'undefined' && previousID !== id;
		const hasReadOnlyChanged = typeof(wasReadOnly) !== 'undefined' && isReadOnly !== wasReadOnly;
		const hasDeviceTypeChanged = typeof(wasTouchOrSmall) !== 'undefined' && isTouchOrSmall !== wasTouchOrSmall;

		if(hasIDChanged) {
			lastSeenValue.current = value;
		}

		if (hasIDChanged || hasReadOnlyChanged || hasDeviceTypeChanged) {
			editorReady.current = false;
			const lateUpdate = iframeRef.current?.contentWindow?.getDataSync?.(true);
			if (lateUpdate) {
				changeIfDifferent(lateUpdate.data.html, lateUpdate.instanceID);
			}

			iframeRef.current.contentWindow.postMessage({
				action: 'init',
				instanceID: id,
				readOnly: isReadOnly,
				disableDrag: isTouchOrSmall,
				localizedStrings: [],
				value: lastSeenValue.current,
				isAttachmentNote
			}, "*");
		}
	}, [id, isAttachmentNote, isReadOnly, changeIfDifferent, previousID, value, wasReadOnly, wasTouchOrSmall, isTouchOrSmall]);

	useLayoutEffect(() => {
		const storedRef = iframeRef.current;
		return () => {
			const lateUpdate = storedRef?.contentWindow?.getDataSync?.(true);
			if (lateUpdate) {
				changeIfDifferent(lateUpdate.data.html, lateUpdate.instanceID);
			}
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="rich-editor">
			<div className={cx('editor-container', { autoresize, initialized: isInitialised }) } >
				<iframe onLoad={ handleIframeLoaded } ref={ iframeRef } src={ noteEditorURL } /> :
			</div>
		</div>
	);
}));

RichEditor.propTypes = {
	autoresize: PropTypes.bool,
	isAttachmentNote: PropTypes.bool,
	id: PropTypes.string,
	isReadOnly: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	onEdit: PropTypes.func,
	value: PropTypes.string,
};

RichEditor.displayName = 'RichEditor';

export default RichEditor;
