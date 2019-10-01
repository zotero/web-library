'use strict';

const extractItems = response => {
	return response.getData().map((item, index) => ({
		...item,
		tags: item.tags || [],  // tags are not present on items in my publications
								// but most of the code expects tags key to be present
		[Symbol.for('meta')]: response.getMeta()[index] || {},
		[Symbol.for('links')]: response.getLinks()[index] || {}
	}));
}

//@TODO: deprecate in favour of items-write.jsx chunkedAction()
const sequentialChunkedAcion = async (action, itemKeys, extraArgs = []) => {
	do {
		const itemKeysChunk = itemKeys.splice(0, 50);
		await action(itemKeysChunk, ...extraArgs);
	} while (itemKeys.length > 0);
}

export { extractItems, sequentialChunkedAcion };
