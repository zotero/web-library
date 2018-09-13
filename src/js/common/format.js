'use strict';

const noteAsTitle = note => note.split('\n')[0].replace(/<(?:.|\n)*?>/gm, '');
const creator = creator => 'lastName' in creator ?
	[creator.lastName, creator.firstName].filter(s => s.trim().length).join(', ') : creator.name;

module.exports = {
	noteAsTitle,
	creator
};
