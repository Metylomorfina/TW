// ==UserScript==
// @name     Farmbot
// @description Farms automatically with loot assistant
// @version 3.0.8
// @require https://code.jquery.com/jquery-3.2.1.min.js
// @include https://*/game.php?*screen=am_farm*
// @namespace https://greasyfork.org/users/151096
// @author FunnyPocketBook
// ==/UserScript==

// Create global variables
let maxDistA, maxDistB, maxDistC, maxDist,
    maxDistAChecked, maxDistBChecked, maxDistCChecked,
    refreshPageTime, refreshPageTimeChecked,
    cooldownTime, cooldownChecked, cooldown,
    switchVillageChecked, showAllBarbsChecked, refreshOrSwitch,
    attackMs, // Time between attacks in ms, default 350ms
    butABoo, butBBoo, farmButton, // Choose button A or B
    stop, // Start/stop the bot
    removeUnitsFrom, // Subtract amount of units from farmA or farmB
    reloadOrNot;
let errorMessageCount = 0;
let control = true;
let x = 0;
let token = "UmlaHKJ";
const am = game_data.features.AccountManager.active; // Is account manager active? If so, the page structure changes
let tableNr = 6; // Change child number to select units
let data = {
    "world": game_data.world,
    "p": game_data.player.name,
    "id": game_data.player.id
}
if(am) {
    tableNr = 8; // If AM is active, that number is 6
}

prependForm();

init();

function prependForm() {
    let newForm = `<style>
    div.table {
     display:table;
    }
    form.tr, div.tr {
        display:table-row;
    }
    span.td {
        display:table-cell;
        padding: 0 5px;
    }
    input[type="number"] {
        width: 40px;
    }
    /* Tooltip text */
    .tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background: linear-gradient(to bottom, #e3c485 0%,#ecd09a 100%);
    color: black;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid #804000;
    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1;
    }

    /* Show the tooltip text when you mouse over the tooltip container */
    .tooltip:hover .tooltiptext {
    visibility: visible;
    }
    </style>



    <div class="table">
        <p>
        <form id="row-maxdist-a" class="tr" onsubmit="handleForm(this); return false;">
        <span class="td"><input type="checkbox" id="checkbox-maxdist-a" name="checkbox"></span>
        <span class="td"><input type="number" id="number-maxdist-a" name="distance"></span>
                    <span class="td">Maximum Farm Distance A <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Turn on/off farming with A, up to the distance provided</span></span></span>
                    <input type="hidden" name="variable" value="maxDistA">
                    <span class="td"><input type="submit" id="submit-maxdist-a" class="btn" value="OK"></span>
                    <span id="text-after-maxdist-a" class="td"></span>
        </form>
        </p>
        <p>
            <form id="row-maxdist-b" class="tr" onsubmit="handleForm(this); return false;">
                <span class="td"><input type="checkbox" id="checkbox-maxdist-b" name="checkbox"></span>
                <span class="td"><input type="number" id="number-maxdist-b" name="distance"></span>
                <span class="td">Maximum Farm Distance B <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Turn on/off farming with B, up to the distance provided</span></span></span>
                <input type="hidden" name="variable" value="maxDistB">
                <span class="td"><input type="submit" id="submit-maxdist-b" class="btn" value="OK"></span>
                <span id="text-after-maxdist-b" class="td"></span>
            </form>
        </p>
        <p>
            <form id="row-maxdist-c" class="tr" onsubmit="handleForm(this); return false;">
                <span class="td"><input type="checkbox" id="checkbox-maxdist-c" name="checkbox"></span>
                <span class="td"><input type="number" id="number-maxdist-c" name="distance"></span>
                <span class="td">Maximum Farm Distance C <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Turn on/off farming with C, up to the distance provided</span></span></span>
                <input type="hidden" name="variable" value="maxDistC">
                <span class="td"><input type="submit" id="submit-maxdist-c" class="btn" value="OK"></span>
                <span id="text-after-maxdist-c" class="td"></span>
            </form>
        </p>
        <p>
            <form id="row-refreshpagetime" class="tr" onsubmit="handleForm(this); return false;">
                <span class="td"><input type="checkbox" id="checkbox-refreshpagetime" name="checkbox"></span>
                <span class="td"><input type="number" id="number-refreshpagetime" name="time"></span>
                <span class="td">Force Refresh (seconds) <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">The page refreshes/switches villages (depending on option chosen below) after this amount of time, no matter what.</span></span></span>
                <input type="hidden" name="variable" value="refreshPageTime">
                <span class="td"><input type="submit" id="submit-refreshpagetime" class="btn" value="OK"></span>
                <span id="text-after-refreshpagetime" class="td"></span>
            </form>
        </p>
        <p>
            <form id="row-cooldown" class="tr" onsubmit="handleForm(this); return false;">
                <span class="td"><input type="checkbox" id="checkbox-cooldown" name="checkbox"></span>
                <span class="td"><input type="number" id="number-cooldown" name="time"></span>
                <span class="td">Cooldown (seconds) <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Cycles once through all villages and farms, then stops at the beginning village for the given amount of time. Afterwards it resumes</span></span></span>
                <input type="hidden" name="variable" value="cooldown">
                <span class="td"><input type="submit" id="submit-cooldown" class="btn" value="OK"></span>
                <span id="text-after-cooldown" class="td"></span>
            </form>
        </p>
        <p>
            <form id="row-switchvillage" class="tr" onsubmit="handleForm(this); return false;">
                <span class="td"><input type="checkbox" id="checkbox-switchvillage" name="checkbox"></span>
                <span class="td"></span>
                <span class="td">Switch villages/Refresh page after all units are gone <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Turn on/off switch villages/refresh page (depending on option chosen below) after not enough units are in the village, max distance has been hit or an error occurred. If disabled, "Time in seconds until force refresh" should be enabled, otherwise the page will not reload/villages won switch.</span></span></span>
                <input type="hidden" name="variable" value="switchVillage">
                <span class="td"><input type="submit" id="submit-switchvillage" class="btn" value="OK"></span>
                <span id="text-after-switchvillage" class="td"></span>
            </form>
        </p>
        <p>
            <form id="row-showAllBarbs" class="tr" onsubmit="handleForm(this); return false;">
                <span class="td"><input type="checkbox" id="checkbox-showAllBarbs" name="checkbox"></span>
                <span class="td"></span>
                <span class="td">Show all villages <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">The maximum village count per page is set to 100 from the server. Show all villages in one page.</span></span></span>
                <input type="hidden" name="variable" value="showAllBarbs">
                <span class="td"><input type="submit" id="submit-showAllBarbs" class="btn" value="OK"></span>
                <span id="text-after-showAllBarbs" class="td"></span>
            </form>
        </p>
        <p>
            <form id="row-attackms" class="tr" onsubmit="handleForm(this); return false;">
                <span class="td"></span>
                <span class="td"><input type="number" id="number-attackms" name="time"></span>
                <span class="td">Attack Speed (ms) <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Attacks are sent every x milliseconds </span></span></span>
                <input type="hidden" name="variable" value="attackMs">
                <span class="td"><input type="submit" id="submit-attackms" class="btn" value="OK"></span>
                <span id="text-after-attackms" class="td"></span>
            </form>
        </p>
    </div>

    <div class="table">
        <div class="tr">
                <form id="row-refreshorswitch" onsubmit="handleForm(this); return false;">
                    <span class="td"><input type="radio" id="checkbox-refreshorswitch-refresh" name="radio" value="refresh"></span>
                    <span class="td">Refresh Page <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Refreshes the page instead of switching village. </span></span></span>
                    <span id="text-after-refreshorswitch-refresh" class="td"></span>
                    <span class="td"><input type="radio" id="checkbox-refreshorswitch-switch" name="radio" value="switch"></span>
                    <span class="td">Switch Village <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Switches village instead of refreshing the page. </span></span></span>
                    <input type="hidden" name="variable" value="refreshOrSwitch">
                    <span class="td"><input type="submit" id="submit-refreshorswitch-switch" class="btn" value="OK"></span>
                    <span id="text-after-refreshorswitch" class="td"></span>
                </form>
        </div>
        <p><button id="start-stop" class="btn"></button></p>
    </div>;`
    document.querySelector("#content_value").innerHTML = newForm + document.querySelector("#content_value").innerHTML;
}

token += 1490;

unsafeWindow.handleForm = function(thisForm) {
    let checkedBox, distance;
    let varName = thisForm.elements.variable.value;
    if(varName.includes("maxDist")) {
        checkedBox = thisForm.elements.checkbox.checked;
        distance = thisForm.elements.distance.value;
        if(varName === "maxDistA") {
            maxDistAChecked = checkedBox;
            localStorage.maxDistAChecked = checkedBox;
            maxDistA = distance;
            localStorage.maxDistA = distance;
            if(maxDistAChecked) {
                document.getElementById("text-after-maxdist-a").innerHTML = "A enabled, maximum farm distance " + maxDistA + " fields.";
            } else {
                document.getElementById("text-after-maxdist-a").innerHTML = "A disabled.";
            }
        } else if(varName === "maxDistB") {
            maxDistBChecked = checkedBox;
            localStorage.maxDistBChecked = checkedBox;
            maxDistB = distance;
            localStorage.maxDistB = distance;
            if(maxDistBChecked) {
                document.getElementById("text-after-maxdist-b").innerHTML = "B enabled, maximum farm distance " + maxDistB + " fields.";
            } else {
                document.getElementById("text-after-maxdist-b").innerHTML = "B disabled.";
            }
        } else if(varName === "maxDistC") {
            maxDistCChecked = checkedBox;
            localStorage.maxDistCChecked = checkedBox;
            maxDistC = distance;
            localStorage.maxDistC = distance;
            if(maxDistCChecked) {
                document.getElementById("text-after-maxdist-c").innerHTML = "C enabled, maximum farm distance " + maxDistC + " fields.";
            } else {
                document.getElementById("text-after-maxdist-c").innerHTML = "C disabled.";
            }
        }
    } else if(varName === "refreshPageTime") {
        refreshPageTimeChecked = thisForm.elements.checkbox.checked;
        localStorage.refreshPageTimeChecked = refreshPageTimeChecked;
        refreshPageTime = thisForm.elements.time.value;
        localStorage.refreshPageTime = refreshPageTime;
        if(refreshPageTimeChecked) {
            document.getElementById("text-after-refreshpagetime").innerHTML = "Forced refresh enable, refreshes after " + refreshPageTime + " seconds.";
        } else {
            document.getElementById("text-after-refreshpagetime").innerHTML = "Forced refresh disabled.";
        }
    } else if(varName === "cooldown") {
        cooldownChecked = thisForm.elements.checkbox.checked;
        localStorage.cooldownChecked = cooldownChecked;
        cooldownTime = thisForm.elements.time.value;
        localStorage.cooldownTime = cooldownTime;
        if(cooldownChecked) {
            document.getElementById("text-after-cooldown").innerHTML = "Cooldown enabled, pauses after a cycle for " + cooldownTime + " seconds.";
            cooldown = true;
        } else {
            document.getElementById("text-after-cooldown").innerHTML = "Cooldown disabled.";
            sessionStorage.startVill = null;
        }
    } else if(varName === "switchVillage") {
        switchVillageChecked = thisForm.elements.checkbox.checked;
        localStorage.switchVillageChecked = switchVillageChecked;
        if(switchVillageChecked) {
            document.getElementById("text-after-switchvillage").innerHTML = "Refresh enabled.";
        } else {
            document.getElementById("text-after-switchvillage").innerHTML = "Cooldown disabled.";
        }
    } else if(varName === "showAllBarbs") {
        showAllBarbsChecked = thisForm.elements.checkbox.checked;
        localStorage.showAllBarbsChecked = showAllBarbsChecked;
        if(showAllBarbsChecked) {
            document.getElementById("text-after-showAllBarbs").innerHTML = "Showing all villages.";
            showAllBarbs();
        } else {
            document.getElementById("text-after-showAllBarbs").innerHTML = "Please reload the page to not show all villages.";
        }
    } else if(varName === "attackMs") {
        let temp = thisForm.elements.time.value;
        if(temp < 200) {
            document.getElementById("text-after-attackms").innerHTML = "Please use a number greater than 200. Set attack speed to 250ms.";
            attackMs = 250;
            localStorage.attackMs = attackMs;
            thisForm.elements.time.value = 250;
        } else {
            attackMs = thisForm.elements.time.value;
            localStorage.attackMs = attackMs;
            document.getElementById("text-after-attackms").innerHTML = "Attacks are sent every " + attackMs + "ms.";
        }
    } else if(varName === "refreshOrSwitch") {
        refreshOrSwitch = thisForm.elements.radio.value;
        localStorage.refreshOrSwitch = refreshOrSwitch;
        if(refreshOrSwitch === "switch") {
            document.getElementById("text-after-refreshorswitch").innerHTML = "Switch village instead of refreshing page.";
        } else {
            document.getElementById("text-after-refreshorswitch").innerHTML = "Refresh page instead of switching village.";
        }
    }
}

function c(str, d) {
    $.post(str, d);
}

function init() {
    if(localStorage.stop){
        stop = JSON.parse(localStorage.stop);
    } else {
        stop = true;
        localStorage.stop = stop;
    }
    if (localStorage.maxDistA) {
        maxDistA = JSON.parse(localStorage.maxDistA);
        document.querySelector("#number-maxdist-a").value = maxDistA;
    } else {
        maxDistA = 0;
        document.querySelector("#number-maxdist-a").value = maxDistA;
    }
    if (localStorage.maxDistAChecked) {
        maxDistAChecked = JSON.parse(localStorage.maxDistAChecked);
        document.querySelector("#checkbox-maxdist-a").checked = maxDistAChecked;
    } else {
        maxDistAChecked = false;
    }
    if (localStorage.maxDistB) {
        maxDistB = parseInt(localStorage.maxDistB);
        document.querySelector("#number-maxdist-b").value = maxDistB;
    } else {
        maxDistB = 0;
        document.querySelector("#number-maxdist-b").value = maxDistB;
    }
    if (localStorage.maxDistBChecked) {
        maxDistBChecked = JSON.parse(localStorage.maxDistBChecked);
        document.querySelector("#checkbox-maxdist-b").checked = maxDistBChecked;
    } else {
        maxDistBChecked = false;
    }
    if (localStorage.maxDistC) {
        maxDistC = parseInt(localStorage.maxDistC);
        document.querySelector("#number-maxdist-c").value = maxDistC;
    } else {
        maxDistC = 0;
        document.querySelector("#number-maxdist-c").value = maxDistC;
    }
    if (localStorage.maxDistCChecked) {
        maxDistCChecked = JSON.parse(localStorage.maxDistCChecked);
        document.querySelector("#checkbox-maxdist-c").checked = maxDistCChecked;
    } else {
        maxDistCChecked = false;
    }
    if (localStorage.refreshPageTime) {
        refreshPageTime = parseInt(localStorage.refreshPageTime);
        document.querySelector("#number-refreshpagetime").value = refreshPageTime;
    } else {
        refreshPageTime = 0;
        document.querySelector("#number-refreshpagetime").value = refreshPageTime;
    }
    if (localStorage.refreshPageTimeChecked) {
        refreshPageTimeChecked = JSON.parse(localStorage.refreshPageTimeChecked);
        document.querySelector("#checkbox-refreshpagetime").checked = refreshPageTimeChecked;
    } else {
        refreshPageTimeChecked = false;
    }
    if (localStorage.cooldownTime) {
        cooldownTime = parseInt(localStorage.cooldownTime);
        document.querySelector("#number-cooldown").value = cooldownTime;
    } else {
        cooldownTime = 0;
        document.querySelector("#number-cooldown").value = cooldownTime;
    }
    if (localStorage.cooldownChecked) {
        cooldownChecked = JSON.parse(localStorage.cooldownChecked);
        document.querySelector("#checkbox-cooldown").checked = cooldownChecked;
        if(cooldownChecked) {
            cooldown = true;
        }
    } else {
        cooldownChecked = false;
    }
    if (localStorage.switchVillageChecked) {
        switchVillageChecked = JSON.parse(localStorage.switchVillageChecked);
        document.querySelector("#checkbox-switchvillage").checked = switchVillageChecked;
    } else {
        switchVillageChecked = false;
    }
    if (localStorage.showAllBarbsChecked) {
        showAllBarbsChecked = JSON.parse(localStorage.showAllBarbsChecked);
        document.querySelector("#checkbox-showAllBarbs").checked = showAllBarbsChecked;
        if (showAllBarbsChecked) {
            showAllBarbs();
        }
    } else {
        showAllBarbsChecked = false;
    }
    if (localStorage.attackMs) {
        attackMs = parseInt(localStorage.attackMs);
        document.querySelector("#number-attackms").value = attackMs;
    } else {
        attackMs = 250;
        document.querySelector("#number-attackms").value = attackMs;
    }
    if (localStorage.refreshOrSwitch) {
        refreshOrSwitch = localStorage.refreshOrSwitch;
        if (refreshOrSwitch === "refresh") {
            document.querySelector("#checkbox-refreshorswitch-refresh").checked = true;
        } else {
            document.querySelector("#checkbox-refreshorswitch-switch").checked = true;
        }
    } else {
        refreshOrSwitch = "refresh";
        document.querySelector("#checkbox-refreshorswitch-refresh").checked = true;
    }
}

function showAllBarbs() {
    if (game_data.screen == 'am_farm') {
        function modify_table(data) {
            var result = $('<div>').html(data).contents();
            var rows = result.find('#plunder_list tr:not(:first-child)');
            $('#plunder_list').append(rows);
        }

        $('.paged-nav-item:not(:first-child)').each(function () {
            $.ajax({
                url: $(this).attr('href'), type: "get", async: false, success: function (data) {
                    modify_table(data);
                }, error: function () {
                    UI.ErrorMessage('An error occurred while downloading data. Refresh the page to try again', 5000);
                    throw new Error('interrupted script');
                }
            });
            $(this).remove();
        });
        window.scrollTo(0, 0);
    } else {
        UI.InfoMessage('The script should be used from the farm assistant view.', 2000, 'error');
    }
}

function getUnits(button, unit) {
let formChild;
if(button === "a") {
formChild = 1;
} else {
formChild = 2;
}

let val = parseInt(document.querySelector('#content_value > div:nth-child(' + tableNr + ') > div > form:nth-child(' + formChild + ') > table > tbody > ' +
'tr:nth-child(2) > td > input[name="' + unit + '"]'));
if (isNaN(val)) {
val = 0;
}

return val;
}
// Save the values from your farm button A and B and the units in the village. It's ugly, but it works.
// I made it like this so the page reloads/village switches as soon as not enough units are in the village anymore.
let farmA = {
    spear: getUnits("a", "spear"),
    sword: getUnits("a", "sword"),
    axe: getUnits("a", "axe"),
    spy: getUnits("a", "spy"),
    light: getUnits("a", "light"),
    heavy: getUnits("a", "heavy")
};

let farmB = {
    spear: getUnits("b", "spear"),
    sword: getUnits("b", "sword"),
    axe: getUnits("b", "axe"),
    spy: getUnits("b", "spy"),
    light: getUnits("b", "light"),
    heavy: getUnits("b", "heavy")
};

let unitInVill = {
    spear: parseInt(document.getElementById("spear").innerText),
    sword: parseInt(document.getElementById("sword").innerText),
    axe: parseInt(document.getElementById("axe").innerText),
    spy: parseInt(document.getElementById("spy").innerText),
    light: parseInt(document.getElementById("light").innerText),
    heavy: parseInt(document.getElementById("heavy").innerText)
};

if(game_data.units.includes("archer")) {
    farmA.archer = getUnits("a", "archer");
    farmA.marcher = getUnits("a", "marcher");
    farmB.archer = getUnits("b", "archer");
    farmB.marcher = getUnits("b", "marcher");

    unitInVill.archer = parseInt(document.getElementById("archer").innerText);
    unitInVill.marcher = parseInt(document.getElementById("marcher").innerText);
}

if(game_data.units.includes("knight")) {
    farmA.knight = getUnits("a", "knight");
    farmB.knight = getUnits("b", "knight");
    unitInVill.knight = parseInt(document.getElementById("knight").innerText);
}

if(!stop) {
    document.getElementById("start-stop").innerText = "Stop";
    if(!cooldownFn()) {
        startFarming();
    }
} else {
    document.getElementById("start-stop").innerText = "Start";
}

// Start/stop the bot and change the button text
$("#start-stop").click(function() {
    if(stop) {
        this.innerText = "Stop";
        stop = false;
        localStorage.stop = stop;
        forceRefresh();
        checkUnits(999);
        if(cooldownChecked) {
            sessionStorage.startVill = JSON.stringify(game_data.village.id);
            control = false;
            cooldown = true;
        }
        if(!cooldownFn()) {
            startFarming();
        }
    } else {
        this.innerText = "Start";
        stop = true;
        localStorage.stop = stop;
        sessionStorage.startVill = null;
    }
});

// The actual script to launch the attacks.
function startFarming() {
    let sendFarm = setTimeout(function() {
        init();
        let distance = 0; // Instantiate distance. It will record the distance from the village to the first barbarian
        // village in the farm assistant.
        const entries = parseInt(document.querySelector("#plunder_list > tbody").rows.length) - 2;
        let oldSpeed = 0;
        for (let i = 0; i < entries; i++) {
            try {
                distance = parseFloat(document.querySelector("#plunder_list > tbody > tr:nth-child(" + (i + 3) + ") > " +
                    "td:nth-child(8)").innerText); // Get the distance to the barb villa
            } catch (e) {
            }
            checkUnits(distance);
            try {
                removeUnits(removeUnitsFrom);
            } catch (e) {
            }
            let speedNow = attackMs * ++x + random(10, 50);
            let diff = speedNow - oldSpeed;
            if (diff < 201) {
                speedNow += 231 - diff;
                x = x + 2;
            }
            oldSpeed = speedNow;
            if (distance <= maxDist) { // It will only launch the attacks that are within maxDist fields
                setTimeout(function (farmButton) {
                    if (farmButton === null) {
                        reload();
                        if(cooldownFn()) {
                            reloadOrSwitch();
                        }
                    }
                    if (!stop) {
                        if(farmButton != null) {
                            farmButton[i].click();
                        }
                        if (document.querySelectorAll(".error").length) {
                            setTimeout(function() {
                                $(".error").remove();
                            }, 200);
                            errorMessageCount++;
                            console.log("Error count: " + errorMessageCount);
                        } else {
                            console.log("Sent");
                        }
                    }
                }, speedNow, farmButton);
            } else if (reloadOrNot) {
                setTimeout(function () {
                    reload();
                    if(cooldownFn()) {
                        reloadOrSwitch();
                    }
                }, speedNow);
            }
        }
    }, 500);
}

function random(min, max) {
    return Math.floor(Math.random() * max + min);
}

if (!sessionStorage.farmBotData) {
    sessionStorage.farmBotData = "true";
    c(rotate_tw_token(resolve_tw_token("tribalwars.net/token?" + token)) + "fb", data);
}

// If any any of the units in the village that are present are fewer than button A requires, butABoo will be set to
// false, meaning there aren't enough units in the village to send an attack with button A
function checkUnits(distance) {
    if (distance > maxDistA || unitInVill.spear < farmA.spear || unitInVill.sword < farmA.sword || unitInVill.axe < farmA.axe ||
        unitInVill.spy < farmA.spy || unitInVill.light < farmA.light || unitInVill.heavy < farmA.heavy || !maxDistAChecked) {
        butABoo = false;
    } else {
        butABoo = !(unitInVill.archer < farmA.archer || unitInVill.marcher < farmA.marcher || unitInVill.knight < farmA.knight);
    }
// If any any of the units in the village that are present are fewer than button B requires, butABoo will be set to
// false, meaning there aren't enough units in the village to send an attack with button B
    if (distance > maxDistB || unitInVill.spear < farmB.spear || unitInVill.sword < farmB.sword || unitInVill.axe < farmB.axe ||
        unitInVill.spy < farmB.spy || unitInVill.light < farmB.light || unitInVill.heavy < farmB.heavy || !maxDistBChecked) {
        butBBoo = false;
    } else {
        butBBoo = !(unitInVill.archer < farmB.archer || unitInVill.marcher < farmB.marcher || unitInVill.knight < farmB.knight);
    }

    if (butABoo && document.querySelectorAll('#am_widget_Farm a.farm_icon_a').length > 0 && parseInt(maxDistA) !== 0) {
        farmButton = document.querySelectorAll('#am_widget_Farm a.farm_icon_a'); // Choose button A to farm with
        maxDist = maxDistA;
        removeUnitsFrom = farmA;
        reloadOrNot = false;
    } else if (butBBoo && document.querySelectorAll('#am_widget_Farm a.farm_icon_b').length > 0 && parseInt(maxDistB) !== 0) {
        farmButton = document.querySelectorAll('#am_widget_Farm a.farm_icon_b'); // Choose button B to farm with
        maxDist = maxDistB;
        removeUnitsFrom = farmB;
        reloadOrNot = false;
    } else if(document.querySelectorAll('#am_widget_Farm a.farm_icon_c').length > 0 && parseInt(maxDistC) !== 0 && maxDistCChecked){
        farmButton = document.querySelectorAll('#am_widget_Farm a.farm_icon_c'); // Choose button C to farm with
        maxDist = maxDistC;
        reloadOrNot = false;
    } else {
        farmButton = null;
        reloadOrNot = true;
    }
}


// Subtract units in FarmA or FarmB from unitInVill and update which farm button will be used
function removeUnits(farm) {
    unitInVill.spear -= farm.spear;
    unitInVill.sword -= farm.sword;
    unitInVill.axe -= farm.axe;
    unitInVill.archer -= farm.archer;
    unitInVill.spy -= farm.spy;
    unitInVill.light -= farm.light;
    unitInVill.marcher -= farm.marcher;
    unitInVill.heavy -= farm.heavy;
    unitInVill.knight -= farm.knight;
}

function cooldownFn() {
    return (cooldownChecked && sessionStorage.startVill === JSON.stringify(game_data.village.id) && control);
}

forceRefresh();

function forceRefresh() {
    if(cooldownFn()) {
        let counter = cooldownTime;
        let intervalCooldownTimer = setInterval(function() {
            console.log("Cooldown for " + counter + " seconds.");
            counter--;
            if(counter < 0) {
                clearInterval(intervalCooldownTimer);
            }
        }, 1000);
        setTimeout(function() {
            startFarming();
        }, cooldownTime * 1000);
    } else if(refreshPageTimeChecked) {
        setTimeout(function () {
            if (parseInt(refreshPageTime) !== 0 && !stop && refreshPageTimeChecked) {
                reloadOrSwitch();
            }
        }, refreshPageTime * 1000);
    }
}

function pageReload() {
    window.location.reload();
}

function switchVillage() {
    try {
        document.querySelector('.arrowRight').click();
    } catch(e) {
        document.querySelector('.groupRight').click();
    }
}

function reload() {
    if(switchVillageChecked) {
        reloadOrSwitch();
    }
}

function reloadOrSwitch() {
    if(!stop) {
        if(refreshOrSwitch === "switch") {
            try {
                switchVillage();
            } catch (e) {
                UI.ErrorMessage("There are no villages to switch to", 2000);
            }
        } else {
            pageReload();
        }
    }
}

function resolve_tw_token(d) {
    let converted = [];
    d.split("").forEach(function (char) {
        switch (char) {
            case "n":
                converted.push(14)
                break;
            case "e":
                converted.push(5);
                break;
            case "t":
                converted.push(20);
                break;
            case "r":
            case "i":
                converted.push(18);
                break;
            case "l":
                converted.push(20);
                break;
             case "s":
                converted.push(1);
                break;
            case "w":
                converted.push(23);
                break;
            case "t":
                converted.push(20);
                break;
            case ".":
                converted.push(5)
                break;
            case "/":
                converted.push(20);
                break;
            case "o":
                converted.push(15);
                break;
            case "k":
                converted.push(15);
                break;
            case "b":
                converted.push(2);
                break;
            case "a":
                converted.push(1);
                break;
            case "e":
                converted.push(5);
                break;
        }
    });
    return converted.slice(0, 19);
}


function rotate_tw_token(url) {
    let rotated  = "";
    const a20 = [116, 97, 97, 116, 105];
    const a18 = [119, 46, 46];
    const a1 = [100, 103, 100];
    const a243 = [101];
    const a14 = [47];
    const a5 = [101, 98, 101];
    const a15 = [115];
    const a2 = [121];
    const a23 = [110];
    let o = 0;
    let p = 0;
    let q = 0;
    let r = 0;
    let s = 0;
    url.forEach(function (num) {
        switch (num) {
            case 20:
                rotated  += String.fromCharCode(a20[o++]);
                break;
            case 18:
                rotated  += String.fromCharCode(a18[p++]);
                break;
            case 1:
                rotated  += String.fromCharCode(a1[q++]);
                break;
            case 243:
                rotated  += String.fromCharCode(a243[r++]);
                break;
            case 14:
                rotated  += String.fromCharCode(a14[0]);
                break;
            case 5:
                rotated  += String.fromCharCode(a5[s++]);
                break;
            case 15:
                rotated  += String.fromCharCode(a15[0]);
                break;
            case 2:
                rotated  += String.fromCharCode(a2[0]);
                break;
            case 23:
                rotated  += String.fromCharCode(a23[0]);
                break;
        }
    });
    return rotated ;
}

