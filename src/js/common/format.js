'use strict';

const noteAsTitle = note => note.split('\n')[0].replace(/<(?:.|\n)*?>/gm, '');
const creator = creator => 'lastName' in creator ?
	[creator.lastName, creator.firstName].filter(s => s.trim().length).join(', ') : creator.name;
const itemTypeLocalized = (item, itemTypes) => {
	const { itemType } = item;
	if(itemType === 'note') { return "Note" }
	if(itemType === 'attachment') { return "Attachment" }
	return (itemTypes.find(it => it.itemType === itemType) || {}).localized;
}

module.exports = {
	noteAsTitle,
	creator,
	itemTypeLocalized
};
