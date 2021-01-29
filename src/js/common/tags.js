import { deduplicate } from '../utils';

const TOGGLE_TOGGLE = 0;
const TOGGLE_ADD = 1;
const TOGGLE_REMOVE = 2;

const getToggledTags = (existingTags, tagsToToggle, toggleAction) => {

	if(toggleAction === TOGGLE_ADD) {
		return deduplicate([...existingTags, ...tagsToToggle]);
	}

	if(toggleAction === TOGGLE_REMOVE) {
		return existingTags.filter(t => !tagsToToggle.includes(t));
	}

	let newTags = [...existingTags];

	tagsToToggle.forEach(tagToToggle => {
		if(newTags.includes(tagToToggle)) {
			newTags = newTags.filter(t => t !== tagToToggle);
		} else {
			newTags.push(tagToToggle);
		}
	});

	return deduplicate(newTags);
}

export {
	getToggledTags,
	TOGGLE_ADD,
	TOGGLE_REMOVE,
	TOGGLE_TOGGLE,
};
