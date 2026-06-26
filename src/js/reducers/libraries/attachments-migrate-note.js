import {
	REQUEST_MIGRATE_ATTACHMENT_NOTE, RECEIVE_MIGRATE_ATTACHMENT_NOTE, ERROR_MIGRATE_ATTACHMENT_NOTE
} from '../../constants/actions';

const attachmentsMigrateNote = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_MIGRATE_ATTACHMENT_NOTE:
			return {
				...state,
				[action.attachmentKey]: {
					isMigrating: true,
				}
			}
		case RECEIVE_MIGRATE_ATTACHMENT_NOTE:
		case ERROR_MIGRATE_ATTACHMENT_NOTE:
			return {
				...state,
				[action.attachmentKey]: {
					...(state[action.attachmentKey] || {}),
					isMigrating: false,
				}
			}
		default:
			return state;
	}
};

export default attachmentsMigrateNote;
