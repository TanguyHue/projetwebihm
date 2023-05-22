async function getData() {
    await fetch('https://api.open-meteo.com/v1/forecast?latitude=47.22&longitude=-1.55&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m,uv_index,terrestrial_radiation&current_weather=true&forecast_days=1&timezone=Europe%2FBerlin')
        .then(response => response.json())
        .then(data => {
            const uv = document.getElementById('uv');
            const temp = document.getElementById('temperature');
            const ozone = document.getElementById('ozone');
            const vent = document.getElementById('vent');
            const humidite = document.getElementById('humidite');
            const pluie = document.getElementById('pluie');

            const hour = new Date().getHours();

            temp.innerHTML = data.current_weather.temperature + data.hourly_units.temperature_2m;
            vent.innerHTML = data.current_weather.windspeed + data.hourly_units.windspeed_10m;

            uv.innerHTML = data.hourly.uv_index[hour] + data.hourly_units.uv_index;
            ozone.innerHTML = data.hourly.terrestrial_radiation[hour] + data.hourly_units.terrestrial_radiation;
            humidite.innerHTML = data.hourly.relativehumidity_2m[hour] + data.hourly_units.relativehumidity_2m;
            pluie.innerHTML = data.hourly.precipitation_probability[hour] + data.hourly_units.precipitation_probability;

            const buttonReload = document.getElementById('reload');
            buttonReload.addEventListener('click', () => {
                console.log("Reload");
                getData();
            }
            );
        })
        .catch(err => console.error(err));
}

getData();

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
