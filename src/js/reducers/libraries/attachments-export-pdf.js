import {
	REQUEST_EXPORT_PDF, RECEIVE_EXPORT_PDF, ERROR_EXPORT_PDF
} from '../../constants/actions';

const attachmentsExportPDF = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_EXPORT_PDF:
			return {
				...state,
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
