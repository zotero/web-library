'use strict';

import React from 'react';
import cx from 'classnames';
import ItemBox from '../../box';
import Abstract from '../../abstract';
import Spinner from '../../../ui/spinner';
import { getBaseMappedValue } from '../../../../common/item';

class InfoTabPane extends React.PureComponent {
	render() {
		const { isActive, isEditing, isLoadingMeta, item } = this.props;
		const title = getBaseMappedValue(item, 'title') || '';

		return (
			<div className={ cx({
				'tab-pane': true,
				'info': true,
				'active': isActive,
				'loading': isLoadingMeta
			}) }>
				{
					isLoadingMeta ? <Spinner /> : (
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
									{ ...this.props }
									hiddenFields={ [ 'abstractNote' ] }
								/>
							</div>
							<div className="col">
								<section className={ cx({
									'empty-abstract': !item.abstractNote,
									abstract: true,
									editing: isEditing,
								}) }>
									<h6 className="h2 abstract-heading">
										Abstract
									</h6>
									<div className="abstract-body">
										<Abstract { ...this.props } />
									</div>
								</section>
							</div>
						</div>
					)
				}
			</div>
		);
	}
}

export default InfoTabPane;
