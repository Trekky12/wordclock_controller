'strict'

const accessToken = localStorage.getItem("accessToken");
const deviceID = localStorage.getItem("deviceID");
const accessTokenInput = document.querySelector('input[name="accessToken"]');
const deviceIDInput = document.querySelector('input[name="deviceID"]');

const storeSettingsButton = document.querySelector('button.storeSettings');
const clearSettingsButton = document.querySelector('button.clearSettings');

if (accessToken && deviceID) {
    document.querySelector('.container.select-color').style.display = 'block';
    document.querySelector('.container.timezone').style.display = 'block';

    accessTokenInput.value = accessToken;
    accessTokenInput.setAttribute("disabled", true);

    deviceIDInput.value = deviceID;
    deviceIDInput.setAttribute("disabled", true);

    storeSettingsButton.style.display = "none";
    clearSettingsButton.style.display = "block";
}

storeSettingsButton.addEventListener('click', function (e) {
    e.preventDefault();

    if (!accessTokenInput.value || !deviceIDInput.value) {
        window.alert("Missing values");
        return;
    }
    localStorage.setItem("accessToken", accessTokenInput.value);
    localStorage.setItem("deviceID", deviceIDInput.value);
    window.location.reload(true);
});

clearSettingsButton.addEventListener('click', function (e) {
    e.preventDefault();

    localStorage.clear();
    window.location.reload(true);
});

const colorInput = document.querySelector('input[name="color"]');
const sendColorButton = document.querySelector('button.sendColor');

sendColorButton.addEventListener('click', async function (e) {
    e.preventDefault();
    console.log("pressed");
    console.log(colorInput.value);

    let color = colorInput.value;

    const r = parseInt(color.substr(1, 2), 16)
    const g = parseInt(color.substr(3, 2), 16)
    const b = parseInt(color.substr(5, 2), 16)
    console.log(`red: ${r}, green: ${g}, blue: ${b}`);

    await makeRequest("controlColor", r + "," + g + "," + b)
});

const sendTimezoneButton = document.querySelector('button.sendTimezone');

sendTimezoneButton.addEventListener('click', async function (e) {
    e.preventDefault();
    console.log("pressed");

    let tz = document.querySelector('input[name="tz"]:checked').value;
    await makeRequest("setTimeZone", tz)
});


async function makeRequest(functionName, command) {
    const data = { 'command': command };
    const response = await fetch("https://api.particle.io/v1/devices/" + deviceID + '/' + functionName, {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Accept': 'application/json',
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(result);

    if (result["connected"] && result["return_value"] == 0) {
        window.alert("success");
    } else {
        window.alert("Error");
    }
}