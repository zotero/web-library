import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { TabPane } from 'web-common/components';

import AttachmentDetails from './attachment-details';

const StandaloneAttachmentTabPane = ({ id, isActive, isReadOnly }) => {
	const itemKey = useSelector(state => state.current.itemKey);

	return (
		<TabPane
			id={ id }
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
