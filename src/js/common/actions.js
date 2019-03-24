'use strict';

const extractItems = (response, state) => {
	return response.getData().map((item, index) => ({
		...item,
		tags: item.tags || [],  // tags are not present on items in my publications
								// but most of the code expects tags key to be present
		[Symbol.for('meta')]: response.getMeta()[index] || {},
		// @TODO: url should not include the key
		[Symbol.for('attachmentUrl')]: item.itemType === 'attachment' &&
			`https://${state.config.apiConfig.apiAuthorityPart}/users/${state.config.userId}/items/${item.key}/file/view?key=${state.config.apiKey}`
	}));
}

export { extractItems };
