'use strict';

const { baseMappings } = require('../constants/item');
const { noteAsTitle, itemTypeLocalized } = require('./format');
const { get } = require('../utils');

module.exports = (items, state) => {
	return items.map(item => {
		const { meta: { itemTypes }} = state;
		const { itemType, note, publisher, publication, dateAdded, dateModified, extra } = item;
		const title = itemType === 'note' ?
			noteAsTitle(note) :
			item[itemType in baseMappings && baseMappings[itemType]['title'] || 'title'] || '';
		const creator = item[Symbol.for('meta')] && item[Symbol.for('meta')].creatorSummary ?
			item[Symbol.for('meta')].creatorSummary :
			'';
		const date = item[Symbol.for('meta')] && item[Symbol.for('meta')].parsedDate ?
			item[Symbol.for('meta')].parsedDate :
			'';
		const coloredTags = item.tags
			.map(tag => get(state, ['libraries', state.current.library, 'tags', `${tag.tag}-0`]))
			.filter(tag => tag && tag.color);
		// same logic as https://github.com/zotero/zotero/blob/6abfd3b5b03969564424dc03313d63ae1de86100/chrome/content/zotero/xpcom/itemTreeView.js#L1062
		const year = date.substr(0, 4);

		return {
			coloredTags,
			creator,
			date,
			dateAdded,
			dateModified,
			extra,
			itemType: itemTypeLocalized(item, itemTypes),
			key: item.key,
			publication,
			publisher,
			title,
			year,
		}
	});
};
