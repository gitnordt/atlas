dojo.require("dojox.grid.TreeGrid");
dojo.require("dojox.grid.enhanced.plugins.Pagination");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.enhanced.plugins.Filter");

function jsonHandler2(results)
{
var data =
                {
					identifier : 'id',
					items : 
					[
							
								{
										id : 1,
										a : 1,
										b : 2,
										c : 3,
										d : 4,
										e : 5,
										f : 6,
										head: "I've got it",
										one :"help",
										two :"me"
										
								},
								{
										id : 2,
										a : 6,
										b : 5,
										c : 4,
										d : 3,
										e : 2,
										f : 1,
										head: "yep"
								} ,
								{
										id : 3,
										a : 6,
										b : 5,
										c : 4,
										d : 3,
										e : 2,
										f : 1,
										head: "great"
								} ,
								{
										id : 4,
										a : 6,
										b : 5,
										c : 4,
										d : 3,
										e : 2,
										f : 1
								} 
							
						
					]
                };

                var store4 = new dojo.data.ItemFileReadStore(
                {
                        data : data
                });

                var structure = [
                {
                        cells : [ [
                        { //first row
                                name : 'Common Header',
                                width : 'auto',
                                colSpan : 6,
                               // headerClasses : "staticHeader",
								field : 'head'

                        } ], [
                        { //second row
                                name : 'Sub Header 1',
                                width : 'auto',
                                colSpan : 3,
                                headerClasses : "staticHeader",
								field : 'one'
                        },
                        {
                                name : 'Sub Header 2',
                                width : 'auto',
                                colSpan : 3,
                                headerClasses : "staticHeader",
								field : 'two'
                        } ], [
                        { // third row
                                name : 'A',
                                width : 'auto',
								headerClasses : "staticHeader",
                                field : 'a'
                        },
                        {
                                name : 'B',
                                width : 'auto',
								headerClasses : "staticHeader",
                                field : 'b'
                        },
                        {
                                name : 'C',
                                width : 'auto',
								headerClasses : "staticHeader",
                                field : 'c'
                        },
                        {
                                name : 'D',
                                width : 'auto',
								headerClasses : "staticHeader",
                                field : 'd'
                        },
                        {
                                name : 'E',
                                width : 'auto',
								headerClasses : "staticHeader",
                                field : 'e'
                        },
                        {
                                name : 'F',
                                width : 'auto',
								headerClasses : "staticHeader",
                                field : 'f'
                        } ] ]
						/*,

                        onBeforeRow : function(inDataIndex, inSubRows)
                        {
                                console.log("in onBeforeRow " + inDataIndex);
                                //if (inDataIndex >= 0)
                               // {
                                        //inSubRows[0].invisible = true;
                                        //inSubRows[1].invisible = true;
                              //  } else
                              //  {
                                        inSubRows[0].invisible = false;
                                        inSubRows[1].invisible = false;
								//}

                        }*/
                } ];

                // create a new grid:

                var grid4 = new dojox.grid.TreeGrid(
                {
                        query : {},
                        store : store4,
                        clientSort : true,
                        rowSelector : '20px',
                        structure : structure,
						autoHeight: true,
                        id : "resultsGrid",
                        // used to disable the click for sort on headers that are only for labeling
                        onHeaderCellClick : function(e)
                        {

                                if (!dojo.hasClass(e.cell.id, "staticHeader"))
                                {
                                        e.grid.setSortIndex(e.cell.index);
                                        e.grid.onHeaderClick(e);
                                }
                        }

                }, document.createElement('div'));

				grid4.placeAt("resultsGridDiv");
                grid4.startup(); 
}