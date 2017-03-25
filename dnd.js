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
    //Show the dangerZone just in case
    //the user wants to dro a task there to delete it
    $("#dangerZone").show();
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
    //Find the dropped item by using its data-task-id attribute
    var droppedItem = $("body").find(`[data-task-id='${droppedItemId}']`);
    //Find the category which it was dragged into
    var category = $(this).parent(".box").data("category");
    //Change the data-category-group of the dropped item
    //and move it from its original position to the new one
    droppedItem.data("category",category).appendTo($(this));
   //Hide the danger zone
    $("#dangerZone").hide();
}
/*
* @param The id of the task we want to delete
*/
function deleteTask(taskId){
    //Find the task with the given taskId
    var taskToDelete = $("body").find(`[data-task-id='${taskId}']`);
    //Remove it
    taskToDelete.remove();
}
function createTask(taskElement){
    //Creates a task div and appends 
    //it to its parent category
    var taskId = taskElement["id"];
    var taskText = taskElement["text"];
    var taskCategory = taskElement["category"];
    var taskToAppend = $(`<div class='list-group-item droppable' draggable='true' data-task-id='${taskId}' data-category='${taskCategory}'>${taskText}</div>`);
    //Find the dropTarget to append the created task
    var dropTarget = $("body").find(`[data-category='${taskCategory}'] .dropTarget`);
    taskToAppend.appendTo(dropTarget);
}
function saveTasks(){
    var isLocalStorageSupported = !!localStorage;
    if(!isLocalStorageSupported){
        //localStorage is not supported so exit the function
        return;
    }
    //Collect all tasks
    var tasks = $(".droppable");
    //This array will store everything needed for a task in order to be saved
    var dataToStore = [];
    for(var i=0,max =tasks.length;i<max;i++){
        var currentTask = tasks[i];
        //For each task we need to store
        //its text, and its category
        //It will be reassigned a unique id after it is loaded back from localStorage
        var taskData = {
            text:$(currentTask).text(),
            category:$(currentTask).data("category")
        };
        dataToStore[i]=taskData;
    }
    localStorage.setItem("taskList",JSON.stringify(dataToStore));
    alert("Tasks have been saved");
}
function loadTasks(){
    //Load tasks from localStorage
    var isLocalStorageSupported = !!localStorage;
    if(!isLocalStorageSupported || !localStorage.getItem("taskList")){
        //Maybe localStorage is not supported or maybe there are no data saved
        return;
    }
    var loadedTasksList = JSON.parse(localStorage.getItem("taskList"));
    for(var i = 0,max = loadedTasksList.length;i<max;i++){
        loadedTasksList[i].id = i;
        createTask(loadedTasksList[i]);
    }
}
$(document).ready(function(){
    loadTasks();
    //When a new task/item is created it is assigned a unique data attribute which is the task index
    var taskIndex =$(".list-group-item").length;
    $("#saveTasksBtn").on("click",saveTasks);
    $("#deleteAllTasksBtn").on("click",function(){
        var answer = confirm("Are you sure you want to delete all tasks?");
        if(answer){
            $(".droppable").remove();
            taskIndex = 0;
            alert("Tasks removed");
        }
    });
    $(".createTask").on("click",function(){
        //Find the category in which the clicked plus symbol belongs to
        var currentCategory = $(this).parent("h1").parent(".box");
        var categoryId = currentCategory.data("category");
        //Create a new task
        var task = $(`<div class='list-group-item droppable' draggable='true' data-task-id='${taskIndex}' data-category='${categoryId}'></div>`);
        //Ask the user for a task description
        var taskDescription = prompt("Enter task description");
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
        //by finding the dropTarget that is available in our currentCategory
        task.appendTo(currentCategory.find(".dropTarget"));
    });
    $("body").on("dragstart",".droppable",dragStartHandler);
    $("body").on("dblclick",".droppable",function(){
        //Ask the user for a new task description
        var newTaskDescription = prompt("Enter a new description for this task");
        if(newTaskDescription){
            //Update the task description
            $(this).text(newTaskDescription);
        }
    });
    $(".dropTarget").on("dragenter",function(event){
        event.preventDefault();
        event.stopPropagation();
    }).on("dragover",false)
    .on("drop",dropHandler);
    $("#dangerZone").on("dragenter",function(event){
        event.preventDefault();
        event.stopPropagation();
    }).on("dragover",false)
    .on("drop",function(event){
        //Let the user confirm that he wants to delete the task they dropped here
        var allowDelete = confirm("Are you sure you want to delete this task?");
        if(allowDelete){
            //Find its id to remove it
            var taskId = event.originalEvent.dataTransfer.getData("text");
            deleteTask(taskId);
        }
        $("#dangerZone").hide();
    });
});

