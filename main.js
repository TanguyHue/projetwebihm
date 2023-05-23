var buttonAssignation = document.getElementById("assignation");
buttonAssignation.checked = false;

buttonAssignation.addEventListener("click", function() {
    if(buttonAssignation.checked) {
        buttonAssignation.value = "Personne pour le moment";
        buttonAssignation.style.backgroundColor = "#f44336";
        buttonAssignation.checked = false;
    } else {
        buttonAssignation.value = "Assigné à moi";
        buttonAssignation.style.backgroundColor = "#4CAF50";
        buttonAssignation.checked = true;
    }
});

var date = document.getElementById("date");
date.value = new Date().toISOString().slice(0, 10);