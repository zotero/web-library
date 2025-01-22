import { BEGIN_ONGOING, CLEAR_ONGOING, COMPLETE_ONGOING, UPDATE_ONGOING } from '../constants/actions';
import { pick } from 'web-common/utils';


const ongoing = (state = [], action) => {
	if(action.type === BEGIN_ONGOING) {
		return [
			...state.filter(p => !p.completed), // remove completed processes when adding a new one
			{ completed: false, ...pick(action, ['id', 'kind', 'data', 'skipUI']) }
		];
	} else if(action.type === UPDATE_ONGOING) {
		return state.map(p => p.id === action.id ? { ...p, ...pick(action, ['kind', 'skipUI']), data: { ...p.data, ...action.data } } : p);
	} else if(action.type === COMPLETE_ONGOING) {
		return state.map(p => p.id === action.id ? { ...p, completed: true, data: { ...p.data, ...action.data } } : p);
	} else if(action.type === CLEAR_ONGOING) {
		return state.filter(p => p.id !== action.id);
	}
	return state;
};

export default ongoing;
