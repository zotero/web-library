import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { TabPane } from '../ui/tabs';
import AttachmentDetails from './attachment-details';
import { sourceFile } from '../../actions';

const StandaloneAttachmentTabPane = ({ isActive, isReadOnly }) => {
	const dispatch = useDispatch();
	const device = useSelector(state => state.device, shallowEqual);
	const itemKey = useSelector(state => state.current.itemKey);
	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const isTinymceFetched = useSelector(state => state.sources.fetched.includes('tinymce'));

	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			dispatch(sourceFile('tinymce'));
		}
	}, []);

	return (
		<TabPane
			className="standalone-attachment"
			isActive={ isActive }
			isLoading={ device.shouldUseTabs && !isTinymceFetched }
		>
			<AttachmentDetails
				attachmentKey={ itemKey }
				isReadOnly={ isReadOnly }
			/>
		</TabPane>
	);
}

StandaloneAttachmentTabPane.propTypes = {
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
}

export default StandaloneAttachmentTabPane;
