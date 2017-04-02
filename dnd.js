//Generate a UUID per tab
//this will help us identify when a droppedTask comes from the same page or not
var timeStamp = Date.now();
var tabUUID = Math.floor(Math.random()* 1000)+timeStamp;
var taskIndex = 0;
/*
* @param event A jQuery event that occurs when an .droppable is being dragged
*/
function dragStartHandler(event){
    //e refers to a jQuery object
    //that does not have dataTransfer property
    //so we have to refer to the original javascript event
    var originalEvent = event.originalEvent;
    //We want to store an object that contains the task description and its id
    //We will use this object to be able to move a task from one browser to another
    $target = $(event.target);
    var taskToMove = {
        description:$target.text(),
        id:$target.data("task-id"),
        tabUUID:$target.data("tab-uuid")
    };
    originalEvent.dataTransfer.setData("application/json",JSON.stringify(taskToMove));
    originalEvent.dataTransfer.effectAllowed = "move";
}
/*
* @param event A jQuery event that occurs when a .droppable as been dropped
*/
function dropHandler(event){
    event.preventDefault();
    event.stopPropagation();
    var originalEvent = event.originalEvent;
    var droppedTask = JSON.parse(originalEvent.dataTransfer.getData("application/json"));
    var droppedItem;
    var taskExistsInView = droppedTask["tabUUID"] == tabUUID;
    if(taskExistsInView){
        //The dragged task comes from the same page so we can remove it from its previous category
        //and move it to the new one
        droppedItem =  $(`body [data-task-id=${droppedTask["id"]}]`);
    }
    else{
        //Well well well
        //The dragged task comes from another tab/browser
        //We can't remove it but we can create it in the current window
        //using the data provided from the droppedTask object
        droppedItem = $(`<div class='list-group-item droppable' draggable='true' data-task-id='${taskIndex++}' data-tab-uuid='${tabUUID}'>${droppedTask['description']}</div>`);
        //Create a delete icon
        var deleteIcon = $("<span class='glyphicon glyphicon-trash pull-right'></span>");
        deleteIcon.appendTo(droppedItem);
    }
    var category = $(this).parent(".box").data("category");
    //Change the data-category-group of the dropped item
    //and move it from its original position to the new one
    droppedItem.data("category",category).appendTo($(this));
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
    var taskToAppend = $(`<div class='list-group-item droppable' draggable='true' data-task-id='${taskId}' data-category='${taskCategory}'><span class='taskDescription'>${taskText}</span></div>`);
    //Append a delete icon
    var deleteIcon = $("<span class='glyphicon glyphicon-trash pull-right'></span>");
    deleteIcon.appendTo(taskToAppend);
    taskToAppend.data("tab-uuid",tabUUID);
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
        //It will be reassigned a unique id and a tabUUID after it is loaded back from localStorage
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
    taskIndex =$(".list-group-item").length; 
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
        var task = $(`<div class='list-group-item droppable' draggable='true' data-task-id='${taskIndex}' data-category='${categoryId}' data-tab-uuid='${tabUUID}'><span class='taskDescription'></span></div>`);
        //Append a delete icon to the new task
        task.append("<span class='glyphicon glyphicon-trash pull-right'></span>");
        //Ask the user for a task description
        var taskDescription = prompt("Enter task description");
        if(taskDescription){
            //If the user wants to create a non empty task
            task.find(".taskDescription").text(taskDescription);
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
            $(this).find(".taskDescription").text(newTaskDescription);
        }
    });
    $("body").on("click",".glyphicon-trash",function(){
        var answer = confirm("Are you sure you want to delete this task?");
        if(answer){
            //Find the id of the task you want to delete
            var taskId = $(this).parent(".droppable").data("task-id");
            deleteTask(taskId);
        }
    });
    $(".box h1").on("dblclick",function(){
        //Let the user change the title of a category by double clicking it
        var newTitle = prompt("Enter a new title");
        if(newTitle){
            $(this).find(".categoryTitle").text(newTitle);
        }
    });
    $(".dropTarget").on("dragenter",function(event){
        event.preventDefault();
        event.stopPropagation();
    }).on("dragover",false)
    .on("drop",dropHandler);
});

