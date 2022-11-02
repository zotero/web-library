import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { TabPane } from '../ui/tabs';
import AttachmentDetails from './attachment-details';

const StandaloneAttachmentTabPane = ({ isActive, isReadOnly }) => {
	const itemKey = useSelector(state => state.current.itemKey);

	return (
		<TabPane
			className="standalone-attachment"
			isActive={ isActive }
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
