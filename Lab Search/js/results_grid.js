dojo.addOnLoad(function(){
	dojo.require("dojox.grid.EnhancedGrid");
	dojo.require("dojox.grid.enhanced.plugins.Pagination");
	dojo.require("dojo.data.ItemFileWriteStore");
	dojo.require("dojox.grid.enhanced.plugins.Filter");
});

var results_id = "resultsGrid";
var expand_all = true;

function col(v) {
    return v ? v.replace('#','') : '';
}

function isInArray(value, array) {
  //checks to see if a value exists in an array
  return array.indexOf(value) > -1;
}

function hasLowerCase(str) {
    if(str.toUpperCase() != str) {
        return true;
    }
    return false;
}

function hasUpperCase(str) {
    if(str.toLowerCase() != str) {
        return true;
    }
    return false;
}

function findUpperCaseLetters(str) {
	var uc = [];
	for(x=0;x<str.length;x++){
		if(str.charAt(x) >= 'A' && str.charAt(x) <= 'Z')
			uc.push(str.indexOf(str.charAt(x)));
	}
	
	return uc;
}

function getStringArray(object) {
	return object = typeof object == 'string' ? [object] : object;
}


function cleanHeader(header){
	var newHeader = "";
	if(header.indexOf("last") == 0)
		header = header.substring(0, 4)  + '_' + header.substring(4, header.length);
	else if(hasUpperCase(header) && header.indexOf("UNIQ") == -1){
		var upperLetters = findUpperCaseLetters(header);
		var concat = header;
		for(var c=0;c<upperLetters.length;c++){
			if(upperLetters[c] != 0){
				if(upperLetters[c+1]){
					upperLetters[c+1] = upperLetters[c+1] + 1;
				}
				concat = concat.substring(0, upperLetters[c]) + "_" + concat.substring(upperLetters[c], concat.length);	
			}
		}
		header = concat;
	}
		
	newHeader = header.replace("$", " - ").toUpperCase().replace("UNIQ", "UNIQUE").split("_").join(" ");
	return newHeader;		
}

function calculateWidth(header, num){
	var width = header.length * num;
	return width;
}

function toggle(inIndex, inShow, grid) {
	var gridNode = dijit.byNode(grid);
	gridNode.expandedRows[inIndex] = inShow;
	gridNode.updateRow(inIndex);
}

function move(array, from, to) {
	  if( to === from ) return;

	  var target = array[from];                         
	  var increment = to < from ? -1 : 1;

	  for(var k = from; k != to; k += increment){
		array[k] = array[k + increment];
	  }
	  array[to] = target;

}

function jsonHandler(results){
	var records = results;
	// Handle a single record.  Turn 'undefined' into '1'.
	var record_length = records.length;
	//console.log(records);
	
	if (record_length == undefined) {
		record_length = 1;
	} else {
		record_length = records.length;
	}	
	
	/*There are 3 sets of Headers needed. The first set is the "origHeaders" which allows for preset headers and compiling the remaining headers. These are used to determine data placement for the rows. */
	var origHeaders = ["Toggle"];
	for (var i=0, total=record_length; i < total; i++) { //loop through documents(rows) to get headers

		records[i]["Toggle"] = "";
		if (record_length == 1)
			var headerRow = records;
		else
			var headerRow = records[i];

		//console.log("header row: "  + headerRow);
		for (var key in headerRow) {
		   if (headerRow.hasOwnProperty(key)) {
		      var objkey = key;
		      if(isInArray(objkey, origHeaders) == false && objkey.indexOf('_') != 0 && objkey != "")
					origHeaders.push(objkey);
		   }
		}
	}

	//console.log(origHeaders);
	//find metadata and content and make sure that they are at the end of the subset
	var meta_idx = origHeaders.indexOf("metadata");
	move(origHeaders, meta_idx, origHeaders.length - 1);
	var content_idx = origHeaders.indexOf("content");
	move(origHeaders, content_idx, origHeaders.length - 1);

	//console.log(origHeaders);
	/*Second is "cleanHeaders" which are the "pretty" headers passed to the detailed view used for displaying. Lastly, "resultWidthHeaders" used in the results table layout and determine width of columns*/
	var cleanHeaders = [], filterWidthHeaders = [], resultWidthHeaders = [], cellSet1 = [], cellSet2 = [], fieldSet = [];
	
	for(var item in origHeaders) {
	    var clean_header = cleanHeader(origHeaders[item]);
		
		if(isInArray(clean_header, cleanHeaders) == false )
		{
			//calculating column widths
			var calc_width = "";
			cleanHeaders.push(clean_header);

			/*

			else if(clean_header == "MEDIA FORMAT"  || clean_header == "LAST MODIFIED")
				calc_width = calculateWidth(clean_header, 10) + "px";*/
			if(clean_header == "PATH")
				calc_width = calculateWidth(clean_header, 66)  + "px";
			else if(clean_header == "AUTHOR" || clean_header.indexOf("UNIQUE") != -1)
				calc_width = calculateWidth(clean_header, 40) + "px";
			else if(clean_header == "PAGE NUMBER")
				calc_width = calculateWidth(clean_header, 9) + "px";
			else if(clean_header == "TOGGLE")
				calc_width = calculateWidth(clean_header, 5) + "px";
			else
				calc_width = 'auto';
				
			if(clean_header == "TOGGLE")
				cellSet1.push({ name: "*", field:origHeaders[item], width: calc_width, headerClasses: ["staticHeader"], styles: "text-align: center; font-size:1.5em;font-weight:bold;", get: getCheck, formatter: formatCheck});
			else if(clean_header.indexOf("AUTHOR") != -1 || clean_header.indexOf("MATADATA") != -1  || clean_header.indexOf("MEDIA FORMAT") != -1  || clean_header.indexOf("LAST MODIFIED") != -1
					|| clean_header.indexOf("PAGE NUMBER") != -1 || clean_header.indexOf("PATH") != -1 || clean_header.indexOf("UNIQUE") != -1)
				cellSet1.push({ name: clean_header, field:origHeaders[item], width: calc_width }); //width:'auto'
			else
				fieldSet.push(origHeaders[item]);
		}
		
	}

	resultWidthHeaders[0] = {onBeforeRow : function(inDataIndex, inSubRows){
							//hide subrow if there is no grid, there are no expanded rows, or it is not expanded
							inSubRows[1].hidden = (!this.grid || !this.grid.expandedRows || !this.grid.expandedRows[inDataIndex]);

                        }};
	resultWidthHeaders[0]["cells"] = [cellSet1];
	cellSet2.push({ name
	: "DETAILS", field:"Filing_Details", fields:fieldSet, width: calc_width, colSpan : cellSet1.length, headerClasses: ["staticHeader"], filterable: true, formatter: formatDetail});
	resultWidthHeaders[0]["cells"].push(cellSet2);

	//console.log(resultWidthHeaders);
	/*Now set the data for each row*/
	var setResultsRows = [];
			
	for (var i=0, total=record_length; i < total; i++) {
		if (record_length == 1) 
			var row = records;
		else
			var row = records[i];
		
		var link = {};
		//console.log(row);
		for(key in origHeaders) {
			var value = row[origHeaders[key]];
			if(!value)
				value = "";

			var _array = getStringArray(value);
			if(_array.length > 1 && _array.length < 3){
				for(var j=0; j < _array.length; j++){
					var new_value = _array[j];
					if(j == 0)
						link[origHeaders[key]] = new_value;
					else if(j > 0 && new_value != "")
						link[origHeaders[key]] += " to " + new_value;
				}
			}	
			else
				link[origHeaders[key]] = value;
		}
		
		setResultsRows.push(link); 	
	}

	buildGrid(resultWidthHeaders, setResultsRows, results_id, results_id + "Div");

	function buildGrid(headers, rows, grid_id, placement_div, grid_type){
		/*Start building the results viewer table*/
		var results_data = {
		  identifier: 'id',
		  items: []
		};
		
		for(var i=0; i<rows.length; i++){
		  results_data.items.push(dojo.mixin({ id: i+1 }, rows[i]));
		}

		var store = new dojo.data.ItemFileReadStore({data: results_data});
		var layout = headers;
		var registered_grid = dijit.registry.byId(grid_id);
		var paging_rules = {id: "paginator", pageSizes: ["20", "100", "300", "600", "1000"], description: true, 	defaultPageSize:20, sizeSwitch: true,pageStepper: true, gotoButton: true, maxPageStep: 5, 	position: "bottom"};
		var filter_rules = {closeFilterbarButton: true, itemsName: "records", ruleCount: 4,ruleCountToConfirmClearFilter: 3};
		var results_plugins = {filter: filter_rules, pagination: paging_rules};

		if(registered_grid == undefined){	
			/*create a new grid*/
			var grid = new dojox.grid.EnhancedGrid({
				id: grid_id,
				store: store,
				structure: layout,
				selectable: true,
				clientSort : true,
				rowSelector: '10px',
				selectionMode: 'single',
				autoHeight: true,
				autoWidth: false,
				plugins: results_plugins,
				canSort: function(col) { return col != 0}
			}, document.createElement('div'));
			
			dojo.connect(grid, "onHeaderCellClick", grid, function(e){
					if(e.cell.index == 0){
						if(expand_all == true){
							var rows_to_alter = [];
							this.store.fetch({
								 onComplete: function (items) {
									 dojo.forEach(items, function (item, index) {
											rows_to_alter[index] = true;
									 })
								 }
							});
							
							this.expandedRows = rows_to_alter;
							expand_all = false;
						}
						else{
							this.expandedRows = [];
							expand_all = true;
						}
						this.updateRows(0, this.getTotalRowCount() - 1);	
					}

			});
			
			/*dojo.connect(grid, "onRowClick", grid, function(e){
					var idx = e.rowIndex, clickedRow = grid.getItem(idx);
					if(this.expandedRows[idx] == true)
						this.expandedRows[idx] = false;
					else
						this.expandedRows[idx] = true;
					
					this.updateRow(idx);
			});*/
			
			grid.placeAt(placement_div);
			grid.startup();
		}
		else
		{
			//if grid has already been created, just replace the layout and store. 
			var grid = dijit.byId(grid_id);
			grid.setStructure(layout);
			grid.setStore(store);
			grid.placeAt(placement_div);
			grid.sort();

			var sourceName = "";
			if (sourceName != "") {
				grid.setFilter([{type: 'string', condition: 'equalTo', column: 0, value: ''+ sourceName +''}]);
			}
			grid.startup();
		}
	}
	
	function formatDetail(value, inRowIndex){
		//every other index, display formatted  data
		var fields = this._props.fields;
		var value_length = Object.keys(value).length;
		var counter = 0;
		var html = "<div id='criteria_input' style='width:100%; margin:2px;'>";
		$.each(value, function( index, val ){

			if(fields[counter] == "content" ||  fields[counter] == "metadata"){
				html += createColumns(cleanHeader(fields[counter]), val, "left", false, true);
			}
			else{
				if(counter % 2 == 0){
					if( counter == value_length - 1)//if last
						html += createColumns(cleanHeader(fields[counter]), val, "left", true, true);
					else 
						html += createColumns(cleanHeader(fields[counter]), val, "left", true, false);
				}
				else
					html += createColumns(cleanHeader(fields[counter]), val, "right", true, true);
			}
			counter ++;
		});
		
		html += "</div>";
		return html;
	}
	
	function getCheck(inRowIndex) {
		if (!this.grid.expandedRows)
			this.grid.expandedRows = [ ];
			
			return {image: (this.grid.expandedRows[inRowIndex] ? 'open.gif' : 'closed.gif'),
					show: (this.grid.expandedRows[inRowIndex] ? 'false' : 'true')};
	}
	
	function formatCheck(value, inRowIndex){
		return html = '<img src="images/' + value.image + '" onclick="toggle(' + inRowIndex + ', ' + value.show +  ', ' + results_id + ');" height="11" width="11"/>';
	}
	
	function createColumns (label, value, placement, split_row, complete_row){
		var html = "";
		
		if(label.indexOf("LINK") != -1 && value.indexOf("http") == 0){
			console.log(label);
			value = "<a href='" + value + "' class='value-cool'>" + value + "</a>";
			console.log(value);
		}

		if (placement == "left")
			html += "<div class='row'>";
		
		if(split_row == true)
			html += "<div class='cell two_halves " + placement + "'><p>" + label + " : <span class='value-cool'>" + value + "</span></p></div>";
		else
			html += "<div class='cell " + placement + "'><p>" + label + " : <span class='value-cool'>" + value + "</span></p></div>";
		
		if(placement == "right"  || complete_row == true)
			html += "</div>";

		return html;
	}

}

