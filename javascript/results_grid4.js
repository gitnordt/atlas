dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.enhanced.plugins.Pagination");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.enhanced.plugins.Filter");

function jsonHandler4(results)
{

//Proceeding 	Name of Filer 	Received 	Type 	Pages
var grid_id = "resultsGrid";
var data =
                {
					identifier : 'id',
					items : 
					[
							
								{
										id : 0,
										a : 1,
										b : 2,
										c : 3,
										d : 4,
										e : 5,
										f : 6,
										g : 7
							
										
								},
								{
										id : 1,
										a : 6,
										b : 5,
										c : 4,
										d : "love",
										e : 2,
										f : 1, 
										g : 0
								} ,
								{
										id : 2,
										a : 7,
										b : "you",
										c : 2,
										d : "me",
										e : 28,
										f : 14, 
										g : 60
								} ,
								{
										id : 3,
										a : 60,
										b : 54,
										c : 49,
										d : "time",
										e : 0,
										f : 22,
										g : 7
								} 
							
						
					]
                };
				
				//console.log(data);
                var store4 = new dojo.data.ItemFileReadStore(
                {
                        data : data
                });

                var structure = [
                {
                        cells : [ [
                        { // getCheck checks for open rows, formatter provides onclick event, style the column header, staticheader prevents from sorting
                                name : 'A',
                                width : '4',
								headerClasses : "staticHeader",
								get: getCheck, formatter: formatCheck, styles: 'text-align: center;',
                                field : 'a'
                        },
                        {// get data from function to override existing data
                                name : 'B',
                                width : 'auto',
								//headerClasses : "staticHeader",
								//get: get,
                                field : 'b'
                        },
                        {
                                name : 'C',
                                width : 'auto',
                                field : 'c'
                        }/*,
                        {
                                name : 'D',
                                width : 'auto',
                                field : 'd'
                        },
                        {
                                name : 'E',
                                width : 'auto',
                                field : 'e'
                        },
                        {
                                name : 'F',
                                width : 'auto',
                                field : 'f'
                        }*/ ], [
                        { //get data from function which overrides set data, and add a formatter
                                name : 'Details',
                                width : 'auto',
                                colSpan : 3,
                                headerClasses : "staticHeader",
								filterable: true,
								fields : ['d', 'e', 'f', 'g'],
								//get: getDetail, 
								formatter: formatDetail

                        } ]]
						,

                        onBeforeRow : function(inDataIndex, inSubRows)
                        {
							//console.log(this.grid);
							inSubRows[1].hidden = (!this.grid || !this.grid.expandedRows || !this.grid.expandedRows[inDataIndex]);
						
                               // console.log("in onBeforeRow " + inDataIndex);
                                //if (inDataIndex >= 0)
                               // {
                                        //inSubRows[0].invisible = true;
                                        //inSubRows[1].invisible = true;
                              //  } else
                              //  {
                                      //  inSubRows[0].invisible = false;
                                      //  inSubRows[1].invisible = false;
								//}

                        }
                } ];
				
		// begin auto data - get can return data for each cell of the grid
		function get(inRowIndex) {
			//return [this.index, inRowIndex].join(',');
			return inRowIndex;
		}
		
		function getDetail(inRowIndex, inDataIndex) {
			var fields = this._props.fields;
			
			if (this.grid.expandedRows[inRowIndex]) {
				//return 'Hello World! ' + inRowIndex;
				var details = {};
				for( item in inDataIndex){
					if(isInArray(item,fields))
						details[item] = inDataIndex[item];
				}
				return details;	
			} else {
				return '';
			}
		}
		//every other index, display formatted  data
		function formatDetail(value, inRowIndex){
			var fields = this._props.fields;
			var value_length = Object.keys(value).length;
			var counter = 0;
			
			var html = "<div id='criteria_input' style='width:100%; margin:2px;'>";
			$.each(value, function( index, val ){

				if(counter % 2 == 0){
					if( counter == value_length - 1)//if last
						html += createColumns(fields[counter], val, "left", true);
					else 
						html += createColumns(fields[counter], val, "left", false);
				}
				else
					html += createColumns(fields[counter], val, "right", true);
					
				counter ++;
			});
			
			html += "</div>";
			return html;
			
			/*if(value){
				var n = (inRowIndex % 2);
				switch (n) {
					case 0:
						return value;
					default:
						return '<div class="bigHello">' + value + '</div>';
				}			
			}
			return value;*/
		}
		//end data

		
		
		//undefined closed, true
		//false closed, true
		//true open, false
		function getCheck(inRowIndex) {
		console.log("getCheck");
		console.log(inRowIndex);
			if (!this.grid.expandedRows)
				this.grid.expandedRows = [ ];
				
			console.log("row expanded?");
			console.log(this.grid.expandedRows[inRowIndex]);
		
			return {image: (this.grid.expandedRows[inRowIndex] ? 'open.gif' : 'closed.gif'),
					show: (this.grid.expandedRows[inRowIndex] ? 'false' : 'true')};
		}
		
	
		
		function formatCheck(value, inRowIndex){
				console.log("formatCheck");
		console.log(inRowIndex);
		console.log(value);
			var html = '<img src="images/' + value.image + '" onclick="toggle(' + inRowIndex + ', ' + value.show + ', ' + grid_id +')" height="11" width="11">';
			console.log(html);
			return html;
		}

		
		function createColumns (label, value, placement,complete_row){
			var html = "";

			if (placement == "left")
				html += "<div class='row'>";
			
			html += "<div class='cell two_halves " + placement + "'><p>" + label + ": <span class='value-cool'>" + value + "</span></p></div>";
			
			if(placement == "right"  || complete_row == true)
				html += "</div>";

			return html;
		}
		
			var registered_grid = dijit.registry.byId(grid_id);
			var paging_rules = {}, filter_rules = {}, results_plugins ={}, auto_width = true;
			
			paging_rules = {id: "paginator", pageSizes: ["100", "300", "600", "1000"], description: true, 	defaultPageSize:20, sizeSwitch: true,pageStepper: true, gotoButton: true, maxPageStep: 5, 	position: "bottom"};
			
			filter_rules = {closeFilterbarButton: true, itemsName: "records", ruleCount: 4,ruleCountToConfirmClearFilter: 3};
			
			results_plugins = {filter: filter_rules, pagination: paging_rules};
			auto_width = false;
		
		
                // create a new grid:
				console.log(data);
				console.log(store4);
				console.log(structure);
                var grid4 = new dojox.grid.EnhancedGrid(
                {
                        query : {},
                        store : store4,
                        clientSort : true,
                        structure : structure,
						rowSelector: '10px',
						selectionMode: 'single',
						autoHeight: true,
						autoWidth: auto_width,
						plugins: results_plugins,
                        id : grid_id,
                        // used to disable the click for sort on headers that are only for labeling
                        onHeaderCellClick : function(e)
                        {
								alert("click");
                                if (!dojo.hasClass(e.cell.id, "staticHeader"))
                                {
										//console.log("static");
                                        e.grid.setSortIndex(e.cell.index);
                                        e.grid.onHeaderClick(e);
                                }
                        }

                }, document.createElement('div'));

				grid4.placeAt(grid_id + "Div");
                grid4.startup(); 
}

