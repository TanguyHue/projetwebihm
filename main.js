const etatSelect = document.getElementById('etat');
const imgEtat = document.getElementById('imgEtat');

const etat = etatSelect.value;
if (etat == "0") {
    imgEtat.src = "images/etatPotager/bon.png";
} else if (etat == "1") {
    imgEtat.src = "images/etatPotager/mauvais.png";
} else if (etat == "2") {
    imgEtat.src = "images/etatPotager/arroser.png";
} else {
    imgEtat.src = "images/etatPotager/travaux.png";
}

etatSelect.addEventListener('change', (event) => {
    const etat = event.target.value;
    if (etat == "0") {
        imgEtat.src = "images/etatPotager/bon.png";
    } else if (etat == "1") {
        imgEtat.src = "images/etatPotager/mauvais.png";
    } else if (etat == "2") {
        imgEtat.src = "images/etatPotager/arroser.png";
    } else {
        imgEtat.src = "images/etatPotager/travaux.png";
    }
});

var boutonsAssignation = document.querySelectorAll("#toDo input[name='assignation']");
boutonsAssignation.forEach(function (bouton) {
    bouton.addEventListener('click', function () {
        if (!this.checked) {
            this.style.backgroundColor = "rgb(223, 219, 172)";
            this.checked = true;
            this.value = "Assigné";
        } else {
            this.checked = false;
            this.style.backgroundColor = "#e9e9ed";
            this.value = "Je m'assigne cette tâche";
        }
    });
});

const notification = document.getElementById('notification');
const boutonArroser = document.getElementById('arroser');

boutonArroser.addEventListener('click', (event) => {
    console.log("click");
    notification.style.opacity = "1";
    setTimeout(function(){
        notification.style.opacity = "0";
    }, 3000);
});