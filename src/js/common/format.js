'use strict';

const noteAsTitle = note => note.split('\n')[0].replace(/<(?:.|\n)*?>/gm, '');

module.exports = {
	noteAsTitle	
};