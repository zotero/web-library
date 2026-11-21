import { BEGIN_STATUS, END_STATUS } from '../constants/actions';
import { pick } from 'web-common/utils';

// Short background activities shown by the status indicator in the items toolbar
const status = (state = [], action) => {
	if(action.type === BEGIN_STATUS) {
		return [...state, pick(action, ['id', 'kind', 'data'])];
	} else if(action.type === END_STATUS) {
		return state.filter(entry => entry.id !== action.id);
	}
	return state;
};

export default status;
