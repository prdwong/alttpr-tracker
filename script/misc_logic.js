function goModeCalc() {
	//return css class style for go mode button: "true", "false", "half"
	return "false";
}

//Bug magic extension doesn't take difficulty into account
//True/false helpers
function hasHookshot() { //unfortunately needed because of bad planning
	return items.hookshot > 1;
}
function rescueZelda() {
	return qtyCounter.zelda;
}
function hasMushroom() {
	return qtyCounter.mushroom === 1;
}
function hasPowder() {
	return qtyCounter.powder > 0;
}
function hasShovel() {
	return qtyCounter.shovel > 0;
}
function hasBoomerang() {
	return qtyCounter.blueboom > 0 || qtyCounter.redboom > 0;
}
function medallionCheck_path(dungeon) {
	if ((qtyCounter["medallion"+dungeon] === 1 && items.bombos)
		|| (qtyCounter["medallion"+dungeon] === 2 && items.ether)
		|| (qtyCounter["medallion"+dungeon] === 3 && items.quake)
		|| (items.bombos && items.ether && items.quake))
		return {ng:"a"};
	if (qtyCounter["medallion"+dungeon] === 0 && (items.bombos || items.ether || items.quake))
		return {ng:"p"};
	return {};
}
//From app/support/ItemCollection.php
function canLiftRocks() {
	return items.glove > 0;
}
function canLiftDarkRocks() {
	return items.glove >= 2;
}
function canLightTorches() {
	return items.firerod || items.lantern;
}
function canMeltThings() {
	return items.firerod
		|| (items.bombos && (optionSwords === "swordless" || hasSword()));
}
function canSpinSpeed() {
	return items.boots
		&& (hasSword() || hasHookshot());
}
function canBlockLasers() {
	return qtyCounter.shield >= 3;
}
function canExtendMagic($bars = 2) {
	return ((qtyCounter.magic === 2) ? 2 : 1)
		* ((qtyCounter.magic === 3) ? 4 : 1)
		* (bottleCount() + 1) >= $bars;
}
function glitchedLinkInDarkWorld() {
	return items.moonpearl || hasABottle();
}
function canBombThings() {
	return items.bombs;
}
function hasSword($min_level = 1) {
	return items.sword >= $min_level;
}
function hasBottle($at_least = 1) {
	return bottleCount() >= $at_least;
}
function bottleCount() {
	return items.bottle;
}
function hasABottle() {
	return hasBottle()
}
//Helpers returning path information
function canFly_path() {
	if (qtyCounter.flute === 2)
		return {ng:"a"};
	if (qtyCounter.flute === 1)
		return canActivateOcarina_path();
	return {};
}
function canActivateOcarina_path() {
	if (optionState === "inverted") {
		if (items.moonpearl)
			return regions.northEastLightWorld();
		return {};
	} else
		return {ng:"a"};
}
function canShootArrows_path($min_level = 1) {
	switch (optionVariation) {
		case "retro":
			if (qtyCounter.bow > 0) {
				if (qtyCounter.arrow >= $min_level)
					return {ng:"a"};
				else if ($min_level === 1)
					return {ng:"p"};
			}
			return {};
		default:
			if (qtyCounter.bow > 0 && qtyCounter.arrow + 1 >= $min_level)
				return {ng:"a"};
			return {};
	}
}
function canGetGoodBee_path() {
	if (items.net
		&& hasABottle()
		&& canBombThings()
		&& (items.boots
			|| (hasSword() && items.quake)))
		return {ng:"a"};
	if (hasABottle()) {
		var path1 = {}; //waterfall fairy
		var path2 = {}; //pyramid fairy
		if (qtyCounter.fairy0 === 5)
			path1 = chests[5].isAvailable();
		if (qtyCounter.fairy0 === 0)
			path1 = convertPossible(chests[5].isAvailable());
		if (qtyCounter.fairy1 === 5)
			path2 = chests[46].isAvailable();
		if (qtyCounter.fairy1 === 0)
			path2 = convertPossible(chests[46].isAvailable());
		return orCombinator(path1, path2);
	}
	return {};
}
//only used during HyruleCastleEscape, HyruleCastleTower & MiseryMire
function canKillMostThings_path($enemies = 5) { //TODO some additional unknown logic here regarding swords
	var path1 = {}; //Non-arrow
	var path2 = {}; //Arrow
	if (hasSword()
		|| items.somaria
		|| (items.bombs && $enemies < 6)
		|| (items.byrna && ($enemies < 6 || canExtendMagic()))
		|| items.hammer
		|| items.firerod)
		path1 = {ng:"a"};
	path2 = canShootArrows_path();
	return orCombinator(path1, path2);
}

//From app/Boss.php
//All bosses return path information
//Added bombs to Lanmo byrna kill
//Added bombs to sword/arrow Helma kill
//Added bombs to Arrghus swordless/hammerless kill
function canBeatArmos() {
	if (hasSword() || items.hammer
		|| hasBoomerang()
		|| (canExtendMagic(4) && (items.firerod || items.icerod))
		|| (canExtendMagic(2) && (items.byrna || items.somaria)))
		return {ng:"a"};
	return canShootArrows_path();
}
function canBeatLanmolas() {
	if (hasSword() || items.hammer
		|| items.firerod || items.icerod
		|| (items.byrna && canBombThings()) || items.somaria)
		return {ng:"a"};
	return canShootArrows_path();
}
function canBeatMoldorm() {
	if (hasSword() || items.hammer)
		return {ng:"a"};
	return {};
}
function canBeatAgahnim() {
	if (hasSword() || items.hammer || items.net)
		return {ng:"a"};
	return {};
}
function canBeatHelmasaur() {
	if (canBombThings()) {
		if (hasSword())
			return {ng:"a"};
		return canShootArrows_path();
	}
	return {};
}
function canBeatArrghus() {
	if (hasHookshot()) {
		if (items.hammer || hasSword())
			return {ng:"a"};
		if (canBombThings() && (items.firerod || items.icerod)) {
			if (canExtendMagic(2))
				return {ng:"a"};
			return canShootArrows_path();
		}
	}
	return {};
}
function canBeatMothula() {
	if (hasSword() || items.hammer
		|| (canExtendMagic(2) && (items.firerod || items.somaria || items.byrna))) //byrna is really hard (is there a trick?)
		return {ng:"a"};
	return canGetGoodBee_path(); //need to keep re-catching good bee
}
function canBeatBlind() {
	if (hasSword() || items.hammer
		|| items.somaria || items.byrna)
		return {ng:"a"};
	return {};
}
function canBeatKholdstare() {
	if (canMeltThings() && (items.hammer || hasSword()
		|| (canExtendMagic(3) && items.firerod)
		|| (canExtendMagic(2) && items.firerod && items.bombos)))
		return {ng:"a"};
	return {};
}
function canBeatVitreous() {
	if (items.hammer || hasSword())
		return {ng:"a"};
	return canShootArrows_path();
}
function canBeatTrinexx() {
	if (items.firerod && items.icerod
		&& (hasSword(3) || items.hammer
			|| (canExtendMagic(2) && hasSword(2))
			|| (canExtendMagic(4) && hasSword())))
		return {ng:"a"};
	return {};
}
function canBeatAgahnim2() {
	if (hasSword() || items.hammer || items.net)
		return {ng:"a"};
	return {};
}

function canBeatBoss(dungeonNum, bossOffset) {
	var bossNum = (dungeonNum + bossOffset) % 10;
	if (bossOffset === -1)
		bossNum = -1;
	switch (bossNum) {
		case -1:
			if (dungeonNum === 2) { //Hera has limitations on bosses
				if (optionSwords === "swordless")
					return anyOrAll4Combinator(canBeatMoldorm(), canBeatHelmasaur(), canBeatMothula(), canBeatVitreous());
				else
					return anyOrAll4Combinator(canBeatMoldorm(), canBeatHelmasaur(), canBeatMothula(),
						anyOrAllCombinator(canBeatKholdstare(), canBeatVitreous()));
			} else if (dungeonNum === 5) { //SW has limitations on bosses
				if (optionSwords === "swordless")
					return anyOrAllCombinator(anyOrAll4Combinator(canBeatArmos(), canBeatLanmolas(), canBeatMoldorm(), canBeatHelmasaur()),
						anyOrAll4Combinator(canBeatArrghus(), canBeatMothula(), canBeatBlind(), canBeatVitreous()));
				else
					return anyOrAllCombinator(anyOrAllCombinator(anyOrAll4Combinator(canBeatArmos(), canBeatLanmolas(), canBeatMoldorm(), canBeatHelmasaur()),
						anyOrAll4Combinator(canBeatArrghus(), canBeatMothula(), canBeatBlind(), canBeatKholdstare())), canBeatVitreous());
			} else
				return anyOrAll4Combinator(anyOrAll4Combinator(canBeatArmos(), canBeatLanmolas(), canBeatMoldorm(), canBeatHelmasaur()),
					anyOrAll4Combinator(canBeatArrghus(), canBeatMothula(), canBeatBlind(), canBeatKholdstare()),
					canBeatVitreous(), canBeatTrinexx()); break;
		case 0: return canBeatArmos(); break;
		case 1: return canBeatLanmolas(); break;
		case 2: return canBeatMoldorm(); break;
		case 3: return canBeatHelmasaur(); break;
		case 4: return canBeatArrghus(); break;
		case 5: return canBeatMothula(); break;
		case 6: return canBeatBlind(); break;
		case 7: return canBeatKholdstare(); break;
		case 8: return canBeatVitreous(); break;
		case 9: return canBeatTrinexx(); break;
	}
}

//Check if the set is {}
function isEmpty(set) {
	for (var key in set)
		if (set.hasOwnProperty(key))
			return false;
	return true;
}

//Change any "available" into "possible"
function convertPossible(set) {
	var pathList = Object.keys(set);
	pathList.forEach(function(path) {
		if (set[path] === "a" || set[path] === "ap")
			set[path] = "p";
		else if (set[path] === "au" || set[path] === "apu")
			set[path] = "pu";
	});
	return set;
}

//Take a path (no view component) and change all portions from x to xv)
function convertView(set) {
	var result = {};
	var pathList = Object.keys(set);
	pathList.forEach(function(route) {
		if (route.indexOf("v") === -1)
			result[route+"v"] = set[route];
	});
	return result;
}

//For paths, mg>=g>=ng, and xa>=x
//There is no assumed relation between v and not v
//This function fills up the assumed relations, replacing empty/undefined with the explicit "a" or "p" for easier comparison
//For g and mg, which can populate from multiple sources:
//  a+x = a
//  u+x = x
//  p+p/u = p
//From here, trying to extend this to accept any input instead of just paths
//  p+ap/au = ap
//  p+pu = p
//  ap+pu = a->a,a and p->p = ap
//  ap+ap = a->a,a and p->a,p = a or ap
//  ap+au = a->a,a and p->a,p = a or ap
//  au+au = a->a,a and u->a,u = a or au
//  au+pu = a->a,a and u->p,u = ap or au
//  pu+pu = p->p,p and u->p,u = p or pu
function populatePath(path) {
	if (path.g === undefined && path.ng !== undefined)
		path.g = path.ng;
	if (path.mg === undefined && path.g !== undefined)
		path.mg = path.g;
	if (path.nga === undefined && path.ng !== undefined)
		path.nga = path.ng;
	if (path.ga === undefined) {
		if (path.g === "a" || path.nga === "a")
			path.ga = "a";
		else if (path.g === undefined)
			path.ga = path.nga;
		else if (path.nga === undefined)
			path.ga = path.g;
		else if (path.g === "p" || path.nga === "p")
			if (path.nga === "ap" || path.nga === "au" || path.g === "ap" || path.g === "au")
				path.ga = "ap";
			else
				path.ga = "p";
		else if ((path.g === "ap" && path.nga === "pu")
			|| (path.g === "pu" && path.nga === "ap"))
			path.ga = "ap";
		else
			path.ga = "error"; //We hope there is no way to get these ambiguous contexts
	}
	if (path.mga === undefined) {
		if (path.mg === "a" || path.ga === "a")
			path.mga = "a";
		else if (path.mg === undefined)
			path.mga = path.ga;
		else if (path.ga === undefined)
			path.mga = path.mg;
		else if (path.mg === "p" || path.ga === "p")
			if (path.ga === "ap" || path.ga === "au" || path.mg === "ap" || path.mg === "au")
				path.mga = "ap";
			else
				path.mga = "p";
		else if ((path.mg === "ap" && path.ga === "pu")
			|| (path.mg === "pu" && path.ga === "ap"))
			path.mga = "ap";
		else
			path.mga = "error"; //We hope there is no way to get these ambiguous contexts
	}
	
	if (path.gv === undefined && path.ngv !== undefined)
		path.gv = path.ngv;
	if (path.mgv === undefined && path.gv !== undefined)
		path.mgv = path.gv;
	if (path.ngva === undefined && path.ngv !== undefined)
		path.ngva = path.ngv;
	if (path.gva === undefined) {
		if (path.gv === "a" || path.ngva === "a")
			path.gva = "a";
		else if (path.gv === undefined)
			path.gva = path.ngva;
		else if (path.ngva === undefined)
			path.gva = path.gv;
		else if (path.gv === "p" || path.ngva === "p")
			if (path.ngva === "ap" || path.ngva === "au" || path.gv === "ap" || path.gv === "au")
				path.gva = "ap";
			else
				path.gva = "p";
		else if ((path.gv === "ap" && path.ngva === "pu")
			|| (path.gv === "pu" && path.ngva === "ap"))
			path.gva = "ap";
		else
			path.gva = "error"; //We hope there is no way to get these ambiguous contexts
	}
	if (path.mgva === undefined) {
		if (path.mgv === "a" || path.gva === "a")
			path.mgva = "a";
		else if (path.mgv === undefined)
			path.mgva = path.gva;
		else if (path.gva === undefined)
			path.mgva = path.mgv;
		else if (path.mgv === "p" || path.gva === "p")
			if (path.gva === "ap" || path.gva === "au" || path.mgv === "ap" || path.mgv === "au")
				path.mgva = "ap";
			else
				path.mgva = "p";
		else if ((path.mgv === "ap" && path.gva === "pu")
			|| (path.mgv === "pu" && path.gva === "ap"))
			path.mgva = "ap";
		else
			path.mgva = "error"; //We hope there is no way to get these ambiguous contexts
	}
	return path;
}

//Remove redundant keys from the set. Note that this works on apu constructs too, not just paths
function depopulate(set) {
	if (set.mga !== undefined && (set.mga === set.mg || set.mga === set.ga))
		delete set.mga;
	if (set.ga !== undefined && (set.ga === set.g || set.ga === set.nga))
		delete set.ga;
	if (set.nga !== undefined && set.nga === set.ng)
		delete set.nga;
	if (set.mg !== undefined && set.mg === set.g)
		delete set.mg;
	if (set.g !== undefined && set.g === set.ng)
		delete set.g;
	if (set.mgva !== undefined && (set.mgva === set.mgv || set.mgva === set.gva))
		delete set.mgva;
	if (set.gva !== undefined && (set.gva === set.gv || set.gva === set.ngva))
		delete set.gva;
	if (set.ngva !== undefined && set.ngva === set.ngv)
		delete set.ngva;
	if (set.mgv !== undefined && set.mgv === set.gv)
		delete set.mgv;
	if (set.gv !== undefined && set.gv === set.ngv)
		delete set.gv;
	return set;
}

//Look at several paths and return the easiest path
//a+x -> a
//p+p/u -> p
//u+u -> u
//
function orCombinator(path1, path2, path3 = {}, path4 = {}, path5 = {}, path6 = {}) {
	var p1 = populatePath(path1);
	var p2 = populatePath(path2);
	var p3 = populatePath(path3);
	var p4 = populatePath(path4);
	var p5 = populatePath(path5);
	var p6 = populatePath(path6);
	var result = {};
	var pathList = ["ng", "ngv", "g", "gv", "mg", "mgv", "nga", "ngva", "ga", "gva", "mga", "mgva"];
	pathList.forEach(function(route) {
		if (p1[route] === "a" || p2[route] === "a" || p3[route] === "a" || p4[route] === "a" || p5[route] === "a" || p6[route] === "a")
			result[route] = "a";
		else if (p1[route] === "p" || p2[route] === "p" || p3[route] === "p" || p4[route] === "p" || p5[route] === "p" || p6[route] === "p")
			result[route] = "p";
	});
	return depopulate(result);
}

//Take several paths and figure out if it is possible to do all of them
//a+a -> a
//a+u or p+x -> p
//u+u -> u
function anyOrAllCombinator(path1, path2) {
	var p1 = populatePath(path1);
	var p2 = populatePath(path2);
	var result = {};
	var pathList = ["ng", "ngv", "g", "gv", "mg", "mgv", "nga", "ngva", "ga", "gva", "mga", "mgva"];
	pathList.forEach(function(route) {
		if (p1[route] === "a" && p2[route] === "a")
			result[route] = "a";
		else if (p1[route] !== undefined || p2[route] !== undefined)
			result[route] = "p";
	});
	return depopulate(result);
}
function anyOrAll4Combinator(path1, path2, path3, path4) {
	return anyOrAllCombinator(anyOrAllCombinator(path1, path2), anyOrAllCombinator(path3, path4));
}

//combine multiple paths into final apu for rendering multiple locations in one spot
function multipleChests(path1, path2, path3 = undefined, path4 = undefined, path5 = undefined, path6 = undefined) {
	var p1 = populatePath(path1);
	var p2 = populatePath(path2);
	var p3 = (path3 === undefined) ? undefined : populatePath(path3);
	var p4 = (path4 === undefined) ? undefined : populatePath(path4);
	var p5 = (path5 === undefined) ? undefined : populatePath(path5);
	var p6 = (path6 === undefined) ? undefined : populatePath(path6);
	var result = {};
	var pathList = ["ng", "ngv", "g", "gv", "mg", "mgv", "nga", "ngva", "ga", "gva", "mga", "mgva"];
	pathList.forEach(function(route) {
		if ((p1[route] !== undefined && p1[route].indexOf("a") !== -1)
			|| (p2[route] !== undefined && p2[route].indexOf("a") !== -1)
			|| (p3 !== undefined && p3[route] !== undefined && p3[route].indexOf("a") !== -1)
			|| (p4 !== undefined && p4[route] !== undefined && p4[route].indexOf("a") !== -1)
			|| (p5 !== undefined && p5[route] !== undefined && p5[route].indexOf("a") !== -1)
			|| (p6 !== undefined && p6[route] !== undefined && p6[route].indexOf("a") !== -1))
			result[route] = "a";
		if ((p1[route] !== undefined && p1[route].indexOf("p") !== -1)
			|| (p2[route] !== undefined && p2[route].indexOf("p") !== -1)
			|| (p3 !== undefined && p3[route] !== undefined && p3[route].indexOf("p") !== -1)
			|| (p4 !== undefined && p4[route] !== undefined && p4[route].indexOf("p") !== -1)
			|| (p5 !== undefined && p5[route] !== undefined && p5[route].indexOf("p") !== -1)
			|| (p6 !== undefined && p6[route] !== undefined && p6[route].indexOf("p") !== -1))
			result[route] === undefined ? result[route] = "p" : result[route] += "p";
		if (p1[route] === undefined
			|| p2[route] === undefined
			|| (p3 !== undefined && p3[route] === undefined)
			|| (p4 !== undefined && p4[route] === undefined)
			|| (p5 !== undefined && p5[route] === undefined)
			|| (p6 !== undefined && p6[route] === undefined))
			result[route] === undefined ? true : result[route] += "u";
	});
	return depopulate(result);
}

//Take several paths and figure out the result if it is needed to do them one after the other
//a+a -> a
//p+a/p -> p
//u+x -> u
function andCombinator(path1, path2, path3 = undefined, path4 = undefined, path5 = undefined, path6 = undefined) {
	var p1 = populatePath(path1);
	var p2 = populatePath(path2);
	var p3 = (path3 === undefined) ? undefined : populatePath(path3);
	var p4 = (path4 === undefined) ? undefined : populatePath(path4);
	var p5 = (path5 === undefined) ? undefined : populatePath(path5);
	var p6 = (path6 === undefined) ? undefined : populatePath(path6);
	var result = {};
	var pathList = ["ng", "ngv", "g", "gv", "mg", "mgv", "nga", "ngva", "ga", "gva", "mga", "mgva"];
	pathList.forEach(function(route) {
		if (p1[route] === "a" && p2[route] === "a"
			&& (p3 === undefined || p3[route] === "a")
			&& (p4 === undefined || p4[route] === "a")
			&& (p5 === undefined || p5[route] === "a")
			&& (p6 === undefined || p6[route] === "a"))
			result[route] = "a";
		else if (p1[route] !== undefined && p2[route] !== undefined
			&& (p3 === undefined || p3[route] !== undefined)
			&& (p4 === undefined || p4[route] !== undefined)
			&& (p5 === undefined || p5[route] !== undefined)
			&& (p6 === undefined || p6[route] !== undefined))
			result[route] = "p";
	});
	return depopulate(result);
}

//Looks up a glitch and returns a path
function glitched(id) {
	for (var i = 0; i < topList.length; i++) {
		if (topList[i].value === id)
			return {g:"a"};
	}
	for (var i = 0; i < bottomList.length; i++) {
		if (bottomList[i].value === id)
			return {mg:"a"};
	}
	return {};
}