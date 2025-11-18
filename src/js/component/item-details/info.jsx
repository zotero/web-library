import { memo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { TabPane } from 'web-common/components';
import { pick } from 'web-common/utils';

import ItemBox from './box';
import Abstract from './abstract';
import { getBaseMappedValue } from '../../common/item';
import { get } from '../../utils';

const Info = ({ isActive, isReadOnly, id, ...rest }) => {
	const isLibraryReadOnly = useSelector(
		state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly
	);
	const abstractNote = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey, 'abstractNote'])
	);
	const title = useSelector(state =>
		getBaseMappedValue(state?.meta?.mappings, get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey], {}), 'title')
	) ?? '';

	const isEditing = useSelector(
		state => state.current.itemKey && state.current.editingItemKey === state.current.itemKey
	);

	return (
		<TabPane
			id={ id }
			className="info"
			isActive={ isActive }
			isLoading={ false }
			{...pick(rest, p => p === 'role' || p.startsWith('data-') || p.startsWith('aria-'))}
		>
			<div className="scroll-container-mouse" tabIndex={-1}>
				<div className="row">
					<div className="col">
						{ !isEditing && (
								<h5 className={ cx(
									'h1','item-title', {
										placeholder: title.length === 0
									}
								)}>
									{ title.length === 0 ? 'Untitled' : title }
								</h5>
							)
						}
						<ItemBox
							isActive={ isActive }
							isReadOnly={ isReadOnly }
							hiddenFields={ [ 'abstractNote' ] }
						/>
					</div>
					{ (!isLibraryReadOnly || abstractNote) && (
						<div className="col">
							<section className={ cx({
								'empty-abstract': !abstractNote,
								abstract: true,
								editing: isEditing,
							}) }>
								<h6 id="label-abstract" className="h2 abstract-heading">
									Abstract
								</h6>
								<div className="abstract-body">
									<Abstract
										aria-labelledby="label-abstract"
										isReadOnly={ isReadOnly }
									/>
								</div>
							</section>
						</div>
					) }
				</div>
			</div>
		</TabPane>
	);
}

Info.propTypes = {
	id: PropTypes.string,
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
}

export default memo(Info);

