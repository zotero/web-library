import cx from 'classnames';
import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import Button from '../ui/button';
import CreatorField from './creator-field';
import Icon from '../ui/icon';
import { enumerateObjects } from '../../utils';
import { removeKeys } from '../../common/immutable';
import { splice } from '../../utils';
import { useEditMode, usePrevious } from '../../hooks';

const Creators = props => {
	const { creatorTypes, onSave, name, value, isForm, onDragStatusChange, isReadOnly } = props;

	const getNewCreator = useCallback(() => {
		return {
			creatorType: creatorTypes[0].value,
			firstName: '',
			lastName: '',
			[Symbol.for('isVirtual')]: true
		};
	}, [creatorTypes]);

	const [creators, setCreators] = useState(
		enumerateObjects(value.length ? value : [getNewCreator()])
	);

	const openOnNextRender = useRef(null);
	const fields = useRef({});
	const prevValue = usePrevious(value);
	const prevCreators = usePrevious(creators);
	const prevCreatorTypes = usePrevious(creatorTypes);
	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const shouldUseModalCreatorField = useSelector(state => state.device.shouldUseModalCreatorField);
	const [isEditing, ] = useEditMode();

	const getHasVirtual = useCallback(() => {
		return !!creators.find(creator => creator[Symbol.for('isVirtual')]);
	}, [creators]);

	const handleSaveCreators = useCallback((creators) => {
		const newValue = creators
			.filter(creator => !creator[Symbol.for('isVirtual')]
				&& (creator.lastName || creator.firstName || creator.name)
			).map(creator => removeKeys(creator, 'id'));

		const hasChanged = !deepEqual(newValue, value);
		setCreators(enumerateObjects(creators));
		onSave(newValue, hasChanged);
	}, [onSave, value]);

	const handleValueChanged = useCallback((index, key, value) => {
		const newCreators = [...creators];
		newCreators[index] = {...creators[index], [key]: value };
		if((newCreators[index].lastName || newCreators[index].firstName || newCreators[index].name)
			&& newCreators[index][Symbol.for('isVirtual')]) {
			delete newCreators[index][Symbol.for('isVirtual')];
		}
		handleSaveCreators(newCreators);
	}, [creators, handleSaveCreators]);

	const handleCreatorAdd = useCallback(({ id, creatorType }) => {
		const insertAfterIndex = creators.findIndex(c => c.id === id);
		const newCreator = {
			creatorType,
			firstName: '',
			lastName: '',
			[Symbol.for('isVirtual')]: true
		};

		openOnNextRender.current = insertAfterIndex + 1;
		setCreators(
			enumerateObjects([
				...creators.slice(0, insertAfterIndex + 1),
				newCreator,
				...creators.slice(insertAfterIndex + 1, creators.length),
			])
		);
	}, [creators]);

	const handleCreatorAppend = useCallback(() => {
		const { id, creatorType } = creators[creators.length - 1];
		handleCreatorAdd({ id, creatorType });
	}, [creators, handleCreatorAdd]);

	const handleCreatorRemove = useCallback(index => {
		if(creators.length > 1) {
			handleSaveCreators(splice(creators, index, 1));
		} else {
			handleSaveCreators([getNewCreator()]);
		}
	}, [creators, getNewCreator, handleSaveCreators]);

	const handleCreatorTypeSwitch = useCallback(index => {
		const newCreators = [...creators];

		if('name' in newCreators[index]) {
			let creator = newCreators[index].name.split(' ');
			newCreators[index] = {
				lastName: creator.length > 0 ? creator[creator.length - 1] : '',
				firstName: creator.slice(0, creator.length - 1).join(' '),
				creatorType: newCreators[index].creatorType,
				[Symbol.for('isVirtual')]: creators[index][Symbol.for('isVirtual')]
			};
		} else if('lastName' in newCreators[index]) {
			newCreators[index] = {
				name: `${newCreators[index].firstName} ${newCreators[index].lastName}`.trim(),
				creatorType: newCreators[index].creatorType,
				[Symbol.for('isVirtual')]: newCreators[index][Symbol.for('isVirtual')]
			};
		}

		handleSaveCreators(newCreators);
	}, [creators, handleSaveCreators]);

	const handleReorder = useCallback((fromIndex, toIndex, commit = false) => {
		const newCreators = [ ...creators ];
		newCreators.splice(toIndex, 0, newCreators.splice(fromIndex, 1)[0]);
		setCreators(newCreators);
		if(commit) {
			handleSaveCreators(newCreators);
		}
	}, [creators, handleSaveCreators]);

	const handleReorderCommit = useCallback(() => {
		handleSaveCreators(creators);
	}, [creators, handleSaveCreators]);

	const handleReorderCancel = useCallback(() => {
		setCreators(enumerateObjects(value));
	}, [value]);

	useEffect(() => {
		if(!deepEqual(value, prevValue)) {
			setCreators(enumerateObjects(value.length ? value : [getNewCreator()]))
		}
	}, [getNewCreator, value, prevValue]);

	useEffect(() => {
		if(!deepEqual(creatorTypes, prevCreatorTypes)) {
			const validCreatorTypes = creatorTypes.map(ct => ct.value);
			setCreators(enumerateObjects(creators.map(creator => ({
				...creator,
				creatorType: validCreatorTypes.includes(creator.creatorType) ? creator.creatorType : validCreatorTypes[0]
			}))));
		}
	}, [creators, creatorTypes, prevCreatorTypes]);

	useEffect(() => {
		if(creators && prevCreators && creators.length > prevCreators.length) {
			const virtualEntryIndex = creators.findIndex(c => c[Symbol.for('isVirtual')]);
			if(virtualEntryIndex > -1) {
				fields.current[virtualEntryIndex].focus();
			}
		}
	}, [creators, prevCreators]);


	// reset openOnNextRender on every render
	var openOnThisRender = null;
	if(openOnNextRender.current) {
		openOnThisRender = openOnNextRender.current;
		openOnNextRender.current = 	null;
	}

	return (
		<React.Fragment>
			{ creators.map((creator, index) => <CreatorField
				className={ cx({ 'touch-separated': getHasVirtual() && isEditing && index === creators.length - 1 }) }
				creator={ creator }
				creatorsCount={ creators.length }
				creatorTypes={ creatorTypes }
				device={ { shouldUseEditMode, shouldUseModalCreatorField } } //@TODO: convert to use selector
				index={ index }
				isCreateAllowed={ !getHasVirtual() }
				isDeleteAllowed={ !getHasVirtual() || creators.length > 1 }
				isEditing={ isEditing }
				isForm={ isForm }
				isReadOnly={ isReadOnly }
				isSingle={ creators.length === 1 }
				isVirtual={ creator[Symbol.for('isVirtual')] || false }
				key={ creator.id }
				name={ name }
				onChange={ handleValueChanged }
				onCreatorAdd={ handleCreatorAdd }
				onCreatorRemove={ handleCreatorRemove }
				onCreatorTypeSwitch={ handleCreatorTypeSwitch }
				onDragStatusChange={ onDragStatusChange }
				onReorder={ handleReorder }
				onReorderCancel={ handleReorderCancel }
				onReorderCommit={ handleReorderCommit }
				ref={ ref => fields.current[index] = ref }
				shouldPreOpenModal={ openOnThisRender === index }
			/> )}
			{ shouldUseEditMode && isEditing && !getHasVirtual() && (
				<li className="metadata touch-separated has-btn-icon">
					<Button
						icon
						className="btn-plus"
						onClick={ handleCreatorAppend }
					>
						<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
						Add Creator …
					</Button>
				</li>
			) }
		</React.Fragment>
	);
}

Creators.propTypes = {
	creatorTypes: PropTypes.array.isRequired,
	isForm: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	name: PropTypes.string,
	onDragStatusChange: PropTypes.func,
	onSave: PropTypes.func,
	value: PropTypes.array,
}

export default memo(Creators);
