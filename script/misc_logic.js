function goModeCalc() {
	var list = [];
	switch(optionGoal) {
		case "ganon":
			for (var i = 0; i < 10; i++)
				if (qtyCounter["dungeonPrize"+i] === 1 || qtyCounter["dungeonPrize"+i] === 2)
					list.push(orCombinator([dungeons[i].isBeaten(), andCombinator([dungeons[i].isAccessible(), dungeons[i].isBeatable()])]));
			if (optionGanon === "random") {
				return andCombinator([dungeons[12].canReachHole(), dungeons[12].isBeatable(true), dungeons[10].isAccessible(true), dungeons[10].isBeatable(true),
					anyOrAllCombinator([threshCombinator(0, list), threshCombinator(1, list), threshCombinator(2, list), threshCombinator(3, list),
						threshCombinator(4, list), threshCombinator(5, list), threshCombinator(6, list), threshCombinator(7, list)])]);
			} else
				return andCombinator([dungeons[12].canReachHole(), dungeons[12].isBeatable(true), dungeons[10].isAccessible(true), dungeons[10].isBeatable(true), threshCombinator(optionGanon, list)]);
		case "fastganon":
			for (var i = 0; i < 10; i++)
				if (qtyCounter["dungeonPrize"+i] === 1 || qtyCounter["dungeonPrize"+i] === 2)
					list.push(orCombinator([dungeons[i].isBeaten(), andCombinator([dungeons[i].isAccessible(), dungeons[i].isBeatable()])]));
			if (optionGanon === "random") {
				return andCombinator([dungeons[12].canReachHole(), dungeons[12].isBeatable(true),
					anyOrAllCombinator([threshCombinator(0, list), threshCombinator(1, list), threshCombinator(2, list), threshCombinator(3, list),
						threshCombinator(4, list), threshCombinator(5, list), threshCombinator(6, list), threshCombinator(7, list)])]);
			} else
				return andCombinator([dungeons[12].canReachHole(), dungeons[12].isBeatable(true), threshCombinator(optionGanon, list)]);
		case "alldungeons":
			for (var i = 0; i < 12; i++)
				list.push(orCombinator([dungeons[i].isBeaten(), andCombinator([dungeons[i].isAccessible(true), dungeons[i].isBeatable(true)])]));
			return andCombinator(dungeons[12].canReachHole(), dungeons[12].isBeatable(true), threshCombinator(12, list));
		case "pedestal":
			for (var i = 0; i < 10; i++)
				if (qtyCounter["dungeonPrize"+i] >= 3)
					list.push(orCombinator([dungeons[i].isBeaten(), andCombinator([dungeons[i].isAccessible(), dungeons[i].isBeatable()])]));
			return andCombinator([regions.northWestLightWorld(), threshCombinator(3, list)]);
	}
	return {};
}

//Helpers
function hasHookshot() { //unfortunately needed because of bad planning
	return items.hookshot > 1;
}
function rescueZelda() {
	return qtyCounter.zelda === 1;
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
	return orCombinator([(qtyCounter["medallion"+dungeon] === 1 && items.bombos)
		|| (qtyCounter["medallion"+dungeon] === 2 && items.ether)
		|| (qtyCounter["medallion"+dungeon] === 3 && items.quake)
		|| (items.bombos && items.ether && items.quake),
		convertPossible(bool2path(qtyCounter["medallion"+dungeon] === 0 && (items.bombos || items.ether || items.quake)))]);
}
function canAdvancedItems_path() {
	if (optionItemplace === "basic")
		return glitched("advanced_items");
	return {ng:"a"};
}
function AccurateLogic(path1, path2) {
	if (optBottleCount) //Use correct (path2) arg, path1 is marked with mg
		return orCombinator([path2, andCombinator([glitched("major"), path1])]);
	else //Use logic (path1) arg, correct call is marked with g
		return orCombinator([path1, andCombinator([glitched("true"), path2])]);
}

//From app/support/ItemCollection.php
function hasHealth(level) {
	return level <= qtyCounter.heart_full + (qtyCounter.heart_piece / 4);
}
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
function canExtendMagic($bars = 2) { //TODO: option to change this for other difficulties
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
function hasArmor() {
	return qtyCounter.tunic > 1;
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
function canFly_path(from_locs = []) {
	return orCombinator([qtyCounter.flute === 2,
		andCombinator([qtyCounter.flute === 1, canActivateOcarina_path(from_locs)])]);
}
function canActivateOcarina_path(from_locs = []) {
	if (optionState === "inverted")
		return regions.northEastLightWorld(true, from_locs);
	else
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
	return orCombinator([items.net
			&& hasABottle()
			&& (items.boots
				|| (hasSword() && items.quake)),
		qtyCounter.bottle0 === 5 || qtyCounter.bottle1 === 5 || qtyCounter.bottle2 === 5 || qtyCounter.bottle3 === 5,
		andCombinator([hasABottle(), orCombinator([andCombinator([qtyCounter.fairy0 === 5, chests[5].isAvailable()]),
			andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[5].isAvailable())]),
			andCombinator([qtyCounter.fairy1 === 5, chests[46].isAvailable()]),
			andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[46].isAvailable())])])])]);
}
function canGetBee_path() {
	return orCombinator([items.net && hasABottle(), //Should be pull objects available to find a bee
		qtyCounter.bottle0 === 4 || qtyCounter.bottle1 === 4 || qtyCounter.bottle2 === 4 || qtyCounter.bottle3 === 4,
		qtyCounter.bottle0 === 5 || qtyCounter.bottle1 === 5 || qtyCounter.bottle2 === 5 || qtyCounter.bottle3 === 5,
		andCombinator([hasABottle(), orCombinator([andCombinator([qtyCounter.fairy0 === 4 || qtyCounter.fairy0 === 5, chests[5].isAvailable()]),
			andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[5].isAvailable())]),
			andCombinator([qtyCounter.fairy1 === 4 || qtyCounter.fairy1 === 5, chests[46].isAvailable()]),
			andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[46].isAvailable())])])])]);
}
function canGetFairy_path(num = 1) {
	var count = 0;
	for (var i = 0; i < 4; i++)
		if (qtyCounter["bottle"+i] === 6)
			count++;
	return orCombinator([items.net && bottleCount() >= num,
		count >= num,
		andCombinator([bottleCount() >= num, orCombinator([andCombinator([qtyCounter.fairy0 === 6, chests[5].isAvailable()]),
			andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[5].isAvailable())]),
			andCombinator([qtyCounter.fairy1 === 6, chests[46].isAvailable()]),
			andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[46].isAvailable())])])])]);
}

//only used during HyruleCastleTower & MiseryMire
//TODO: canExtendMagic is not great for higher difficulty, but this is how logic is right now -- not actually sure how to handle it otherwise (approx 1.25 for CT, none for MM)
function canKillMostThings_path($enemies = 5) {
	return orCombinator([hasSword()
		|| items.somaria
		|| (canBombThings() && $enemies < 6)
		|| (items.byrna && ($enemies < 6 || canExtendMagic())),
		canShootArrows_path(),
		items.hammer
		|| items.firerod]);
}

//Used during HyruleCastleEscape
function canKillEscapeThings_path() {
	return orCombinator([hasSword()
		|| items.somaria
		|| canBombThings()
		|| items.byrna,
		canShootArrows_path(),
		items.hammer
		|| items.firerod]);
}

//From config/logic.php
function canSuperBunny_path(type = "") { //Used for superbunny, mire, VoO
	switch (optionLogic) {
		case "nmg":
			if (type === "fall")
				return glitched("superbunny");
			else if (type === "hit")
				return glitched("superbunny_hit");
			else if (type === "mirror")
				return andCombinator([items.mirror, glitched("superbunny_mirror")]);
			return {};
		case "owg":
		case "major":
		case "nologic":
			return {ng:"a"};
	}
	return {};
}
function canFakeFlipper_path(type = "") { //Screen transition fake flipper -- Used for Lake Hylia dNE access, hammer peg/chest area, IP, Waterfall/Zora area, Hobo/Capacity fairy
	switch (optionLogic) {
		case "nmg":
			return glitched("fakeflipper");
		case "owg":
		case "major":
		case "nologic":
			return {ng:"a"};
	}
}
function canSuperSpeed_path() {
	if (canSpinSpeed())
		switch (optionLogic) {
			case "nmg":
				return {};
			case "owg":
			case "major":
			case "nologic":
				return {ng:"a"};
		}
	return {};
}
function canBootsClip_path() {
	if (items.boots)
		switch (optionLogic) {
			case "nmg":
				return {};
			case "owg":
			case "major":
			case "nologic":
				return {ng:"a"};
		}
	return {};
}
function canMirrorClip_path() {
	if (items.mirror)
		switch (optionLogic) {
			case "nmg":
				return {};
			case "owg":
			case "major":
			case "nologic":
				return {ng:"a"};
		}
	return {};
}
function canWaterWalk_path() { //Used for dNE access (qirn area), IP, Waterfall/Ledge, Hobo
	if (items.boots)
		switch (optionLogic) {
			case "nmg":
				return glitched("waterwalk_boots");
			case "owg":
			case "major":
			case "nologic":
				return {ng:"a"};
		}
	return {};
}
function canBunnySurf_path() { //Used for Lake Hylia
	if (items.mirror && items.flippers && !items.moonpearl)
		switch (optionLogic) {
			case "nmg":
				return glitched("surfingbunny_mirror");
			case "owg":
			case "major":
			case "nologic":
				return {ng:"a"};
		}
	return {};
}
function canMirrorWrap_path() {
	if (items.mirror)
		switch (optionLogic) {
			case "nmg":
				return {};
			case "owg":
			case "major":
			case "nologic":
				return {ng:"a"};
		}
	return {};
}
function canDungeonRevive_path() { //Used for SW, IP
	switch (optionLogic) {
		case "nmg":
			return glitched("dungeonrevival");
		case "owg":
		case "major":
		case "nologic":
			return {ng:"a"};
	}
}
function canBunnyRevive_path() { //Used nowhere
	switch (optionLogic) {
		case "nmg":
		case "owg":
			return {};
		case "major":
		case "nologic":
			return {ng:"a"};
	}
}
function canOWYBA_path(bottles = bottleCount()) { //Used for fake flute only, I assume
	var logic = {};
	switch (optionLogic) {
		case "nmg": logic = {}; break;
		case "owg": logic = glitched("fakeflute"); break;
		case "major": case "nologic": logic = {ng:"a"}; break;
	}
	return AccurateLogic(andCombinator([bottleCount() >= 1, logic]), andCombinator([bottles >= 1, logic]));
}
function canOneFrameClipOW_path() {
	switch (optionLogic) {
		case "nmg":
			return {};
		case "owg":
			return glitched("clip1f");
		case "major":
		case "nologic":
			return {ng:"a"};
	}
}
function canOneFrameClipUW_path() {
	switch (optionLogic) {
		case "nmg":
		case "owg":
			return {};
		case "major":
		case "nologic":
			return {ng:"a"};
	}
}

//From app/Boss.php
//All bosses return path information
//LogicAdd: Added bombs to Lanmo byrna kill and Arrghus rod kills
//LogicAdd: Added net to Mothula good bee kill, because V31 assumes net req to get good bee
function canBeatArmos() {
	return orCombinator([hasSword() || items.hammer, canShootArrows_path(),
		hasBoomerang()
		|| (canExtendMagic(4) && (items.firerod || items.icerod))
		|| (canExtendMagic(2) && (items.byrna || items.somaria)),
		andCombinator([glitched("armos_firerod"), canExtendMagic(2.25) && items.firerod]),
		andCombinator([glitched("armos_firerod_super"), canExtendMagic(1.5) && items.firerod]),
		andCombinator([glitched("armos_bombs"), canBombThings() && (items.firerod || items.icerod || items.byrna || items.somaria)]),
		andCombinator([glitched("armos_bombs_only"), canBombThings()])]);
}
function canBeatLanmolas() {
	return orCombinator([hasSword() || items.hammer,
		canShootArrows_path(), items.firerod || items.icerod
		|| (items.byrna && canBombThings()) || items.somaria,
		andCombinator([glitched("lanmo_bombs"), canBombThings()])]);
}
function canBeatMoldorm() {
	return bool2path(hasSword() || items.hammer);
}
function canBeatAgahnim() {
	return bool2path(hasSword() || items.hammer || items.net);
}
function canBeatHelmasaur() {
	return andCombinator([canBombThings() || items.hammer,
		orCombinator([hasSword(2), canShootArrows_path()]),
		andCombinator(glitched("helma_fighter"), hasSword()),
		andCombinator(glitched("helma_hammer_ext"), items.hammer && (hasSword() || optionSwords === "swordless")), //extension when holding sword out or in swordless mode (sword = 255)
		andCombinator(glitched("helma_hammer"), items.hammer)]);
}
function canBeatArrghus() {
	//13 puffs vulnerable to bombs (2), silvers, rods
	//body vulnerable to arrows, rods (0.5 bar)
	return andCombinator([orCombinator([optionItemplace !== "basic" || optionSwords === "swordless" || hasSword(2), canAdvancedItems_path()]),
		hasHookshot(), orCombinator([items.hammer || hasSword(),
			andCombinator([orCombinator([canExtendMagic(2), canShootArrows_path()]), canBombThings() && (items.firerod || items.icerod)]),
			andCombinator([glitched("arrghus_silver"), canShootArrows_path(2)]),
			andCombinator([glitched("arrghus_rods"), items.firerod || items.icerod, orCombinator([canExtendMagic(2.125), andCombinator([canExtendMagic(1.625), canShootArrows_path()])])]),
			andCombinator([glitched("arrghus_spooky"), items.firerod, orCombinator([canExtendMagic(1.375), canShootArrows_path()])]),
			andCombinator([glitched("arrghus_spooky_triple"), items.firerod]),
			andCombinator([glitched("arrghus_bombs"), canBombThings(), orCombinator([canShootArrows_path(), items.firerod || items.icerod])])])]);
}
function canBeatMothula() {
	return andCombinator([orCombinator([optionItemplace !== "basic" || hasSword(2) || (canExtendMagic(2) && items.firerod), canAdvancedItems_path()]),
		orCombinator([hasSword() || items.hammer
			|| (canExtendMagic(2) && (items.firerod || items.somaria
				|| items.byrna)),
			andCombinator([items.net, canGetGoodBee_path()]),
			andCombinator([glitched("mothula_adv"), items.firerod || items.somaria || (canExtendMagic(1.25) && items.byrna)])])]);
}
function canBeatBlind() {
	return andCombinator([orCombinator([optionItemplace !== "basic" || optionSwords === "swordless" || (hasSword() && (items.cape || items.byrna)), canAdvancedItems_path()]),
		hasSword() || items.hammer
		|| items.somaria || items.byrna]);
}
function canBeatKholdstare() {
	return andCombinator([orCombinator([optionItemplace !== "basic" || hasSword(2) || (canExtendMagic(3) && items.firerod)
			|| (items.bombos && (optionSwords === "swordless" || hasSword()) && canExtendMagic(2) && items.firerod), canAdvancedItems_path()]),
		canMeltThings(), orCombinator([(items.hammer || hasSword()
			|| (canExtendMagic(3) && items.firerod)
			|| (canExtendMagic(2) && items.firerod && items.bombos)),
			andCombinator([glitched("khold_single"), orCombinator([canExtendMagic(2.5) && items.firerod, canExtendMagic(1.75) && items.firerod && items.bombos,
				andCombinator([glitched("khold_beams"), canExtendMagic(2) && items.firerod])])]),
			andCombinator([glitched("khold_double"), orCombinator([canExtendMagic(1.75) && items.firerod, items.firerod && items.bombos,
				andCombinator([glitched("khold_beams"), canExtendMagic(1.25) && items.firerod])])]),
			andCombinator([glitched("khold_triple"), orCombinator([canExtendMagic(1.5) && items.firerod, items.firerod && items.bombos,
				andCombinator([glitched("khold_beams"), items.firerod])])])])]);
}
function canBeatVitreous() {
	return andCombinator([orCombinator([optionItemplace !== "basic" || hasSword(2), canShootArrows_path(), canAdvancedItems_path()]),
		orCombinator([items.hammer || hasSword(), canShootArrows_path(), //35 arrows
			andCombinator([glitched("vitty_bombs"), canBombThings()])])]);
}
function canBeatTrinexx() {
	return andCombinator([items.firerod && items.icerod,
		orCombinator([optionItemplace !== "basic" || optionSwords === "swordless" || hasSword(3) || (canExtendMagic(2) && hasSword(2)), canAdvancedItems_path()]),
		orCombinator([hasSword(3) || items.hammer
			|| (canExtendMagic(2) && hasSword(2))
			|| (canExtendMagic(4) && hasSword()),
			andCombinator([glitched("trinexx_master"), hasSword(2)]),
			andCombinator([glitched("trinexx_fighter"), canExtendMagic(1.25) && hasSword()]),
			//andCombinator([glitched("trinexx_spooky"), canExtendMagic(1.125) && hasSword()]) //Expert mode already restores 25%, so no need for this strat
		])]);
}
function canBeatAgahnim2() {
	return bool2path(hasSword() || items.hammer || items.net);
}
function canBeatBoss(dungeonNum, offset = undefined) {
	var bossOffset = qtyCounter["boss"+dungeonNum];
	if (offset !== undefined)
		bossOffset = offset;
	var bossNum = (dungeonNum + bossOffset) % 10;
	if (bossOffset === -1)
		bossNum = -1;
	//app/Randomizer has global requirements
	switch (bossNum) {
		case -1:
			var possible = [true, true, true, true, true, true, true, true, true, true];
			if (optionSwords === "swordless")
				possible[7] = false; //No Kholdstare (forced in IP)
			if (dungeonNum === 2) { //Hera and GT top have limitations on bosses
				possible[0] = false; //No Armos
				possible[4] = false; //No Arrghus
				possible[6] = false; //No Blind
				possible[1] = false; //No Lanmo
				possible[9] = false; //No Trinexx
			} else if (dungeonNum === 5) { //SW has limitations on bosses
				possible[9] = false; //No Trinexx
			} else if (dungeonNum === 1 && offset !== undefined) { //GT middle has limitations on bosses
				possible[6] = false; //No Blind
			}
			switch (optionBossShuffle) { //Restrictions on how many multiples there are
				case "simple": maxBoss = [2, 2, 2, 1, 1, 1, 1, 1, 1, 1]; break;
				case "full": maxBoss = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; break;
				case "on": maxBoss = [13, 13, 13, 13, 13, 13, 13, 13, 13, 13]; break;
			}
			for (var i = 0; i < 13; i++) {
				var thisBossOffset = qtyCounter["boss"+i];
				var thisBoss = (i + thisBossOffset) % 10;
				if (i >= 10) {
					thisBossOffset = qtyCounter["boss"+(i+3)];
					thisBoss = ((i % 10) + thisBossOffset) % 10;
				}
				if (thisBossOffset !== -1)
					maxBoss[thisBoss]--;
			}
			var path = [];
			for (var i = 0; i < 10; i++)
				if (possible[i] && maxBoss[i] > 0)
					switch (i) {
						case 0: path.push(canBeatArmos()); break;
						case 1: path.push(canBeatLanmolas()); break;
						case 2: path.push(canBeatMoldorm()); break;
						case 3: path.push(canBeatHelmasaur()); break;
						case 4: path.push(canBeatArrghus()); break;
						case 5: path.push(canBeatMothula()); break;
						case 6: path.push(canBeatBlind()); break;
						case 7: path.push(canBeatKholdstare()); break;
						case 8: path.push(canBeatVitreous()); break;
						case 9: path.push(canBeatTrinexx()); break;
					}
			return anyOrAllCombinator(path);
		case 0: return canBeatArmos();
		case 1: return canBeatLanmolas();
		case 2: return canBeatMoldorm();
		case 3: return canBeatHelmasaur();
		case 4: return canBeatArrghus();
		case 5: return canBeatMothula();
		case 6: return canBeatBlind();
		case 7: return canBeatKholdstare();
		case 8: return canBeatVitreous();
		case 9: return canBeatTrinexx();
	}
}

//Check if the set is {}
function isEmpty(set) {
	for (var key in set)
		if (set.hasOwnProperty(key))
			return false;
	return true;
}

//Change all a into p
function convertPossible(set) {
	var result = {};
	var pathList = Object.keys(set);
	pathList.forEach(function(path) {
		if (set[path] === "a" || set[path] === "ap")
			result[path] = "p";
		else if (set[path] === "au" || set[path] === "apu")
			result[path] = "pu";
		else
			result[path] = set[path];
	});
	return result;
}

//Change all portions from x to xv (will overwrite existing views)
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
/*Thought experiment:
Trying to extend this to accept any input instead of just paths
  p+ap/au = ap
  p+pu = p
  ap+pu = a->a,a and p->p = ap
  ap+ap = a->a,a and p->a,p = a or ap
  ap+au = a->a,a and p->a,p = a or ap
  au+au = a->a,a and u->a,u = a or au
  au+pu = a->a,a and u->p,u = ap or au
  pu+pu = p->p,p and u->p,u = p or pu*/
function populatePath(path_in) {
	var path = path_in;
	if (path_in === true)
		return {ng:"a", g:"a", mg:"a", nga:"a", ga:"a", mga:"a"};
	if (path_in === false)
		return {};
	if (path.g === undefined && path.ng !== undefined)
		path.g = path.ng;
	if (path.mg === undefined && path.g !== undefined)
		path.mg = path.g;
	if (path.nga === undefined && path.ng !== undefined)
		path.nga = path.ng;
	if (path.ga === undefined && (path.g !== undefined || path.nga !== undefined)) {
		if (path.g === "a" || path.nga === "a")
			path.ga = "a";
		else if (path.g === undefined)
			path.ga = path.nga;
		else if (path.nga === undefined)
			path.ga = path.g;
		else
			path.ga = "p";
		/*else if (path.g === "p" || path.nga === "p")
			if (path.nga === "ap" || path.nga === "au" || path.g === "ap" || path.g === "au")
				path.ga = "ap";
			else
				path.ga = "p";
		else if ((path.g === "ap" && path.nga === "pu")
			|| (path.g === "pu" && path.nga === "ap"))
			path.ga = "ap";
		else
			path.ga = "error"; //We hope there is no way to get these ambiguous contexts*/
	}
	if (path.mga === undefined && (path.mg !== undefined || path.ga !== undefined)) {
		if (path.mg === "a" || path.ga === "a")
			path.mga = "a";
		else if (path.mg === undefined)
			path.mga = path.ga;
		else if (path.ga === undefined)
			path.mga = path.mg;
		else
			path.mga = "p";
		/*else if (path.mg === "p" || path.ga === "p")
			if (path.ga === "ap" || path.ga === "au" || path.mg === "ap" || path.mg === "au")
				path.mga = "ap";
			else
				path.mga = "p";
		else if ((path.mg === "ap" && path.ga === "pu")
			|| (path.mg === "pu" && path.ga === "ap"))
			path.mga = "ap";
		else
			path.mga = "error"; //We hope there is no way to get these ambiguous contexts*/
	}
	
	if (path.gv === undefined && path.ngv !== undefined)
		path.gv = path.ngv;
	if (path.mgv === undefined && path.gv !== undefined)
		path.mgv = path.gv;
	if (path.ngva === undefined && path.ngv !== undefined)
		path.ngva = path.ngv;
	if (path.gva === undefined && (path.gv !== undefined || path.ngva !== undefined)) {
		if (path.gv === "a" || path.ngva === "a")
			path.gva = "a";
		else if (path.gv === undefined)
			path.gva = path.ngva;
		else if (path.ngva === undefined)
			path.gva = path.gv;
		else
			path.gva = "p";
		/*else if (path.gv === "p" || path.ngva === "p")
			if (path.ngva === "ap" || path.ngva === "au" || path.gv === "ap" || path.gv === "au")
				path.gva = "ap";
			else
				path.gva = "p";
		else if ((path.gv === "ap" && path.ngva === "pu")
			|| (path.gv === "pu" && path.ngva === "ap"))
			path.gva = "ap";
		else
			path.gva = "error"; //We hope there is no way to get these ambiguous contexts*/
	}
	if (path.mgva === undefined && (path.mgv !== undefined || path.gva !== undefined)) {
		if (path.mgv === "a" || path.gva === "a")
			path.mgva = "a";
		else if (path.mgv === undefined)
			path.mgva = path.gva;
		else if (path.gva === undefined)
			path.mgva = path.mgv;
		else
			path.mgva = "p";
		/*else if (path.mgv === "p" || path.gva === "p")
			if (path.gva === "ap" || path.gva === "au" || path.mgv === "ap" || path.mgv === "au")
				path.mgva = "ap";
			else
				path.mgva = "p";
		else if ((path.mgv === "ap" && path.gva === "pu")
			|| (path.mgv === "pu" && path.gva === "ap"))
			path.mgva = "ap";
		else
			path.mgva = "error"; //We hope there is no way to get these ambiguous contexts*/
	}
	return path;
}

//Remove redundant keys from the set. Note that this works on apu constructs too, not just paths
function depopulate(set) {
	if ((set.mga !== undefined && (set.mga === set.mg || set.mga === set.ga)) || set.mga === undefined)
		delete set.mga;
	if ((set.ga !== undefined && (set.ga === set.g || set.ga === set.nga)) || set.ga === undefined)
		delete set.ga;
	if ((set.nga !== undefined && set.nga === set.ng) || set.nga === undefined)
		delete set.nga;
	if ((set.mg !== undefined && set.mg === set.g) || set.mg === undefined)
		delete set.mg;
	if ((set.g !== undefined && set.g === set.ng) || set.g === undefined)
		delete set.g;
	if (set.ng === undefined)
		delete set.ng;
	if ((set.mgva !== undefined && (set.mgva === set.mgv || set.mgva === set.gva)) || set.mgva === undefined)
		delete set.mgva;
	if ((set.gva !== undefined && (set.gva === set.gv || set.gva === set.ngva)) || set.gva === undefined)
		delete set.gva;
	if ((set.ngva !== undefined && set.ngva === set.ngv) || set.ngva === undefined)
		delete set.ngva;
	if ((set.mgv !== undefined && set.mgv === set.gv) || set.mgv === undefined)
		delete set.mgv;
	if ((set.gv !== undefined && set.gv === set.ngv) || set.gv === undefined)
		delete set.gv;
	if (set.ngv === undefined)
		delete set.ngv;
	return set;
}

//Look at several paths and return the easiest path
//a+x -> a
//p+p/u -> p
//u+u -> u
function orCombinator(path1, path2, path3 = {}, path4 = {}, path5 = {}, path6 = {}) {
	if (Array.isArray(path1)) {
		var result = {};
		var pathList = ["ng", "ngv", "g", "gv", "mg", "mgv", "nga", "ngva", "ga", "gva", "mga", "mgva"];
		pathList.forEach(function(route) {
			var a_route = false;
			var all_u = true;
			for (var i = 0; i < path1.length; i++) {
				var p = populatePath(path1[i]);
				if (p[route] === "a") {
					a_route = true;
					break;
				} else if (p[route] !== "u" && p[route] !== undefined)
					all_u = false;
			}
			if (a_route)
				result[route] = "a";
			else if (all_u)
				; //result[route] = "u";
			else
				result[route] = "p";
		});
		return depopulate(result);
	} else {
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
}

//Take several paths and figure out if it is possible to do all of them
//a+a -> a
//a+u or p+x -> p
//u+u -> u
function anyOrAllCombinator(path1, path2) { //TODO: Convert every usage to arrays
	if (Array.isArray(path1)) {
		var result = {};
		var pathList = ["ng", "ngv", "g", "gv", "mg", "mgv", "nga", "ngva", "ga", "gva", "mga", "mgva"];
		pathList.forEach(function(route) {
			var all_a = true;
			var all_u = true;
			for (var i = 0; i < path1.length; i++) {
				var p = populatePath(path1[i]);
				if (p[route] !== "a")
					all_a = false;
				if (p[route] !== "u" && p[route] !== undefined)
					all_u = false;
			}
			if (all_a)
				result[route] = "a";
			else if (all_u)
				; //result[route] = "u";
			else
				result[route] = "p";
		});
		return depopulate(result);
	} else {
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
}
function anyOrAll4Combinator(path1, path2, path3, path4) { //TODO: Delete this
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
function andCombinator(path1, path2, path3 = undefined, path4 = undefined, path5 = undefined, path6 = undefined) { //TODO: Convert every usage to arrays
	if (Array.isArray(path1)) {
		for (var i = 0; i < path1.length; i++)
			if (isEmpty(path1[i]) && path1[i] !== true)
				return {};
		return threshCombinator(path1.length, path1);
	} else {
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
}

//Take an array of paths and figure out if at least a certain number (x) of them are doable
//at least x paths are a -> a
//too many u to do x -> u
//everything else -> p
function threshCombinator(threshold, paths = []) {
	var result = {};
	var pathList = ["ng", "ngv", "g", "gv", "mg", "mgv", "nga", "ngva", "ga", "gva", "mga", "mgva"];
	pathList.forEach(function(route) {
		var a_count = 0;
		var u_count = 0;
		for (var i = 0; i < paths.length; i++) {
			var p = populatePath(paths[i]);
			if (p[route] === "a")
				a_count++;
			else if (p[route] === "u" || p[route] === undefined)
				u_count++;
		}
		if (a_count >= threshold)
			result[route] = "a";
		else if (paths.length - u_count < threshold)
			; //result[route] = "u";
		else
			result[route] = "p";
	});
	return depopulate(result);
}

//Looks up a glitch and returns a path
function glitched(id) {
	//Quick way to get {g:"a"} (example, andCombinator([glitched("true"), conditions]))
	if (id === "true")
		return {g:"a"};
	if (id === "major")
		return {mg:"a"};
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

//Takes a boolean and returns a path
function bool2path(bool) {
	if (bool === true)
		return {ng:"a"};
	return {};
}

//Evaulate path first to try to avoid expensive region calculation
//Region looks like: ["region id", must_be_link, from_locs, bottles]
function calcFilter(path, region) {
	if (isEmpty(path))
		return {};
	else {
		var arg1, arg2, arg3;
		if (region.length === 4) {
			arg1 = region[1];
			arg2 = region[2];
			arg3 = region[3];
		} else {
			arg1 = undefined;
			arg2 = undefined;
			arg3 = undefined;
		}
		switch(region[0]) {
			case "wDM": return andCombinator([path, regions.westDeathMountain(arg1, arg2, arg3)]);
			case "eDM": return andCombinator([path, regions.eastDeathMountain(arg1, arg2, arg3)]);
			case "deDM": return andCombinator([path, regions.darkEastDeathMountain(arg1, arg2, arg3)]);
			case "dwDM": return andCombinator([path, regions.darkWestDeathMountain(arg1, arg2, arg3)]);
			case "dNE": return andCombinator([path, regions.northEastDarkWorld(arg1, arg2, arg3)]);
			case "dNW": return andCombinator([path, regions.northWestDarkWorld(arg1, arg2, arg3)]);
			case "dS": return andCombinator([path, regions.SouthDarkWorld(arg1, arg2, arg3)]);
			case "mire": return andCombinator([path, regions.mire(arg1, arg2, arg3)]);
			case "NE": return andCombinator([path, regions.northEastLightWorld(arg1, arg2, arg3)]);
			case "NW": return andCombinator([path, regions.northWestLightWorld(arg1, arg2, arg3)]);
			case "S": return andCombinator([path, regions.SouthLightWorld(arg1, arg2, arg3)]);
		}
	}
}