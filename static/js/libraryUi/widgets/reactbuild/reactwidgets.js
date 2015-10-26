"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Zotero.ui.widgets.reactitem = {};
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.reactitem.init = function (el) {
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(ItemDetails, { library: library }), document.getElementById('item-widget-div'));
	Zotero.ui.widgets.reactitem.reactInstance = reactInstance;

	library.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.reactitem.loadItem, { widgetEl: el });
	library.listen("itemTypeChanged", Zotero.ui.widgets.reactitem.itemTypeChanged, { widgetEl: el });
	library.listen("uploadSuccessful", Zotero.ui.widgets.reactitem.refreshChildren, { widgetEl: el });

	library.listen("addTag", Zotero.ui.widgets.reactitem.addTag, { widgetEl: el });
	library.listen("removeTag", Zotero.ui.widgets.reactitem.removeTag, { widgetEl: el });

	library.listen("addCreator", Zotero.ui.widgets.reactitem.addCreator, { widgetEl: el });
	library.listen("removeCreator", Zotero.ui.widgets.reactitem.removeCreator, { widgetEl: el });

	library.listen("switchCreatorFields", Zotero.ui.widgets.reactitem.switchCreatorFields, { widgetEl: el });

	library.listen("addNote", Zotero.ui.widgets.reactitem.addNote, { widgetEl: el });
	library.listen("tagsChanged", Zotero.ui.widgets.reactitem.updateTypeahead, { widgetEl: el });

	library.listen("showChildren", Zotero.ui.widgets.reactitem.refreshChildren, { widgetEl: el });

	library.listen("edit-item-field edit-creator-field", Zotero.ui.widgets.reactitem.clickToEdit, { widgetEl: el });
	library.listen("edit-item-tag", Zotero.ui.widgets.reactitem.clickToEdit, { widgetEl: el });

	//watch buttons on item field from widget DOM element
	var container = J(el);

	Zotero.state.bindTagLinks(container);
	Zotero.state.bindItemLinks(container);

	//add a new tag when user presses enter in add-tag-input
	container.on('keydown', "input#add-tag-input", function (e) {
		Z.debug("add-tag-input keydown");
		e.stopImmediatePropagation();
		if (e.keyCode === Zotero.ui.keyCode.ENTER) {
			var input = J(this);
			var itemKey = input.data('itemkey');
			var item = library.items.getItem(itemKey);
			var newTagString = input.val();
			var itemTags = item.get('tags');
			itemTags.push({ tag: newTagString });
			Zotero.ui.saveItem(item);
			container.find("div.item-tags-list").append(J("#taglistitemTemplate").render({ tag: newTagString }, {
				item: item,
				key: "tag",
				value: newTagString,
				itemKey: itemKey,
				libraryString: library.libraryString,
				tagIndex: itemTags.length - 1
			}));
			container.find('span.tag-count').html(itemTags.length);
			input.val('');
			Zotero.eventful.initTriggers(container);
		}
	});

	//blur field when user presses enter in item field input to trigger save
	/*
 container.on('keydown', ".item-field-control", function(e){
 	return;
 	e.stopImmediatePropagation();
 	if (e.keyCode === Zotero.ui.keyCode.ENTER){
 		J(this).blur();
 	}
 });
 
 container.on('blur', '.item-field-control', function(e){
 	return;
 	Z.debug("blurred");
 	var input = J(this);
 	var itemKey = input.data('itemkey');
 	var item = library.items.getItem(itemKey);
 	var updatedField = input.attr('name');
 	var updatedValue = input.val();
 	var creatorIndex = input.data('creatorindex');
 	var tagIndex = input.data('tagindex');
 	Z.debug(updatedField);
 	Z.debug(updatedValue);
 	var templateData = {
 		item:item,
 		key: updatedField,
 		value: updatedValue,
 		itemKey: itemKey,
 		libraryString: library.libraryString,
 		creatorIndex: creatorIndex,
 		tagIndex: tagIndex,
 	};
 		if(['name', 'firstName', 'lastName', 'creatorType'].indexOf(updatedField) != -1){
 		//creator field
 		input.replaceWith(J("#datafieldspanTemplate").render(templateData));
 		var row = J("tr.creator-row[data-creatorindex='" + creatorIndex + "']");
 		var updatedCreator = Zotero.ui.widgets.reactitem.creatorFromRow(row);
 		Zotero.ui.widgets.reactitem.updateItemCreatorField(library, itemKey, updatedCreator, creatorIndex);
 	} else if(updatedField == 'tag'){
 		var tags = item.get('tags');
 		if(tags[tagIndex]){
 			tags[tagIndex].tag = updatedValue;
 		} else {
 			tags[tagIndex] = {tag:updatedValue};
 		}
 		
 		Zotero.ui.saveItem(item);
 		input.typeahead('destroy');
 		input.replaceWith(J("#datafieldspanTemplate").render(templateData));
 	}
 	else {
 		Zotero.ui.widgets.reactitem.updateItemField(library, itemKey, updatedField, updatedValue);
 		input.replaceWith(J("#datafieldspanTemplate").render(templateData));
 	}
 		Zotero.eventful.initTriggers(container);
 });
 */
	library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.reactitem.loadItem = function (event) {
	Z.debug('Zotero eventful loadItem', 3);
	var widgetEl = J(event.data.widgetEl);
	var triggeringEl = J(event.triggeringElement);
	var loadingPromise;

	//clean up RTEs before we end up removing their dom elements out from under them
	Zotero.ui.cleanUpRte(widgetEl);

	var library = Zotero.ui.getAssociatedLibrary(widgetEl);

	//get the key of the item we need to display, or display library stats
	var itemKey = Zotero.state.getUrlVar('itemKey');
	if (!itemKey) {
		Z.debug("No itemKey - " + itemKey, 3);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: null });
		return Promise.reject(new Error("No itemkey - " + itemKey));
	}

	//if we are showing an item, load it from local library of API
	//then display it
	var loadedItem = library.items.getItem(itemKey);
	if (loadedItem) {
		Z.debug("have item locally, loading details into ui", 3);
		loadingPromise = Promise.resolve(loadedItem);
	} else {
		Z.debug("must fetch item from server", 3);
		var config = {
			'target': 'item',
			'libraryType': library.type,
			'libraryID': library.libraryID,
			'itemKey': itemKey
		};
		Zotero.ui.widgets.reactitem.reactInstance.setState({ itemLoading: true });

		loadingPromise = library.loadItem(itemKey);
	}
	loadingPromise.then(function (item) {
		loadedItem = item;
	}).then(function () {
		return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
	}).then(function (creatorTypes) {
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: loadedItem, itemLoading: false });
		library.trigger('showChildren');
		Zotero.eventful.initTriggers(widgetEl);
		try {
			//trigger event for Zotero translator detection
			var ev = document.createEvent('HTMLEvents');
			ev.initEvent('ZoteroItemUpdated', true, true);
			document.dispatchEvent(ev);
		} catch (e) {
			Zotero.error("Error triggering ZoteroItemUpdated event");
		}
	});
	loadingPromise["catch"](function (err) {
		Z.error("loadItem promise failed");
		Z.error(err);
	}).then(function () {
		widgetEl.removeData('loadingPromise');
	})["catch"](Zotero.catchPromiseError);

	widgetEl.data('loadingPromise', loadingPromise);
	return loadingPromise;
};

/**
 * Add creator field to item edit form
 * @param {DOM Button} button Add creator button clicked
 */
/*
Zotero.ui.widgets.reactitem.addCreator = function(e){
	Z.debug("widgets.item.addCreator", 3);
	var triggeringElement = J(e.triggeringElement);
	var widgetEl = J(e.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
	var itemKey = triggeringElement.data('itemkey');
	var item = library.items.getItem(itemKey);
	var newCreatorIndex = item.get('creators').length;
	
	widgetEl.find("tr.creator-row").last().after(J("#creatorrowTemplate").render({}, {
		creatorIndex: newCreatorIndex,
		libraryString: library.libraryString,
		item: item,
	}));

	Zotero.eventful.initTriggers(widgetEl);
};
*/
/**
 * Remove a creator from an edit item form
 * @param  {Dom Button} button Remove creator button that was clicked
 * @return {undefined}
 */
/*
Zotero.ui.widgets.reactitem.removeCreator = function(e){
	Z.debug("widgets.item.removeCreator", 3);
	var triggeringElement = J(e.triggeringElement);
	var widgetEl = J(e.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
	var itemKey = triggeringElement.data('itemkey');
	var item = library.items.getItem(itemKey);
	var creatorIndex = triggeringElement.data('creatorindex');
	
	//empty specified creator from item and save
	var creators = item.get('creators');
	creators.splice(creatorIndex, 1);
	Zotero.ui.saveItem(item);

	//re-render creator rows so they are re-indexed
	var oldRows = widgetEl.find("tr.creator-row");
	var oldRowCount = oldRows.length;
	for(var i = 0; i < creators.length; i++){
		widgetEl.find("tr.creator-row").last().after(J("#creatorrowTemplate").render(creators[i], {
			creatorIndex: i,
			libraryString: library.libraryString,
			item: item,
		}));
	}

	oldRows.remove();

	Zotero.eventful.initTriggers(widgetEl);
};
*/
/**
 * Add a note field to an editItem Form
 * @param {Dom Button} button Add note button that was clicked
 */
Zotero.ui.widgets.reactitem.addNote = function (e) {
	Z.debug("Zotero.ui.addNote", 3);
	var button = J(e.currentTarget);
	var container = button.closest("form");
	//var itemKey = J(button).data('itemkey');
	var notenum = 0;
	var lastNoteIndex = container.find("textarea.note-text:last").data('noteindex');
	if (lastNoteIndex) {
		notenum = parseInt(lastNoteIndex, 10);
	}

	var newindex = notenum + 1;
	var newNoteID = "note_" + newindex;
	var jel;
	jel = container.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" class="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
	Zotero.ui.init.rte('default', true, newNoteID);
};

/**
 * Add a tag field to an edit item form
 * @param {bool} focus Whether to focus the newly added tag field
 */
Zotero.ui.widgets.reactitem.addTag = function (e, focus) {
	Z.debug("Zotero.ui.widgets.reactitem.addTag", 3);
	var triggeringElement = J(e.triggeringElement);
	var widgetEl = J(e.data.widgetEl);
	widgetEl.find(".add-tag-form").show().find(".add-tag-input").focus();
	/*
 if(typeof focus == 'undefined'){
 	focus = true;
 }
 var widgetEl = Zotero.ui.parentWidgetEl(e);
 var jel = widgetEl.find("td.tags");
 jel.append( J('#itemtagTemplate').render({'library':library}) );
 
 var library = Zotero.ui.getAssociatedLibrary(widgetEl);
 if(library){
 	Zotero.ui.widgets.reactitem.addTagTypeahead(library, widgetEl);
 		//widgetEl.find("input.taginput").not('.tt-query').typeahead({name: 'tags', local: library.tags.plainList});
 }
 
 if(focus){
 	J("input.taginput").last().focus();
 }
 */
};

/**
 * Remove a tag field from an edit item form
 * @param  {DOM Element} el Tag field to remove
 * @return {undefined}
 */
/*
Zotero.ui.widgets.reactitem.removeTag = function(e) {
	Z.debug("Zotero.ui.removeTag", 3);
	var el = e.triggeringElement;
	var widgetEl = Zotero.ui.parentWidgetEl(el);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	var tagRow = J(el).closest('.item-tag-row');
	var tagSpan = tagRow.find('.editable-item-tag');
	var itemKey = tagSpan.data('itemkey');
	var item = library.items.getItem(itemKey);
	var removeTagString = tagSpan.data('value');
	//remove tag from item tags array
	var newTags = [];
	var oldTags = item.get('tags');
	J.each(oldTags, function(ind, val){
		if(val.tag != removeTagString){
			Z.debug("leaving tag alone:" + val.tag);
			newTags.push(val);
		}
	});

	item.set('tags', newTags);
	Zotero.ui.saveItem(item);
	tagRow.remove();
	//check to make sure there is another tag field available to use
	//if not add an empty one
	if(widgetEl.find("div.edit-tag-div").length === 1){
		Zotero.ui.widgets.reactitem.addTag(e);
	}
};
*/
Zotero.ui.widgets.reactitem.addTagTypeahead = function (library, widgetEl) {
	Z.debug('adding typeahead', 3);
	var typeaheadSource = library.tags.plainList;
	if (!typeaheadSource) {
		typeaheadSource = [];
	}
	var ttEngine = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		local: J.map(typeaheadSource, function (typeaheadSource) {
			return { value: typeaheadSource };
		})
	});
	ttEngine.initialize();
	widgetEl.find("input.taginput").typeahead('destroy');
	widgetEl.find("input.taginput").typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	}, {
		name: 'tags',
		displayKey: 'value',
		source: ttEngine.ttAdapter()
		//local: library.tags.plainList
	});
};

Zotero.ui.widgets.reactitem.addTagTypeaheadToInput = function (library, element) {
	Z.debug('adding typeahead', 3);
	var typeaheadSource = library.tags.plainList;
	if (!typeaheadSource) {
		typeaheadSource = [];
	}
	var ttEngine = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		local: J.map(typeaheadSource, function (typeaheadSource) {
			return { value: typeaheadSource };
		})
	});
	ttEngine.initialize();
	J(element).typeahead('destroy');
	J(element).typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	}, {
		name: 'tags',
		displayKey: 'value',
		source: ttEngine.ttAdapter()
		//local: library.tags.plainList
	});
};

/**
 * Render and display full item details into an element
 * @param  {Zotero_Item} item Zotero Item to display
 * @param  {Dom Element} el   Container
 * @return {undefined}
 */
Zotero.ui.widgets.reactitem.loadItemDetail = function (item, el) {
	Z.debug("Zotero.ui.widgets.reactitem.loadItemDetail", 3);
	var jel = J(el);
	var rteType = "default";
	if (!Zotero.config.librarySettings.allowEdit) {
		rteType = "readonly";
	}
	Zotero.ui.init.rte(rteType);

	jel.data('itemkey', item.apiObj.key);
};

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.widgets.reactitem.refreshChildren = function (e) {
	Z.debug('Zotero.ui.widgets.reactitem.refreshChildren', 3);
	var widgetEl = J(e.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	var itemKey = Zotero.state.getUrlVar('itemKey');
	if (!itemKey) {
		Z.debug("No itemKey - " + itemKey, 3);
		return Promise.reject(new Error("No itemkey - " + itemKey));
	}

	var item = library.items.getItem(itemKey);
	Zotero.ui.widgets.reactitem.reactInstance.setState({ loadingChildren: true });
	var p = item.getChildren(library).then(function (childItems) {
		//var container = childrenPanel;
		Zotero.ui.widgets.reactitem.reactInstance.setState({ childItems: childItems, loadingChildren: false });
		//Zotero.state.bindItemLinks(container);
	})["catch"](Zotero.catchPromiseError);
	return p;
};

//when enter pressed in an item form, add a tag if it's a tag input
//or advance to the next field/button if it's not
Zotero.ui.widgets.reactitem.itemFormKeydown = function (e) {
	if (e.keyCode === Zotero.ui.keyCode.ENTER) {
		Z.debug(e);
		e.preventDefault();
		var triggeringEl = J(this);
		if (triggeringEl.hasClass('taginput')) {
			var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
			if (triggeringEl.hasClass('tt-query')) {
				var val = triggeringEl.val();
				triggeringEl.typeahead('setQuery', val);
				triggeringEl.trigger('blur');
			}
			if (library) {
				library.trigger("addTag");
			}
			return;
		}
		var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
		if (nextEligibleSiblings.length) {
			nextEligibleSiblings.first().focus();
		} else {
			J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
		}
	}
};

Zotero.ui.widgets.reactitem.updateTypeahead = function (event) {
	return;
	Z.debug("updateTypeahead", 3);
	var widgetEl = J(event.data.widgetEl);
	var triggeringEl = J(event.triggeringElement);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	if (library) {
		Zotero.ui.widgets.reactitem.addTagTypeahead(library, widgetEl);
	}
};

//switch an item field to a form input when clicked to edit (and is editable by the user)
/*
Zotero.ui.widgets.reactitem.clickToEdit = function(e){
	return;
	Z.debug("widgets.item.clickToEdit", 3);
	if(!Zotero.config.librarySettings.allowEdit) {
		return false;
	}
	var triggeringElement = J(e.triggeringElement);
	var widgetEl = J(e.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
	var itemField = triggeringElement.data('itemfield');
	var itemKey = triggeringElement.data('itemkey');
	var creatorIndex = triggeringElement.data('creatorindex');
	var tagIndex = triggeringElement.data('tagindex');
	var item = library.items.getItem(itemKey);
	var creators = item.get('creators');
	var fieldValue = "";
	if(creatorIndex !== undefined && creators[creatorIndex]){
		fieldValue = creators[creatorIndex][itemField];
	} else if(itemField == 'tag'){
		fieldValue = triggeringElement.data('value');
	} else {
		fieldValue = item.get(itemField);
	}

	triggeringElement.replaceWith(J("#datafieldTemplate").render({
		creatorTypes: item.creatorTypes[item.get('itemType')],
		key: itemField,
		value: fieldValue,
		itemKey: itemKey,
		creatorIndex: creatorIndex,
		tagIndex: tagIndex,
		library:library,
		item:item,
	}));

	var createdElement = widgetEl.find("[name='" + itemField + "']");
	if(itemField == 'tag'){
		Zotero.ui.widgets.reactitem.addTagTypeaheadToInput(library, createdElement);
	}
	createdElement.focus();
};
*/
/*
Zotero.ui.widgets.reactitem.switchCreatorFields = function(e){
	Z.debug("widgets.item.switchCreatorFields", 3);
	var triggeringElement = J(e.triggeringElement);
	var creatorIndex = triggeringElement.data('creatorindex');
	var rowSelector = "tr.creator-row[data-creatorindex='" + creatorIndex + "']";
	Z.debug(rowSelector);
	var row = J(rowSelector);
	var creator = Zotero.ui.widgets.reactitem.creatorFromRow(row);
	
	var widgetEl = J(e.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(e.data.widgetEl);
	var itemField = triggeringElement.data('itemfield');
	var itemKey = triggeringElement.data('itemkey');
	var item = library.items.getItem(itemKey);
	var updatedField;
	var updatedValue;

	if(creator.name !== undefined){
		var split = creator.name.split(' ');
		if(split.length > 1){
			creator.lastName = split.splice(-1, 1)[0];
			creator.firstName = split.join(' ');
		}
		else{
			creator.lastName = creator.name;
			creator.firstName = '';
		}
		delete creator.name;
	} else {
		if(creator.firstName === "" && creator.lastName === "") {
			creator.name = "";
		} else {
			creator.name = creator.firstName + ' ' + creator.lastName;
		}
		delete creator.firstName;
		delete creator.lastName;
	}

	var creators = item.get('creators');
	creators[creatorIndex] = creator;
	Zotero.ui.saveItem(item);

	row.replaceWith(J("#creatorrowTemplate").render(creator, {
		creatorIndex: creatorIndex,
		libraryString: library.libraryString,
		item: item,
	}));
	Zotero.eventful.initTriggers(widgetEl);
};
*/
/**
 * save an item after a field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
/*
Zotero.ui.widgets.reactitem.updateItemField = function(library, itemKey, updatedField, updatedValue){
	return;
	Z.debug("widgets.item.updateItemField", 3);
	Z.debug("itemKey: " + itemKey, 3);
	if(!itemKey){
		throw new Error("Expected widget element to have itemKey data");
	}
	
	var item = library.items.getItem(itemKey);
	if(item.get(updatedField) != updatedValue){
		item.set(updatedField, updatedValue);
		Zotero.ui.saveItem(item);
	}
};
*/
/**
 * save an item after a creator field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
/*
Zotero.ui.widgets.reactitem.updateItemCreatorField = function(library, itemKey, updatedCreator, creatorIndex){
	return;
	Z.debug("widgets.item.updateCreatorField", 3);
	Z.debug("itemKey: " + itemKey, 3);
	if(!itemKey){
		throw new Error("Expected widget element to have itemKey data");
	}
	
	var item = library.items.getItem(itemKey);
	var creators = item.get('creators');
	if(creators[creatorIndex]){
		creators[creatorIndex] = updatedCreator;
		Zotero.ui.saveItem(item);
	} else {
		//get full creator information from row of data, and add creator at index
		var rowSelector = "tr.creator-row[data-creatorindex='" + creatorIndex + "']";
		var row = J(rowSelector);
		var creator = Zotero.ui.widgets.reactitem.creatorFromRow(row);
		creators[creatorIndex] = creator;
		Zotero.ui.saveItem(item);
	}
};
*/
/*
Zotero.ui.widgets.reactitem.creatorFromRow = function(rowElement) {
	return;
	Z.debug("widgets.item.creatorFromRow", 3);
	var row = J(rowElement);
	var creatorType = row.find("span[data-itemfield='creatorType']").data('value');
	var name = row.find("span[data-itemfield='name']").data('value') || "";
	var firstName = row.find("span[data-itemfield='firstName']").data('value') || "";
	var lastName = row.find("span[data-itemfield='lastName']").data('value') || "";
	
	var creator = {
		creatorType: creatorType,
		name: name,
		firstName: firstName,
		lastName: lastName,
	};
	
	if(creator['name'] !== ""){
		delete creator.firstName;
		delete creator.lastName;
	} else {
		delete creator['name'];
	}
	
	return creator;
};
*/

Zotero.ui.editMatches = function (props, edit) {
	Z.debug("Zotero.ui.editMatches");
	Z.debug(props);
	Z.debug(edit);
	if (props === null || edit === null) {
		return false;
	}
	if (edit.field != props.field) {
		return false;
	}
	//field is the same, make sure index matches if set
	if (edit.creatorIndex != props.creatorIndex) {
		return false;
	}
	if (props.tagIndex != edit.tagIndex) {
		return false;
	}
	return true;
};

Zotero.ui.genericDisplayedFields = function (item) {
	var genericDisplayedFields = Object.keys(item.apiObj.data).filter(function (field) {
		if (Zotero.Item.prototype.hideFields.indexOf(field) != -1) {
			return false;
		}
		if (!item.fieldMap.hasOwnProperty(field)) {
			return false;
		}
		if (field == "title" || field == "creators" || field == "itemType") {
			return false;
		}
		return true;
	});
	return genericDisplayedFields;
};

Zotero.ui.widgets.reactitem.editFields = function (item) {
	var fields = [{ field: "itemType" }, { field: "title" }];
	var creators = item.get('creators');
	creators.forEach(function (k, i) {
		fields.push({ field: "creatorType", creatorIndex: i });
		if (k.name) {
			fields.push({ field: "name", creatorIndex: i });
		} else {
			fields.push({ field: "lastName", creatorIndex: i });
			fields.push({ field: "firstName", creatorIndex: i });
		}
	});

	var genericFields = Zotero.ui.genericDisplayedFields(item);
	genericFields.forEach(function (k, i) {
		fields.push({ field: k });
	});
};

//take an edit object and return the edit object selecting the next field of the item
Zotero.ui.widgets.reactitem.nextEditField = function (item, edit) {
	if (!edit || !edit.field) {
		return null;
	}
	var editFields = Zotero.ui.widgets.reactitem.editFields(item);
	var curFieldIndex;
	for (var i = 0; i < editFields.length; i++) {
		if (editFields[i].field == edit.field) {
			if (editFields[i].creatorIndex == edit.creatorIndex) {
				curFieldIndex = i;
			}
		}
	}
	if (curFieldIndex == editFields.length) {
		return editFields[0];
	} else {
		return editFields[i + 1];
	}
	/*
 //special case if editing a creator
 switch(edit.field) {
 	case "title":
 		return {
 			creatorIndex: 0,
 			field: "creatorType"
 		};
 		break;
 	case "creatorType":
 		var creators = item.get('creators');
 		var creator = creators[edit.creatorIndex];
 		if(creator.name){
 			return {
 				creatorIndex: edit.creatorIndex,
 				field: "name"
 			};
 		} else {
 			return {
 				creatorIndex: edit.creatorIndex,
 				field: "lastName"
 			};
 		}
 		break;
 	case "lastName":
 		return {
 			creatorIndex: edit.creatorIndex + 1,
 			field: "firstName"
 		};
 		break;
 	case "name":
 	case "firstName":
 		//move to next creator, or fields after creators
 		if(edit.creatorIndex < creators.length){
 			return {
 				creatorIndex: edit.creatorIndex + 1,
 				field:"creatorType"
 			}
 		} else {
 			//move to first field after creators
 			var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
 			return {
 				field: genericDisplayedFields[0]
 			}
 		}
 		break;
 	default:
 		var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
 		//if currently at the last field, go back up to title
 		if(genericDisplayedFields[genericDisplayedFields.length - 1] == edit.field){
 			return {
 				field:"title"
 			};
 		}
 		//otherwise, return the field at current edit field + 1
 		for(var i = 0; i < genericDisplayedFields.length; i++){
 			if(edit.field == genericDisplayedFields[i]){
 				return {
 					field:genericDisplayedFields[i + 1]
 				};
 			}
 		}
 }
 */
};

/*
var Item = React.createClass({
	render: function() {
		return (
			<div role="tabpanel">
				<ul className="nav nav-tabs" role="tablist">
					<li role="presentation" className="active"><a href="#item-info-panel" aria-controls="item-info-panel" role="tab" data-toggle="tab">Info</a></li>
					<li role="presentation"><a href="#item-children-panel" aria-controls="item-children-panel" role="tab" data-toggle="tab">Children</a></li>
					<li role="presentation"><a href="#item-tags-panel" aria-controls="item-tags-panel" role="tab" data-toggle="tab">Tags</a></li>
				</ul>
				<div className="tab-content">
					<div id="item-info-panel" role="tabpanel" className="item-details-div eventfulwidget tab-pane active">
					</div>
					<div id="item-children-panel" role="tabpanel" className="item-children-div tab-pane">
					</div>
					<div id="item-tags-panel" role="tabpanel" className="item-tags-div tab-pane">
					</div>
				</div>
			</div>
		);
	}
});
*/
var CreatorRow = React.createClass({
	displayName: "CreatorRow",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			library: null,
			creator: {
				creatorType: "author",
				name: "",
				firstName: "",
				lastName: ""
			},
			creatorIndex: 0,
			edit: null
		};
	},
	getInitialState: function getInitialState() {
		return {
			creatorType: "author"
		};
	},
	render: function render() {
		Z.debug("CreatorRow render");
		if (this.props.item == null) {
			return null;
		}
		var edit = this.props.edit;
		var sharedProps = {
			creatorIndex: this.props.creatorIndex,
			item: this.props.item,
			creator: this.props.creator
		};

		var nameSpans = null;
		if (this.props.creator.name && this.props.creator.name != "") {
			nameSpans = React.createElement(NameField, {
				field: "name",
				creatorIndex: this.props.creatorIndex,
				item: this.props.item,
				creator: this.props.creator,
				edit: edit
			});
		} else {
			nameSpans = [React.createElement(NameField, {
				key: "lastName",
				field: "lastName",
				creatorIndex: this.props.creatorIndex,
				item: this.props.item,
				creator: this.props.creator,
				edit: edit
			}), ", ", React.createElement(NameField, {
				key: "firstName",
				field: "firstName",
				creatorIndex: this.props.creatorIndex,
				item: this.props.item,
				creator: this.props.creator,
				edit: edit
			})];
		}

		return React.createElement(
			"tr",
			{ className: "creator-row", "data-creatorindex": this.props.creatorIndex },
			React.createElement(CreatorTypeHeader, { item: this.props.item, creatorIndex: this.props.creatorIndex, creator: this.props.creator, edit: edit }),
			React.createElement(
				"td",
				{ className: this.state.creatorType },
				nameSpans,
				React.createElement(
					"div",
					{ className: "btn-toolbar", role: "toolbar" },
					React.createElement(ToggleCreatorFieldButton, { item: this.props.item, creatorIndex: this.props.creatorIndex }),
					React.createElement(AddRemoveCreatorFieldButtons, { item: this.props.item, creatorIndex: this.props.creatorIndex })
				)
			)
		);
	}
});

var CreatorTypeHeader = React.createClass({
	displayName: "CreatorTypeHeader",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			creatorIndex: 0,
			edit: null
		};
	},
	handleClick: function handleClick(evt) {
		Zotero.ui.widgets.reactitem.reactInstance.setState({ edit: { field: "creatorType", creatorIndex: this.props.creatorIndex } });
	},
	render: function render() {
		Z.debug("CreatorTypeHeader render");
		var itemKey = this.props.item ? this.props.item.get('key') : "";
		if (this.props.item == null) {
			return null;
		}

		if (Zotero.ui.editMatches(this.props.edit, { creatorIndex: this.props.creatorIndex, field: "creatorType" })) {
			return React.createElement(
				"th",
				null,
				React.createElement(EditField, { item: this.props.item, field: "creatorType", value: this.props.creator.creatorType, edit: this.props.edit, creatorIndex: this.props.creatorIndex })
			);
		} else {
			return React.createElement(
				"th",
				null,
				React.createElement(
					"span",
					{ className: "editable-creator-field",
						tabIndex: "0",
						onClick: this.handleClick },
					this.props.item.creatorMap[this.props.creator.creatorType]
				)
			);
		}
	}
});

var NameField = React.createClass({
	displayName: "NameField",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			creatorIndex: 0,
			field: "name",
			edit: null
		};
	},
	editClickedField: function editClickedField(evt) {
		Z.ui.widgets.reactitem.reactInstance.setState({ edit: {
				field: this.props.field,
				creatorIndex: this.props.creatorIndex
			} });
	},
	handleChange: function handleChange(evt) {
		//set field to new value
		var item = this.props.item;
		var creators = item.get('creators');
		var creator = creators[this.props.creatorIndex];
		creator[this.props.field] = evt.target.value;
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	},
	saveBlurredField: function saveBlurredField(evt) {
		var creators = this.props.item.get('creators');
		var creator = creators[this.props.creatorIndex];
		creator[this.props.field] = evt.target.value;
		Zotero.ui.saveItem(this.props.item);
		Z.ui.widgets.reactitem.reactInstance.setState({ edit: null });
	},
	render: function render() {
		Z.debug("NameField render");
		var focusEl = function focusEl(el) {
			if (el != null) {
				el.focus();
			}
		};
		var field = this.props.field;
		var val = this.props.creator[field];
		var placeHolders = {
			"name": "(full name)",
			"firstName": "(first)",
			"lastName": "(last)"
		};

		var p = {
			item: this.props.item,
			field: field,
			creatorIndex: this.props.creatorIndex,
			value: val,
			className: "editable-item-field",
			tabIndex: 0,
			edit: this.props.edit
		};

		if (!Zotero.ui.editMatches(this.props.edit, this.props)) {
			p.onClick = this.editClickedField;
			return React.createElement(
				"span",
				p,
				val != "" ? val : placeHolders[field]
			);
		} else {
			return React.createElement(EditField, p);
		}
	}
});

var ToggleCreatorFieldButton = React.createClass({
	displayName: "ToggleCreatorFieldButton",

	render: function render() {
		Z.debug("ToggleCreatorFieldButton render");
		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ type: "button",
					className: "switch-two-field-creator-link btn btn-default",
					title: "Toggle single field creator",
					"data-itemkey": this.props.item.get('key'),
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.switchCreatorFields },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-unchecked" })
			)
		);
	},
	switchCreatorFields: function switchCreatorFields(evt) {
		Z.debug("CreatorRow switchCreatorFields");
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		var creator = creators[creatorIndex];

		//split a single name creator into first/last, or combine first/last
		//into a single name
		if (creator.name !== undefined) {
			var split = creator.name.split(' ');
			if (split.length > 1) {
				creator.lastName = split.splice(-1, 1)[0];
				creator.firstName = split.join(' ');
			} else {
				creator.lastName = creator.name;
				creator.firstName = '';
			}
			delete creator.name;
		} else {
			if (creator.firstName === "" && creator.lastName === "") {
				creator.name = "";
			} else {
				creator.name = creator.firstName + ' ' + creator.lastName;
			}
			delete creator.firstName;
			delete creator.lastName;
		}

		creators[creatorIndex] = creator;
		Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	}
});

var AddRemoveCreatorFieldButtons = React.createClass({
	displayName: "AddRemoveCreatorFieldButtons",

	render: function render() {
		Z.debug("AddRemoveCreatorFieldButtons render");
		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ type: "button",
					className: "btn btn-default eventfultrigger",
					"data-itemkey": this.props.item.get('key'),
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.removeCreator },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-minus" })
			),
			React.createElement(
				"button",
				{ type: "button",
					className: "btn btn-default eventfultrigger",
					"data-itemkey": this.props.item.get('key'),
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.addCreator },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-plus" })
			)
		);
	},
	addCreator: function addCreator(evt) {
		var item = this.props.item;
		var creators = item.get('creators');
		creators.push({ creatorType: "author", firstName: "", lastName: "" });
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	},
	removeCreator: function removeCreator(evt) {
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		creators.splice(creatorIndex, 1);
		//Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	}
});

var ItemNavTabs = React.createClass({
	displayName: "ItemNavTabs",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null
		};
	},
	render: function render() {
		Z.debug("ItemNavTabs render");
		if (this.props.item == null) {
			return null;
		}
		if (!this.props.item.isSupplementaryItem()) {
			return React.createElement(
				"ul",
				{ className: "nav nav-tabs", role: "tablist" },
				React.createElement(
					"li",
					{ role: "presentation", className: "active" },
					React.createElement(
						"a",
						{ href: "#item-info-panel", "aria-controls": "item-info-panel", role: "tab", "data-toggle": "tab" },
						"Info"
					)
				),
				React.createElement(
					"li",
					{ role: "presentation" },
					React.createElement(
						"a",
						{ href: "#item-children-panel", "aria-controls": "item-children-panel", role: "tab", "data-toggle": "tab" },
						"Children"
					)
				),
				React.createElement(
					"li",
					{ role: "presentation" },
					React.createElement(
						"a",
						{ href: "#item-tags-panel", "aria-controls": "item-tags-panel", role: "tab", "data-toggle": "tab" },
						"Tags"
					)
				)
			);
		}
		return null;
	}
});

var ItemFieldRow = React.createClass({
	displayName: "ItemFieldRow",

	handleClick: function handleClick() {
		Zotero.ui.widgets.reactitem.reactInstance.setState({ edit: { field: this.props.fieldName } });
	},
	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			edit: null
		};
	},
	render: function render() {
		Z.debug("ItemFieldRow render");
		var item = this.props.item;
		var fieldName = this.props.fieldName;
		var sharedSpanProps = {
			item: this.props.item,
			onClick: this.handleClick,
			className: "editable-item-field",
			tabIndex: 0
		};
		var placeholderOrValue;
		if (this.props.edit && this.props.edit.field == fieldName) {
			placeholderOrValue = React.createElement(EditField, { item: item, field: fieldName, value: this.props.val, edit: this.props.edit });
		} else {
			placeholderOrValue = this.props.val == "" ? React.createElement("div", { className: "empty-field-placeholder" }) : Zotero.ui.formatItemField(fieldName, item);
		}
		if (fieldName == 'url') {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					React.createElement(
						"a",
						{ rel: "nofollow", href: this.props.val },
						Zotero.Item.prototype.fieldMap[fieldName]
					)
				),
				React.createElement(
					"td",
					{ className: fieldName },
					React.createElement(
						"span",
						_extends({}, sharedSpanProps, { "data-itemfield": fieldName, "data-itemkey": item.get('key') }),
						placeholderOrValue
					)
				)
			);
		} else if (fieldName == 'DOI') {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					React.createElement(
						"a",
						{ rel: "nofollow", href: 'http://dx.doi.org/' + this.props.val },
						Zotero.Item.prototype.fieldMap[fieldName]
					)
				),
				React.createElement(
					"td",
					{ className: fieldName },
					React.createElement(
						"span",
						_extends({}, sharedSpanProps, { "data-itemfield": fieldName, "data-itemkey": item.get('key') }),
						placeholderOrValue
					)
				)
			);
		} else if (Zotero.config.richTextFields[fieldName]) {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					Zotero.Item.prototype.fieldMap[fieldName],
					"}"
				),
				React.createElement(
					"td",
					{ className: fieldName },
					React.createElement(
						"span",
						_extends({}, sharedSpanProps, { "data-itemfield": fieldName, "data-itemkey": item.get('key') }),
						React.createElement(
							"textarea",
							{ cols: "40", rows: "14", name: fieldName, className: "rte" },
							this.props.val
						)
					)
				)
			);
		} else {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					Zotero.Item.prototype.fieldMap[fieldName] || fieldName
				),
				React.createElement(
					"td",
					{ className: fieldName },
					React.createElement(
						"span",
						_extends({}, sharedSpanProps, { "data-itemfield": fieldName, "data-itemkey": item.get('key') }),
						placeholderOrValue
					)
				)
			);
		}
	}
});

//set onChange
var EditField = React.createClass({
	displayName: "EditField",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			field: null,
			value: null,
			edit: null
		};
	},
	handleChange: function handleChange(evt) {
		//set field to new value
		var item = this.props.item;
		switch (this.props.field) {
			case "creatorType":
			case "name":
			case "firstName":
			case "lastName":
				var creators = item.get('creators');
				var creator = creators[this.props.creatorIndex];
				creator[this.props.field] = evt.target.value;
				break;
			default:
				item.set(this.props.field, evt.target.value);
		}
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	},
	handleBlur: function handleBlur(evt) {
		//save item, move edit to next field
		Z.debug("handleBlur");
		this.handleChange(evt);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ edit: null });
		//this.props.item.set(this.props.field, evt.target.value);
		Zotero.ui.saveItem(this.props.item);
	},
	checkKey: function checkKey(evt) {
		Z.debug("EditField checkKey");
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER) {
			Z.debug("EditField checkKey");
			this.handleBlur(evt);
			var nextEdit = Zotero.ui.widgets.reactitem.nextEditField(this.props.item, this.props.edit);
			Zotero.ui.widgets.reactitem.reactInstance.setState({ edit: nextEdit });
		}
	},
	render: function render() {
		Z.debug("EditField render");
		var item = this.props.item;
		var focusEl = function focusEl(el) {
			if (el != null) {
				el.focus();
			}
		};
		var sharedProps = {
			className: "form-control item-field-control " + this.props.field,
			name: this.props.field,
			value: this.props.value,
			onChange: this.handleChange,
			onKeyDown: this.checkKey,
			onBlur: this.handleBlur,
			ref: focusEl,
			creatorindex: this.props.creatorIndex,
			tagindex: this.props.tagIndex
		};

		switch (this.props.field) {
			case null:
				return null;
				break;
			case 'itemType':
				var itemTypeOptions = Zotero.Item.prototype.itemTypes.map(function (itemType) {
					return React.createElement(
						"option",
						{ key: itemType.itemType,
							label: itemType.localized,
							value: itemType.itemType },
						itemType.localized
					);
				});
				return React.createElement(
					"select",
					sharedProps,
					itemTypeOptions
				);
				break;
			case 'creatorType':
				var creatorTypeOptions = item.creatorTypes[item.get('itemType')].map(function (creatorType) {
					return React.createElement(
						"option",
						{ key: creatorType.creatorType,
							label: creatorType.localized,
							value: creatorType.creatorType
						},
						creatorType.localized
					);
				});
				return React.createElement(
					"select",
					_extends({ id: "creatorType" }, sharedProps, { "data-creatorindex": this.props.creatorIndex }),
					creatorTypeOptions
				);
				break;
			/*
   case 'name':
   case 'firstName':
   case 'lastName':
   	return (
   		<input type="text" {...sharedProps}
   			className={"form-control item-field-control creator-" + this.props.field}
   			data-creatorindex={this.props.creatorIndex}
   		/>
   	);
   	break;
   */
			/*
   case 'tag':
   	return (
   		<input type='text' {...sharedProps} />
   	);
   	break;
   */
			default:
				if (Zotero.config.largeFields[this.props.field]) {
					return React.createElement("textarea", sharedProps);
				} else if (Zotero.config.richTextFields[this.props.field]) {
					return React.createElement("textarea", _extends({}, sharedProps, { className: "rte default" }));
				} else {
					//default single line input field
					return React.createElement("input", _extends({ type: "text" }, sharedProps));
				}
		}
	}
});

var ItemInfoPanel = React.createClass({
	displayName: "ItemInfoPanel",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			loading: false,
			edit: null
		};
	},
	render: function render() {
		Z.debug("ItemInfoPanel render");
		var item = this.props.item;
		Z.debug("ItemInfoPanel render: items.totalResults: " + this.props.library.items.totalResults);
		var itemCountP = React.createElement(
			"p",
			{ className: "item-count", hidden: !this.props.libraryItemsLoaded },
			this.props.library.items.totalResults + " items in this view"
		);

		var edit = this.props.edit;

		if (item == null) {
			return React.createElement(
				"div",
				{ id: "item-info-panel", role: "tabpanel", className: "item-details-div eventfulwidget tab-pane active" },
				React.createElement(LoadingSpinner, { loading: this.props.loading }),
				itemCountP
			);
		}
		var itemKey = item.get('key');
		var libraryType = item.owningLibrary.libraryType;

		var parentUrl = false;
		if (item.get("parentItem")) {
			parentUrl = this.props.library.websiteUrl({ itemKey: item.get("parentItem") });
		}
		var parentLink = parentUrl ? React.createElement(
			"a",
			{ href: parentUrl, className: "item-select-link", "data-itemkey": item.get('parentItem') },
			"Parent Item"
		) : null;
		var libraryIDSpan;
		if (libraryType == "user") {
			libraryIDSpan = React.createElement("span", { id: "libraryUserID", title: item.apiObj.library.id });
		} else {
			libraryIDSpan = React.createElement("span", { id: "libraryGroupID", title: item.apiObj.library.id });
		}

		//the Zotero user that created the item, if it's a group library item
		var zoteroItemCreatorRow = null;
		if (libraryType == "group") {
			zoteroItemCreatorRow = React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					"Added by"
				),
				React.createElement(
					"td",
					{ className: "user-creator" },
					React.createElement(
						"a",
						{ href: item.apiObj.meta.createdByUser.links.alternate.href, className: "user-link" },
						item.apiObj.meta.createdByUser.name
					)
				)
			);
		}

		var creatorRows = [];
		if (item.isSupplementaryItem()) {
			creatorRows = [];
		} else if (item.get('creators').length > 0) {
			creatorRows = item.get('creators').map(function (creator, ind) {
				return React.createElement(CreatorRow, { key: ind, creator: creator, creatorIndex: ind, item: item, edit: edit });
			});
		} else {
			creatorRows = [React.createElement(CreatorRow, { key: 0, creatorIndex: 0, item: item, edit: edit })];
		}

		var genericFieldRows = [];
		//filter out fields we don't want to display or don't want to include as generic
		var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
		genericDisplayedFields.forEach(function (key) {
			var editThis = false;
			if (edit && key == edit.field) {
				editThis = true;
			}
			genericFieldRows.push(React.createElement(ItemFieldRow, { key: key, fieldName: key, item: item, val: item.apiObj.data[key], edit: edit }));
		});

		return React.createElement(
			"div",
			{ id: "item-info-panel", role: "tabpanel", className: "item-details-div eventfulwidget tab-pane active" },
			React.createElement(LoadingSpinner, { loading: this.props.loading }),
			parentLink,
			libraryIDSpan,
			React.createElement(
				"table",
				{ className: "item-info-table table", "data-itemkey": itemKey },
				React.createElement(
					"tbody",
					null,
					zoteroItemCreatorRow,
					React.createElement(ItemFieldRow, { key: "itemType", fieldName: "itemType", item: item, val: item.get("itemType"), edit: edit }),
					");",
					React.createElement(ItemFieldRow, { key: "title", fieldName: "title", item: item, val: item.get("title"), edit: edit }),
					");",
					creatorRows,
					genericFieldRows
				)
			)
		);
	}
});

var TagListRow = React.createClass({
	displayName: "TagListRow",

	getDefaultProps: function getDefaultProps() {
		return {
			tagIndex: 0,
			tag: { tag: "" },
			item: null,
			library: null,
			edit: null
		};
	},
	removeTag: function removeTag(evt) {
		var tag = this.props.tag.tag;
		var item = this.props.item;
		var tagIndex = this.props.tagIndex;

		var tags = item.get('tags');
		tags.splice(tagIndex, 1);
		//Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	},
	render: function render() {
		Z.debug("TagListRow render");
		return React.createElement(
			"div",
			{ className: "row item-tag-row" },
			React.createElement(
				"div",
				{ className: "col-xs-1" },
				React.createElement("span", { className: "glyphicons fonticon glyphicons-tag" })
			),
			React.createElement(
				"div",
				{ className: "col-xs-9" },
				React.createElement(
					"span",
					{ className: "editable-item-tag",
						tabIndex: "0",
						"data-event": "focus"
					},
					this.props.tag.tag
				)
			),
			React.createElement(
				"div",
				{ className: "col-xs-2" },
				React.createElement(
					"button",
					{ type: "button", className: "remove-tag-link btn btn-default", onClick: this.removeTag },
					React.createElement("span", { className: "glyphicons fonticon glyphicons-minus" })
				)
			)
		);
	}
});

var ItemTagsPanel = React.createClass({
	displayName: "ItemTagsPanel",

	render: function render() {
		Z.debug("ItemTagsPanel render");
		var item = this.props.item;
		var library = this.props.library;
		if (item == null) {
			return React.createElement("div", { id: "item-tags-panel", role: "tabpanel", className: "item-tags-div tab-pane" });
		}
		var tagRows = [];
		var tagRows = item.apiObj.data.tags.map(function (tag, ind) {
			return React.createElement(TagListRow, { key: tag.tag, library: library, item: item, tag: tag, tagIndex: ind });
		});

		return React.createElement(
			"div",
			{ id: "item-tags-panel", role: "tabpanel", className: "item-tags-div tab-pane" },
			React.createElement(
				"p",
				null,
				React.createElement(
					"span",
					{ className: "tag-count" },
					item.get('tags').length
				),
				" tags"
			),
			React.createElement(
				"button",
				{ className: "add-tag-button btn btn-default", "data-itemkey": item.get('key') },
				"Add Tag"
			),
			React.createElement(
				"div",
				{ className: "item-tags-list" },
				tagRows
			),
			React.createElement(
				"div",
				{ className: "add-tag-form form-horizontal" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"div",
						{ className: "col-xs-1" },
						React.createElement(
							"label",
							{ htmlFor: "add-tag-input" },
							React.createElement("span", { className: "glyphicons fonticon glyphicons-tag" })
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-11" },
						React.createElement("input", { type: "text", id: "add-tag-input", className: "add-tag-input form-control",
							"data-itemfield": "tag",
							"data-itemkey": item.get('key')
						})
					)
				)
			)
		);
	}
});

var ItemChildrenPanel = React.createClass({
	displayName: "ItemChildrenPanel",

	getDefaultProps: function getDefaultProps() {
		return {
			childItems: []
		};
	},
	render: function render() {
		Z.debug("ItemChildrenPanel render");
		var childListEntries = this.props.childItems.map(function (item, ind) {
			var title = item.get('title');
			var href = Zotero.url.itemHref(item);
			var iconClass = item.itemTypeIconClass();
			var key = item.get('key');
			if (item.itemType == "note") {
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						title
					)
				);
			} else if (item.attachmentDownloadUrl == false) {
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					title,
					"(",
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						"Attachment Details"
					),
					")"
				);
			} else {
				var attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					React.createElement(
						"a",
						{ className: "itemdownloadlink", href: attachmentDownloadUrl },
						title,
						" ",
						Zotero.url.attachmentFileDetails(item)
					),
					"(",
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						"Attachment Details"
					),
					")"
				);
			}
		});
		return React.createElement(
			"div",
			{ id: "item-children-panel", role: "tabpanel", className: "item-children-div tab-pane" },
			React.createElement(
				"ul",
				{ id: "notes-and-attachments" },
				childListEntries
			),
			React.createElement(
				"button",
				{ type: "button", id: "upload-attachment-link", className: "btn btn-primary upload-attachment-button eventfultrigger", "data-triggers": "uploadAttachment", hidden: !Zotero.config.librarySettings.allowUpload },
				"Upload File"
			)
		);
	}
});

var ItemTabPanes = React.createClass({
	displayName: "ItemTabPanes",

	render: function render() {
		Z.debug("ItemTabPanes render");
		return React.createElement(
			"div",
			{ className: "tab-content" },
			React.createElement(ItemInfoPanel, { library: this.props.library,
				item: this.props.item,
				loading: this.props.itemLoading,
				libraryItemsLoaded: this.props.libraryItemsLoaded,
				edit: this.props.edit
			}),
			React.createElement(ItemChildrenPanel, { library: this.props.library, childItems: this.props.childItems, loading: this.props.childrenLoading }),
			React.createElement(ItemTagsPanel, { library: this.props.library, item: this.props.item })
		);
	}
});

var ItemDetails = React.createClass({
	displayName: "ItemDetails",

	getInitialState: function getInitialState() {
		return {
			item: null,
			childItems: [],
			itemLoading: false,
			childrenLoading: false,
			libraryItemsLoaded: false,
			edit: null
		};
	},
	render: function render() {
		Z.debug("ItemDetails render");
		return React.createElement(
			"div",
			{ role: "tabpanel" },
			React.createElement(ItemNavTabs, { item: this.state.item }),
			React.createElement(ItemTabPanes, { item: this.state.item,
				library: this.props.library,
				childItems: this.state.childItems,
				itemLoading: this.state.itemLoading,
				childrenLoading: this.state.childrenLoading,
				libraryItemsLoaded: this.state.libraryItemsLoaded,
				edit: this.state.edit
			})
		);
	}
});
'use strict';

Zotero.ui.widgets.reactcollections = {};

Zotero.ui.widgets.reactcollections.init = function (el) {
	Z.debug("collections widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var initialCollectionKey = Zotero.state.getUrlVar('collectionKey');
	var reactInstance = ReactDOM.render(React.createElement(Collections, { library: library, initialCollectionKey: initialCollectionKey }), document.getElementById('collection-list-div'));
	Zotero.ui.widgets.reactcollections.reactInstance = reactInstance;

	library.listen("collectionsDirty", Zotero.ui.widgets.reactcollections.syncCollections, { widgetEl: el });
	//library.listen("syncCollections", Zotero.ui.widgets.reactcollections.syncCollections, {widgetEl: el});
	//library.listen("syncLibrary", Zotero.ui.widgets.reactcollections.syncCollections, {widgetEl: el});
	library.listen("cachedDataLoaded", Zotero.ui.widgets.reactcollections.syncCollections, { widgetEl: el });

	library.listen("libraryCollectionsUpdated", function () {
		reactInstance.setState({ collections: library.collections });
	});
	//library.listen("selectCollection", Zotero.ui.widgets.reactcollections.selectCollection, {widgetEl: el});
	//library.listen("selectedCollectionChanged", Zotero.ui.widgets.reactcollections.updateSelectedCollection, {widgetEl: el});

	//Zotero.ui.widgets.reactcollections.bindCollectionLinks(el);
};

Zotero.ui.widgets.reactcollections.syncCollections = function (evt) {
	Zotero.debug("Zotero eventful syncCollectionsCallback", 3);
	var widgetEl = J(evt.data.widgetEl);
	//Zotero.ui.showSpinner(J(widgetEl).find("#collection-list-container") );
	var loadingPromise = widgetEl.data('loadingPromise');
	if (loadingPromise) {
		var p = widgetEl.data('loadingPromise');
		return p.then(function () {
			return Zotero.ui.widgets.reactcollections.syncCollections(evt);
		});
	}

	//get Zotero.Library object if already bound to element
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	//update the widget as soon as we have the cached collections
	Zotero.ui.widgets.reactcollections.reactInstance.setState({ collections: library.collections });

	//sync collections if loaded from cache but not synced
	return library.loadUpdatedCollections().then(function () {
		library.trigger("libraryCollectionsUpdated");
	}, function (err) {
		//sync failed, but we already had some data, so show that
		Z.error("Error syncing collections");
		Z.error(err);
		library.trigger("libraryCollectionsUpdated");
		Zotero.ui.jsNotificationMessage("Error loading collections. Collections list may not be up to date", 'error');
	}).then(function () {
		widgetEl.removeData('loadingPromise');
	});
};

Zotero.ui.widgets.reactcollections.rerenderCollections = function (evt) {
	Zotero.debug("Zotero.ui.widgets.reactcollections.rerenderCollections", 3);
	var widgetEl = J(evt.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	Zotero.ui.widgets.reactcollections.reactInstance.setState({ collections: library.collections });
	return;
};

/*
Zotero.ui.widgets.reactcollections.updateSelectedCollection = function(evt){
	Zotero.debug("Zotero eventful updateSelectedCollection", 3);
	var widgetEl = J(evt.data.widgetEl);
	var collectionListEl = widgetEl.find('.collection-list-container');
	
	Zotero.ui.widgets.reactcollections.highlightCurrentCollection(widgetEl);
	Zotero.ui.widgets.reactcollections.nestHideCollectionTree(collectionListEl);
	Zotero.ui.widgets.reactcollections.updateCollectionButtons(widgetEl);
	return;
};
*/
/*
Zotero.ui.widgets.reactcollections.updateCollectionButtons = function(el){
	if(!el){
		el = J("body");
	}
	var jel = J(el);
	
	//disable everything if we're not allowed to edit the library
	if(!Zotero.config.librarySettings.allowEdit){
		J(".permission-edit").hide();
		jel.find(".create-collection-button").addClass('disabled');
		jel.find(".update-collection-button").addClass('disabled');
		jel.find(".delete-collection-button").addClass('disabled');
		return;
	}
	//enable modify and delete only if collection is selected
	if(Zotero.state.getUrlVar("collectionKey")){
		jel.find(".update-collection-button").removeClass('disabled');
		jel.find(".delete-collection-button").removeClass('disabled');
	}
	else{
		jel.find(".update-collection-button").addClass('disabled');
		jel.find(".delete-collection-button").addClass('disabled');
	}
};
*/

//generate the full html for the nested collections list
/**
 * generate the full html for the nested collections list
 * @param  {Dom Element} el          Element to display collections in
 * @param  {Zotero_Collections} collections Zotero_Collections to display
 * @return {undefined}
 */
/*
Zotero.ui.widgets.reactcollections.renderCollectionList = function(el, collections){
	Z.debug("Zotero.ui.renderCollectionList", 3);
	var widgetEl = J(el);
	var currentCollectionKey = Zotero.state.getUrlVar('collectionKey') || '';
	var trash = collections.owningLibrary.libraryType == 'user' ? true : false;
	//var ncollections = collections.nestedOrderingArray();
	widgetEl.append( J('#collectionlistTemplate').render({collections:collections.collectionsArray,
										libUrlIdentifier:collections.libraryUrlIdentifier,
										currentCollectionKey: currentCollectionKey,
										trash: trash
										//ncollections: ncollections
									}
									) );
	
};
*/

/**
 * Bind collection links to take appropriate action instead of following link
 * @return {boolean}
 */
/*
Zotero.ui.widgets.reactcollections.bindCollectionLinks = function(container){
	Z.debug("Zotero.ui.bindCollectionLinks", 3);
	var library = Zotero.ui.getAssociatedLibrary(container);
	
	J(container).on('click', "div.folder-toggle", function(e){
		e.preventDefault();
		J(this).siblings('.collection-select-link').click();
		return false;
	});
	
	J(container).on('click', ".collection-select-link", function(e){
		Z.debug("collection-select-link clicked", 4);
		e.preventDefault();
		var collectionKey = J(this).attr('data-collectionkey');
		//if this is the currently selected collection, treat as expando link
		if(J(this).hasClass('current-collection')) {
			var expanded = J('.current-collection').data('expanded');
			if(expanded === true){
				Zotero.ui.widgets.reactcollections.nestHideCollectionTree(J("#collection-list-container"), false);
			}
			else{
				Zotero.ui.widgets.reactcollections.nestHideCollectionTree(J("#collection-list-container"), true);
			}
			
			//go back to items list
			Zotero.state.clearUrlVars(['collectionKey', 'mode']);
			
			//cancel action for expando link behaviour
			return false;
		}
		library.trigger("selectCollection", {collectionKey: collectionKey});
		
		//Not currently selected collection
		Z.debug("click " + collectionKey, 4);
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pathVars['collectionKey'] = collectionKey;
		
		Zotero.state.pushState();
		return false;
	});
	
	J(container).on('click', "a.my-library", function(e){
		e.preventDefault();
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pushState();
		return false;
	});
};
*/
//FROM UPDATESTATE.JS
//Rendering Code

/**
 * Nest the collection tree and hide/show appropriate nodes
 * @param  {Dom Element} el             Container element
 * @param  {boolean} expandSelected Show or hide the currently selected collection
 * @return {undefined}
 */
/*
Zotero.ui.widgets.reactcollections.nestHideCollectionTree = function(el, expandSelected){
	Z.debug("nestHideCollectionTree", 3);
	if(typeof expandSelected == 'undefined'){
		expandSelected = true;
	}
	//nest and hide collection tree
	var jel = J(el);
	jel.find("#collection-list ul").hide().siblings(".folder-toggle")
										.children(".placeholder")
										.addClass('glyphicon')
										.addClass("glyphicon-chevron-right");
	jel.find(".current-collection").parents("ul").show();
	jel.find("#collection-list li.current-collection").children('ul').show();
	//start all twisties in closed position
	jel.find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
	//show opened twisties as expanded
	jel.find("li.current-collection").parentsUntil("#collection-list").children('div.folder-toggle').find(".glyphicon-chevron-right")
												.removeClass("glyphicon-chevron-right")
												.addClass("glyphicon-chevron-down");
	
	
	if(expandSelected === false){
		jel.find("#collection-list li.current-collection").children('ul').hide();
		jel.find("#collection-list li.current-collection").find(".glyphicon-chevron-down")
													.removeClass("glyphicon-chevron-down")
													.addClass("glyphicon-chevron-right");
		jel.find(".current-collection").data('expanded', false);
	}
	else{
		jel.find("li.current-collection").children('div.folder-toggle').find(".glyphicon-chevron-right")
												.removeClass("glyphicon-chevron-right")
												.addClass("glyphicon-chevron-down");
												
		jel.find(".current-collection").data('expanded', true);
	}
};
*/
/**
 * Highlight the currently selected collection
 * @return {undefined}
 */
/*
Zotero.ui.widgets.reactcollections.highlightCurrentCollection = function(widgetEl){
	Z.debug("Zotero.ui.widgets.reactcollections.highlightCurrentCollection", 3);
	if(!widgetEl){
		widgetEl = J("body");
	}
	widgetEl = J(widgetEl);
	var collectionKey = Zotero.state.getUrlVar('collectionKey');
	//unhighlight currently highlighted
	widgetEl.find("a.current-collection").closest("li").removeClass("current-collection");
	widgetEl.find("a.current-collection").removeClass("current-collection");
	
	if(collectionKey){
		//has collection selected, highlight it
		widgetEl.find("a[data-collectionKey='" + collectionKey + "']").addClass("current-collection");
		widgetEl.find("a[data-collectionKey='" + collectionKey + "']").closest('li').addClass("current-collection");
	}
	else{
		widgetEl.find("a.my-library").addClass("current-collection");
		widgetEl.find("a.my-library").closest('li').addClass("current-collection");
	}
};
*/

//collections
// - selected
// - open
// - depth
// - hasChildren
// - name
// - numItems
//

var CollectionRow = React.createClass({
	displayName: 'CollectionRow',

	getDefaultProps: function getDefaultProps() {
		return {
			collection: null,
			selectedCollection: "",
			depth: 0,
			expandedCollections: {}
		};
	},
	handleCollectionClick: function handleCollectionClick(evt) {
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		//if current collect
		Zotero.ui.widgets.reactcollections.reactInstance.setState({ currentCollectionKey: collectionKey });
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pathVars['collectionKey'] = collectionKey;
		Zotero.state.pushState();
	},
	handleTwistyClick: function handleTwistyClick(evt) {
		Z.debug("handleTwistyClick");
		//toggle expanded state for this collection
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		var exp = this.props.expandedCollections;
		if (exp[collectionKey]) {
			delete exp[collectionKey];
		} else {
			exp[collectionKey] = true;
		}
		Zotero.ui.widgets.reactcollections.reactInstance.setState({ expandedCollections: exp });
	},
	render: function render() {
		Z.debug("CollectionRow render");
		if (this.props.collection == null) {
			return null;
		}
		var collection = this.props.collection;
		var collectionKey = collection.get('key');
		var selectedCollection = this.props.selectedCollection;
		var expandedCollections = this.props.expandedCollections;
		var expanded = expandedCollections[collectionKey] === true;
		var isSelectedCollection = this.props.selectedCollection == collectionKey;

		var childRows = [];
		collection.children.forEach(function (collection, ind) {
			childRows.push(React.createElement(CollectionRow, {
				key: collection.get('key'),
				collection: collection,
				selectedCollection: selectedCollection,
				expandedCollections: expandedCollections }));
		});
		var childrenList = null;
		if (collection.hasChildren) {
			childrenList = React.createElement(
				'ul',
				{ hidden: !expanded },
				childRows
			);
		}

		var placeholderClasses = "placeholder small-icon light-icon pull-left";
		if (expandedCollections[collectionKey] === true) {
			placeholderClasses += " glyphicon glyphicon-chevron-down clickable";
		} else if (childRows.length > 0) {
			placeholderClasses += " glyphicon glyphicon-chevron-right clickable";
		}

		return React.createElement(
			'li',
			{ className: 'collection-row' },
			React.createElement(
				'div',
				{ className: 'folder-toggle' },
				React.createElement('span', { className: placeholderClasses, onClick: this.handleTwistyClick }),
				React.createElement('span', { className: 'fonticon glyphicons glyphicons-folder-open barefonticon' })
			),
			React.createElement(
				'a',
				{ href: collection.websiteCollectionLink, className: isSelectedCollection ? "current-collection" : "", onClick: this.handleCollectionClick },
				collection.get('name')
			),
			childrenList
		);
	}
});

var TrashRow = React.createClass({
	displayName: 'TrashRow',

	getDefaultProps: function getDefaultProps() {
		return {
			collectionKey: "trash",
			selectedCollection: ""
		};
	},
	handleClick: function handleClick() {
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pathVars['collectionKey'] = this.props.collectionKey;
		Zotero.state.pushState();
	},
	render: function render() {
		Z.debug("TrashRow render");
		var className = this.props.selectedCollection == this.props.collectionKey ? "collection-row current-collection" : "collection-row";

		return React.createElement(
			'li',
			{ className: className },
			React.createElement(
				'div',
				{ className: 'folder-toggle' },
				React.createElement('span', { className: 'sprite-placeholder sprite-icon-16 pull-left dui-icon' }),
				React.createElement('span', { className: 'glyphicons fonticon glyphicons-bin barefonticon' })
			),
			'Trash'
		);
	}
});

var Collections = React.createClass({
	displayName: 'Collections',

	getDefaultProps: function getDefaultProps() {
		initialCollectionKey: null;
	},
	getInitialState: function getInitialState() {
		return {
			collections: null,
			currentCollectionKey: this.props.initialCollectionKey,
			expandedCollections: {}
		};
	},
	render: function render() {
		Z.debug("Collections render");
		Z.debug(this.state);
		var collections = this.state.collections;
		if (collections == null) {
			return null;
		}

		var collectionsArray = this.state.collections.collectionsArray;
		var currentCollectionKey = this.state.currentCollectionKey;
		var libraryUrlIdentifier = "";
		//var libraryUrlIdentifier = (collections == null ? "" : collections.libraryUrlIdentifier);

		//Set of collections in an expanded state
		var expandedCollections = this.state.expandedCollections;

		//path from top level collection to currently selected collection, to ensure that we expand
		//them all and the current collection is visible
		var currentCollectionPath = [];
		if (currentCollectionKey !== null) {
			var currentCollection = collections.getCollection(currentCollectionKey);
			var c = currentCollection;
			while (true) {
				if (!c.topLevel) {
					var parentCollectionKey = c.get('parentCollection');
					c = collections.getCollection(parentCollectionKey);
					currentCollectionPath.push(parentCollectionKey);
					expandedCollections[parentCollectionKey] = true;
				} else {
					break;
				}
			}
		}
		Z.debug("currentCollectionPath : expandedCollections");
		Z.debug(currentCollectionPath);
		Z.debug(expandedCollections);

		var collectionRows = [];
		collectionsArray.forEach(function (collection, ind) {
			if (collection.topLevel) {
				collectionRows.push(React.createElement(CollectionRow, {
					key: collection.get('key'),
					collection: collection,
					selectedCollection: currentCollectionKey,
					expandedCollections: expandedCollections }));
			}
		});

		return React.createElement(
			'div',
			{ id: 'collection-list-container', className: 'collection-list-container' },
			React.createElement(
				'ul',
				{ id: 'collection-list' },
				React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'glyphicons fonticon glyphicons-inbox barefonticon' }),
					React.createElement(
						'a',
						{ className: 'my-library', href: "/" + libraryUrlIdentifier + "/items" },
						'Library'
					)
				),
				collectionRows
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactitems = {};

Zotero.ui.widgets.reactitems.init = function (el) {
	Z.debug("widgets.items.init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(ItemTable, { library: library }), document.getElementById('library-items-div'));

	Zotero.ui.widgets.reactitems.reactInstance = reactInstance;

	library.listen("displayedItemsChanged", Zotero.ui.widgets.reactitems.loadItems, { widgetEl: el });
	library.listen("displayedItemChanged", reactInstance.selectDisplayed);
	Zotero.listen("selectedItemsChanged", function () {
		reactInstance.setState({ selectedItemKeys: Zotero.state.getSelectedItemKeys() });
	});

	library.listen("loadMoreItems", Zotero.ui.widgets.reactitems.loadMoreItems, { widgetEl: el });
	library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, { widgetEl: el });

	//bind item links inside widget
	var container = J(el);
	Zotero.state.bindItemLinks(container);

	//monitor scroll position of items pane for infinite scrolling
	container.closest("#items-panel").on('scroll', function (e) {
		if (Zotero.ui.widgets.reactitems.scrollAtBottom(J(this))) {
			library.trigger("loadMoreItems");
		}
	});

	J(window).on('resize', function () {
		if (!window.matchMedia("(min-width: 768px)").matches) {
			Zotero.ui.widgets.reactitems.reactInstance.setState({ narrow: true });
		} else {
			Zotero.ui.widgets.reactitems.reactInstance.setState({ narrow: false });
		}
	});

	library.trigger("displayedItemsChanged");
};

Zotero.ui.widgets.reactitems.loadItems = function (event) {
	Z.debug('Zotero eventful loadItems', 3);
	var library = Zotero.ui.widgets.reactitems.reactInstance.props.library;
	var newConfig = Zotero.ui.getItemsConfig(library);

	//clear contents and show spinner while loading
	Zotero.ui.widgets.reactitems.reactInstance.setState({ items: [], moreloading: true });

	var p = library.loadItems(newConfig).then(function (response) {
		if (!response.loadedItems) {
			Zotero.error("expected loadedItems on response not present");
			throw "Expected response to have loadedItems";
		}
		library.items.totalResults = response.totalResults;
		Zotero.ui.widgets.reactitems.reactInstance.setState({ items: response.loadedItems, moreloading: false, sort: newConfig.sort, order: newConfig.order });
	})["catch"](function (response) {
		Z.error(response);
		Zotero.ui.widgets.reactitems.reactInstance.setState({ errorLoading: true, moreloading: false, sort: newConfig.sort, order: newConfig.order });
	});
	return p;
};

//load more items when the user has scrolled to the bottom of the current list
Zotero.ui.widgets.reactitems.loadMoreItems = function (event) {
	Z.debug('loadMoreItems', 3);
	var widgetEl = J(event.data.widgetEl);
	//bail out if we're already fetching more items
	if (Zotero.ui.widgets.reactitems.reactInstance.state.moreloading) {
		return;
	}
	//bail out if we're done loading all items
	if (Zotero.ui.widgets.reactitems.reactInstance.state.allItemsLoaded) {
		return;
	}

	var reactInstance = Zotero.ui.widgets.reactitems.reactInstance;
	reactInstance.setState({ moreloading: true });
	var library = reactInstance.props.library;
	var newConfig = Zotero.ui.getItemsConfig(library);
	var newStart = reactInstance.state.items.length;
	newConfig.start = newStart;

	var p = library.loadItems(newConfig).then(function (response) {
		if (!response.loadedItems) {
			Zotero.error("expected loadedItems on response not present");
			throw "Expected response to have loadedItems";
		}
		var reactInstance = Zotero.ui.widgets.reactitems.reactInstance;
		var allitems = reactInstance.state.items.concat(response.loadedItems);
		reactInstance.setState({ items: allitems, moreloading: false });

		//see if we're displaying as many items as there are in results
		var itemsDisplayed = allitems.length;
		if (response.totalResults == itemsDisplayed) {
			reactInstance.setState({ allItemsLoaded: true });
		}
	})["catch"](function (response) {
		Z.error(response);
		Zotero.ui.widgets.reactitems.reactInstance.setState({ errorLoading: true, moreloading: false });
	});
};

Zotero.ui.getItemsConfig = function (library) {
	var effectiveUrlVars = ['tag', 'collectionKey', 'order', 'sort', 'q', 'qmode'];
	var urlConfigVals = {};
	J.each(effectiveUrlVars, function (index, value) {
		var t = Zotero.state.getUrlVar(value);
		if (t) {
			urlConfigVals[value] = t;
		}
	});

	var defaultConfig = { libraryID: library.libraryID,
		libraryType: library.libraryType,
		target: 'items',
		targetModifier: 'top',
		limit: library.preferences.getPref('itemsPerPage')
	};

	var userPreferencesApiArgs = {
		order: Zotero.preferences.getPref('order'),
		sort: Zotero.preferences.getPref('sort'),
		limit: library.preferences.getPref('itemsPerPage')
	};

	//Build config object that should be displayed next and compare to currently displayed
	var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
	//newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);

	//don't allow ordering by group only columns if user library
	if (library.libraryType == 'user' && Zotero.Library.prototype.groupOnlyColumns.indexOf(newConfig.order) != -1) {
		newConfig.order = 'title';
	}

	if (!newConfig.sort) {
		newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
	}

	//don't pass top if we are searching for tags (or query?)
	if (newConfig.tag || newConfig.q) {
		delete newConfig.targetModifier;
	}

	return newConfig;
};

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
/*
Zotero.ui.widgets.reactitems.displayItems = function(el, config={}, itemsArray=[]) {
	Z.debug("Zotero.ui.widgets.displayItems", 3);
	var library = Zotero.ui.widgets.reactitems.reactInstance.props.library;
	
	var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
	var displayFields = library.preferences.getPref('listDisplayedFields');
	if(library.libraryType != 'group'){
		displayFields = J.grep(displayFields, function(el, ind){
			return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
		});
	}
	
	Zotero.ui.widgets.reactitems.reactInstance.setState({items:itemsArray, displayFields:displayFields})
};
*/
Zotero.ui.callbacks.resortItems = function (e) {
	Z.debug(".field-table-header clicked", 3);
	var widgetEl = J(e.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
	var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
	var newSortField;
	var newSortOrder;
	if (e.newSortField) {
		newSortField = e.newSortField;
	} else {
		newSortField = J(e.triggeringElement).data('columnfield');
	}
	if (e.newSortOrder) {
		newSortOrder = e.newSortOrder;
	} else {
		newSortOrder = Zotero.config.sortOrdering[newSortField];
	}

	//only allow ordering by the fields we have
	if (J.inArray(newSortField, Zotero.Library.prototype.sortableColumns) == -1) {
		return false;
	}

	//change newSort away from the field default if that was already the current state
	if (!e.newSortOrder && currentSortField == newSortField && currentSortOrder == newSortOrder) {
		if (newSortOrder == 'asc') {
			newSortOrder = 'desc';
		} else {
			newSortOrder = 'asc';
		}
	}

	//problem if there was no sort column mapped to the header that got clicked
	if (!newSortField) {
		Zotero.ui.jsNotificationMessage("no order field mapped to column");
		return false;
	}

	//update the url with the new values
	Zotero.state.pathVars['order'] = newSortField;
	Zotero.state.pathVars['sort'] = newSortOrder;
	Zotero.state.pushState();

	//set new order as preference and save it to use www prefs
	library.preferences.setPref('sortField', newSortField);
	library.preferences.setPref('sortOrder', newSortOrder);
	library.preferences.setPref('order', newSortField);
	library.preferences.setPref('sort', newSortOrder);
	Zotero.preferences.setPref('order', newSortField);
	Zotero.preferences.setPref('sort', newSortOrder);
};

Zotero.ui.widgets.reactitems.scrollAtBottom = function (el) {
	if (J(el).scrollTop() + J(el).innerHeight() >= J(el)[0].scrollHeight) {
		return true;
	}
	return false;
};

var ItemTable = React.createClass({
	displayName: "ItemTable",

	getDefaultProps: function getDefaultProps() {
		return {};
	},
	getInitialState: function getInitialState() {
		return {
			moreloading: false,
			allItemsLoaded: false,
			errorLoading: false,
			items: [],
			selectedItemKeys: [],
			allSelected: false,
			displayFields: ["title", "creator", "dateModified"],
			order: "title",
			sort: "asc",
			narrow: false
		};
	},
	//select and highlight in the itemlist the item  that is displayed
	//in the item details widget
	selectDisplayed: function selectDisplayed() {
		Z.debug('widgets.items.selectDisplayed', 3);
		Zotero.state.selectedItemKeys = [];
		this.setState({ selectedItemKeys: Zotero.state.getSelectedItemKeys(), allSelected: false });
	},
	fixTableHeaders: function fixTableHeaders() {
		var tableEl = this.refs.itemsTable;
		var tel = J(tableEl);
		var colWidths = [];
		tel.find("tbody tr").first().find("td").each(function (ind, th) {
			var width = J(th).width();
			colWidths.push(width);
			tel.find("thead th").eq(ind).width(width);
		});

		var bodyOffset = tel.find("thead").height();

		tel.find("thead").css('position', 'fixed').css('margin-top', -bodyOffset).css('background-color', 'white').css('z-index', 10);
		tel.find("tbody").css('margin-top', bodyOffset);
		tel.css("margin-top", bodyOffset);
	},
	handleSelectAllChange: function handleSelectAllChange(ev) {
		var nowselected = [];
		var allSelected = false;
		if (ev.target.checked) {
			allSelected = true;
			//select all items
			this.state.items.forEach(function (item) {
				nowselected.push(item.get('key'));
			});
		} else {
			var selectedItemKey = Zotero.state.getUrlVar('itemKey');
			if (selectedItemKey) {
				nowselected.push(selectedItemKey);
			}
		}
		Zotero.state.selectedItemKeys = nowselected;
		this.setState({ selectedItemKeys: nowselected, allSelected: allSelected });
		this.props.library.trigger("selectedItemsChanged", { selectedItemKeys: nowselected });

		//if deselected all, reselect displayed item row
		if (nowselected.length === 0) {
			this.props.library.trigger('displayedItemChanged');
		}
	},
	newSortOrder: function newSortOrder() {},
	nonreactBind: function nonreactBind() {
		Zotero.eventful.initTriggers();
		if (J("body").hasClass('lib-body')) {
			this.fixTableHeaders(J("#field-table"));
		}
	},
	componentDidMount: function componentDidMount() {
		this.nonreactBind();
	},
	componentDidUpdate: function componentDidUpdate() {
		this.nonreactBind();
	},
	render: function render() {
		var narrow = this.state.narrow;
		var order = this.state.order;
		var sort = this.state.sort;
		var loading = this.state.moreloading;
		var libraryString = this.props.library.libraryString;
		var selectedItemKeys = this.state.selectedItemKeys;
		var selectedItemKeyMap = {};
		selectedItemKeys.forEach(function (itemKey) {
			selectedItemKeyMap[itemKey] = true;
		});

		var sortIcon;
		if (sort == "desc") {
			sortIcon = React.createElement("span", { className: "glyphicons fonticon chevron-down pull-right" });
		} else {
			sortIcon = React.createElement("span", { className: "glyphicons fonticon chevron-up pull-right" });
		}

		var headers = [React.createElement(
			"th",
			{ key: "checkbox-header" },
			React.createElement("input", { type: "checkbox",
				className: "itemlist-editmode-checkbox all-checkbox",
				name: "selectall",
				checked: this.state.allSelected,
				onChange: this.handleSelectAllChange })
		)];
		if (narrow) {
			headers.push(React.createElement(
				"th",
				{ key: "single-cell-header", className: "eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "chooseSortingDialog" },
				Zotero.Item.prototype.fieldMap[order],
				sortIcon
			));
		} else {
			var fieldHeaders = this.state.displayFields.map(function (header, ind) {
				var sortable = Zotero.Library.prototype.sortableColumns.indexOf(header) != -1;
				var selectedClass = header == order ? "selected-order sort-" + sort + " " : "";
				var sortspan = null;
				if (header == order) {
					sortspan = sortIcon;
				}
				return React.createElement(
					"th",
					{
						key: header,
						"data-triggers": "changeItemSorting",
						className: "field-table-header eventfultrigger " + selectedClass + (sortable ? "clickable " : ""),
						"data-columnfield": header,
						"data-library": libraryString },
					Zotero.Item.prototype.fieldMap[header] ? Zotero.Item.prototype.fieldMap[header] : header,
					sortspan
				);
			});
			headers = headers.concat(fieldHeaders);
		}

		var itemRows = this.state.items.map(function (item) {
			var selected = selectedItemKeyMap.hasOwnProperty(item.get('key')) ? true : false;
			if (narrow) {
				return React.createElement(SingleCellItemRow, { key: item.get("key"), item: item, selected: selected });
			} else {
				return React.createElement(ItemRow, { key: item.get("key"), item: item, selected: selected });
			}
		});
		return React.createElement(
			"form",
			{ className: "item-select-form", method: "POST" },
			React.createElement(
				"table",
				{ id: "field-table", ref: "itemsTable", className: "wide-items-table table table-striped" },
				React.createElement(
					"thead",
					null,
					React.createElement(
						"tr",
						null,
						headers
					)
				),
				React.createElement(
					"tbody",
					null,
					itemRows
				)
			),
			React.createElement(LoadingError, { errorLoading: this.state.errorLoading }),
			React.createElement(LoadingSpinner, { loading: this.state.moreloading })
		);
	}
});

var ItemRow = React.createClass({
	displayName: "ItemRow",

	getDefaultProps: function getDefaultProps() {
		return {
			displayFields: ["title", "creatorSummary", "dateModified"],
			selected: false,
			item: {}
		};
	},
	handleSelectChange: function handleSelectChange(ev) {
		var itemKey = this.props.item.get('key');
		Zotero.state.toggleItemSelected(itemKey);
		selected = Zotero.state.getSelectedItemKeys();

		Zotero.ui.widgets.reactitems.reactInstance.setState({ selectedItemKeys: selected });
		Zotero.ui.widgets.reactitems.reactInstance.props.library.trigger("selectedItemsChanged", { selectedItemKeys: selected });
	},
	render: function render() {
		var item = this.props.item;
		var selected = this.props.selected;
		var fields = this.props.displayFields.map(function (field) {
			return React.createElement(ItemField, { key: field, field: field, item: item });
		});
		return React.createElement(
			"tr",
			{ className: selected ? "highlighed" : "" },
			React.createElement(
				"td",
				{ className: "edit-checkbox-td", "data-itemkey": item.get("key") },
				React.createElement("input", { type: "checkbox", onChange: this.handleSelectChange, checked: selected, className: "itemlist-editmode-checkbox itemKey-checkbox", name: "selectitem-" + item.get("key"), "data-itemkey": item.get("key") })
			),
			fields
		);
	}
});

var SingleCellItemRow = React.createClass({
	displayName: "SingleCellItemRow",

	getDefaultProps: function getDefaultProps() {
		return {
			displayFields: ["title", "creatorSummary", "dateModified"],
			selected: false,
			item: {}
		};
	},
	handleSelectChange: function handleSelectChange(ev) {
		var itemKey = this.props.item.get('key');
		Zotero.state.toggleItemSelected(itemKey);
		selected = Zotero.state.getSelectedItemKeys();

		Zotero.ui.widgets.reactitems.reactInstance.setState({ selectedItemKeys: selected });
		Zotero.ui.widgets.reactitems.reactInstance.props.library.trigger("selectedItemsChanged", { selectedItemKeys: selected });
	},
	render: function render() {
		var item = this.props.item;
		var selected = this.props.selected;

		return React.createElement(
			"tr",
			{ className: selected ? "highlighed" : "", "data-itemkey": item.get('key') },
			React.createElement(
				"td",
				{ className: "edit-checkbox-td", "data-itemkey": item.get('key') },
				React.createElement("input", { type: "checkbox", className: "itemlist-editmode-checkbox itemKey-checkbox", name: "selectitem-" + item.get('key'), "data-itemkey": item.get('key') })
			),
			React.createElement(SingleCellItemField, { item: item, displayFields: this.props.displayFields })
		);
	}
});

var SingleCellItemField = React.createClass({
	displayName: "SingleCellItemField",

	render: function render() {
		var item = this.props.item;
		var field = this.props.field;

		var pps = [];
		this.props.displayFields.forEach(function (field) {
			var fieldDisplayName = Zotero.Item.prototype.fieldMap[field] ? Zotero.Item.prototype.fieldMap[field] + ":" : "";
			if (field == "title") {
				pps.push(React.createElement("span", { key: "itemTypeIcon", className: 'sprite-icon pull-left sprite-treeitem-' + item.itemTypeImageClass() }));
				pps.push(React.createElement(ColoredTags, { key: "coloredTags", item: item }));
				pps.push(React.createElement(
					"b",
					{ key: "title" },
					Zotero.ui.formatItemField(field, item, true)
				));
			} else if (field === 'dateAdded' || field === 'dateModified') {
				pps.push(React.createElement("p", { key: field, title: item.get(field), dangerouslySetInnerHtml: { __html: fieldDisplayName + Zotero.ui.formatItemDateField(field, item, true) } }));
			} else {
				pps.push(React.createElement(
					"p",
					{ key: field, title: item.get(field) },
					fieldDisplayName,
					Zotero.ui.formatItemField(field, item, true)
				));
			}
		});
		return React.createElement(
			"td",
			{ className: "single-cell-item", "data-itemkey": item.get('key') },
			React.createElement(
				"a",
				{ className: "item-select-link", "data-itemkey": item.get('key'), href: Zotero.url.itemHref(item) },
				pps
			)
		);
	}
});

var ColoredTags = React.createClass({
	displayName: "ColoredTags",

	render: function render() {
		var item = this.props.item;
		var library = item.owningLibrary;

		var coloredTags = library.matchColoredTags(item.apiObj._supplement.tagstrings);
		Z.debug("coloredTags:" + JSON.stringify(coloredTags));

		return React.createElement("span", { className: "coloredTags" });
	}
});

var ColoredTag = React.createClass({
	displayName: "ColoredTag",

	render: function render() {
		var styleObj = { color: this.props.color };
		return React.createElement(
			"span",
			{ style: styleObj },
			React.createElement("span", { style: styleObj, className: "glyphicons fonticon glyphicons-tag" })
		);
	}
});

var ItemField = React.createClass({
	displayName: "ItemField",

	render: function render() {
		var item = this.props.item;
		var field = this.props.field;
		return React.createElement(
			"td",
			{ className: field, "data-itemkey": item.get("key") },
			React.createElement(
				"a",
				{ className: "item-select-link", "data-itemkey": item.get("key"), href: Zotero.url.itemHref(item), title: item.get(field) },
				Zotero.ui.formatItemField(field, item, true)
			)
		);
	}
});

var LoadingSpinner = React.createClass({
	displayName: "LoadingSpinner",

	render: function render() {
		var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
		return React.createElement(
			"div",
			{ className: "items-spinner", hidden: !this.props.loading },
			React.createElement("img", { className: "spinner", src: spinnerUrl })
		);
	}
});

var LoadingError = React.createClass({
	displayName: "LoadingError",

	render: function render() {
		return React.createElement(
			"p",
			{ hidden: !this.props.errorLoading },
			"There was an error loading your items. Please try again in a few minutes."
		);
	}
});
