import {
	INVALIDATE_META_CACHE,
	RECEIVE_SCHEMA,
    RECEIVE_ITEM_TEMPLATE,
} from '../constants/actions.js';

const itemTemplates = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_ITEM_TEMPLATE:
			return {
				...state,
				[action.itemType]: action.template
			};
		default:
			return state;
	}
};

const defaultState = {
	itemTypes: [],
	itemFields: [],
	itemTypeCreatorTypes: {},
	itemTypeFields: {},
	itemTemplates: {},
	invalidated: false,
	isUsingEmbeddedSchema: null,
}

// TODO: localization
const locale = 'en-US';
const ignoredItemTypes = ['note', 'attachment', 'annotation'];

const meta = (state = { ...defaultState }, action) => {
	switch(action.type) {
		case RECEIVE_SCHEMA:
			return {
				...state,
				isUsingEmbeddedSchema: !!action?.embedded,
				itemTypes: action.schema.itemTypes
					.filter(({ itemType }) => !ignoredItemTypes.includes(itemType))
					.map(({ itemType }) => ({
						itemType, localized: action.schema.locales?.[locale]?.itemTypes?.[itemType] ?? itemType
				})),
				itemTypeFields: action.schema.itemTypes.reduce((acc, { itemType, fields }) => {
					acc[itemType] = fields.map(({ field }) => ({
						field, localized: action.schema.locales?.[locale]?.fields?.[field] ?? field
					}));
					return acc;
				}, {}),
				itemTypeCreatorTypes: action.schema.itemTypes.reduce((acc, { itemType, creatorTypes }) => {
					acc[itemType] = creatorTypes.map(({ creatorType, primary }) => ({
						creatorType, localized: action.schema.locales?.[locale]?.creatorTypes?.[creatorType] ?? creatorType, primary
					}));
					return acc;
				}, {}),
				itemFields: action.schema.locales?.[locale]?.fields ?
					Object.entries(action.schema.locales[locale].fields).map(([field, localized]) => ({ field, localized })) :
					[],
				mappings: action.schema.itemTypes.reduce((acc, data) => {
					const itemTypeMappings = data.fields.reduce((fieldsAcc, fieldData) => {
						if ('baseField' in fieldData) {
							fieldsAcc[fieldData.baseField] = fieldData.field;
						}
						return fieldsAcc;
					}, {});
					if (Object.keys(itemTypeMappings).length > 0) {
						acc[data.itemType] = itemTypeMappings
					}
					return acc;
				}, {})
			}
		case RECEIVE_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: itemTemplates(state.itemTemplates, action)
			}
		case INVALIDATE_META_CACHE:
			return {
				...defaultState,
				invalidated: true
			}
	}

	return state;
};

export default meta;
