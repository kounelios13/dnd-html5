/*
* @param event A jQuery event that occurs when an .droppable is being dragged
*/
function dragStartHandler(event){
	//e refers to a jQuery object
	//that does not have dataTransfer property
	//so we have to refer to the original javascript event
	var originalEvent = event.originalEvent;
	//We want to store the data-task-id of the object that is being dragged
	originalEvent.dataTransfer.setData("text",$(event.target).data("task-id"));
	originalEvent.dataTransfer.effectAllowed = "move";
}
/*
* @param event A jQuery event that occurs when a .droppable as been dropped
*/
function dropHandler(event){
	event.preventDefault();
	event.stopPropagation();
	var originalEvent = event.originalEvent;
	//Get the task-id of the dropped item
	var droppedItemId = originalEvent.dataTransfer.getData("text");
	//Find the dropped item
	var droppedItem = $("body").find(`[data-task-id='${droppedItemId}']`);
	//Find the category which it was dragged into
	var category = $(this).parent(".box").data("category");
	//Change the data-category-group of the dropped item
	//and move it from its original position to the new one
	droppedItem.data("category-group",category).appendTo($(this));
}
$(document).ready(function(){
	//When a new task/item is creatted it is assigned a unique data attribute which is the task index
	var taskIndex = 0;
	$(".createTask").on("click",function(){
		//Find the category whict this button belongs to 
		var currentCategory = $(this).parent(".box");
		var categoryId = currentCategory.data("category");
		//Create a new task
		var task = $("<div class='list-group-item droppable' draggable='true' data-task-id="+taskIndex+"></div>");
		//Ask the user for a task description
		var taskDescription = prompt("Enter description for yout task");
		if(taskDescription){
			//If the user wants to create a non empty task
			task.text(taskDescription);
			taskIndex++;
		}else{
			//User has left the task description empty
			//so exit
			return;
		}
		//Append the new task to the clossest dropTarget
		task.appendTo($(this).prev(".dropTarget"));
	});
	$("body").on("dragstart",".droppable",dragStartHandler);
	$(".dropTarget").on("dragenter",function(event){
		event.preventDefault();
		event.stopPropagation();
		$(this).addClass("highlighted-box");
	}).on("dragover",false)
	.on("drop",dropHandler);
});
