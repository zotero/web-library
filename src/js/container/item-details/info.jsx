import React from 'react';
import { connect } from 'react-redux';

import Info from '../../component/item-details/info';
import { get } from '../../utils';

const InfoContainer = props => <Info { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], {});

	return { item };
}

export default connect(mapStateToProps)(InfoContainer)
