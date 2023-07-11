import { BEGIN_ONGOING, COMPLETE_ONGOING } from '../constants/actions';
import { pick } from 'web-common/utils';


const ongoing = (state = [], action) => {
	if(action.type === BEGIN_ONGOING) {
		return [
			...state,
			pick(action, ['id', 'kind', 'count'])
		];
	} else if(action.type === COMPLETE_ONGOING) {
		return state.filter(p => p.id !== action.id);
	}
	return state;
};

export default ongoing;
