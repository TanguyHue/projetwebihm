'use strict'
/*eslint-env browser */

console.log('Construction du calendrier.');

// Construction du calendrier
const calendar = document.getElementById('calendar');
const daysOfWeek = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const headerRow = document.createElement('tr');

// Construction des colonnes (jours)
const tableHeader = document.createElement('thead');

for (var i = 0; i < daysOfWeek.length; i++) {
    const headerCell = document.createElement('th');
    headerCell.textContent = daysOfWeek[i];
    headerRow.appendChild(headerCell);
}

tableHeader.appendChild(headerRow);

const table = document.createElement('table');
table.appendChild(tableHeader);
table.setAttribute('class', 'table table-striped-columns');

// Création des lignes (heures de 8 à 22)
const tableBody = document.createElement('tbody');

for (var i = 8; i <= 22; i++){
    // Ligne de la table
    const new_row = document.createElement('tr');

    // Heure correspondant à la ligne
    const hour = document.createElement('th');
    hour.setAttribute('scope', 'row');
    const hourText = document.createTextNode(i);
    hour.appendChild(hourText);
    new_row.appendChild(hour);

    // Créneaux horaires de chaque ligne
    for (var j = 1; j < daysOfWeek.length; j++){
        const time_slot = document.createElement('td');
        new_row.appendChild(time_slot);
    }

    tableBody.appendChild(new_row)
}

// Ajout des cases "notes"
const memo_row = document.createElement('tr');
const empty = document.createElement('td');
memo_row.appendChild(empty);

for (var i = 1; i < daysOfWeek.length; i++){
    const memo = document.createElement('td');
    const memoText = document.createTextNode('Notes :');
    memo.appendChild(memoText);
    memo_row.appendChild(memo);
}
tableBody.appendChild(memo_row);

table.appendChild(tableBody);

calendar.appendChild(table);
