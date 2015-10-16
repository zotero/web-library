Zotero.ui.widgets.reactitem = {};
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.reactitem.init = function(el){
	var library = Zotero.ui.getAssociatedLibrary(el);
	
	var reactInstance = ReactDOM.render(
		<ItemDetails library={library} />,
		document.getElementById('item-widget-div')
	);
	Zotero.ui.widgets.reactitem.reactInstance = reactInstance;
	
	library.listen("displayedItemChanged modeChanged", Zotero.ui.widgets.reactitem.loadItem, {widgetEl: el});
	library.listen("itemTypeChanged", Zotero.ui.widgets.reactitem.itemTypeChanged, {widgetEl:el});
	library.listen("uploadSuccessful", Zotero.ui.widgets.reactitem.refreshChildren, {widgetEl:el});
	
	library.listen("addTag", Zotero.ui.widgets.reactitem.addTag, {widgetEl:el});
	library.listen("removeTag", Zotero.ui.widgets.reactitem.removeTag, {widgetEl:el});
	
	library.listen("addCreator", Zotero.ui.widgets.reactitem.addCreator, {widgetEl:el});
	library.listen("removeCreator", Zotero.ui.widgets.reactitem.removeCreator, {widgetEl:el});
	
	library.listen("switchCreatorFields", Zotero.ui.widgets.reactitem.switchCreatorFields, {widgetEl:el});
	
	library.listen("addNote", Zotero.ui.widgets.reactitem.addNote, {widgetEl:el});
	library.listen("tagsChanged", Zotero.ui.widgets.reactitem.updateTypeahead, {widgetEl:el});

	library.listen("showChildren", Zotero.ui.widgets.reactitem.refreshChildren, {widgetEl:el});
	
	
	library.listen("edit-item-field edit-creator-field", Zotero.ui.widgets.reactitem.clickToEdit, {widgetEl:el});
	library.listen("edit-item-tag", Zotero.ui.widgets.reactitem.clickToEdit, {widgetEl:el});
	
	//watch buttons on item field from widget DOM element
	var container = J(el);
	
	Zotero.state.bindTagLinks(container);
	Zotero.state.bindItemLinks(container);
	
	//add a new tag when user presses enter in add-tag-input
	container.on('keydown', "input#add-tag-input", function(e){
		Z.debug("add-tag-input keydown");
		e.stopImmediatePropagation();
		if (e.keyCode === Zotero.ui.keyCode.ENTER){
			var input = J(this);
			var itemKey = input.data('itemkey');
			var item = library.items.getItem(itemKey);
			var newTagString = input.val();
			var itemTags = item.get('tags');
			itemTags.push({tag:newTagString});
			Zotero.ui.saveItem(item);
			container.find("div.item-tags-list").append(J("#taglistitemTemplate").render({tag:newTagString},
			{
				item:item,
				key: "tag",
				value: newTagString,
				itemKey: itemKey,
				libraryString: library.libraryString,
				tagIndex: (itemTags.length - 1),
			}));
			container.find('span.tag-count').html(itemTags.length);
			input.val('');
			Zotero.eventful.initTriggers(container);
		}
	});
	
	//blur field when user presses enter in item field input to trigger save
	container.on('keydown', ".item-field-control", function(e){
		e.stopImmediatePropagation();
		if (e.keyCode === Zotero.ui.keyCode.ENTER){
			J(this).blur();
		}
	});
	
	container.on('blur', '.item-field-control', function(e){
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

	library.trigger("displayedItemChanged");
};

Zotero.ui.widgets.reactitem.loadItem = function(event){
	Z.debug('Zotero eventful loadItem', 3);
	var widgetEl = J(event.data.widgetEl);
	var triggeringEl = J(event.triggeringElement);
	var loadingPromise;
	
	//clean up RTEs before we end up removing their dom elements out from under them
	Zotero.ui.cleanUpRte(widgetEl);
	
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	//clear contents and show spinner while loading
	//itemInfoPanel.empty();
	//Zotero.ui.showSpinner(itemInfoPanel);
	
	//get the key of the item we need to display, or display library stats
	var itemKey = Zotero.state.getUrlVar('itemKey');
	if(!itemKey){
		Z.debug("No itemKey - " + itemKey, 3);
		Zotero.ui.widgets.reactitem.reactInstance.setState({item:null});
		//itemInfoPanel.empty();
		//Zotero.ui.widgets.reactitem.displayStats(library, widgetEl);
		return Promise.reject(new Error("No itemkey - " + itemKey));
	}
	
	//if we are showing an item, load it from local library of API
	//then display it
	var loadedItem = library.items.getItem(itemKey);
	if(loadedItem){
		Z.debug("have item locally, loading details into ui", 3);
		loadingPromise = Promise.resolve(loadedItem);
	}
	else{
		Z.debug("must fetch item from server", 3);
		var config = {
			'target':'item',
			'libraryType':library.type,
			'libraryID':library.libraryID,
			'itemKey':itemKey
		};
		Zotero.ui.widgets.reactitem.reactInstance.setState({itemLoading:true});
		
		loadingPromise = library.loadItem(itemKey);
	}
	loadingPromise.then(function(item){
		loadedItem = item;
	}).then(function(){
		return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
	}).then(function(creatorTypes){
		Z.debug("setting state with loaded item, before triggering showChildren");
		Zotero.ui.widgets.reactitem.reactInstance.setState({item:loadedItem, itemLoading:false});
		Z.debug("set loaded item into state; triggering showChildren");
		library.trigger('showChildren');
		Zotero.eventful.initTriggers(widgetEl);
	});
	loadingPromise.catch(function(err){
		Z.error("loadItem promise failed");
		Z.error(err);
	}).then(function(){
		widgetEl.removeData('loadingPromise');
	}).catch(Zotero.catchPromiseError);
	
	widgetEl.data('loadingPromise', loadingPromise);
	return loadingPromise;
};

/**
 * Add creator field to item edit form
 * @param {DOM Button} button Add creator button clicked
 */
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

/**
 * Remove a creator from an edit item form
 * @param  {Dom Button} button Remove creator button that was clicked
 * @return {undefined}
 */
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

/**
 * Add a note field to an editItem Form
 * @param {Dom Button} button Add note button that was clicked
 */
Zotero.ui.widgets.reactitem.addNote = function(e){
	Z.debug("Zotero.ui.addNote", 3);
	var button = J(e.currentTarget);
	var container = button.closest("form");
	//var itemKey = J(button).data('itemkey');
	var notenum = 0;
	var lastNoteIndex = container.find("textarea.note-text:last").data('noteindex');
	if(lastNoteIndex){
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
Zotero.ui.widgets.reactitem.addTag = function(e, focus) {
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

Zotero.ui.widgets.reactitem.addTagTypeahead = function(library, widgetEl){
	Z.debug('adding typeahead', 3);
	var typeaheadSource = library.tags.plainList;
	if(!typeaheadSource){
		typeaheadSource = [];
	}
	var ttEngine = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
	});
	ttEngine.initialize();
	widgetEl.find("input.taginput").typeahead('destroy');
	widgetEl.find("input.taginput").typeahead(
		{
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		}
	);
};

Zotero.ui.widgets.reactitem.addTagTypeaheadToInput = function(library, element){
	Z.debug('adding typeahead', 3);
	var typeaheadSource = library.tags.plainList;
	if(!typeaheadSource){
		typeaheadSource = [];
	}
	var ttEngine = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
	});
	ttEngine.initialize();
	J(element).typeahead('destroy');
	J(element).typeahead(
		{
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		}
	);
};

/**
 * Render and display full item details into an element
 * @param  {Zotero_Item} item Zotero Item to display
 * @param  {Dom Element} el   Container
 * @return {undefined}
 */
Zotero.ui.widgets.reactitem.loadItemDetail = function(item, el){
	Z.debug("Zotero.ui.widgets.reactitem.loadItemDetail", 3);
	var jel = J(el);
	//itemInfoPanel = jel.find("#item-info-panel");
	//itemInfoPanel.empty();
	/*
	var parentUrl = false;
	var library = item.owningLibrary;
	if(item.apiObj.data.parentItem){
		parentUrl = library.websiteUrl({itemKey:item.apiObj.data.parentItem});
	}
	
	Z.debug("setting state on item reactInstance");
	Z.debug(item);
	*/
	/*
	if(item.apiObj.data.itemType == "note"){
		Z.debug("note item", 3);
		jel.empty().append( J('#itemnotedetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
	}
	else{
		Z.debug("non-note item", 3);
		jel.empty().append( J('#itemdetailsTemplate').render({item:item, parentUrl:parentUrl, libraryString:library.libraryString}) );
	}
	*/
	var rteType = "default"
	if(!Zotero.config.librarySettings.allowEdit){
		rteType = "readonly"
	}
	Zotero.ui.init.rte(rteType);
	
	try{
		//trigger event for Zotero translator detection
		var ev = document.createEvent('HTMLEvents');
		ev.initEvent('ZoteroItemUpdated', true, true);
		document.dispatchEvent(ev);
	}
	catch(e){
		Zotero.error("Error triggering ZoteroItemUpdated event");
	}
	jel.data('itemkey', item.apiObj.key);
};

//get stats from library.items and display them in the item info pane when we
//don't have a selected item to show
/*
Zotero.ui.widgets.reactitem.displayStats = function(library, widgetEl) {
	Z.debug("Zotero.ui.widgets.reactitem.displayStats", 3);
	var totalResults = library.items.totalResults;
	if(totalResults){
		J(widgetEl).html("<p class='item-count'>" + totalResults + " items in this view</p>");
	}
};
*/

/**
 * Get an item's children and display summary info
 * @param  {DOM Element} el      element to insert into
 * @param  {string} itemKey key of parent item
 * @return {undefined}
 */
Zotero.ui.widgets.reactitem.refreshChildren = function(e){
	Z.debug('Zotero.ui.widgets.reactitem.refreshChildren', 3);
	var widgetEl = J(e.data.widgetEl);
	var childrenPanel = widgetEl.find("#item-children-panel");
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	var itemKey = Zotero.state.getUrlVar('itemKey');
	if(!itemKey){
		Z.debug("No itemKey - " + itemKey, 3);
		//widgetEl.empty();
		//TODO: display information about library like client?
		return Promise.reject(new Error("No itemkey - " + itemKey));
	}
	
	var item = library.items.getItem(itemKey);
	
	Zotero.ui.widgets.reactitem.reactInstance.setState({loadingChildren:true});
	//Zotero.ui.showSpinner(childrenPanel);
	var p = item.getChildren(library)
	.then(function(childItems){
		var container = childrenPanel;
		/*container.html( J('#childitemsTemplate').render({
			childItems:childItems,
			libraryString: library.libraryString
		}) );*/
		//Zotero.eventful.initTriggers(container);
		Zotero.state.bindItemLinks(container);
		Zotero.ui.widgets.reactitem.reactInstance.setState({childItems: childItems, loadingChildren:false});
	})
	.catch(Zotero.catchPromiseError);
	return p;
};


Zotero.ui.widgets.reactitem.itemFormKeydown = function(e){
	return;
	if ( e.keyCode === Zotero.ui.keyCode.ENTER ){
		Z.debug(e);
		e.preventDefault();
		var triggeringEl = J(this);
		if(triggeringEl.hasClass('taginput')){
			var library = Zotero.ui.getAssociatedLibrary(triggeringEl);
			if(triggeringEl.hasClass('tt-query')){
				var val = triggeringEl.val();
				triggeringEl.typeahead('setQuery', val);
				triggeringEl.trigger('blur');
			}
			if(library){
				library.trigger("addTag");
			}
			return;
		}
		var nextEligibleSiblings = J(this).nextAll("input, button, textarea, select");
		if(nextEligibleSiblings.length){
			nextEligibleSiblings.first().focus();
		}
		else{
			J(this).closest("tr").nextAll().find("input, button, textarea, select").first().focus();
		}
	}
};

Zotero.ui.widgets.reactitem.updateTypeahead = function(event){
	return;
	Z.debug("updateTypeahead", 3);
	var widgetEl = J(event.data.widgetEl);
	var triggeringEl = J(event.triggeringElement);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	if(library){
		Zotero.ui.widgets.reactitem.addTagTypeahead(library, widgetEl);
	}
};



//switch an item field to a form input when clicked to edit (and is editable by the user)
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

Zotero.ui.widgets.reactitem.switchCreatorFields = function(e){
	return;
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

/**
 * save an item after a field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
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

/**
 * save an item after a creator field that was being edited has lost focus
 * @param  {event} e DOM Event triggering callback
 * @return {boolean}
 */
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
	getDefaultProps: function() {
		return {
			creator:{
				creatorType: "author",
				name: "",
				firstName: "",
				lastName: ""
			},
			libraryString: "",
			creatorIndex: 0,
		};
	},
	getInitialState: function() {
		return {
			creatorType: "author"
		};
	},
	render: function() {
		Z.debug("CreatorRow render");
		Z.debug(this.props.item);
		Z.debug(this.props.creator);
		//return null;
		if(this.props.item == null){
			return null;
		}
		var nameSpans = null;
		
		if(this.props.creator.name && this.props.creator.name != "") {
			nameSpans = <NameSpan creatorIndex={this.props.creatorIndex} libraryString={this.props.libraryString} item={this.props.item} creator={this.props.creator} />
		} else {
			nameSpans = [
				<LastNameSpan key="lastName" creatorIndex={this.props.creatorIndex} libraryString={this.props.libraryString} item={this.props.item} creator={this.props.creator} />,
				", ",
				<FirstNameSpan key="firstName" creatorIndex={this.props.creatorIndex} libraryString={this.props.libraryString} item={this.props.item} creator={this.props.creator} />
			];
		}
		return (
			<tr className="creator-row" data-creatorindex={this.props.creatorIndex}>
				<CreatorTypeHeader item={this.props.item} libraryString={this.props.libraryString} creatorIndex={this.props.creatorIndex} creator={this.props.creator} />
				<td className={this.state.creatorType}>
					{nameSpans}
					<div className="btn-toolbar" role="toolbar">
						<ToggleCreatorFieldButton item={this.props.item} libraryString={this.props.libraryString} creatorIndex={this.props.creatorIndex} />
						<AddRemoveCreatorFieldButtons item={this.props.item} libraryString={this.props.libraryString} creatorIndex={this.props.creatorIndex} />
					</div>
				</td>
			</tr>
		);
	}
});

var CreatorTypeHeader = React.createClass({
	getDefaultProps: function() {
		return {
			item: null,
			creatorIndex: 0,
			libraryString: ""
		}
	},
	render: function() {
		var itemKey = this.props.item ? this.props.item.get('key') : "";
		if(this.props.item == null){
			return null;
		}
		return (
			<th>
				<span className="editable-creator-field eventfultrigger"
					tabIndex="0"
					data-creatorindex={this.props.creatorIndex}
					data-triggers="edit-creator-field"
					data-event="focus"
					data-library={this.props.libraryString}
					data-itemfield="creatorType"
					data-itemkey={itemKey}
					data-value={this.props.creator.creatorType}>
						{this.props.item.creatorMap[this.props.creator.creatorType]}
				</span>
			</th>
		);
	}
});

var NameSpan = React.createClass({
	render: function() {
		return (
			<span className="editable-creator-field eventfultrigger"
				tabIndex="0"
				data-creatorindex={this.props.creatorIndex}
				data-triggers="edit-creator-field"
				data-event="focus"
				data-library={this.props.libraryString}
				data-itemfield="name"
				data-itemkey={this.props.item.get('key')}
				data-value={this.props.creator.name}>
				{this.props.creator.name != "" ? this.props.creator.name : "(full name"}
			</span>
		);
	}
});

var LastNameSpan = React.createClass({
	render: function() {
		return (
			<span className="editable-creator-field eventfultrigger"
				tabIndex="0"
				data-creatorindex={this.props.creatorIndex}
				data-triggers="edit-creator-field"
				data-event="focus"
				data-library={this.props.libraryString}
				data-itemfield="lastName"
				data-itemkey={this.props.item.get('key')}
				data-value={this.props.creator.lastName}>
				{this.props.creator.lastName != "" ? this.props.creator.lastName : "(last)"}
			</span>
		);
	}
});

var FirstNameSpan = React.createClass({
	render: function() {
		return (
			<span className="editable-creator-field eventfultrigger"
				tabIndex="0"
				data-creatorindex={this.props.creatorIndex}
				data-triggers="edit-creator-field"
				data-event="focus"
				data-library={this.props.libraryString}
				data-itemfield="firstName"
				data-itemkey={this.props.item.get('key')}
				data-value={this.props.creator.firstName}>
				{this.props.creator.firstName != "" ? this.props.creator.firstName : "(first)"}
			</span>
		);
	}
});

var ToggleCreatorFieldButton = React.createClass({
	render: function() {
		return (
			<div className="btn-group">
				<button type="button"
					className="switch-two-field-creator-link btn btn-default eventfultrigger"
					title="Toggle single field creator"
					data-triggers="switchCreatorFields"
					data-itemkey={this.props.item.get('key')}
					data-library={this.props.libraryString}
					data-creatorindex={this.props.creatorIndex}>
					<span className="fonticon glyphicons glyphicons-unchecked"></span>
				</button>
			</div>
		);
	}
});

var AddRemoveCreatorFieldButtons = React.createClass({
	render: function() {
		return (
			<div className="btn-group">
				<button type="button"
					className="btn btn-default eventfultrigger"
					data-triggers="removeCreator"
					data-itemkey={this.props.item.get('key')}
					data-library={this.props.libraryString}
					data-creatorindex={this.props.creatorIndex}>
					<span className="fonticon glyphicons glyphicons-minus"></span>
				</button>
				<button type="button"
					className="btn btn-default eventfultrigger"
					data-triggers="addCreator"
					data-itemkey={this.props.item.get('key')}
					data-library={this.props.libraryString}
					data-creatorindex={this.props.creatorIndex}>
					<span className="fonticon glyphicons glyphicons-plus"></span>
				</button>
			</div>
		);
	}
});

var ItemNavTabs = React.createClass({
	getDefaultProps: function() {
		return {
			item: null
		}
	},
	render: function() {
		if(this.props.item == null){
			return null;
		}
		if(!this.props.item.isSupplementaryItem()){
			return (
				<ul className="nav nav-tabs" role="tablist">
					<li role="presentation" className="active"><a href="#item-info-panel" aria-controls="item-info-panel" role="tab" data-toggle="tab">Info</a></li>
					<li role="presentation"><a href="#item-children-panel" aria-controls="item-children-panel" role="tab" data-toggle="tab">Children</a></li>
					<li role="presentation"><a href="#item-tags-panel" aria-controls="item-tags-panel" role="tab" data-toggle="tab">Tags</a></li>
				</ul>
			);
		}
		return null;
	}
});

var GenericItemFieldRow = React.createClass({
	render: function() {
		Z.debug()
		var placeholderOrValue = this.props.val == "" ? (<div className="empty-field-placeholder"></div>) : Zotero.ui.formatItemField(this.props.fieldName, this.props.item);
		if(this.props.fieldName == 'url'){
			return (
				<tr>
					<th><a rel='nofollow' href={this.props.val}>{Zotero.Item.prototype.fieldMap[this.props.fieldName]}</a></th>
					<td className={this.props.fieldName}>
						<span className="editable-item-field eventfultrigger" tabIndex="0" data-triggers="edit-item-field" data-event="focus" data-library={this.props.libraryString} data-itemfield={this.props.fieldName} data-itemkey={this.props.item.get('key')}>
							{placeholderOrValue}
						</span>
					</td>
				</tr>
			);
		} else if(this.props.fieldName == 'DOI') {
			return (
				<tr>
					<th><a rel='nofollow' href={'http://dx.doi.org/' + this.props.val}>{Zotero.Item.prototype.fieldMap[this.props.fieldName]}</a></th>
					<td className={this.props.fieldName}>
						<span className="editable-item-field eventfultrigger" tabIndex="0" data-triggers="edit-item-field" data-event="focus" data-library={this.props.libraryString} data-itemfield={this.props.fieldName} data-itemkey={this.props.item.get('key')}>
							{placeholderOrValue}
						</span>
					</td>
				</tr>
			);
		} else if(Zotero.config.richTextFields[this.props.fieldName]) {
			return (
				<tr>
					<th>{Zotero.Item.prototype.fieldMap[this.props.fieldName]}}</th>
					<td className={this.props.fieldName}>
						<span className="editable-item-field eventfultrigger" tabIndex="0" data-triggers="edit-item-field" data-event="focus" data-library={this.props.libraryString} data-itemfield={this.props.fieldName} data-itemkey={this.props.item.get('key')}>
							<textarea cols="40" rows="14" name={this.props.fieldName} className="rte">{this.props.val}</textarea>
						</span>
					</td>
				</tr>
			);
		} else {
			return (
				<tr>
					<th>{Zotero.Item.prototype.fieldMap[this.props.fieldName] || this.props.fieldName}</th>
					<td className={this.props.fieldName}>
						<span className="editable-item-field eventfultrigger" tabIndex="0" data-triggers="edit-item-field"  data-event="focus" data-library={this.props.libraryString} data-itemfield={this.props.fieldName} data-itemkey={this.props.item.get('key')}>
							{placeholderOrValue}
						</span>
					</td>
				</tr>
			);
		}
	}
});

var ItemInfoPanel = React.createClass({
	getDefaultProps: function() {
		return {
			item: null,
			loading: false
		};
	},
	render: function() {
		var item = this.props.item;
		Z.debug("ItemInfoPanel render: items.totalResults: " + this.props.library.items.totalResults);
		var itemCountP = (
			<p className='item-count' hidden={!this.props.libraryItemsLoaded}>
				{this.props.library.items.totalResults + " items in this view"}
			</p>
		);
		
		var libraryString = this.props.library.libraryString;
		
		if(item == null){
			return (
				<div id="item-info-panel" role="tabpanel" className="item-details-div eventfulwidget tab-pane active">
					<LoadingSpinner loading={this.props.loading} />
					{itemCountP}
				</div>
			)
		}

		var itemKey = item.get('key');
		var libraryType = item.owningLibrary.libraryType;
		var parentUrl = false;
		if(item.get("parentItem")) {
			parentUrl = this.props.library.websiteUrl({itemKey:item.get("parentItem")});
		}
		var parentLink = parentUrl ? <a href={parentUrl} className="item-select-link" data-itemkey={item.get('parentItem')}>Parent Item</a> : null;
		var libraryIDSpan;
		if(libraryType == "user") {
			libraryIDSpan = <span id="libraryUserID" title={item.apiObj.library.id}></span>;
		} else {
			libraryIDSpan = <span id="libraryGroupID" title={item.apiObj.library.id}></span>
		}
		
		//the Zotero user that created the item, if it's a group library item
		var zoteroItemCreatorRow = null;
		if(libraryType == "group") {
			zoteroItemCreatorRow = (
				<tr>
					<th>Added by</th>
					<td className="user-creator"><a href={item.apiObj.meta.createdByUser.links.alternate.href} className="user-link">{item.apiObj.meta.createdByUser.name}</a></td>
				</tr>
			);
		}

		var creatorRows = [];
		if(item.isSupplementaryItem()){
			creatorRows = [];
		} else if(item.get('creators').length > 0){
			creatorRows = item.get('creators').map(function(creator, ind) {
				return (
					<CreatorRow key={ind} creator={creator} creatorIndex={ind} libraryString={libraryString} item={item} />
				);
			});
		} else {
			creatorRows = [
				<CreatorRow key={0} creatorIndex={0} libraryString={libraryString} item={item} />
			];
		}
		var genericFieldRows = [];
		//filter out fields we don't want to display or don't want to include as generic
		var genericDisplayedFields = Object.keys(item.apiObj.data).filter(function(field){
			if(Zotero.Item.prototype.hideFields.indexOf(field) != -1) {
				return false;
			}
			if(!item.fieldMap.hasOwnProperty(field)){
				return false;
			}
			if(field == "title" || field == "creators" || field == "itemType"){
				return false;
			}
			return true;
		});
		genericDisplayedFields.forEach(function(key) {
			genericFieldRows.push(<GenericItemFieldRow key={key} fieldName={key} item={item} val={item.apiObj.data[key]} libraryString={libraryString} />);
		});
		return (
			<div id="item-info-panel" role="tabpanel" className="item-details-div eventfulwidget tab-pane active">
				<LoadingSpinner loading={this.props.loading} />
				{parentLink}
				{libraryIDSpan}
				<table className="item-info-table table" data-itemkey={itemKey}>
					<tbody>
						{zoteroItemCreatorRow}
						
						<tr>
							<th>Item Type</th>
							<td className={"itemType " + item.get('itemType')}>
								<span className="editable-item-field eventfultrigger" tabIndex="0" data-triggers="edit-item-field" data-event="focus" data-library={libraryString} data-itemfield="itemType" data-itemkey={item.get('key')}>{item.typeMap[item.get('itemType')]}</span>
							</td>
						</tr>

						<tr>
							<th>{item.fieldMap['title']}</th>
							<td className="title">
								<span className="editable-item-field eventfultrigger" tabIndex="0" data-triggers="edit-item-field" data-event="focus" data-library={libraryString} data-itemfield="title" data-itemkey={item.get('key')}>{Zotero.ui.formatItemField("title", item)}</span>
							</td>
						</tr>

						{creatorRows}
						
						{genericFieldRows}
					</tbody>
				</table>
			</div>
		);
	}
});

var TagListRow = React.createClass({
	getDefaultProps: function(){
		return {
			tagIndex:0,
			tag:{tag:""},
			item:null,
			library:null
		};
	},
	render: function() {
		return (
			<div className="row item-tag-row">
				<div className="col-xs-1">
					<span className="glyphicons fonticon glyphicons-tag"></span>
				</div>
				<div className="col-xs-9">
					<span className="editable-item-tag eventfultrigger"
						tabIndex="0"
						data-triggers="edit-item-field"
						data-event="focus"
						data-library={this.props.library.libraryString}
						data-itemfield="tag"
						data-value={this.props.tag.tag}
						data-itemkey={this.props.item.get('key')}
						data-tagindex={this.props.tagIndex} >
						{this.props.tag.tag}
					</span>
				</div>
				<div className="col-xs-2">
					<button type="button" className="remove-tag-link btn btn-default eventfultrigger" data-triggers="removeTag" data-library={this.props.library.libraryString}>
						<span className="glyphicons fonticon glyphicons-minus"></span>
					</button>
				</div>
			</div>
		);
	}
});

var ItemTagsPanel = React.createClass({
	render: function() {
		var item = this.props.item;
		var library = this.props.library;
		if(item == null) {
			return (
				<div id="item-tags-panel" role="tabpanel" className="item-tags-div tab-pane">
				</div>
			);
		}
		var tagRows = [];
		var tagRows = item.apiObj.data.tags.map(function(tag, ind){
			return (
				<TagListRow key={tag.tag} library={library} item={item} tag={tag} tagIndex={ind} />
			);
		});
		
		return (
			<div id="item-tags-panel" role="tabpanel" className="item-tags-div tab-pane">
				<p><span className="tag-count">{item.get('tags').length}</span> tags</p>
				<button className="add-tag-button eventfultrigger btn btn-default" data-triggers="addTag" data-library={this.props.libraryString} data-itemkey={item.get('key')}>Add Tag</button>
				
				<div className="item-tags-list">
					{tagRows}
				</div>
				<div className="add-tag-form form-horizontal">
					<div className="form-group">
						<div className="col-xs-1">
							<label htmlFor="add-tag-input"><span className="glyphicons fonticon glyphicons-tag"></span></label>
						</div>
						<div className="col-xs-11">
							<input type="text" id="add-tag-input" className="add-tag-input form-control"
								data-library={this.props.library.libraryString}
								data-itemfield="tag"
								data-itemkey={item.get('key')}
								/>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var ItemChildrenPanel = React.createClass({
	getDefaultProps: function() {
		return {
			childItems: []
		}
	},
	render: function() {
		var childListEntries = this.props.childItems.map(function(item, ind){
			var title = item.get('title');
			var href = Zotero.url.itemHref(item);
			var iconClass = item.itemTypeIconClass();
			if(item.itemType == "note"){
				return (
					<li>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						<a className='item-select-link' data-itemkey={item.get('key')} href={href} title={title}>{title}</a>
					</li>
				);
			} else if(item.attachmentDownloadUrl == false) {
				return (
					<li>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						{title}
						(<a className='item-select-link' data-itemkey={item.get('key')} href={href} title={title}>Attachment Details</a>)
					</li>
				);
			} else {
				var attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
				return (
					<li>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						<a className='itemdownloadlink' href={attachmentDownloadUrl}>{title} {Zotero.url.attachmentFileDetails(item)}</a>
						(<a className='item-select-link' data-itemkey={item.get('key')} href={href} title={title}>Attachment Details</a>)
					</li>
				);
			}
		});
		return (
			<div id="item-children-panel" role="tabpanel" className="item-children-div tab-pane">
				<ul id="notes-and-attachments">
					{childListEntries}
				</ul>
				<button type="button" id="upload-attachment-link" className="btn btn-primary upload-attachment-button eventfultrigger" data-triggers="uploadAttachment" data-library={this.props.library.libraryString} hidden={!Zotero.config.librarySettings.allowUpload}>Upload File</button>
			</div>
		);
	}
});

var ItemTabPanes = React.createClass({
	render: function() {
		return (
			<div className="tab-content">
				<ItemInfoPanel library={this.props.library} item={this.props.item} loading={this.props.itemLoading} libraryItemsLoaded={this.props.libraryItemsLoaded} />
				<ItemChildrenPanel library={this.props.library} childItems={this.props.childItems} loading={this.props.childrenLoading} />
				<ItemTagsPanel library={this.props.library} item={this.props.item} />
			</div>
		);
	}
});


var ItemDetails = React.createClass({
	getInitialState: function() {
		return {
			item: null,
			childItems: [],
			itemLoading:false,
			childrenLoading:false,
			libraryItemsLoaded:false
		}
	},
	render: function() {
		return (
			<div role="tabpanel">
				<ItemNavTabs item={this.state.item} />
				<ItemTabPanes item={this.state.item} library={this.props.library} childItems={this.state.childItems} itemLoading={this.state.itemLoading} childrenLoading={this.state.childrenLoading} libraryItemsLoaded={this.state.libraryItemsLoaded} />
			</div>
		);
	}
});
