//TODO: Kholdstare is fixed in IP for swordless mode

var logicSelect = document.querySelector('#logic_select');
var itemplaceSelect = document.querySelector('#itemplace_select');
var variationSelect = document.querySelector('#variation_select');
var accessibilitySelect = document.querySelector('#accessibility_select');
var goalSelect = document.querySelector('#goal_select');
var towerSelect = document.querySelector('#tower_select');
var ganonSelect = document.querySelector('#ganon_select');
var stateSelect = document.querySelector('#state_select');
var swordsSelect = document.querySelector('#swords_select');
var difficultySelect = document.querySelector('#difficulty_select');
var bossShuffleSelect = document.querySelector('#bossShuffle_select');
var categorySelect = document.querySelector('#category_select');
var itemSelect = document.querySelector('#item_select');
var topList = document.querySelector('#top-area');
var bottomList = document.querySelector('#bottom-area');

var optionLogic = logicSelect.value;
var optionItemplace = itemplaceSelect.value;
var optionVariation = variationSelect.value;
var optOldVariation = variationSelect.value;
var optionAccessibility = accessibilitySelect.value;
var optionGoal = goalSelect.value;
var optionTower = towerSelect.value;
var optionGanon = ganonSelect.value;
var optionState = stateSelect.value;
var optionSwords = swordsSelect.value;
var optionDifficulty = difficultySelect.value;
var optionBossShuffle = bossShuffleSelect.value;
var optionCategorySelect = categorySelect.value;
var optionItemSelect = itemSelect.value;

var optMapCompLogic = document.querySelector('#MapCompLogic').checked;
var optStdKeys = document.querySelector('#std_keysanity').checked;
var optBottleCount = document.querySelector('#optn_BottleCount').checked;

document.querySelector('#option_button').addEventListener('click', function() {
	if (document.querySelector('#options').style.display === "none") {
		document.querySelector('#options').style.display = "inherit";
		setOptionBlankHeight();
	} else
		document.querySelector('#options').style.display = "none";
});

document.querySelector('#reset_button').addEventListener('click', function() {
	resetMap();
	resetItems();
	resetLog();
});

document.querySelector('#close_uwmap_button').addEventListener('click', function() {
	document.querySelector('#uw_map').style.display = "none";
});

stateSelect.addEventListener('change', function() {
	optionState = stateSelect.value;

	//Zelda starts unrescued in standard mode
	if (optionState === "standard") {
		qtyCounterMin.zelda = 0;
	} else {
		qtyCounterMin.zelda = 1;
		if (qtyCounter.zelda < qtyCounterMin.zelda) {
			qtyCounter.zelda = qtyCounterMin.zelda;
			updateQuadrant("zelda");
		}
	}

	//Move Link's House, CT, GT, and Ganon for inverted
	if (optionState === "inverted") {
		document.getElementById("poi21").style.left = "77.56%";
		document.getElementById("poi21").style.top = "68.92%";
		document.getElementById("bossMap10").style.left = "24.75%";
		document.getElementById("bossMap10").style.top = "40.01%";
		document.getElementById("dungeon10").style.left = "24.75%";
		document.getElementById("dungeon10").style.top = "40.01%";
		document.getElementById("dungentr10").style.left = "24.75%";
		document.getElementById("dungentr10").style.top = "40.01%";
		document.getElementById("bossMap11").style.left = "78.33%";
		document.getElementById("bossMap11").style.top = "5.86%";
		document.getElementById("dungeon11").style.left = "78.33%";
		document.getElementById("dungeon11").style.top = "5.86%";
		document.getElementById("dungentr11").style.left = "78.33%";
		document.getElementById("dungentr11").style.top = "5.86%";
		document.getElementById("bossMap12").style.left = "29.10%";
		document.getElementById("bossMap12").style.top = "51.70%";
		document.getElementById("dungeon12").style.left = "29.10%";
		document.getElementById("dungeon12").style.top = "51.70%";
		document.getElementById("dungentr12").style.left = "29.10%";
		document.getElementById("dungentr12").style.top = "51.70%";
	} else {
		document.getElementById("poi21").style.left = "27.09%";
		document.getElementById("poi21").style.top = "68.92%";
		document.getElementById("bossMap10").style.left = "78.33%";
		document.getElementById("bossMap10").style.top = "5.86%";
		document.getElementById("dungeon10").style.left = "78.33%";
		document.getElementById("dungeon10").style.top = "5.86%";
		document.getElementById("dungentr10").style.left = "78.33%";
		document.getElementById("dungentr10").style.top = "5.86%";
		document.getElementById("bossMap11").style.left = "24.75%";
		document.getElementById("bossMap11").style.top = "40.01%";
		document.getElementById("dungeon11").style.left = "24.75%";
		document.getElementById("dungeon11").style.top = "40.01%";
		document.getElementById("dungentr11").style.left = "24.75%";
		document.getElementById("dungentr11").style.top = "40.01%";
		document.getElementById("bossMap12").style.left = "75.14%";
		document.getElementById("bossMap12").style.top = "40.80%";
		document.getElementById("dungeon12").style.left = "75.14%";
		document.getElementById("dungeon12").style.top = "40.80%";
		document.getElementById("dungentr12").style.left = "75.14%";
		document.getElementById("dungentr12").style.top = "40.80%";
	}

	refreshMap();
});

logicSelect.addEventListener('change', function() {
	optionLogic = logicSelect.value;

	//Start with boots in glitched modes
	if (optionLogic !== "nmg") {
		items.boots = true;
		updateTrackerItem("boots");
	}
	
	//Don't need HC BK unless underworld MG are allowed
	updateQuadrant("hc_bk");

	//Disallow dungeonPrize marking if impossible to dupe
	for (var i = 0; i < 10; i++)
		if (i !== 8 || (optionLogic === "nmg" || optionLogic === "owg"))
			if (qtyCounter["gotPrize"+i] === true) {
				qtyCounter["gotPrize"+i] = false;
				updateQuadrant("dungeonPrize"+i);
			}

	refreshMap();
});

itemplaceSelect.addEventListener('change', function() {
	optionItemplace = itemplaceSelect.value;
	refreshMap();
});

towerSelect.addEventListener('change', function() {
	optionTower = towerSelect.value;
	refreshMap();
});

ganonSelect.addEventListener('change', function() {
	optionGanon = ganonSelect.value;
	refreshMap();
});

swordsSelect.addEventListener('change', function() {
	optionSwords = swordsSelect.value;

	//Cannot have a sword in swordless mode
	if (optionSwords === "swordless") {
		items.sword = 0;
		itemsMax.sword = 0;
		updateTrackerItem("sword");
	} else {
		switch (optionDifficulty) {
			case "easy": itemsMax.sword = 4; break;
			case "normal": itemsMax.sword = 4; break;
			case "hard": itemsMax.sword = 3; break;
			case "expert": itemsMax.sword = 2; break;
			case "insane": itemsMax.sword = 2; break;
		}
	}

	//Kholdstare can't be in Hera in swordless mode
	if (optionSwords === "swordless" && qtyCounter.boss2 === 5)
		qtyCounter.boss2 = -1;
	updateTrackerItem("boss2");

	//Kholdstare can't be in Hera in swordless mode
	if (optionSwords === "swordless" && qtyCounter.boss5 === 2)
		qtyCounter.boss5 = -1;
	updateTrackerItem("boss5");

	refreshMap();
});

goalSelect.addEventListener('change', function() {
	optionGoal = goalSelect.value;

	//Triforce counter replaces go button in triforce mode
	if (optionGoal === "triforce") {
		qtyCounterMax.triforce = 216;
		document.getElementById("go").style.backgroundImage = "url(images/triforce.png)";
		document.getElementById("go").className = "true";
	} else {
		qtyCounterMax.triforce = 0;
		qtyCounter.triforce = 0;
		document.getElementById("go").innerHTML = "";
		document.getElementById("go").style.backgroundImage = "url(images/go.png)";
		updateTrackerItem("go");
	}
	refreshMap();
});

difficultySelect.addEventListener('change', function() {
	optionDifficulty = difficultySelect.value;

	//swords available change
	//shield/mails available change
	//heart pieces available change
	//heart containers available change
	//half-magic available change
	//fairies in bottle possible change
	switch (optionDifficulty) {
		case "easy":
			itemsMax.sword = 4;
			qtyCounterMax.shield = 3;
			qtyCounterMax.tunic = 3;
			qtyCounterMax.heart_piece = 24;
			qtyCounterMax.heart_full = 14;
			qtyCounterMax.magic = 3;
			qtyCounterMax.bottle0 = 6; qtyCounterMax.bottle1 = 6; qtyCounterMax.bottle2 = 6; qtyCounterMax.bottle3 = 6;
			qtyCounterMax.fairy0 = 6; qtyCounterMax.fairy1 = 6;
			break;
		case "normal":
			itemsMax.sword = 4;
			qtyCounterMax.shield = 3;
			qtyCounterMax.tunic = 3;
			qtyCounterMax.heart_piece = 24;
			qtyCounterMax.heart_full = 14;
			qtyCounterMax.magic = 2;
			qtyCounterMax.bottle0 = 6; qtyCounterMax.bottle1 = 6; qtyCounterMax.bottle2 = 6; qtyCounterMax.bottle3 = 6;
			qtyCounterMax.fairy0 = 6; qtyCounterMax.fairy1 = 6;
			break;
		case "hard":
			itemsMax.sword = 3;
			qtyCounterMax.shield = 2;
			qtyCounterMax.tunic = 2;
			qtyCounterMax.heart_piece = 20;
			qtyCounterMax.heart_full = 9;
			qtyCounterMax.magic = 1;
			qtyCounterMax.bottle0 = 5; qtyCounterMax.bottle1 = 5; qtyCounterMax.bottle2 = 5; qtyCounterMax.bottle3 = 5;
			qtyCounterMax.fairy0 = 5; qtyCounterMax.fairy1 = 5;
			break;
		case "expert":
			itemsMax.sword = 2;
			qtyCounterMax.shield = 1;
			qtyCounterMax.tunic = 1;
			qtyCounterMax.heart_piece = 20;
			qtyCounterMax.heart_full = 4;
			qtyCounterMax.magic = 1;
			qtyCounterMax.bottle0 = 5; qtyCounterMax.bottle1 = 5; qtyCounterMax.bottle2 = 5; qtyCounterMax.bottle3 = 5;
			qtyCounterMax.fairy0 = 5; qtyCounterMax.fairy1 = 5;
			break;
		case "insane":
			itemsMax.sword = 2;
			qtyCounterMax.shield = 0;
			qtyCounterMax.tunic = 1;
			qtyCounterMax.heart_piece = 0;
			qtyCounterMax.heart_full = 3;
			qtyCounterMax.magic = 1;
			qtyCounterMax.bottle0 = 5; qtyCounterMax.bottle1 = 5; qtyCounterMax.bottle2 = 5; qtyCounterMax.bottle3 = 5;
			qtyCounterMax.fairy0 = 5; qtyCounterMax.fairy1 = 5;
			break;
	}
	if (optionSwords === "swordless") //override if swordless
		itemsMax.sword = 0;
	if (items.sword > itemsMax.sword) {
		items.sword = itemsMax.sword;
		updateTrackerItem("sword");
	}
	if (qtyCounter.shield > qtyCounterMax.shield)
		qtyCounter.shield = qtyCounterMax.shield;
	if (qtyCounter.tunic > qtyCounterMax.tunic)
		qtyCounter.tunic = qtyCounterMax.tunic;
	updateTrackerItem("alldefense"); //in case mail/shield changed due to limit
	if (qtyCounter.heart_piece > qtyCounterMax.heart_piece)
		qtyCounter.heart_piece = qtyCounterMax.heart_piece;
	updateQuadrant("heart_piece"); //may need update to fix lime max`
	if (optionVariation === "retro")
		qtyCounterMax.heart_full += 3; //3 take any heart containers available
	if (qtyCounter.heart_full > qtyCounterMax.heart_full)
		qtyCounter.heart_full = qtyCounterMax.heart_full;
	updateQuadrant("heart_full"); //may need update to fix lime max
	if (qtyCounter.magic > qtyCounterMax.magic) {
		qtyCounter.magic = qtyCounterMax.magic;
		updateQuadrant("magic");
	}
	for (var i = 0; i < 4; i++)
		if (qtyCounter["bottle"+i] > qtyCounterMax["bottle"+i])
			qtyCounter["bottle"+i] = 0; //empty bottle if it had a fairy but not allowed to
	updateQuadrant("bottle0"); //triggers update of all 4
	
	//Addition of wooden arrows in retro mode
	if (optionVariation === "retro") {
		qtyCounterMax.arrow = 3;
		if (optionDifficulty === "insane") {
			qtyCounterMax.arrow = 1;
			if (qtyCounter.arrow > 1)
				qtyCounter.arrow -= 2;
		}
	} else {
		qtyCounterMax.arrow = 1;
		if (optionDifficulty === "insane") {
			qtyCounterMax.arrow = 0;
			qtyCounter.arrow = 0;
		}
	}
	updateTrackerItem("allbow");

	refreshMap();
});

variationSelect.addEventListener('change', function() {
	optOldVariation = optionVariation;
	optionVariation = variationSelect.value;

	/*
	//Addition of wooden arrows in retro mode
	if (optionVariation === "retro") {
		qtyCounterMax.arrow = 3;
		if (optionDifficulty === "insane")
			qtyCounterMax.arrow = 1;
		if (qtyCounter.arrow === 1)
			if (optionDifficulty === "insane")
				qtyCounter.arrow = 0;
			else
				qtyCounter.arrow = 2;
	} else {
		qtyCounterMax.arrow = 1;
		if (qtyCounter.arrow < 2)
			qtyCounter.arrow = 0;
		else
			qtyCounter.arrow = 1;
		if (optionDifficulty === "insane")
			qtyCounterMax.arrow = 0;
	}
	updateTrackerItem("allbow");

	//Update heart containers for retro
	switch (optionDifficulty) {
		case "easy":
		case "normal": qtyCounterMax.heart_full = 14; break;
		case "hard": qtyCounterMax.heart_full = 9; break;
		case "expert": qtyCounterMax.heart_full = 4; break;
		case "insane": qtyCounterMax.heart_full = 3; break;
	}
	if (optionVariation === "retro")
		qtyCounterMax.heart_full += 3;
	if (qtyCounter.heart_full > qtyCounterMax.heart_full)
		qtyCounter.heart_full = qtyCounterMax.heart_full;
	updateQuadrant("heart_full"); //may need update to fix lime max*/

	//Update max chest counts for keysanity/retro
	if (optionVariation === "keysanity") {
		itemsMax.chest0 = 6;
		itemsMax.chest1 = 6;
		itemsMax.chest2 = 6;
		itemsMax.chest3 = 14;
		itemsMax.chest4 = 10;
		itemsMax.chest5 = 8;
		itemsMax.chest6 = 8;
		itemsMax.chest7 = 8;
		itemsMax.chest8 = 8;
		itemsMax.chest9 = 12;
		itemsMax.chest10 = 27;
		itemsMax.chest11 = 2;
	} else if (optionVariation === "mcs") {
		itemsMax.chest0 = 5;
		itemsMax.chest1 = 5;
		itemsMax.chest2 = 5;
		itemsMax.chest3 = 13;
		itemsMax.chest4 = 9;
		itemsMax.chest5 = 7;
		itemsMax.chest6 = 7;
		itemsMax.chest7 = 7;
		itemsMax.chest8 = 7;
		itemsMax.chest9 = 11;
		itemsMax.chest10 = 26;
		itemsMax.chest11 = 2;
	} else if (optionVariation === "mc") {
		itemsMax.chest0 = 5;
		itemsMax.chest1 = 4;
		itemsMax.chest2 = 4;
		itemsMax.chest3 = 7;
		itemsMax.chest4 = 8;
		itemsMax.chest5 = 4;
		itemsMax.chest6 = 6;
		itemsMax.chest7 = 5;
		itemsMax.chest8 = 4;
		itemsMax.chest9 = 7;
		itemsMax.chest10 = 22;
		itemsMax.chest11 = 0;
	} else {
		itemsMax.chest0 = 3;
		itemsMax.chest1 = 2;
		itemsMax.chest2 = 2;
		itemsMax.chest3 = 5;
		itemsMax.chest4 = 6;
		itemsMax.chest5 = 2;
		itemsMax.chest6 = 4;
		itemsMax.chest7 = 3;
		itemsMax.chest8 = 2;
		itemsMax.chest9 = 5;
		itemsMax.chest10 = 20;
		itemsMax.chest11 = 0;
	}
	for (var i = 0; i < 12; i++) {
		if (items["chest"+i] > itemsMax["chest"+i]) {
			items["chest"+i] = itemsMax["chest"+i];
			updateTrackerItem("chest"+i);
		}
	}

	/*
	//Remove small key collection in retro
	if (optionVariation === "retro") {
		for (var i = 1; i < 12; i++) {
			qtyCounterMax["ditems_sk"+i] = 0;
			qtyCounter["ditems_sk"+i] = 0;
			updateQuadrant("ditems_sk"+i);
		}
		qtyCounterMax.hc_sk = 99;
		updateQuadrant("hc_sk"); //may need update to fix lime max
	} else {
		qtyCounterMax.ditems_sk1 = 1;
		qtyCounterMax.ditems_sk2 = 1;
		qtyCounterMax.ditems_sk3 = 6;
		qtyCounterMax.ditems_sk4 = 1;
		qtyCounterMax.ditems_sk5 = 3;
		qtyCounterMax.ditems_sk6 = 1;
		qtyCounterMax.ditems_sk7 = 2;
		qtyCounterMax.ditems_sk8 = 3;
		qtyCounterMax.ditems_sk9 = 4;
		qtyCounterMax.ditems_sk10 = 4;
		qtyCounterMax.ditems_sk11 = 2;
		qtyCounterMax.hc_sk = 1;
		if (qtyCounter.hc_sk > qtyCounterMax.hc_sk) {
			qtyCounter.hc_sk = qtyCounterMax.hc_sk;
			updateQuadrant("hc_sk");
		}
	}*/

	//Add dungeon item rows for keysanity 
	if (optionVariation === "none" && optStdKeys === false) {
		document.getElementsByClassName("dungeonrow")[0].style.display = 'none';
		document.getElementsByClassName("dungeonrow")[1].style.display = 'none';
	} else {
		document.getElementsByClassName("dungeonrow")[0].style.display = '';
		document.getElementsByClassName("dungeonrow")[1].style.display = '';
	}

	/*
	//Update all entrances on the map, className and backgroundImage
	entrances.forEach(function(entrance, entranceNum) {
		if (optionVariation !== "retro")
			document.getElementById("entrance"+entranceNum).className = "entrance no-show";
	});

	//Update all shops on the map, className and backgroundImage
	shops.forEach(function(shop, shopNum) {
		if (optionVariation !== "retro")
			document.getElementById("shop"+shopNum).className = "shop no-show";
	});*/

	if (document.getElementById("altMap").checked) {
		var top_px = 512;
		if (optionVariation !== "none" || optStdKeys === true)
			top_px += 128;
		if (document.getElementById("sphereTracker").checked)
			top_px += 259;
		document.getElementById("map").style.top = top_px + "px";
	}

	var old = [];
	var now = [];
	switch (optOldVariation) {
		case "none": old = [3, 2, 2, 5, 6, 2, 4, 3, 2, 5, 20, 0]; break;
		case "mc": old = [5, 4, 4, 7, 8, 4, 6, 5, 4, 7, 22, 0]; break;
		case "mcs": old = [5, 5, 5, 13, 9, 7, 7, 7, 7, 11, 26, 2]; break;
		case "keysanity": old = [6, 6, 6, 14, 10, 8, 8, 8, 8, 12, 27, 2]; break;
	}
	switch (optionVariation) {
		case "none": now = [3, 2, 2, 5, 6, 2, 4, 3, 2, 5, 20, 0]; break;
		case "mc": now = [5, 4, 4, 7, 8, 4, 6, 5, 4, 7, 22, 0]; break;
		case "mcs": now = [5, 5, 5, 13, 9, 7, 7, 7, 7, 11, 26, 2]; break;
		case "keysanity": now = [6, 6, 6, 14, 10, 8, 8, 8, 8, 12, 27, 2]; break;
	}
	for (var i = 0; i < 12; i++) {
		var diff = now[i] - old[i];
		if (diff > 0) {
			items["chest"+i] += diff;
			updateTrackerItem("chest"+i);
		}
	}

	setOptionBlankHeight();
	refreshMap();
});

bossShuffleSelect.addEventListener('change', function() {
	optionBossShuffle = bossShuffleSelect.value;

	if (optionBossShuffle !== "off") {
		for (var i = 0; i < 10; i++) {
			qtyCounterMin["boss"+i] = -1;
			qtyCounterMax["boss"+i] = 9;
		}
		for (var i = 13; i <= 15; i++) {
			qtyCounterMin["boss"+i] = -1;
			qtyCounterMax["boss"+i] = 9;
		}
		document.getElementById("gtboss13").style.display = "";
		document.getElementById("gtboss14").style.display = "";
		document.getElementById("gtboss15").style.display = "";
	} else {
		for (var i = 0; i < 10; i++) {
			qtyCounterMin["boss"+i] = 0;
			qtyCounterMax["boss"+i] = 0;
			qtyCounter["boss"+i] = 0;
			updateTrackerItem("boss"+i);
		}
		for (var i = 13; i <= 15; i++) {
			qtyCounterMin["boss"+i] = 0;
			qtyCounterMax["boss"+i] = 0;
			qtyCounter["boss"+i] = 0;
		}
		document.getElementById("gtboss13").style.display = "none";
		document.getElementById("gtboss14").style.display = "none";
		document.getElementById("gtboss15").style.display = "none";
	}
	resetItems();
});

categorySelect.addEventListener('change', function() {
	filterChange();
});

function filterChange() {
	optionCategorySelect = categorySelect.value;
	var size = itemSelect.length;
	for (var i = 0; i < size; i++)
		itemSelect.remove(0);
	var option = document.createElement("option");
	option.value = "blank";
	option.text = "";
	itemSelect.add(option);
	Object.keys(glitches).forEach(function(key) {
		if (glitches[key].category === optionCategorySelect || optionCategorySelect === "all") {
			var option = document.createElement("option");
			option.value = key;
			option.title = glitches[key].tip;
			option.text = glitches[key].name;
			itemSelect.add(option);
		}
	});
	optionItemSelect = itemSelect.value;
}

itemSelect.addEventListener('change', function() {
	optionItemSelect = itemSelect.value;
});
accessibilitySelect.addEventListener('change', function() {
	optionAccessibility = accessibilitySelect.value;
});

document.querySelector('#add_top').addEventListener('click', function() {
	if (optionItemSelect !== "blank") {
		for (var i = 0; i < topList.length; i++)
			if (topList[i].value === optionItemSelect)
				return;
		for (var i = 0; i < bottomList.length; i++)
			if (bottomList[i].value === optionItemSelect)
				return;
		var option = document.createElement("option");
		option.value = optionItemSelect;
		option.text = glitches[optionItemSelect].name;
		topList.add(option);
	}
	refreshMap();
});

document.querySelector('#remove_top').addEventListener('click', function() {
	for (var i = topList.length - 1; i >= 0; i--) {
		if (topList[i].selected) {
			topList.remove(i);
		}
	}
	refreshMap();
});

document.querySelector('#all_top').addEventListener('click', function() {
	for (var i = 1; i < itemSelect.length; i++) {
		var addthis = true;
		for (var j = 0; j < topList.length; j++)
			if (topList[j].value === itemSelect[i].value)
				addthis = false;
		for (var j = 0; j < bottomList.length; j++)
			if (bottomList[j].value === itemSelect[i].value)
				addthis = false;
		if (addthis) {
			var option = document.createElement("option");
			option.value = itemSelect[i].value;
			option.text = glitches[itemSelect[i].value].name;
			topList.add(option);
		}
	}
	refreshMap();
});

document.querySelector('#none_top').addEventListener('click', function() {
	for (var i = 1; i < itemSelect.length; i++) {
		for (var j = topList.length - 1; j >= 0; j--)
			if (topList[j].value === itemSelect[i].value)
				topList.remove(j);
	}
	refreshMap();
});

document.querySelector('#clear_top').addEventListener('click', function() {
	for (var j = topList.length - 1; j >= 0; j--)
		topList.remove(j);
	refreshMap();
});

document.querySelector('#arrow_up').addEventListener('click', function() {
	for (var i = 0; i < bottomList.length; i++) {
		if (bottomList[i].selected) {
			var option = document.createElement("option");
			option.value = bottomList[i].value;
			option.text = glitches[bottomList[i].value].name;
			topList.add(option);
		}
	}
	for (var i = bottomList.length - 1; i >= 0; i--) {
		var found_dupe = false;
		for (var j = 0; j < topList.length; j++)
			if (topList[j].value === bottomList[i].value)
				found_dupe = true;
		if (found_dupe)
			bottomList.remove(i);
	}
	refreshMap();
});

document.querySelector('#arrow_down').addEventListener('click', function() {
	for (var i = 0; i < topList.length; i++) {
		if (topList[i].selected) {
			var option = document.createElement("option");
			option.value = topList[i].value;
			option.text = glitches[topList[i].value].name;
			bottomList.add(option);
		}
	}
	for (var i = topList.length - 1; i >= 0; i--) {
		var found_dupe = false;
		for (var j = 0; j < bottomList.length; j++)
			if (bottomList[j].value === topList[i].value)
				found_dupe = true;
		if (found_dupe)
			topList.remove(i);
	}
	refreshMap();
});

function setOptionBlankHeight() {
	var height = 512;
	if (optionVariation === "keysanity")
		height += 128;
	if (document.getElementById("sphereTracker").checked)
		height += 259;
	if (document.getElementById("altMap").checked)
		height += 222 + 20;
	if (height <= 550) height = 550;
	document.querySelector('#options').style.height = height + "px";
}

function handleOptionClick(cb) {
	switch (cb.id) {
		case "sphereTracker":
			if (document.getElementById("altMap").checked) {
				var top_px = 512;
				if (optionVariation === "keysanity")
					top_px += 128;
				if (cb.checked)
					top_px += 259;
				document.getElementById("map").style.top = top_px + "px";
			}
			setOptionBlankHeight();
			if (cb.checked) {
				document.getElementById("sphereborder").style.display = "";
				document.getElementById("spheres0").style.display = "";
				document.getElementById("spheres1").style.display = "";
				document.getElementById("spheres2").style.display = "";
				document.getElementById("spheres3").style.display = "";
			} else {
				document.getElementById("sphereborder").style.display = "none";
				document.getElementById("spheres0").style.display = "none";
				document.getElementById("spheres1").style.display = "none";
				document.getElementById("spheres2").style.display = "none";
				document.getElementById("spheres3").style.display = "none";
			}
			break;
		case "altMap":
			setOptionBlankHeight();
			if (cb.checked) {
				document.getElementById("map").className = "map-alt";
				var top_px = 512;
				if (optionVariation === "keysanity")
					top_px += 128;
				if (document.getElementById("sphereTracker").checked)
					top_px += 259;
				document.getElementById("map").style.top = top_px + "px";
				document.getElementById("caption").id = "caption-alt";
				//document.getElementById("option_button").id = "option_button-alt";
				//document.getElementById("reset_button").id = "reset_button-alt";
				var chestlist = document.getElementsByClassName("chest");
				while (chestlist.length > 0) {
					chestlist[0].classList.add("chest-alt");
					chestlist[0].classList.remove("chest");
				}
				var list = document.getElementsByClassName("boss");
				while (list.length > 0) {
					list[0].classList.add("boss-alt");
					list[0].classList.remove("boss");
				}
				var list = document.getElementsByClassName("dungeon");
				while (list.length > 0) {
					list[0].classList.add("dungeon-alt");
					list[0].classList.remove("dungeon");
				}
				var list = document.getElementsByClassName("dungentr");
				while (list.length > 0) {
					list[0].classList.add("dungentr-alt");
					list[0].classList.remove("dungentr");
				}
				var list = document.getElementsByClassName("entrance");
				while (list.length > 0) {
					list[0].classList.add("entrance-alt");
					list[0].classList.remove("entrance");
				}
				var list = document.getElementsByClassName("shop");
				while (list.length > 0) {
					list[0].classList.add("shop-alt");
					list[0].classList.remove("shop");
				}
			} else {
				document.getElementById("map").className = "map";
				document.getElementById("map").style.top = "0px";
				document.getElementById("caption-alt").id = "caption";
				//document.getElementById("option_button-alt").id = "option_button";
				//document.getElementById("reset_button-alt").id = "reset_button";
				var chestlist = document.getElementsByClassName("chest-alt");
				while (chestlist.length > 0) {
					chestlist[0].classList.add("chest");
					chestlist[0].classList.remove("chest-alt");
				}
				var list = document.getElementsByClassName("boss-alt");
				while (list.length > 0) {
					list[0].classList.add("boss");
					list[0].classList.remove("boss-alt");
				}
				var list = document.getElementsByClassName("dungeon-alt");
				while (list.length > 0) {
					list[0].classList.add("dungeon");
					list[0].classList.remove("dungeon-alt");
				}
				var list = document.getElementsByClassName("dungentr-alt");
				while (list.length > 0) {
					list[0].classList.add("dungentr");
					list[0].classList.remove("dungentr-alt");
				}
				var list = document.getElementsByClassName("entrance-alt");
				while (list.length > 0) {
					list[0].classList.add("entrance");
					list[0].classList.remove("entrance-alt");
				}
				var list = document.getElementsByClassName("shop-alt");
				while (list.length > 0) {
					list[0].classList.add("shop");
					list[0].classList.remove("shop-alt");
				}
			}
			break;
		case "MapCompLogic":
			optMapCompLogic = cb.checked;
			break;
		case "std_keysanity":
			optStdKeys = cb.checked;
			if (optionVariation === "none" && optStdKeys === false) {
				document.getElementsByClassName("dungeonrow")[0].style.display = 'none';
				document.getElementsByClassName("dungeonrow")[1].style.display = 'none';
			} else {
				document.getElementsByClassName("dungeonrow")[0].style.display = '';
				document.getElementsByClassName("dungeonrow")[1].style.display = '';
			}
			break;
		case "optn_BottleCount":
			optBottleCount = cb.checked;
			break;
	}
	refreshMap();
}