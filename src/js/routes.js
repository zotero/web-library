const singleId = '[a-zA-Z0-9]{8}';
const multipleId = '(?:[a-zA-Z0-9]{8},?)+';
const any = '[^/]+';
const anyOrEmpty = '[^/]*';

const tags = `tags/(?<tags>${any})`;
const search = `search/(?<search>${any})/(?<qmode>titleCreatorYear|everything)`;
const items = `items/(?<items>${multipleId})`;
const note = `note/(?<note>${any})`;
const attachment = `attachment/(?<attachment>${singleId})`;
const view = `(?<view>library|collection|item-list|item-details|reader)`;
const location = `(?<locationType>pageNumber|annotationID|position|href)/(?<locationValue>${any})`;

const group = `/groups/(?<groupid>${any})/(?<groupslug>${anyOrEmpty})`;
const user = `/(?<userslug>${any})`;
const source = `(?<source>collections|trash|publications)`;
const collection = `(?<collection>${singleId})`;


export let routeRegexp;
try {
	routeRegexp = new RegExp(`^(${group}|${user})(/${source})?((?<=collections)(/${collection}))?(/${tags})?(/${search})?(/${items})?((?<=items/(?:${singleId}))(/${note}|/${attachment}))?(/${view})?(/${location})?/?$`);
} catch {
	// Fallback for Safari <16 where lookbehind is not supported, this means that some invalid paths, like /trash/collections/:collection, won't be redirected but the app should still work
	routeRegexp = new RegExp(`^(${group}|${user})(/${source})?(/${collection})?(/${tags})?(/${search})?(/${items})?(/${note}|/${attachment})?(/${view})?(/${location})?/?$`);
	console.warn('Using legacy regular expression for route matching due to lack of lookbehind support.');
}

export const redirectRegexes = [
	{
		pattern: new RegExp(`^/([^/]+)/items/collectionKey/trash/itemKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/trash/items/$2',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/collectionKey/(${singleId})/itemKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/collections/$2/items/$3',
	},
	{ // canonical swap
		pattern: new RegExp(`^/([^/]+)/items/itemKey/(${singleId})/collectionKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/collections/$3/items/$2',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/collectionKey/trash/q/([^/]+)$`),
		replace: '/$1/trash/search/$2',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/collectionKey/trash(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/trash',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/collectionKey/(${singleId})/q/([^/]+)(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/collections/$2/search/$3',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/collectionKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/collections/$2',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/action/newItem/collectionKey/trash(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/trash',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/action/newItem/collectionKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/collections/$2',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/itemKey/trash(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/trash',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/itemKey/publications(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/publications',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/itemKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/items/$2',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/action/newItem(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/$1/library',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items/q/([^/]+)$`),
		replace: '/$1/search/$2',
	},
	{
		pattern: new RegExp(`^/([^/]+)/items$`),
		replace: '/$1/library',
	},

	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/collectionKey/trash/itemKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/trash/items/$3',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/collectionKey/(${singleId})/itemKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/collections/$3/items/$4',
	},
	{ // canonical swap
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/itemKey/(${singleId})/collectionKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/collections/$4/items/$3',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/collectionKey/trash/q/([^/]+)$`),
		replace: '/groups/$1/$2/trash/search/$3',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/collectionKey/trash(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/trash',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/collectionKey/(${singleId})/q/([^/]+)(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/collections/$3/search/$4',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/collectionKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/collections/$3',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/action/newItem/collectionKey/trash(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/trash',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/action/newItem/collectionKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/collections/$3',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/itemKey/trash(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/trash',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/itemKey/publications(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/publications',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/itemKey/(${singleId})(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/items/$3',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/action/newItem(?:/([^/]+))?(?:/([^/]+))?$`),
		replace: '/groups/$1/$2/library',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items/q/([^/]+)$`),
		replace: '/groups/$1/$2/search/$3',
	},
	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)/items$`),
		replace: '/groups/$1/$2/library',
	},

	{
		pattern: new RegExp(`^/groups/([^/]+)/([^/]+)$`),
		replace: '/groups/$1/$2/library',
	},
];
