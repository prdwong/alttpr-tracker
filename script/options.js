var stateSelect = document.querySelector('#state_select');
var logicSelect = document.querySelector('#logic_select');
var swordsSelect = document.querySelector('#swords_select');
var goalSelect = document.querySelector('#goal_select');
var difficultySelect = document.querySelector('#difficulty_select');
var variationSelect = document.querySelector('#variation_select');
var bossShuffleSelect = document.querySelector('#bossShuffle_select');
var categorySelect = document.querySelector('#category_select');
var itemSelect = document.querySelector('#item_select');
var topList = document.querySelector('#top-area');
var bottomList = document.querySelector('#bottom-area');

document.querySelector('#option_button').addEventListener('click', function() {
	if (document.querySelector('#options').style.display === "none")
		document.querySelector('#options').style.display = "inherit";
	else
		document.querySelector('#options').style.display = "none";
});

document.querySelector('#reset_button').addEventListener('click', function() {
	resetMap();
	resetItems();
	resetLog();
});

stateSelect.addEventListener('change', function() {
	optionState = stateSelect.value;

	//Zelda starts unrescued in standard mode
	if (optionState === "standard")
		qtyCounterMin.zelda = 0;
	else {
		qtyCounterMin.zelda = 1;
		if (qtyCounter.zelda < qtyCounterMin.zelda) {
			qtyCounter.zelda = qtyCounterMin.zelda;
			updateQuadrant("zelda");
		}
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
	refreshMap();
});

variationSelect.addEventListener('change', function() {
	optionVariation = variationSelect.value;

	//Addition of wooden arrows in retro mode
	if (optionVariation === "retro") {
		qtyCounterMax.arrow = 3;
		if (qtyCounter.arrow === 1)
			qtyCounter.arrow = 2;
	} else {
		qtyCounterMax.arrow = 1;
		if (qtyCounter.arrow < 2)
			qtyCounter.arrow = 0;
		else
			qtyCounter.arrow = 1;
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
	updateQuadrant("heart_full"); //may need update to fix lime max

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
	} else if (optionVariation === "retro") {
		itemsMax.chest0 = 3;
		itemsMax.chest1 = 3;
		itemsMax.chest2 = 3;
		itemsMax.chest3 = 11;
		itemsMax.chest4 = 7;
		itemsMax.chest5 = 5;
		itemsMax.chest6 = 5;
		itemsMax.chest7 = 5;
		itemsMax.chest8 = 5;
		itemsMax.chest9 = 9;
		itemsMax.chest10 = 24;
		itemsMax.chest11 = 2;
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
	}

	//Add dungeon item rows for keysanity 
	if (optionVariation !== "keysanity") {
		document.getElementsByClassName("dungeonrow")[0].style.display = 'none';
		document.getElementsByClassName("dungeonrow")[1].style.display = 'none';
	} else {
		document.getElementsByClassName("dungeonrow")[0].style.display = '';
		document.getElementsByClassName("dungeonrow")[1].style.display = '';
	}

	//Update all entrances on the map, className and backgroundImage
	entrances.forEach(function(entrance, entranceNum) {
		if (optionVariation !== "retro")
			document.getElementById("entrance"+entranceNum).className = "entrance no-show";
	});

	//Update all shops on the map, className and backgroundImage
	shops.forEach(function(shop, shopNum) {
		if (optionVariation !== "retro")
			document.getElementById("shop"+shopNum).className = "shop no-show";
	});

	resetItems();
	refreshMap();
});

bossShuffleSelect.addEventListener('change', function() {
	optionBossShuffle = bossShuffleSelect.value;

	if (optionBossShuffle === "on") {
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
	refreshMap();
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
			option.text = glitches[key].name;
			itemSelect.add(option);
		}
	});
	optionItemSelect = itemSelect.value;
}

itemSelect.addEventListener('change', function() {
	optionItemSelect = itemSelect.value;
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

function handleOptionClick(cb) {
	if (cb.id === "sphereTracker")
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
}