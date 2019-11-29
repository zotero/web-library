'use strict';

const getVariants = prefix => {
	return [
		`${prefix}/tags/:tags/search/:search/items/:items/note/:note`,
		`${prefix}/tags/:tags/search/:search/items/:items/attachment/:attachment`,
		`${prefix}/tags/:tags/search/:search/items/:items`,
		`${prefix}/tags/:tags/items/:items/note/:note`,
		`${prefix}/tags/:tags/items/:items/attachment/:attachment`,
		`${prefix}/tags/:tags/items/:items`,
		`${prefix}/search/:search/:qmode/items/:items/note/:note`,
		`${prefix}/search/:search/:qmode/items/:items/attachment/:attachment`,
		`${prefix}/search/:search/:qmode/items/:items`,
		`${prefix}/items/:items/note/:note`,
		`${prefix}/items/:items/attachment/:attachment`,
		`${prefix}/items/:items`,
		`${prefix}/tags/:tags/search/:search/:qmode`,
		`${prefix}/tags/:tags`,
		`${prefix}/search/:search/:qmode`,
		`${prefix}/:view(library|collection|item-list|item-details)?`,
	];
}

export const routes = [
	'/:view(libraries)',
	...getVariants('/groups/:groupid/:groupslug/collections/:collection'),
	...getVariants('/groups/:groupid/:groupslug/trash'),
	...getVariants('/groups/:groupid/:groupslug'),
	...getVariants('/:userslug/collections/:collection'),
	...getVariants('/:userslug/trash'),
	...getVariants('/:userslug/publications'),
	...getVariants('/:userslug'),
];

export const redirects = [
	{ 	from: 	 '/:userslug/items/collectionKey/trash/itemKey/:items/:optional?/:mode?',
		to: 	 '/:userslug/trash/items/:items'
	},
	{ 	from: 	 '/:userslug/items/collectionKey/:collection/itemKey/:items/:optional?/:mode?',
		to: 	 '/:userslug/collections/:collection/items/:items'
	},  //@NOTE: Canonical url redirect return collectionKey and itemKey swapped around:
	{ 	from: 	 '/:userslug/items/itemKey/:items/collectionKey/:collection/:optional?/:mode?',
		to: 	 '/:userslug/collections/:collection/items/:items'
	},
	{	from: 	 '/:userslug/items/collectionKey/trash/q/:search',
		to: 	 '/:userslug/trash/search/:search'
	},
	{	from: 	 '/:userslug/items/collectionKey/trash/:optional?/:mode?',
		to: 	 '/:userslug/trash'
	},
	{	from: 	 '/:userslug/items/collectionKey/:collection/q/:search/:optional?/:mode?',
		to: 	 '/:userslug/collections/:collection/search/:search'
	},
	{	from: 	 '/:userslug/items/collectionKey/:collection/:optional?/:mode?',
		to: 	 '/:userslug/collections/:collection'
	},
	{ 	from: 	 '/:userslug/items/action/newItem/collectionKey/trash/:optional?/:mode?',
		to: 	 '/:userslug/trash'
	},
	{ 	from: 	 '/:userslug/items/action/newItem/collectionKey/:collection/:optional?/:mode?',
		to: 	 '/:userslug/collections/:collection'
	},
	{ 	from: 	 '/:userslug/items/itemKey/trash/:optional?/:mode?',
		to: 	 '/:userslug/trash'
	},
	{ 	from: 	 '/:userslug/items/itemKey/publications/:optional?/:mode?',
		to: 	 '/:userslug/publications'
	},
	{ 	from: 	 '/:userslug/items/itemKey/:items/:optional?/:mode?',
		to: 	 '/:userslug/items/:items'
	},
	{ 	from: 	 '/:userslug/items/action/newItem/:optional?/:mode?',
		to: 	 '/:userslug/library'
	},
	{ 	from: 	 '/:userslug/items/q/:search',
		to: 	 '/:userslug/search/:search'
	},
	{ 	from: 	 '/:userslug/items',
		to: 	 '/:userslug/library'
	},

	{ 	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/trash/itemKey/:items/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/trash/items/:items'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/:collection/itemKey/:items/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/collections/:collection/items/:items'
	},  //@NOTE: Canonical url redirect return collectionKey and itemKey swapped around:
	{ 	from: 	 '/groups/:groupid/:groupslug/items/itemKey/:items/collectionKey/:collection/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/collections/:collection/items/:items'
	},
	{	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/trash/q/:search',
		to: 	 '/groups/:groupid/:groupslug/trash/search/:search'
	},
	{	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/trash/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/trash'
	},
	{	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/:collection/q/:search/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/collections/:collection/search/:search'
	},
	{	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/:collection/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/collections/:collection'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/action/newItem/collectionKey/trash/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/trash'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/action/newItem/collectionKey/:collection/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/collections/:collection'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/itemKey/trash/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/trash'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/itemKey/publications/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/publications'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/itemKey/:items/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/items/:items'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/action/newItem/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/library'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/q/:search',
		to: 	 '/groups/:groupid/:groupslug/search/:search'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items',
		to: 	 '/groups/:groupid/:groupslug/library'
	},

	{	from: '/groups/:groupid/:groupslug',
		to: '/groups/:groupid/:groupslug/library'
	},

	{ 	from: '/',
		to: '/libraries'
	},
];
