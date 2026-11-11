import { useSelector } from 'react-redux';
import { TabPane } from 'web-common/components';
import { pick } from 'web-common/utils';

import AttachmentDetails from './attachment-details';

const StandaloneAttachmentTabPane = ({ asSections, id, isActive, isReadOnly, ...rest }) => {
	const itemKey = useSelector(state => state.current.itemKey);

	return (
		<TabPane
			asSections={ asSections }
			id={ id }
			className="standalone-attachment"
			isActive={ isActive }
			{...pick(rest, p => p === 'role' || p.startsWith('data-') || p.startsWith('aria-'))}
		>
			<AttachmentDetails
				attachmentKey={ itemKey }
				isReadOnly={ isReadOnly }
			/>
		</TabPane>
	);
}

export default StandaloneAttachmentTabPane;
