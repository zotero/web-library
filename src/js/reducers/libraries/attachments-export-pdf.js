import { mapObject, omit } from 'web-common/utils';
import {
	REQUEST_EXPORT_PDF, RECEIVE_EXPORT_PDF, ERROR_EXPORT_PDF
} from '../../constants/actions';


// To keep memory usage sane, when user requests a new pdf with annotations, we remove anything that
// has been downloaded and prepped older than 60 seconds
const keepTime = 60 * 1000;

const cleanOldBlobs = state => mapObject(state, (k, v) => {
	if (v.blobURL && Date.now() - v.timestamp > keepTime) {
		URL.revokeObjectURL(v.blobURL);
		return [k, omit(v, ['blobURL', 'fileName', 'timestamp'])];
	}
	return [k, v];
});

const attachmentsExportPDF = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_EXPORT_PDF:
			return {
				...cleanOldBlobs(state),
				[action.itemKey]: {
					isFetching: true,
				}
			}
		case RECEIVE_EXPORT_PDF:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					isFetching: false,
					fileName: action.fileName,
					timestamp: Date.now(),
					blobURL: URL.createObjectURL(action.blob)
				}
			}
		case ERROR_EXPORT_PDF:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					isFetching: false,
				}
			}
		default:
			return state;
	}
};

export default attachmentsExportPDF;
