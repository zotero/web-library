const singleIdRe = '[a-zA-Z0-9]{8}';
// const multipleIdRe = '(?:[a-zA-Z0-9]{8},?)+';
// @TODO: Use above once path-to-regex gets updated in react-router. Also remove workaround in reducers/current
// 		  https://github.com/ReactTraining/react-router/issues/6899
const multipleIdRe = '[A-Z0-9,]+';

const getVariants = prefix => {
	return [
		`${prefix}/tags/:tags/search/:search/:qmode/items/:items(${multipleIdRe})/note/:note/:view(library|collection|item-list|item-details)?`,
		`${prefix}/tags/:tags/search/:search/:qmode/items/:items(${multipleIdRe})/attachment/:attachment(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/tags/:tags/search/:search/:qmode/items/:items(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/tags/:tags/search/:search/:qmode/items/:items(${multipleIdRe})/:view(library|collection|item-list|item-details)?`,
		`${prefix}/tags/:tags/items/:items(${multipleIdRe})/note/:note/:view(library|collection|item-list|item-details)?`,
		`${prefix}/tags/:tags/items/:items(${multipleIdRe})/attachment/:attachment(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/tags/:tags/items/:items(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/tags/:tags/items/:items(${multipleIdRe})/:view(library|collection|item-list|item-details)?`,
		`${prefix}/search/:search/:qmode/items/:items(${multipleIdRe})/note/:note/:view(library|collection|item-list|item-details)?`,
		`${prefix}/search/:search/:qmode/items/:items(${multipleIdRe})/attachment/:attachment(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/search/:search/:qmode/items/:items(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/search/:search/:qmode/items/:items(${multipleIdRe})/:view(library|collection|item-list|item-details)?`,
		`${prefix}/items/:items(${multipleIdRe})/note/:note/:view(library|collection|item-list|item-details)?`,
		`${prefix}/items/:items(${multipleIdRe})/attachment/:attachment(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/items/:items(${singleIdRe})/:view(library|collection|item-list|item-details|reader)?`,
		`${prefix}/items/:items(${multipleIdRe})/:view(library|collection|item-list|item-details)?`,
		`${prefix}/tags/:tags/search/:search/:qmode/:view(library|collection|item-list|item-details)?`,
		`${prefix}/tags/:tags/:view(library|collection|item-list|item-details)?`,
		`${prefix}/search/:search/:qmode/:view(library|collection|item-list|item-details)?`,
		`${prefix}/:view(library|collection|item-list|item-details)?`,
	];
};

export const routes = [
	'/:view(libraries)',
	...getVariants(`/groups/:groupid/:groupslug/:source(collections)/:collection(${singleIdRe})`),
	...getVariants('/groups/:groupid/:groupslug/:source(trash)'),
	...getVariants('/groups/:groupid/:groupslug'),
	...getVariants(`/:userslug/:source(collections)/:collection(${singleIdRe})`),
	...getVariants('/:userslug/:source(trash|publications)'),
	...getVariants('/:userslug'),
];

export const redirects = [
	{ 	from: 	 `/:userslug/items/collectionKey/trash/itemKey/:items(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/:userslug/trash/items/:items'
	},
	{ 	from: 	 `/:userslug/items/collectionKey/:collection(${singleIdRe})/itemKey/:items(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/:userslug/collections/:collection/items/:items'
	},  //@NOTE: Canonical url redirect return collectionKey and itemKey swapped around:
	{ 	from: 	 `/:userslug/items/itemKey/:items(${singleIdRe})/collectionKey/:collection(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/:userslug/collections/:collection/items/:items'
	},
	{	from: 	 '/:userslug/items/collectionKey/trash/q/:search',
		to: 	 '/:userslug/trash/search/:search'
	},
	{	from: 	 '/:userslug/items/collectionKey/trash/:optional?/:mode?',
		to: 	 '/:userslug/trash'
	},
	{	from: 	 `/:userslug/items/collectionKey/:collection(${singleIdRe})/q/:search/:optional?/:mode?`,
		to: 	 '/:userslug/collections/:collection/search/:search'
	},
	{	from: 	 `/:userslug/items/collectionKey/:collection(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/:userslug/collections/:collection'
	},
	{ 	from: 	 '/:userslug/items/action/newItem/collectionKey/trash/:optional?/:mode?',
		to: 	 '/:userslug/trash'
	},
	{ 	from: 	 `/:userslug/items/action/newItem/collectionKey/:collection(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/:userslug/collections/:collection'
	},
	{ 	from: 	 '/:userslug/items/itemKey/trash/:optional?/:mode?',
		to: 	 '/:userslug/trash'
	},
	{ 	from: 	 '/:userslug/items/itemKey/publications/:optional?/:mode?',
		to: 	 '/:userslug/publications'
	},
	{ 	from: 	 `/:userslug/items/itemKey/:items(${singleIdRe})/:optional?/:mode?`,
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

	{ 	from: 	 `/groups/:groupid/:groupslug/items/collectionKey/trash/itemKey/:items(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/groups/:groupid/:groupslug/trash/items/:items'
	},
	{ 	from: 	 `/groups/:groupid/:groupslug/items/collectionKey/:collection(${singleIdRe})/itemKey/:items(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/groups/:groupid/:groupslug/collections/:collection/items/:items'
	},  //@NOTE: Canonical url redirect return collectionKey and itemKey swapped around:
	{ 	from: 	 `/groups/:groupid/:groupslug/items/itemKey/:items(${singleIdRe})/collectionKey/:collection(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/groups/:groupid/:groupslug/collections/:collection/items/:items'
	},
	{	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/trash/q/:search',
		to: 	 '/groups/:groupid/:groupslug/trash/search/:search'
	},
	{	from: 	 '/groups/:groupid/:groupslug/items/collectionKey/trash/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/trash'
	},
	{	from: 	 `/groups/:groupid/:groupslug/items/collectionKey/:collection(${singleIdRe})/q/:search/:optional?/:mode?`,
		to: 	 '/groups/:groupid/:groupslug/collections/:collection/search/:search'
	},
	{	from: 	 `/groups/:groupid/:groupslug/items/collectionKey/:collection(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/groups/:groupid/:groupslug/collections/:collection'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/action/newItem/collectionKey/trash/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/trash'
	},
	{ 	from: 	 `/groups/:groupid/:groupslug/items/action/newItem/collectionKey/:collection(${singleIdRe})/:optional?/:mode?`,
		to: 	 '/groups/:groupid/:groupslug/collections/:collection'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/itemKey/trash/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/trash'
	},
	{ 	from: 	 '/groups/:groupid/:groupslug/items/itemKey/publications/:optional?/:mode?',
		to: 	 '/groups/:groupid/:groupslug/publications'
	},
	{ 	from: 	 `/groups/:groupid/:groupslug/items/itemKey/:items(${singleIdRe})/:optional?/:mode?`,
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
