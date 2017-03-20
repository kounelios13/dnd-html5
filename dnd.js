/*
* @param event A jquery event that occurs when an object is being dragged
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
$(document).ready(function(){
	//When a new task/item is creatted it is assigned a unique data attribute which is the task index
	var taskIndex = 0;
	$(".text-info").addClass("text-center");
	$(".createTask").addClass("btn-block").on("click",function(){
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
			return;
		}
		task.appendTo($(this).prev(".dropTarget"));
	});
	$("body").on("dragstart",".droppable",dragStartHandler);
	$(".dropTarget").on("dragenter",function(event){
		event.preventDefault();
		event.stopPropagation();
		$(this).addClass("highlighted-box");
	}).on("dragover",false)
	.on("drop",function(event){
		event.preventDefault();
		event.stopPropagation();
		var originalEvent = event.originalEvent;
		//Retrieve the data-task-id we stored in the event
		var taskId = originalEvent.dataTransfer.getData("text");
		//The object that will be moved is determined by the id we stored on the event parameter
		var objectToMove =$("body").find(`[data-task-id='${taskId}']`);
		var category = $(this).parent(".box").data("category");
		objectToMove.data("category-group",category);
		//Remove the element that was being draged from its previous position
		//and append it to the current dropTarget
		$(objectToMove).appendTo(this);
		return false;
	});
});
