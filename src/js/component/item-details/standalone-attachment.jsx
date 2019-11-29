import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { TabPane } from '../ui/tabs';
import AttachmentDetails from './attachment-details';

const StandaloneAttachmentTabPane = ({ isActive }) => {
	const itemKey = useSelector(state => state.current.itemKey);
	return (
		<TabPane className="standalone-attachment" isActive={ isActive } >
			<AttachmentDetails attachmentKey={ itemKey } />
		</TabPane>
	);
}

StandaloneAttachmentTabPane.propTypes = {
	isActive: PropTypes.bool,
}

export default StandaloneAttachmentTabPane;
