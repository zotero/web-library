import cx from 'classnames';
import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState, createRef } from 'react';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';
import { omit } from 'web-common/utils';

import CreatorField from './creator-field';
import { enumerateObjects, splice } from '../../utils';
import { useEditMode } from '../../hooks';

const Creators = props => {
	const { onSave, name, value = [], isForm, itemType, isReadOnly } = props;
	const creatorTypeOptions = useSelector(state => state.meta.itemTypeCreatorTypeOptions[itemType]);
	const virtualCreators = useMemo(() => [{
		id: 0,
		creatorType: creatorTypeOptions?.[0]?.value ?? '',
		firstName: '',
		lastName: '',
		[Symbol.for('isVirtual')]: true
	}], [creatorTypeOptions]);

	const [creators, setCreators] = useState(
		value.length ? enumerateObjects(value) : virtualCreators
	);

	const hasVirtual = useMemo(() => !!creators.find(creator => creator[Symbol.for('isVirtual')]), [creators]);
	const openOnNextRender = useRef(null);
	const fields = useRef({});
	const focusOnNext = useRef(null);
	const animateAppearOnNextRender = useRef(null);
	const prevValue = usePrevious(value);
	const prevCreators = usePrevious(creators);
	const prevItemType = usePrevious(itemType);
	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const [isEditing, ] = useEditMode();

	const handleSaveCreators = useCallback((creators) => {
		const newValue = creators
			.filter(creator => !creator[Symbol.for('isVirtual')]
				&& (creator.lastName || creator.firstName || creator.name)
			).map(creator => omit(creator, 'id'));

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
			handleSaveCreators(virtualCreators);
		}
	}, [creators, handleSaveCreators, virtualCreators]);

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

	const handleAddMany = useCallback((additionalCreators, index) => {
		const newCreators = [ ...creators ];
		newCreators.splice(index, 1, ...additionalCreators);

		animateAppearOnNextRender.current = Array.from(
			{ length: additionalCreators.length }, (_, i) => i + index
		);

		setCreators(enumerateObjects(newCreators));
		handleSaveCreators(newCreators);
		focusOnNext.current = index + (additionalCreators.length - 1);
	}, [creators, handleSaveCreators]);

	useEffect(() => {
		if(typeof(prevValue) !== 'undefined' && !deepEqual(value, prevValue)) {
			setCreators(value.length ? enumerateObjects(value) : virtualCreators)
		}
	}, [value, virtualCreators, prevValue]);

	useEffect(() => {
		if (typeof (prevItemType) !== 'undefined' && prevItemType !== itemType) {
			const validCreatorTypes = creatorTypeOptions.map(ct => ct.value);
			setCreators(enumerateObjects(creators.map(creator => ({
				...creator,
				creatorType: validCreatorTypes.includes(creator.creatorType) ? creator.creatorType : validCreatorTypes[0]
			}))));
		}
	}, [creatorTypeOptions, creators, itemType, prevItemType]);

	useEffect(() => {
		if(creators && prevCreators && creators.length > prevCreators.length) {
			const virtualEntryIndex = creators.findIndex(c => c[Symbol.for('isVirtual')]);
			if(virtualEntryIndex > -1) {
				fields.current[virtualEntryIndex].current.focus();
			}
		}

		if(focusOnNext.current !== null) {
			fields.current[focusOnNext.current].current.focus();
			focusOnNext.current = null;
		}
	}, [creators, prevCreators]);


	// reset openOnNextRender on every render
	var openOnThisRender = null;
	if(openOnNextRender.current) {
		openOnThisRender = openOnNextRender.current;
		openOnNextRender.current = 	null;
	}

	var animateThisRender = [];
	if(animateAppearOnNextRender.current !== null) {
		animateThisRender = [...animateAppearOnNextRender.current];
		animateAppearOnNextRender.current = null;
	}

	if (!creatorTypeOptions || !creatorTypeOptions.length) {
		return null;
	}

	return (
        <Fragment>
			{ creators.map((creator, index) => {
				let creatorFieldRef = createRef(null);
				fields.current[index] = creatorFieldRef;
				return (
				<CSSTransition
					key={ creator.id }
					classNames="color"
					in={ animateThisRender.includes(index) }
					timeout={ 600 }
					nodeRef={ creatorFieldRef }
				>
					<CreatorField
						className={ cx({
							'touch-separated': hasVirtual && isEditing && index === creators.length - 1,
						}) }
						creator={ creator }
						creatorsCount={ creators.length }
						creatorTypes={ creatorTypeOptions }
						index={ index }
						isCreateAllowed={ !hasVirtual }
						isDeleteAllowed={ !hasVirtual || creators.length > 1 }
						isForm={ isForm }
						isReadOnly={ isReadOnly }
						isSingle={ creators.length === 1 }
						isVirtual={ creator[Symbol.for('isVirtual')] || false }
						name={ name }
						onChange={ handleValueChanged }
						onCreatorAdd={ handleCreatorAdd }
						onCreatorRemove={ handleCreatorRemove }
						onCreatorTypeSwitch={ handleCreatorTypeSwitch }
						onAddMany={ handleAddMany }
						onReorder={ handleReorder }
						onReorderCancel={ handleReorderCancel }
						onReorderCommit={ handleReorderCommit }
						ref={ creatorFieldRef }
						shouldPreOpenModal={ openOnThisRender === index }
					/>
				</CSSTransition>
			)})}
			{ shouldUseEditMode && isEditing && !hasVirtual && (
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
		</Fragment>
    );
}

Creators.propTypes = {
	isForm: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	itemType: PropTypes.string.isRequired,
	name: PropTypes.string,
	onSave: PropTypes.func,
	value: PropTypes.array,
};

export default memo(Creators);
