import { createItem, getAttachmentUrl, updateItem } from '.';
import { BEGIN_RECOGNIZE_DOCUMENT, COMPLETE_RECOGNIZE_DOCUMENT, ERROR_RECOGNIZE_DOCUMENT, UPDATE_RECOGNIZE_DOCUMENT } from '../constants/actions';
import { PDFWorker } from '../common/pdf-worker.js';
import { pick } from 'web-common/utils';

// TODO: This and `searchIdentifier` should be merged (but we don't want to dispatch idenfitier actions here)
const getItemFromIdentifier = identifier => {
	return async (dispatch, getState) => {
		const state = getState();
		const { translateUrl } = state.config;
		const url = `${translateUrl}/search`;
		const response = await fetch(url, {
			method: 'POST',
			mode: 'cors',
			headers: { 'Content-Type': 'text/plain', },
			body: identifier
		});
		if (response.ok) {
			const translatorResponse = await response.json();
			return translatorResponse?.[0]
		} else {
			//TODO
			throw new Error('Failed to get item from identifier');
		}
	}
}

const retrieveMetadata = (itemKey, libraryKey) => {
	return async (dispatch, getState) => {
		dispatch({ type: BEGIN_RECOGNIZE_DOCUMENT, itemKey, libraryKey });
		const state = getState();
		const attachmentItem = state.libraries[state.current.libraryKey]?.items?.[itemKey];
		try {
			const recognizerData = await dispatch(getRecognizerData(itemKey));
			dispatch({ type: UPDATE_RECOGNIZE_DOCUMENT, itemKey, libraryKey, stage: 1 });
			const recognizedItem = await dispatch(recognizePDF(recognizerData));
			dispatch({ type: UPDATE_RECOGNIZE_DOCUMENT, itemKey, libraryKey, stage: 2 });
			delete recognizedItem.key;
			delete recognizedItem.version;
			recognizedItem.collections = [...attachmentItem.collections];
			const item = await dispatch(createItem(recognizedItem, libraryKey));
			dispatch({ type: UPDATE_RECOGNIZE_DOCUMENT, itemKey, libraryKey, stage: 3 });
			await dispatch(updateItem(itemKey, { parentItem: item.key, collections: [] }, libraryKey));
			dispatch({ type: COMPLETE_RECOGNIZE_DOCUMENT, itemKey, libraryKey, parentItemKey: item.key });
		} catch (error) {
			dispatch({
				type: ERROR_RECOGNIZE_DOCUMENT,
				itemKey,
				libraryKey,
				silent: true, // do not display an error message, this error is only relevant in the recognizer UI
				error: error?.message ?? 'Failed to recognize document'
			});
		}
	}
}


// extract metadata from the PDF and send it to the recognizer server
const getRecognizerData = itemKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const attachmentItem = state.libraries[state.current.libraryKey]?.items?.[itemKey];
		if (attachmentItem.contentType !== 'application/pdf') {
			throw new Error("Attachment is not a PDF");
		}

		const attachmentURL = await dispatch(getAttachmentUrl(itemKey));
		const data = await (await fetch(attachmentURL)).arrayBuffer();
		const { pdfWorkerURL, pdfReaderCMapsURL, pdfReaderStandardFontsURL, recognizerUrl } = state.config;
		const pdfWorker = new PDFWorker({ pdfWorkerURL, pdfReaderCMapsURL, pdfReaderStandardFontsURL });
		const recognizerInputData = await pdfWorker.getRecognizerData(data); // TODO: add suport for password-protected PDFs
		recognizerInputData.fileName = attachmentItem.filename;

		const containingTextPages = recognizerInputData.pages.reduce((acc, page) => {
			if (page?.[2]?.length) {
				acc++;
			}
			return acc;
		}, 0);

		if (containingTextPages === 0) {
			// TODO
			throw new Error('PDF does not contain any text');
		}

		const url = `${recognizerUrl}/recognize`;
		const response = await fetch(url, {
			method: 'POST',
			mode: 'cors',
			headers: { 'content-type': 'application/json', },
			body: JSON.stringify(recognizerInputData)
		});
		if (response.ok) {
			return await response.json();
		} else {
			throw new Error('Failed to recognize document');
		}
	}
}


// create item based on data returned from recognizer
// based on https://github.com/zotero/zotero/blob/5fd94e22dff87318aa3a84e735e1fdece488f5e3/chrome/content/zotero/xpcom/recognizeDocument.js#L411
const recognizePDF = (recognizerData) => {
	return async (dispatch) => {
		let identifierPrefix = '';
		let idenfitierValue = '';
		if (recognizerData.arxiv) {
			identifierPrefix = 'arxiv';
			idenfitierValue = recognizerData.arxiv;
		} else if (recognizerData.doi) {
			identifierPrefix = 'DOI';
			idenfitierValue = recognizerData.doi;
		} else if (recognizerData.isbn) {
			identifierPrefix = 'ISBN';
			idenfitierValue = recognizerData.isbn;
		}

		if (identifierPrefix && idenfitierValue) {
			try {
				const translatedItem = await dispatch(getItemFromIdentifier(`${identifierPrefix}: ${idenfitierValue}`));
				if (translatedItem) {
					if (!translatedItem.abstractNote && recognizerData.abstract) {
						translatedItem.abstractNote = recognizerData.abstract;
					}
					if (!translatedItem.language && recognizerData.language) {
						translatedItem.language = recognizerData.language;
					}
					if (translatedItem.tags) {
						translatedItem.tags = translatedItem.tags.map(tag => {
							if (typeof tag === 'string') {
								return { tag, type: 1 };
							}
							tag.type = 1;
							return tag;
						});
					}
					return translatedItem;
				}
			} catch (e) {
				// if this fails (e.g. translation server returns 500), we log the error and continue with the fallback using the recognizer data
				console.error(`Failed to translate identfier (${identifierPrefix}:${idenfitierValue}):\n${e}\n\nFalling back to recognizer data`);
			}
		}

		// no identifier found, or translation failed
		if (recognizerData.title) {
			let type = 'journalArticle';

			if (recognizerData.type === 'book-chapter') {
				type = 'bookSection';
			}

			const newItem = {
				type,
				creators: recognizerData.authors.map(author => ({
					creatorType: 'author', ...pick(author, ['firstName', 'lastName'])
				})),
				title: recognizerData.title,
				abstractNote: recognizerData.abstract,
				date: recognizerData.year,
				libraryCatalog: 'Zotero',
				...pick(recognizerData, ['pages', 'volume', 'url', 'language']),
				...(type === 'journalArticle' ? { issue: recognizerData.issue, issn: recognizerData.ISSN, publicationTitle: recognizerData.container } : {}),
				...(type === 'bookSection' ? { bookTitle: recognizerData.container, publisher: recognizerData.publisher } : {}),
			};

			return newItem;
		}

		return null;
	}
}

export { retrieveMetadata };
