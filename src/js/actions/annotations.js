import deepEqual from 'deep-equal';

import { createItems, fetchItemTemplate, updateMultipleItems } from '.';
import { annotationItemFromJSON } from '../common/annotations';


const excludeKeys = ['dateModified', 'dateCreated'];
const mapAnnotationFromReader = (annotationFromReader, annotationItem, isNewItem = false) => {
	const annotationPatch = isNewItem ? { ...annotationItem } : { };
	annotationFromReader = annotationItemFromJSON(annotationFromReader);
	annotationPatch.key = annotationFromReader.key;

	Object.keys(annotationItem).forEach(key => {
		if (excludeKeys.includes(key)) {
			return;
		}

		const value = annotationFromReader[key];

		if (key in annotationFromReader && !deepEqual(annotationItem[key], value)) {
			annotationPatch[key] = value;
		}
	});



	if(Object.keys(annotationPatch).length === 1) {
		// only key is present, no changes
		return null;
	}

	return annotationPatch;
}


export const postAnnotationsFromReader = (annotationsFromReader, parentItemKey, annotationTemplates = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const libraryKey = state.current.libraryKey;
		const items = state.libraries[libraryKey]?.items ?? {};
		const itemsBeingUpdated = state.libraries[libraryKey]?.updating?.items ?? {};
		const itemsBeingCreated = state.libraries[libraryKey]?.creating?.items ?? {};
		let annotationTypes = new Set();
		let itemsToUpdate = [], itemsToCreate = [];

		annotationsFromReader.forEach(annotationFromReader => {
			if(annotationFromReader.id in itemsBeingUpdated) {
				// update is pending, aggregate pending & new changes and queue another update
				const pendingChanges = itemsBeingUpdated[annotationFromReader.id];
				const aggregatedPatch = (pendingChanges || []).reduce(
					(aggr, { patch }) => ({ ...aggr, ...patch }), {}
				);

				const itemWithPendingChanges = {
					...items[annotationFromReader.id],
					...aggregatedPatch
				};

				itemsToUpdate.push(
					mapAnnotationFromReader(annotationFromReader, itemWithPendingChanges)
				);
			} else if(annotationFromReader.id in items) {
				// update existing item
				itemsToUpdate.push(
					mapAnnotationFromReader(annotationFromReader, items[annotationFromReader.id])
				);
			} else if(annotationFromReader.id in itemsBeingCreated) {
				// item is being created, merge existing and new data and queue an update
				itemsToUpdate.push(
					mapAnnotationFromReader(annotationFromReader, itemsBeingCreated[annotationFromReader.id].data)
				)
			} else {
				// item does not exist, obtain template and create it (this might require a recursive call, see comment below)
				annotationTypes.add(annotationFromReader.type);
				itemsToCreate.push(annotationFromReader);
			}
		});

		itemsToUpdate = itemsToUpdate.filter(item => item !== null);

		if(itemsToUpdate.length > 0) {
			dispatch(updateMultipleItems(itemsToUpdate));
		}

		annotationTypes = Array.from(annotationTypes);

		if (annotationTypes.length > 0) {
			annotationTypes = annotationTypes.filter(type => !(type in annotationTemplates));

			if (annotationTypes.length > 0) {
				let newTemplates = await Promise.all(
					annotationTypes
						.map(async annotationType =>
							dispatch(fetchItemTemplate('annotation', annotationType))
						)
				);
				newTemplates = Object.fromEntries(
					annotationTypes.map((_, i) => [annotationTypes[i], newTemplates[i]])
				);
				// templates obtained but by now state might have changed, so we need to check again
				return dispatch(
					postAnnotationsFromReader(annotationsFromReader, parentItemKey, { ...annotationTemplates, ...newTemplates })
				);
			}

			itemsToCreate = itemsToCreate.map(annotationFromReader => {
				const template = annotationTemplates[annotationFromReader.type];
				return mapAnnotationFromReader(
					annotationFromReader, { ...template, version: 0, parentItem: parentItemKey }, true
				);
			});
			dispatch(createItems(itemsToCreate));
		}
	};
};
