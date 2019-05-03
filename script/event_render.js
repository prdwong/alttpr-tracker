function initTracker() {
	//Init all className and backgroundImage
	Object.keys(items).forEach(function(itemName) {
		if (itemName === "bottle" || itemName === "hcitems" || itemName.substring(0, 6) === "ditems" || itemName.substring(0, 5) === "blank") //these have no images (covered by quadrants)
			;
		else {
			if (typeof items[itemName] === "boolean") //these have unchanging pictures
				document.getElementById(itemName).style.backgroundImage = "url(images/" + itemName + ".png)";
			updateTrackerItem(itemName);
		}
	});

	updateQuadrant("magic");
	updateQuadrant("heart_full");
	for (var i = 0; i < 4; i++)
		updateQuadrant("bottle" + i);
	updateQuadrant("fairy0");
	updateQuadrant("fairy1");
	for (var i = 0; i < 10; i++) {
		updateQuadrant("dungeonPrize" + i);
		if (i >= 8)
			updateQuadrant("medallion" + i);
	}

	document.getElementById("go").style.backgroundImage = "url(images/go.png)";
	document.getElementById("hc_sk").style.backgroundImage = "url(images/smallkey.png)";
	document.getElementById("hc_bk").style.backgroundImage = "url(images/bigkey.png)";
	document.getElementById("hc_map").style.backgroundImage = "url(images/mapdung.png)";
	updateQuadrant("hc_sk");
	updateQuadrant("hc_bk");
	updateQuadrant("hc_map");
	updateQuadrant("zelda");
	for (var i = 0; i < 12; i++) {
		if (i !== 11) { //BK graphics
			document.getElementById("ditems_bk"+i).style.backgroundImage = "url(images/bigkey.png)";
			document.getElementById("ditems_map"+i).style.backgroundImage = "url(images/mapdung.png)";
			document.getElementById("ditems_comp"+i).style.backgroundImage = "url(images/compass.png)";
			updateQuadrant("ditems_bk"+i);
			updateQuadrant("ditems_map"+i);
			updateQuadrant("ditems_comp"+i);
		}
		if (i !== 0) { //SK graphics
			document.getElementById("ditems_sk"+i).style.backgroundImage = "url(images/smallkey.png)";
			updateQuadrant("ditems_sk"+i);
		}
	}
	for (var i = 13; i <=15; i++)
		updateQuadrant("gtboss"+i);
	initSphereTracker();
}

function initSphereTracker() {
	for (var i = 0; i < 7; i++) {
		for (var j = 0; j < 4; j++) {
			for (var k = 0; k < 4; k++) {
				updateSphereTracker("sphere"+i+j+k);
			}
		}
	}
}

//returns qtyCounter identifier based on item identifier and click
//possible cells:
//allx
function translateItem(cell, click) {
	switch (cell) {
		case "allbow": if (!click) return "bow"; else return "arrow"; break;
		case "allboom": if (!click) return "blueboom"; else return "redboom"; break;
		case "allpowder": if (!click) return "mushroom"; else return "powder"; break;
		case "alldefense": if (!click) return "shield"; else return "tunic"; break;
		case "allflute": if (!click) return "shovel"; else return "flute"; break;
	}
}

//className, backgroundImage, and innerHTML updates
//possible items:
//allbow, allboom, hookshot, bombs, allpowder, boots, sword
//firerod, icerod, bombos, ether, quake, glove, alldefense
//lantern, hammer, allflute, net, book, flippers
//somaria, byrna, cape, mirror, moonpearl
//bossx, chestx, go
function updateTrackerItem(itemName) {
	if (itemName === "go") { //go
		if (qtyCounter["triforce"] === 0)
			document.getElementById(itemName).innerHTML = "";
		else
			document.getElementById(itemName).innerHTML = qtyCounter["triforce"];
		if (optionGoal === "triforce")
			document.getElementById(itemName).className = "true";
		else
			document.getElementById(itemName).className = goModeCalc();
		return;
	}

	if (itemName.substring(0, 3) === "all")
		items[itemName] = qtyCounter[translateItem(itemName, 0)].toString() + qtyCounter[translateItem(itemName, 1)];

	//Grayed out if 0 or false
	if (items[itemName] && items[itemName] !== "00") //applies to all
		document.getElementById(itemName).className = "true";
	else
		document.getElementById(itemName).className = "false";

	//Change image of item
	if (typeof items[itemName] === "boolean") //bombs, boots, firerod, icerod, bombos, ether, quake, lantern, hammer, net, book, flippers, somaria, byrna, cape, mirror, moonpearl: no picture updates
		;
	else if (itemName.substring(0, 5) === "chest") //chestx: pngs shared amongst chestx based on qty
		document.getElementById(itemName).style.backgroundImage = "url(images/chest" + items[itemName] + ".png)";
	else if (itemName.substring(0, 4) === "boss" && itemName.substring(4) < 10) { //bossx: offset boss image {
		if (qtyCounter[itemName] === -1) {
			document.getElementById(itemName).style.backgroundImage = "url(images/boss_unk.png)";
			document.getElementById(itemName).style.backgroundImage += ", url(images/" + itemName + items[itemName] + ".png)";
		} else {
			var newboss = (parseInt(itemName.substring(4)) + qtyCounter[itemName]) % 10;
			document.getElementById(itemName).style.backgroundImage = "url(images/boss" + newboss + items[itemName] + ".png)";
		}
	} else //allx, hookshot, sword, glove, bossx
		document.getElementById(itemName).style.backgroundImage = "url(images/" + itemName + items[itemName] + ".png)";

	//Overrides
	if (optionVariation === "retro" && itemName === "allbow") //retrobow
		document.getElementById(itemName).style.backgroundImage = "url(images/allretrobow" + items[itemName] + ".png)";
}

//className, backgroundImage, and innerHTML updates
//possible quadrants:
//heart_piece, death, heart_full
//bottle0, bottle1, bottle2, bottle3
//fairy0, fairy1, pullcrab0, pullcrab1
//pull1, pull2, pull3, pullfish
//hc_sk, hc_bk, hc_map, zelda
//ditems_skx, ditems_bkx, ditems_mapx, ditems_compx
//stunprize, medallionx, dungeonPrizex, gtbossx
function updateQuadrant(itemName) {
	if (itemName.substring(0, 6) === "bottle") { //bottlex: update visibility of all quadrants based on # of bottles
		for (var i = 0; i < 4; i++) {
			if (items.bottle > i)
				document.getElementById("bottle"+i).className = "corner true";
			else {
				document.getElementById("bottle"+i).className = "corner false";
				qtyCounter["bottle"+i] = 0; //empty bottle if we lose it
			}
			document.getElementById("bottle"+i).style.backgroundImage = "url(images/bottle"+qtyCounter["bottle"+i]+".png)";
		}
	} else if (itemName.substring(0, 5) === "fairy") { //fairyx: half visibilty if empty, share bottle pngs
		if (qtyCounter[itemName])
			document.getElementById(itemName).className = "corner true";
		else
			document.getElementById(itemName).className = "corner half";
		document.getElementById(itemName).style.backgroundImage = "url(images/bottle"+qtyCounter[itemName]+".png)";
	} else if (itemName === "stunprize" || itemName.substring(0, 4) === "pull") { //stunprize, pullx: share stunprize pngs
		document.getElementById(itemName).style.backgroundImage = "url(images/stunprize"+qtyCounter[itemName]+".png)";
	} else if (itemName.substring(0, 7) === "dungeon") { //dungeonPrizex
		document.getElementById(itemName).style.backgroundImage = "url(images/dungeon"+qtyCounter[itemName]+".png)";
		if (qtyCounter["gotPrize"+itemName.substring(12)])
			document.getElementById(itemName).style.backgroundImage = "url(images/checkmark.png), " + document.getElementById(itemName).style.backgroundImage;
	} else if (itemName.substring(0, 9) === "medallion") { //medallionx
		document.getElementById(itemName).style.backgroundImage = "url(images/medallion"+qtyCounter[itemName]+".png)";
	} else if (itemName === "magic" || itemName === "zelda") { //magic, zelda
		document.getElementById(itemName).style.backgroundImage = "url(images/"+itemName+qtyCounter[itemName]+".png)";
		if (qtyCounter[itemName])
			document.getElementById(itemName).className = "corner true";
		else
			document.getElementById(itemName).className = "corner false";
	} else if (itemName.substring(0, 6) === "gtboss") {
		if (optionBossShuffle === "off")
			document.getElementById(itemName).style.backgroundImage = "";
		else if (qtyCounter[itemName.substring(2)] === -1) {
			document.getElementById(itemName).style.backgroundImage = "url(images/boss_unk.png)";
			document.getElementById(itemName).style.backgroundImage += ", url(images/boss" + (parseInt(itemName.substring(6)) - 13) + qtyCounter[itemName] + ".png)";
		} else {
			var newboss = ((parseInt(itemName.substring(6)) - 13) + qtyCounter[itemName.substring(2)]) % 10;
			document.getElementById(itemName).style.backgroundImage = "url(images/boss" + newboss + qtyCounter[itemName] + ".png)";
		}

	} else if (itemName === "hc_bk") {
		if (optionLogic === "nmg" || optionLogic === "owg")
			document.getElementById(itemName).style.display = "none";
		else
			document.getElementById(itemName).style.display = "inherit";
		if (qtyCounter[itemName])
			document.getElementById(itemName).className = "corner true";
		else
			document.getElementById(itemName).className = "corner false";
	} else if (typeof qtyCounter[itemName] === "boolean") { //hc_bk, hc_map, ditems_bkx, ditems_mapx, ditems_compx
		if (qtyCounter[itemName])
			document.getElementById(itemName).className = "corner true";
		else
			document.getElementById(itemName).className = "corner false";
	} else { //heart_piece, death, heart_full, hc_sk, ditems_skx: number counters
		if (qtyCounter[itemName] === 0)
			document.getElementById(itemName).innerHTML = "";
		else
			document.getElementById(itemName).innerHTML = qtyCounter[itemName];

		if (qtyCounter[itemName] === 0)
			document.getElementById(itemName).className = "corner false";
		else if (qtyCounter[itemName] === qtyCounterMax[itemName])
			document.getElementById(itemName).className = "corner true maxcount";
		else
			document.getElementById(itemName).className = "corner true";
	}
}

//event handler for clicks on item cells, updates data structure with new status of items/qty
//possible items:
//allbow, allboom, hookshot, bombs, allpowder, boots, sword
//firerod, icerod, bombos, ether, quake, glove, alldefense
//lantern, hammer, allflute, net, book, flippers
//somaria, byrna, cape, mirror, moonpearl
//bossx, chestx, go, blankx
//stunprize, dungeonPrizex, medallionx, gtbossx <-- these are overlaid on top of item cell
function itemToggle(event) {
	var label = event.target.id;

	if (label.substring(0, 5) === "blank")
		return;
	if (label === "stunprize") //click passthrough to hookshot
		label = "hookshot";
	if (label.substring(0, 12) === "dungeonPrize" || label.substring(0, 9) === "medallion" ||
		(label.substring(0, 6) === "gtboss" && optionBossShuffle === "on")) { //send to quadrant handler for processing instead
		quadrantToggle(event);
		return;
	}
	if (label.substring(0, 6) === "gtboss") //click passthrough to boss10
		label = "boss10";

	if (event.button === 0) { //left click
		if ((typeof items[label]) === "boolean") {
			if (label === "go") { //go: add 1 to triforce, max out at end
				if (++qtyCounter["triforce"] > qtyCounterMax["triforce"])
					qtyCounter["triforce"] = qtyCounterMax["triforce"];
				else
					logAction(label, qtyCounter["triforce"], event.button);
			} else { //bombs, boots, firerod, icerod, bombos, ether, quake, lantern, hammer, net, book, flippers, somaria, byrna, cape, mirror, moonpearl: toggle
				items[label] = !items[label];
				logAction(label, items[label], event.button);
			}
		} else if (label.substring(0, 3) === "all") { //allx: add 1 to qty, wrap around, also update item
			var qty = translateItem(label, event.button);
			var old = qtyCounter[qty];
			if (++qtyCounter[qty] > qtyCounterMax[qty])
				qtyCounter[qty] = qtyCounterMin[qty];
			var newv = qtyCounter[qty];
			if (old !== newv)
				logAction(qty, qtyCounter[qty], event.button);
		} else if (label.substring(0,5) === "chest") { //chestx: count down, max out at end
			if (--items[label] < itemsMin[label])
				items[label] = itemsMin[label];
			else
				logAction(label, items[label], event.button);
		} else { //hookshot, sword, glove, bossx: add 1, wrap around
			var old = items[label];
			if (++items[label] > itemsMax[label])
				items[label] = itemsMin[label];
			var newv = items[label];
			if (old !== newv)
				logAction(label, items[label], event.button);
		}

		//prime sphere tracking
		if (label === "boots" || label === "firerod" || label === "icerod" || label === "bombos" || label === "ether" || label === "quake" || label === "lantern" || label === "hammer" || label === "net" || label === "book" || label === "flippers" || label === "somaria" || label === "byrna" || label === "cape" || label === "mirror" || label === "moonpearl")
			if (items[label]) lastItem = label;
			else lastItem = "";
		else if (label === "sword" || label === "glove")
			lastItem = label + items[label];
		else if (label === "hookshot")
			if (items[label] > 1) lastItem = label + items[label];
			else lastItem = "";
		else if (label.substring(0, 3) === "all")
			if (qtyCounter[translateItem(label, event.button)])
				if (label === "alldefense") lastItem = translateItem(label, event.button) + qtyCounter[translateItem(label, event.button)];
				else lastItem = translateItem(label, event.button);
			else lastItem = "";
	}

	if (event.button === 2) { //right click
		if (label === "go") { //go: subtract 1 from triforce, max out at end
			if (--qtyCounter["triforce"] < qtyCounterMin["triforce"])
				qtyCounter["triforce"] = qtyCounterMin["triforce"];
			else
				logAction(label, qtyCounter["triforce"], event.button);
		} else if (label === "hookshot") { //hookshot: add one to stun prize, wrap around (reversed from pulls, but OK?)
			qtyCounter.stunprize++;
			if (qtyCounter.stunprize > qtyCounterMax.stunprize)
				qtyCounter.stunprize = qtyCounterMin.stunprize;
			updateQuadrant("stunprize");
			return;
		} else if (label.substring(0, 3) === "all") { //allx: add 1 to qty, wrap around, also update item
			var qty = translateItem(label, event.button);
			var old = qtyCounter[qty];
			if (++qtyCounter[qty] > qtyCounterMax[qty])
				qtyCounter[qty] = qtyCounterMin[qty];
			var newv = qtyCounter[qty];
			if (old !== newv)
				logAction(qty, qtyCounter[qty], event.button);
		} else if (label.substring(0,5) === "chest") { //chestx: add 1, max out at end
			if (++items[label] > itemsMax[label])
				items[label] = itemsMax[label];
			else
				logAction(label, items[label], event.button);
		} else if (label.substring(0, 4) === "boss") { //bossx: add 1 to offset, wrap around
			var old = qtyCounter[label];
			qtyCounter[label]++;
			if (label === "boss2") {
				while (qtyCounter[label] === 2 || qtyCounter[label] === 4 || (qtyCounter[label] === 5 && optionSwords === "swordless")
					|| qtyCounter[label] === 7 || qtyCounter[label] === 8 || qtyCounter[label] === 9)
					qtyCounter[label]++;
			} else if (label === "boss5") {
				while ((qtyCounter[label] === 2 && optionSwords === "swordless")
					|| qtyCounter[label] === 4)
					qtyCounter[label]++;
			}
			if (qtyCounter[label] > qtyCounterMax[label])
				qtyCounter[label] = qtyCounterMin[label];
			var newv = qtyCounter[label];
			if (old !== newv)
				logAction(label, qtyCounter[label], event.button);
		} else { //bombs, boots, sword, firerod, icerod, bombos, ether, quake, glove, lantern, hammer, net, book, flippers, somaria, byrna, cape, mirror, moonpearl: no effect
			;
		}

		//prime sphere tracking
		if (label === "glove" || label === "sword")
			lastItem = "";
		else if (label.substring(0, 3) === "all")
			if (label === "alldefense")
				if (qtyCounter[translateItem(label, event.button)] > 1)
					lastItem = translateItem(label, event.button) + qtyCounter[translateItem(label, event.button)];
				else lastItem = "";
			else if (qtyCounter[translateItem(label, event.button)])
				lastItem = translateItem(label, event.button);
			else lastItem = "";
		//Override
		if (label === "allbow" && optionVariation === "retro")
			if (qtyCounter[translateItem(label, event.button)] === 1)
				lastItem = "arrow1";
	}

	if (event.button === 1) { //middle click
		//prime sphere tracking
		if (label === "boots" || label === "firerod" || label === "icerod" || label === "bombos" || label === "ether" || label === "quake" || label === "lantern" || label === "hammer" || label === "net" || label === "book" || label === "flippers" || label === "somaria" || label === "byrna" || label === "cape" || label === "mirror" || label === "moonpearl")
			lastItem = label;
		else if (label === "sword" || label === "glove") {
			if (items[label] === 0)
				lastItem = label + 1;
			else
				lastItem = label + items[label];
		} else if (label === "hookshot") {
			lastItem = label + 2;
		} else if (label.substring(0, 3) === "all") {
			var first = items[label].substring(items[label].length - 2, 1);
			var second = items[label].substring(items[label].length - 1);
			if (second === "0" || first !== "0" || (second === "1" && label === "alldefense")) {
				lastItem = translateItem(label, 0);
				if (label === "alldefense")
					lastItem = lastItem + 1;
			} else {
				lastItem = translateItem(label, 1);
				if (label === "alldefense")
					lastItem = lastItem + 2;
			}
		}
	}

	updateTrackerItem(label);
	refreshMap();
}

//event handler for clicks on cells that are divided into quadrants, updates data structure with new status of items/qty
//possible quadrants:
//magic, heart_piece, death, heart_full
//bottle0, bottle1, bottle2, bottle3
//fairy0, fairy1, pullcrab0, pullcrab1
//pull1, pull2, pull3, pullfish
//hc_sk, hc_bk, hc_map, zelda
//ditems_skx, ditems_bkx, ditems_mapx, ditems_compx
//medallionx, dungeonPrizex, gtbossx <-- these are handled by itemToggle then passed to quadrantToggle
function quadrantToggle(event) {
	var label = event.target.id;

	//These events exist, but we ignore them
	if (label === "ditems_sk0" || label === "ditems_bk11" || label === "ditems_map11" || label === "ditems_comp11")
		return;

	if (event.button === 0) { //left click
		if (label.substring(0, 6) === "bottle") { //bottlex: add 1 bottle to inventory, wrap around
			items.bottle++;
			if (items.bottle > itemsMax.bottle)
				items.bottle = itemsMin.bottle;
			logAction("bottle", items.bottle, event.button);
		} else if (label.substring(0, 5) === "fairy" || label.substring(0, 4) === "pull") { //fairyx, pullx: subtract 1, wrap around (reversed of fairy/pull right click, which matches bottle/stunprize right click)
			if (--qtyCounter[label] < qtyCounterMin[label])
				qtyCounter[label] = qtyCounterMax[label];
		} else if (typeof qtyCounter[label] === "boolean") { //hc_bk, hc_map, ditems_bkx, ditems_mapx, ditems_compx: toggle
			qtyCounter[label] = !qtyCounter[label];
			logAction(label, qtyCounter[label], event.button);
		} else if (label.substring(0, 5) === "magic" || label === "zelda" || label.substring(0, 9) === "medallion" || label.substring(0, 12) === "dungeonPrize" || label.substring(0, 6) === "gtboss") { //magic, zelda, medallionx, dungeonPrizex, gtboss: add 1, wrap around
			var old = qtyCounter[label];
			if (++qtyCounter[label] > qtyCounterMax[label])
				qtyCounter[label] = qtyCounterMin[label];
			var newv = qtyCounter[label];
			if (old !== newv)
				logAction(label, qtyCounter[label], event.button);
		} else { //heart_piece, death, heart_full, hc_sk, ditems_skx: add 1, max out at end
			if (++qtyCounter[label] > qtyCounterMax[label])
				qtyCounter[label] = qtyCounterMax[label];
			else
				logAction(label, qtyCounter[label], event.button);
		}

		//prime sphere tracking
		if (label === "magic")
			lastItem = "magic" + qtyCounter[label];
		else if (label.substring(0, 6) === "bottle")
			if (items["bottle"]) lastItem = "bottle0";
			else lastItem = "";
		else if (label === "zelda")
			if (qtyCounter[label]) lastItem = label + qtyCounter[label];
			else lastItem = "";
		else if (label === "hc_sk" || label.substring(0, 9) === "ditems_sk" || label.substring(0, 9) === "ditems_bk")
			lastItem = label;
	}

	if (event.button === 2) { //right click
		if (label.substring(0, 6) === "bottle" || label.substring(0, 5) === "fairy") { //bottlex, fairyx: add 1 to bottle contents, wrap around
			if (label.substring(0, 6) !== "bottle" || label.substring(6) < items.bottle) //only process if we have the bottle
				if (++qtyCounter[label] > qtyCounterMax[label])
					qtyCounter[label] = qtyCounterMin[label];
		} else if (label.substring(0, 12) === "dungeonPrize")  {//dungeonPrizex: mark prize
			if (optionLogic === "nologic" || (optionLogic === "major" && label === "dungeonPrize8")) {
				qtyCounter["gotPrize"+label.substring(12)] = !qtyCounter["gotPrize"+label.substring(12)];
				logAction(label, qtyCounter["gotPrize"+label.substring(12)], event.button);
			}
		} else if (label === "heart_piece" || label === "death" || label === "heart_full" || label === "hc_sk" || label.substring(0, 9) === "ditems_sk") { //heart_piece, death, heart_full, hc_sk, ditems_sk: subtract 1, max out at end
			if (--qtyCounter[label] < qtyCounterMin[label])
				qtyCounter[label] = qtyCounterMin[label];
			else
				logAction(label, qtyCounter[label], event.button);
		} else if (label.substring(0, 4) === "pull") { //pullx: add 1, wrap around
			if (++qtyCounter[label] > qtyCounterMax[label])
				qtyCounter[label] = qtyCounterMin[label];
		} else if (label.substring(0, 6) === "gtboss") { //gtbossx: add 1, wrap around
			var num = label.substring(6);
			qtyCounter["boss"+num]++;
			if (label === "gtboss14")
				while (qtyCounter["boss"+num] === 5 || (qtyCounter["boss"+num] === 6 && optionSwords === "swordless"))
					qtyCounter["boss"+num]++;
			else if (label === "gtboss15")
				while (qtyCounter["boss"+num] === 2 || qtyCounter["boss"+num] === 4 || (qtyCounter["boss"+num] === 5 && optionSwords === "swordless")
					|| qtyCounter["boss"+num] === 7 || qtyCounter["boss"+num] === 8 || qtyCounter["boss"+num] === 9)
					qtyCounter["boss"+num]++;
			if (qtyCounter["boss"+num] > qtyCounterMax["boss"+num])
				qtyCounter["boss"+num] = qtyCounterMin["boss"+num];
			logAction(label, qtyCounter["boss"+num], event.button);
		} else { //magic, hc_bk, hc_map, zelda, ditems_bkx, ditems_mapx, ditems_comps, medallionx: no effect
			return;
		}

		//prime sphere tracking
		if (label === "magic" || label === "hc_sk" || label.substring(0, 9) === "ditems_sk")
			lastItem = "";
	}

	if (event.button === 1) { //middle click
		if (label.substring(0, 6) === "bottle")
			lastItem = "bottle0";
		else if (label === "magic")
			if (qtyCounter[label] <= 1)
				lastItem = label + 2;
			else
				lastItem = label + qtyCounter[label];
		else if (label === "zelda")
			lastItem = label + 1;
		else if (label === "hc_sk" || label.substring(0, 9) === "ditems_sk" || label.substring(0, 9) === "ditems_bk")
			lastItem = label;
	}

	updateQuadrant(label);
	refreshMap();
}

//updates className and images and innerHTML of spheres
function updateSphereTracker(sphereName) {
	if (spheres[sphereName] === undefined || spheres[sphereName] === "") {
		document.getElementById(sphereName).className = "corner half";
		document.getElementById(sphereName).style.backgroundImage = "url(images/dungeon0.png)";
		document.getElementById(sphereName).innerHTML = "";
	} else {
		document.getElementById(sphereName).className = "corner true";
		if (spheres[sphereName] === "hc_sk" || spheres[sphereName].substring(0, 9) === "ditems_sk")
			document.getElementById(sphereName).style.backgroundImage = "url(images/smallkey.png)";
		else if (spheres[sphereName].substring(0, 9) === "ditems_bk")
			document.getElementById(sphereName).style.backgroundImage = "url(images/bigkey.png)";
		else
			document.getElementById(sphereName).style.backgroundImage = "url(images/"+spheres[sphereName]+".png)";
		if (spheres[sphereName] === "hc_sk")
			document.getElementById(sphereName).innerHTML = "HC";
		else if (spheres[sphereName].substring(0, 9) === "ditems_sk" || spheres[sphereName].substring(0, 9) === "ditems_bk") {
			switch (spheres[sphereName].substring(9)) {
				case "0": document.getElementById(sphereName).innerHTML = "EP"; break;
				case "1": document.getElementById(sphereName).innerHTML = "DP"; break;
				case "2": document.getElementById(sphereName).innerHTML = "ToH"; break;
				case "3": document.getElementById(sphereName).innerHTML = "PoD"; break;
				case "4": document.getElementById(sphereName).innerHTML = "SP"; break;
				case "5": document.getElementById(sphereName).innerHTML = "SW"; break;
				case "6": document.getElementById(sphereName).innerHTML = "TT"; break;
				case "7": document.getElementById(sphereName).innerHTML = "IP"; break;
				case "8": document.getElementById(sphereName).innerHTML = "MM"; break;
				case "9": document.getElementById(sphereName).innerHTML = "TR"; break;
				case "10": document.getElementById(sphereName).innerHTML = "GT"; break;
				case "11": document.getElementById(sphereName).innerHTML = "AT"; break;
			}
		} else
			document.getElementById(sphereName).innerHTML = "";
	}
}

//event handler for clicks on sphere tracker
//updates data structure with new status of spheres
function sphereToggle(event) {
	if (event.button === 0 || event.button === 1) { //left or middle click, place last item to this sphere, or clear this sphere
		var newItem = spheres[event.target.id];
		spheres[event.target.id] = lastItem;
		lastItem = newItem;
		updateSphereTracker(event.target.id);
	}

	if (event.button === 2) { //right click, cycle item in sphere
		var label = spheres[event.target.id];
		if (spheres[event.target.id] === undefined || spheres[event.target.id] === "") {
			spheres[event.target.id] = lastItem;
			lastItem = "";
		} else
			switch (label) {
				case "sword1": spheres[event.target.id] = "sword2"; break;
				case "sword2": spheres[event.target.id] = "sword3"; break;
				case "sword3": spheres[event.target.id] = "sword4"; break;
				case "sword4": spheres[event.target.id] = "sword1"; break;
				case "glove1": spheres[event.target.id] = "glove2"; break;
				case "glove2": spheres[event.target.id] = "glove1"; break;
				case "magic2": spheres[event.target.id] = "magic3"; break;
				case "magic3": spheres[event.target.id] = "magic2"; break;
				case "bow": spheres[event.target.id] = "arrow1"; break;
				case "arrow1": spheres[event.target.id] = "arrow"; break;
				case "arrow": spheres[event.target.id] = "bow"; break;
				case "blueboom": spheres[event.target.id] = "redboom"; break;
				case "redboom": spheres[event.target.id] = "blueboom"; break;
				case "mushroom": spheres[event.target.id] = "powder"; break;
				case "powder": spheres[event.target.id] = "mushroom"; break;
				case "shovel": spheres[event.target.id] = "flute"; break;
				case "flute": spheres[event.target.id] = "shovel"; break;
				case "shield1": spheres[event.target.id] = "shield2"; break;
				case "shield2": spheres[event.target.id] = "shield3"; break;
				case "shield3": spheres[event.target.id] = "tunic2"; break;
				case "tunic2": spheres[event.target.id] = "tunic3"; break;
				case "tunic3": spheres[event.target.id] = "shield1"; break;
			}
		updateSphereTracker(event.target.id);
	}
}

// Highlights a chest location on mouseover and shows the name as caption
function highlight(x){
	if (x.substring(0, 7) === "bossMap" || x.substring(0, 7) === "dungeon")
		x = "dungentr" + x.substring(7);
	if (x.substring(0, 8) === "entrance")
		document.getElementById(x).style.borderColor  = "yellow";
	else
		document.getElementById(x).style.outlineColor  = "yellow";
	if (x.substring(0, 3) === "poi")
		document.getElementById("caption").innerHTML = chests[x.substring(3)].name + " " + (chests[x.substring(3)].hint ? chests[x.substring(3)].hint : "");
	else if (x.substring(0, 8) === "entrance")
		document.getElementById("caption").innerHTML = entrances[x.substring(8)].name + " " + (entrances[x.substring(8)].hint ? entrances[x.substring(8)].hint : "");
	else if (x.substring(0, 4) === "shop")
		document.getElementById("caption").innerHTML = shops[x.substring(4)].name + " " + (shops[x.substring(4)].hint ? shops[x.substring(4)].hint : "");
}
function unhighlight(x){
	if (x.substring(0, 7) === "bossMap" || x.substring(0, 7) === "dungeon")
		x = "dungentr" + x.substring(7);
	if (x.substring(0, 8) === "entrance")
		document.getElementById(x).style.borderColor  = "black";
	else
		document.getElementById(x).style.outlineColor  = "black";
	document.getElementById("caption").innerHTML = "&nbsp;";
}

function mapToggle(event) {
	if (event.button === 0) { //left click
		if (event.target.id.substring(0, 3) === "poi") {
			chests[event.target.id.substring(3)].isOpened = !chests[event.target.id.substring(3)].isOpened;
			logAction(event.target.id, chests[event.target.id.substring(3)].isOpened, event.button);
		} else if (event.target.id.substring(0, 8) === "entrance") {
			entrances[event.target.id.substring(8)].isOpened = !entrances[event.target.id.substring(8)].isOpened;
			logAction(event.target.id, entrances[event.target.id.substring(8)].isOpened, event.button);
		} else if (event.target.id.substring(0, 4) === "shop") {
			shops[event.target.id.substring(4)].isOpened = !shops[event.target.id.substring(4)].isOpened;
			logAction(event.target.id, shops[event.target.id.substring(4)].isOpened, event.button);
		}
	}
	refreshMap();
}

function refreshMap() {
	//Update all chests on the map, className and backgroundImage
	chests.forEach(function(chest, chestNum) {
		if (chest.isOpened)
			document.getElementById("poi"+chestNum).className = "chest opened";
		else
			document.getElementById("poi"+chestNum).className = "chest " + accessTranslator(chest.isAvailable());
	});

	//Update all boss & dungeons on the map, className, innerText and backgroundImage
	dungeons.forEach(function(dungeon, dungeonNum) {
		if (dungeon.isBeaten() || (dungeonNum === 12 && (optionGoal === "triforce" || optionGoal === "pedestal")))
			document.getElementById("bossMap"+dungeonNum).className = "boss opened";
		else
			document.getElementById("bossMap"+dungeonNum).className = "boss " + accessTranslator(dungeon.isBeatable());
		if (items["chest" + dungeonNum] === 0 || (dungeonNum === 12 && (dungeons[12].isBeaten() || optionGoal === "triforce" || optionGoal === "pedestal")))
			document.getElementById("dungeon"+dungeonNum).className = "dungeon opened";
		else
			document.getElementById("dungeon"+dungeonNum).className = "dungeon " + accessTranslator(dungeon.canGetChests());
		if ((items["chest" + dungeonNum] === 0 && dungeons[dungeonNum].isBeaten() && dungeons[dungeonNum].gotPrize())
			|| (dungeonNum === 12 && (dungeons[12].isBeaten() || optionGoal === "triforce" || optionGoal === "pedestal")))
			document.getElementById("dungentr"+dungeonNum).className = "dungentr opened";
		else
			document.getElementById("dungentr"+dungeonNum).className = "dungentr " + accessTranslator(dungeon.isAccessible());
		switch (dungeonNum) {
			case 10: document.getElementById("bossMap"+dungeonNum).style.backgroundImage = "url(images/agahnim2.png)"; break;
			case 11: document.getElementById("bossMap"+dungeonNum).style.backgroundImage = "url(images/agahnim.png)"; break;
			case 12: document.getElementById("bossMap"+dungeonNum).style.backgroundImage = "url(images/ganon.png)"; break;
			default:
				if (qtyCounter["boss"+dungeonNum] === -1) {
					document.getElementById("bossMap"+dungeonNum).style.backgroundImage = "url(images/boss_unk2.png)";
					document.getElementById("bossMap"+dungeonNum).style.backgroundImage += ", url(images/boss"+dungeonNum+"2.png)";
				} else {
					var bossnum = (dungeonNum + qtyCounter["boss"+dungeonNum]) % 10;
					document.getElementById("bossMap"+dungeonNum).style.backgroundImage = "url(images/boss"+bossnum+"2.png)";
				}
				break;
		}
	});

	if (optionVariation === "retro") {
		//Update all entrances on the map, className and backgroundImage
		entrances.forEach(function(entrance, entranceNum) {
			if (entrance.isOpened)
				document.getElementById("entrance"+entranceNum).className = "entrance opened";
			else
				document.getElementById("entrance"+entranceNum).className = "entrance " + accessTranslator(entrance.isAvailable());
		});

		//Update all shops on the map, className and backgroundImage
		shops.forEach(function(shop, shopNum) {
			if (shop.isOpened)
				document.getElementById("shop"+shopNum).className = "shop opened";
			else
				document.getElementById("shop"+shopNum).className = "shop " + accessTranslator(shop.isAvailable());
		});
	}
}


//Assume: Views can only be "a", "p", or "u". Only possible multiples would be DP torch, GT torch, and Hera basement
//			Also means we will never see ng:multiple + ngv:a/p
//List of "v"s: Desert Ledge, Floating Island, Lake Hylia, Library, Lumberjack, Maze Race, Pyramid, Spectacle Rock,
//		Spectacle Rock Cave, Zora's Ledge, Ether Tablet, Bombos Tablet, Pedestal, Bumper Cave
//		Mushroom, Forest Thieves, Cave 45
//How to get "possible":
//		Medallion check, arrows, canBeatBoss, dungeon calcs, good bee, ---- FAIRY REVIVAL
//		Mimic cave, desert ledge, ether tablet, Hyrule castle stuff

//We need to save halves for g/mg/a, so x+v must be represented with one swath
//I think we give up and say it's OK to overload/simplify
//ng:a + ngv:u -> available1
//ng:p + ngv:u -> possible2
//ng:u + ngv:u -> unavailable
//ng:ap + ngv:u -> possible2
//ng:au + ngv:u -> some3
//ng:pu + ngv:u -> some4 (ugh)
//ng:apu + ngv:u -> some3
//ng:a + ngv:a -> available1
//ng:p + ngv:a -> possible2
//ng:u + ngv:a -> possible5
//ng:a + ngv:p -> available1
//ng:p + ngv:p -> possible2
//ng:u + ngv:p -> possible6
function accessTranslator(path) {
	if (path === undefined)
		return undefined;
	if (path.ng === "a")
		return "available";
	if (path.ng === "p" || path.ng === "ap")
		return "possible";
	if (path.ng === "au" || path.ng === "apu")
		return "some";
	if (path.ng === "pu")
		return "some";
	if (path.ngv === "a")
		return "possible";
	if (path.ngv === "p")
		return "possible";
	if (path.ng === "u" || path.ng === undefined)
		return "unavailable";
	return undefined;
}

function resetMap() {
	chests.forEach(function(chest) {
		chest.isOpened = false;
	});
	entrances.forEach(function(entrance) {
		entrance.isOpened = false;
	});
	shops.forEach(function(shop) {
		shop.isOpened = false;
	});
}