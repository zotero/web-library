import { RECEIVE_GROUPS } from '../constants/actions';
import { populateGroups } from '../common/reducers'

const version = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_GROUPS:
			return populateGroups(state, action.groups, action);
		default:
			return state;
	}
};

export default version;
