/*All logic is storing all relevant info on status of the location(s)
	Renderer decides how to display/prioritize the info
This file's logic storage is as follows:
Individual location or path: a = available; p = possible; u = unavailable
	IMPORTANT: Path specifically means this (only a, p, and blank(=u) are valid)
Collection of locations: a = all a; p = all p; u = all u; ap = only a and p combo; au = only a and u combo; pu = only p and u combo; apu = a, p and u in combo
These values (a, p, u, ap, au, pu, apu) apply to the following:
path.ng - location considering no glitches
path.ngv - is location viewable considering no glitches
path.g - location considering glitches
path.gv - is location viewable considering glitches
path.mg - location considering major glitches
path.mgv - is location viewable considering major glitches
path.nga - location considering no glitches and if aga is defeated
path.ngva - is location viewable considering no glitches and if aga is defeated
path.ga - location considering glitches and if aga is defeated
path.gva - is location viewable considering glitches and if aga is defeated
path.mga - location considering major glitches and if aga is defeated
path.mgva - is location viewable considering major glitches and if aga is defeated
Nonexistent/undefined values are equivalent to unavailable
*/

//Bug: Pretty sure MG logic here (dark EDM) is wrong, and they meant to put in (pearl || bottle) && boots
//	Issue #664 filed
//Bug: MG logic needs bottle to get up DM and then another bottle to other dark world areas
//	Issue #664 filed
//Bug: MG logic should be able to get to NE darkworld from S darkworld
//	Issue #664 filed
//Some WOW paths seem incorrect

//must_be_link -- only return routes that end with Link state.
//	false = bunny, superbunny or link; true = link; 2 = superbunny or link
//from_locs -- route has already been through these regions, don't go through here again or it will be infinite loop
//bottles -- # of bottles remaining that can be used (e.g. for fake fluting)
//newcalc -- recalculate from scratch, or grab from region cache to avoid expensive computation
//TODO: Add OBR and unbunny+superbunny-item and superbunny-item+pull and unbunny+fake flute as possible Link states

//Standard/Open Logic Assumptions:
//  Any route to get up to dark west DM can also get you to west DM (eDM and deDM route simplification)
//  Only ways to be link in dark world is: moonpearl,
//    bottle (fake flute): only from dwDM or dNE -- deDM->dwDM; mire portal access = DM portal; dNW/dS no access w/out pearl or dwDM/dNE,
//    bottle (OBR)
//    mirror wrap to stumpy: only at dS
//    1f to bumper ledge: only at dNW
//  Superbunny only matters on dark west DM -- any other area there is a pullable object to be Link instead
//    Only way to be superbunny is fake flute which makes it useless for mire
//  No route uses dwDM as an intermediary step (never call regions.dwDM)


//change infinite recursion so it allows to recurse with different states
var regions = {
	westDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) { //0-1 bottles
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("westDeathMountain", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("westDeathMountain") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("westDeathMountain"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				return andCombiner([rescueZelda(),
					orCombiner([canFly_path(), //Flute
						canOneFrameClipOW_path(), //1f
						canOWYBA_path(bottles), //Fake flute
						canBootsClip_path(), //Bootsclip
						canLiftRocks() && items.lantern, //Old man cave
						andCombiner([canLiftRocks(), glitched("oldMan")]), //Dark room
						AccurateLogic(false, canSuperSpeed_path())])]); //Spinspeed only, screenwrap on DM to enter Hera [V31 bug]
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						if ((items.moonpearl && must_be_link)
							|| !must_be_link)
							return regions.darkWestDeathMountain(undefined, new_locs, bottles);
						return {};
					default:
						var path1 = {}; //From dark WDM
						var path2 = {}; //From eastDeathMountain
						var path3 = {}; //From light NW
						var path4 = {}; //Fake flute will stay same state as before fluting
						if ((items.moonpearl && must_be_link)
							|| !must_be_link)
							path1 = regions.darkWestDeathMountain(undefined, new_locs, bottles);
						if (items.hammer || hasHookshot() || items.boots) //top path, lower path, or boots to clip
							path2 = regions.eastDeathMountain(true, new_locs, bottles);
						if (items.boots)
							path3 = regions.northWestLightWorld(true, new_locs, bottles);
						if (bottles >= 1)
							path4 = andCombiner(glitched("fakeflute"),
								orCombiner(regions.eastDeathMountain(must_be_link, new_locs, bottles - 1),
								regions.northEastLightWorld(must_be_link, new_locs, bottles - 1),
								regions.northWestLightWorld(must_be_link, new_locs, bottles - 1),
								regions.SouthLightWorld(must_be_link, new_locs, bottles - 1)));
						return orCombiner(path1, path2, path3, path4);
				}
			case "retro":
		}
	},
	eastDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) { //0-2 bottles
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("eastDeathMountain", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("eastDeathMountain") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("eastDeathMountain"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				//Mirror wrap/clip goes from dwDM, but just use portal instead (any route up dDM works on DM)
				//  Only difference is being Link without moon pearl in dwDM, but this doesn't matter for light world endstate
				return andCombiner([rescueZelda(), orCombiner([
						andCombiner([AccurateLogic(regions.westDeathMountain(), regions.westDeathMountain(undefined, new_locs, bottles)),
							orCombiner([canOneFrameClipOW_path(), //1f
								canMirrorClip_path(), //Mirror clip
								canBootsClip_path(), //Bootsclip
								(items.hammer && items.mirror)
								|| hasHookshot(),
								AccurateLogic(false, orCombiner([canMirrorWrap_path(), canSuperSpeed_path()])), //Superspeed/mirror wrap [V31 bug]
								AccurateLogic(false, andCombiner([canBombClipOW_path(), items.hammer]))])]), //bombclip
						AccurateLogic(false, andCombiner([regions.westDeathMountain(undefined, new_locs, bottles - 1),
								canGetFairy_path(), glitched("hoverDM")]))])]); //hover across bridge
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						var path1 = {}; //From dark EDM
						var path2 = {}; //From wDM
						if (canLiftDarkRocks()
							&& ((items.moonpearl && must_be_link)
								|| !must_be_link))
							path1 = regions.darkEastDeathMountain(undefined, new_locs, bottles);
						if (hasHookshot())
							path2 = regions.westDeathMountain(true, new_locs, bottles);
						return orCombiner(path1, path2);
					default:
						var path1 = {}; //From dark EDM
						var path2 = {}; //From wDM
						if (canLiftDarkRocks()
							&& ((items.moonpearl && must_be_link)
								|| !must_be_link))
							path1 = regions.darkEastDeathMountain(undefined, new_locs, bottles);
						if (hasHookshot() || items.boots)
							path2 = regions.westDeathMountain(true, new_locs, bottles);
						//Can boots climb from NE light world, but if you can do that, you have west DM access anyways
						return orCombiner(path1, path2);
				}
			case "retro":
		}
	},
	darkWestDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("darkWestDeathMountain", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("darkWestDeathMountain") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("darkWestDeathMountain"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				return andCombiner([rescueZelda(),
					AccurateLogic(true, false)]); //Assume no path uses dwDM
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						var path1 = {}; //Old man cave
						var path2 = {}; //Flute
						var path3 = {}; //Dark room glitch
						if (canLiftRocks() && items.lantern)
							path1 = {ng:"a"};
						path2 = canFly_path(new_locs);
						if (canLiftRocks())
							path3 = glitched("oldMan");
						return orCombiner(path1, path2, path3);
					default:
						var path1 = {}; //Old man cave
						var path2 = {}; //Flute
						var path3 = {}; //Dark room glitch
						var path4 = {}; //Fake flute
						if ((canLiftRocks() && items.lantern)
							|| items.boots)
							path1 = {ng:"a"};
						path2 = canFly_path(new_locs);
						if (canLiftRocks())
							path3 = glitched("oldMan");
						if (hasABottle() && bottles >= 1)
							path4 = glitched("fakeflute");
						return orCombiner(path1, path2, path3, path4);
				}
			case "retro":
		}
	},
	darkEastDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) { //0-3 bottles
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("darkEastDeathMountain", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("darkEastDeathMountain") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("darkEastDeathMountain"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				if (!rescueZelda()) return {};
				var superbunny_at_dwDM = andCombiner([rgn_fakeflute2link(new_locs, bottles), //fake flute to DM instead of linkstate (1-2 bottles)
					glitched("fakefluteDM")]); //preserve superbunny state by dodging boulders
				return AccurateLogic(orCombiner([andCombiner([canLiftDarkRocks(),
							regions.eastDeathMountain(undefined, new_locs)]),
						andCombiner([canBootsClip_path(),
							items.moonpearl || items.hammer]),
						canOneFrameClipOW_path()]),
					orCombiner([rgn_link2here("darkEastDeathMountain", new_locs, bottles),
						must_be_link ? false : rgn_bunny2here("darkEastDeathMountain", new_locs, bottles)]));
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						var path1 = {}; //Lynels
						var path2 = {}; //EDM
						var path3 = {}; //Hookshot Lynels
						if ((optionVariation !== "ohko" && optionVariation !== "timedohko")
							|| items.byrna || items.cape)
							path1 = regions.darkWestDeathMountain(undefined, new_locs, bottles);
						if (items.mirror)
							path2 = regions.eastDeathMountain(undefined, new_locs, bottles);
						if (hasHookshot())
							path3 = andCombiner(regions.darkWestDeathMountain(undefined, new_locs, bottles), glitched("DM_lynels"));
						return orCombiner(path1, path2, path3);
					default:
						var path1 = {}; //Lynels
						var path2 = {}; //EDM
						var path3 = {}; //Hookshot Lynels
						if (items.boots || (optionVariation !== "ohko" && optionVariation !== "timedohko")
							|| items.byrna || items.cape)
							path1 = regions.darkWestDeathMountain(undefined, new_locs, bottles);
						if (items.mirror)
							path2 = regions.eastDeathMountain(undefined, new_locs, bottles);
						if (hasHookshot())
							path3 = andCombiner(regions.darkWestDeathMountain(undefined, new_locs, bottles), glitched("DM_lynels"));
						return orCombiner(path1, path2, path3);
				}
			case "retro":
		}
	},
	northEastDarkWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("northEastDarkWorld", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("northEastDarkWorld") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northEastDarkWorld"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				if (!rescueZelda()) return {};
				return AccurateLogic(orCombiner([canOWYBA_path(bottles),
						dungeons[11].isBeaten(), convertAga(dungeons[11].canGetPrize()),
						items.hammer && canLiftRocks() && items.moonpearl,
						andCombiner([canLiftDarkRocks(),
							orCombiner([items.flippers,
								andCombiner([canBootsClip_path(), canFakeFlipper_path()]),
								canWaterWalk_path()]),
							items.moonpearl]),
						andCombiner([canSuperSpeed_path(), canMirrorClip_path(),
							regions.westDeathMountain(undefined, new_locs)])]),
					orCombiner([rgn_link2here("northEastDarkWorld", new_locs, bottles),
						must_be_link ? false : rgn_bunny2here("northEastDarkWorld", new_locs, bottles)]));
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						var path1 = {}; //Normal access
						var path2 = {}; //Mirror from light world
						var path3 = {}; //Waterwalk from NW
						var path4 = {}; //Qirn jump
						if (items.hammer || items.flippers)
							path1 = {ng:"a"};
						if (items.mirror)
							path2 = regions.northEastLightWorld(undefined, new_locs, bottles);
						if (items.boots)
							path3 = glitched("waterwalk_boots");
						if (canBombThings())
							path4 = glitched("qirn_jump");
						return orCombiner(path1, path2, path3, path4);
					default:
						var path1 = {}; //Normal access
						var path2 = {}; //Mirror from light world
						var path3 = {}; //Qirn jump
						var path4 = {}; //Fake flute
						if (items.hammer || items.flippers || items.boots)
							path1 = {ng:"a"};
						if (items.mirror)
							path2 = regions.northEastLightWorld(undefined, new_locs, bottles);
						if (canBombThings())
							path3 = glitched("qirn_jump");
						if (hasABottle() && bottles >= 1)
							path4 = glitched("fakeflute");
						return orCombiner(path1, path2, path3, path4);
				}
			case "retro":
		}
	},
	northWestDarkWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("northWestDarkWorld", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("northWestDarkWorld") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northWestDarkWorld"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				if (!rescueZelda()) return {};
				return AccurateLogic(orCombiner([canOneFrameClipOW_path(),
						andCombiner([orCombiner([items.moonpearl, canOWYBA_path(bottles)]),
							orCombiner([andCombiner([regions.northEastDarkWorld(undefined, new_locs),
									hasHookshot() && (items.flippers || canLiftRocks() || items.hammer)]),
								(items.hammer && canLiftRocks())
								|| canLiftDarkRocks()])])]),
					orCombiner([rgn_link2here("northWestDarkWorld", new_locs, bottles),
						must_be_link ? false : rgn_bunny2here("northWestDarkWorld", new_locs, bottles)]));
			case "inverted":
				return {ng:"a"};
			case "retro":
		}
	},
	SouthDarkWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("SouthDarkWorld", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("SouthDarkWorld") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("SouthDarkWorld"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				if (!rescueZelda()) return {};
				return AccurateLogic(orCombiner([canOWYBA_path(bottles),
						andCombiner([items.moonpearl,
							orCombiner([andCombiner([regions.northEastDarkWorld(undefined, new_locs), items.hammer
										|| (hasHookshot() && (items.flippers || canLiftRocks()))]),
								(items.hammer && canLiftRocks())
								|| canLiftDarkRocks()])])]),
					orCombiner([rgn_link2here("SouthDarkWorld", new_locs, bottles),
						must_be_link ? false : rgn_bunny2here("SouthDarkWorld", new_locs, bottles)]));
			case "inverted":
				return {ng:"a"};
			case "retro":
		}
	},
	mire: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("mire", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("mire") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("mire"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				if (!rescueZelda()) return {};
				return AccurateLogic(orCombiner([andCombiner([canLiftDarkRocks(), orCombiner([canFly_path(), canBootsClip_path()])]),
						andCombiner([items.moonpearl, canBootsClip_path(), regions.SouthDarkWorld(undefined, from_locs)]),
						canOWYBA_path(bottles)]),
					orCombiner([rgn_link2here("mire", new_locs, bottles),
						must_be_link ? false : rgn_bunny2here("mire", new_locs, bottles)]));
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						var path1 = {}; //Fly
						var path2 = {}; //Mirror
						path1 = canFly_path(new_locs);
						if (items.mirror)
							path2 = regions.SouthLightWorld(undefined, new_locs, bottles);
						return orCombiner(path1, path2);
					default:
						var path1 = {}; //Fly
						var path2 = {}; //Mirror
						var path3 = {}; //Boots
						var path4 = {}; //Fake flute
						path1 = canFly_path(new_locs);
						if (items.mirror)
							path2 = regions.SouthLightWorld(undefined, new_locs, bottles);
						if (items.boots)
							path3 = {ng:"a"};
						if (hasABottle())
							path4 = glitched("fakeflute");
						return orCombiner(path1, path2, path3, path4);
				}
			case "retro":
		}
	},
	northEastLightWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("northEastLightWorld", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("northEastLightWorld") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northEastLightWorld"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				return bool2path(rescueZelda());
				break;
			case "inverted": //Later: Add aga info
			case "retro":
		}
	},
	northWestLightWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("northWestLightWorld", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("northWestLightWorld") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northWestLightWorld"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				return bool2path(rescueZelda());
				break;
			case "inverted":
			case "retro":
		}
	},
	SouthLightWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false) {
		if (bottles < 0) return {}; //Used too many bottles
		if (!newcalc) //return cache
			return region_cache_lookup("SouthLightWorld", must_be_link, from_locs, bottles);
		if (from_locs.indexOf("SouthLightWorld") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("SouthLightWorld"); //new array of visited locations (prevent infinite recursion)
		switch (optionState) {
			case "standard":
			case "open":
				return bool2path(rescueZelda());
				break;
			case "inverted":
			case "retro":
		}
	}
};

//isBeaten is for when the boss is killed
//gotPrize is for when the pendant/crystal is obtained (including dupes)
//isAccessible is for being able to enter the dungeon
//canGetPrize is for being able to get dungeonPrize (pendant/crystal only, including dupes)
//isBeatable is for being able to kill the boss (go mode)
//canGetChests is for being able to clear the dungeon of items (full clear)
//Bug: Map/compass being in logic before dungeon completion is for nmg, but not always for glitched
//Mire doesn't have canKillThings for MG
//Bug: IP boss logic says you need to be able to melt things
var dungeons = new Array;
dungeons[0] = {
	name: "Eastern Palace",
	abbrev: "EP",
	x: "46.62%", //47.48%
	y: "38.84%",
	image: "boss02.png",
	isBeaten: function(){
		return items.boss0 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize0;
		}
	},
	isAccessible: function(){
		return bool2path(rescueZelda());
	},
	canGetPrize: function(){
		return andCombiner([this.isAccessible(), this.isBeatable()]);
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Boss: arrow, darkness, BK, boss, MC
		var path1 = {}; //Dark back
		var path2 = {}; //Big Key
		var path3 = {}; //MC
		path1 = orCombiner([items.lantern, andCombiner([items.firerod, canAdvancedItems_path()]), glitched("ep_back")]);
		path2 = this.big();
		path3 = (qtyCounter.ditems_comp0 && qtyCounter.ditems_map0) || optMapCompLogic === false || optionVariation === "none";
		return andCombiner([canShootArrows_path(), path1, path2, canBeatBoss(0), path3]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombiner([andCombiner([this.big(), this.bigkey(), this.isBeatable()]),
			convertPossible(threshCombiner(items.maxChest0, [{ng:"a"}, this.big(), {ng:"a"}, this.bigkey(), {ng:"a"}, this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests([{ng:"a"}, this.big(), this.bigkey(), this.isBeatable()]);
		return hope;
	},
	big: function(){ //BK
		return orCombiner([qtyCounter.ditems_bk0,
			andCombiner([optionVariation !== "keysanity",
				anyOrAllCombiner([{ng:"a"}, this.bigkey()])])]);
	},
	bigkey: function(){ //Lamp
		return orCombiner([items.lantern, glitched("ep_dark")]);
	}
};
dungeons[1] = {
	name: "Desert Palace",
	hint: "<img src='images/book.png' class='mini'>/(<img src='images/mirror.png' class='mini'><img src='images/glove2.png' class='mini'><img src='images/flute.png' class='mini'>)",
	abbrev: "DP",
	x: "3.67%",
	y: "79.64%",
	image: "boss12.png",
	isBeaten: function(){
		return items.boss1 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize1;
		}
	},
	isAccessible: function(){ //isAccessible only gets you to the front
		return andCombiner([rescueZelda(),
			orCombiner([items.book, //Front
				canBootsClip_path(), //Bootsclip
				andCombiner([items.mirror, AccurateLogic(canOWYBA_path(), regions.mire())]), //Fake Flute [V31 bug]
				andCombiner([items.mirror && canLiftDarkRocks(), canFly_path()]), //Dark world
				AccurateLogic(false, canOneFrameClipOW_path())])]); //1f
	},
	canGetPrize: function(){
		return andCombiner([this.isAccessible(), this.isBeatable()]);
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Boss: glove/clip, torches, bk, sk, boss, MC
		var path1 = {}; //Entry
		var path2 = {}; //BK
		var path3 = {}; //SK, min req nothing
		var path4 = {}; //MC
		path1 = orCombiner([canLiftRocks(), canBootsClip_path(),
			andCombiner([false, orCombiner([canSuperSpeed_path(), canOneFrameClipOW_path()])])]);
		path2 = this.big();
		path3 = this.bigkey();
		path4 = (qtyCounter.ditems_comp1 && qtyCounter.ditems_map1) || optMapCompLogic === false || optionVariation === "none";
		return andCombiner([path1, canLightTorches(), path2, path3, canBeatBoss(1), path4]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombiner([andCombiner([this.big(), this.torch(), this.bigkey(), this.isBeatable()]),
			convertPossible(threshCombiner(itemsMax.chest1, [this.big(), {ng:"a"}, this.torch(), this.bigkey(), this.bigkey(), this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests([this.big(), {ng:"a"}, this.torch(), this.bigkey(), this.isBeatable()]);
		return hope;
	},
	big: function(){ //BK
		return orCombiner([qtyCounter.ditems_bk1,
			andCombiner([optionVariation !== "keysanity",
				anyOrAllCombiner([{ng:"a"}, this.torch(), this.bigkey()])])]);
	},
	torch: function(){ //Boots
		return orCombiner([items.boots, {ngv:"a"}]);
	},
	bigkey: function(){ //SK, min req nothing
		//SK could be in big, but then BK can only be on torch or map
		return orCombiner([qtyCounter.ditems_sk1 >= 1,
			andCombiner([optionVariation !== "keysanity" && optionVariation !== "mcs",
				anyOrAllCombiner([{ng:"a"}, this.torch()])]),
			{ng:"p"}]);
	}
};
dungeons[2] = {
	name: "Tower of Hera",
	hint: "<img src='images/mirror.png' class='mini'>/(<img src='images/hookshot.png' class='mini'><img src='images/hammer.png' class='mini'>)",
	abbrev: "Hera",
	x: "29.60%", //27.75%
	y: "5.86%", //3.30%
	image: "boss22.png",
	isBeaten: function(){
		return items.boss2 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize2;
		}
	},
	isAccessible: function(){
		var path1 = {}; //Main
		var path2 = {}; //Mire
		if (rescueZelda()) {
			path1 = this.main();
			path2 = this.mire();
		}
		return orCombiner(path1, path2);
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//BK, basement, map, compass, big, boss
		//BK: torch, SK
		//Compass, Big: BK
		//Boss: boss, BK, compass, map
		switch (optionLogic) {
			case "nmg":
			case "owg":
				switch (optionVariation) {
					case "keysanity":
						if (qtyCounter.ditems_bk2 && qtyCounter.ditems_comp2 && qtyCounter.ditems_map2)
							return canBeatBoss(2, qtyCounter.boss2);
						return {};
					default:
						var path1 = {}; //Always
						var path2 = {}; //Possible
						if (canLightTorches()) //BK in BK
							path1 = canBeatBoss(2, qtyCounter.boss2);
						path2 = convertPossible(canBeatBoss(2, qtyCounter.boss2));
						return orCombiner(path1, path2);
				}
			default:
		//BK: torch, SK
		//Compass: main&BK || mire
		//Big: main&BK || mire&BK2/8
		//Boss: main&BK || mire, boss
				switch (optionVariation) {
					case "keysanity":
						var path1 = {}; //Main + BK2
						var path2 = {}; //Mire
						if (qtyCounter.ditems_bk2 && !isEmpty(this.main()))
							path1 = canBeatBoss(2, qtyCounter.boss2);
						if (!isEmpty(this.mire()))
							path2 = canBeatBoss(2, qtyCounter.boss2);
						return orCombiner(path1, path2);
					default:
						var path1 = {}; //Can always access boss from mire
										//From main, might not be able to access boss, which means mire access needed
						var path2 = {}; //Possible lucky BK in map from main entrance
						if (!isEmpty(this.mire()))
							path1 = canBeatBoss(2, qtyCounter.boss2);
						path2 = convertPossible(andCombiner(!isEmpty(this.main()) ? {ng:"a"} : {}, canBeatBoss(2, qtyCounter.boss2)));
						return orCombiner(path1, path2);
				}
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionLogic) {
			case "nmg":
			case "owg":
				switch (optionVariation) {
					case "keysanity":
						var path1 = {ng:"a"}; //Free basement, map
						var path2 = {}; //BK
						var path3 = {}; //Big, compass
						var path4 = {}; //Boss
						if (canLightTorches() && qtyCounter.ditems_sk2 >= 1)
							path2 = {ng:"a"};
						if (qtyCounter.ditems_bk2)
							path3 = {ng:"a"};
						path4 = this.isBeatable();
						return multipleChests([path1, path2, path3, path4]);
					default:
						var path1 = {ng:"a"}; //Free basement, map
						var path2 = {}; //BK
						var path3 = {}; //Big, compass
						var path4 = {}; //Boss
						if (canLightTorches()
							&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 1))
							path2 = {ng:"a"};
						path3 = anyOrAllCombiner([path1, path2]);
						path4 = this.isBeatable();
						var always = andCombiner(path1, path2, path3, path4);
						var possible = {ng:"p"}; //BK in basement, items on map, compass, big
						return orCombiner(always, possible);
				}
		//BK: torch, SK
		//Compass: main&BK || mire
		//Big: main&BK || mire&BK2/8
		//Boss: main&BK || mire, boss
			default:
				switch (optionVariation) {
					case "keysanity":
						var path1 = {ng:"a"}; //Basement, map
						var path2 = {}; //BK
						var path3 = {}; //Compass
						var path4 = {}; //Big
						var path5 = {}; //Boss
						if (canLightTorches() && qtyCounter.ditems_sk2 >= 1)
							path2 = {ng:"a"};
						if ((!isEmpty(this.main()) && qtyCounter.ditems_bk2)
							|| !isEmpty(this.mire()))
							path3 = {ng:"a"};
						if ((!isEmpty(this.main()) && qtyCounter.ditems_bk2)
							|| (!isEmpty(this.mire()) && (qtyCounter.ditems_bk2 || qtyCounter.ditems_bk8)))
							path4 = {ng:"a"};
						path5 = this.isBeatable();
						return multipleChests([path1, path2, path3, path4, path5]);
					default: //BK and SK can be anywhere, so main&BK is not guaranteed -- mire gives access to compass/boss/map/basement
						var path1 = {ng:"a"}; //Basement, map
						var path2 = {}; //BK
						var path3 = {}; //Compass
						var path4 = {}; //Big
						var path5 = {}; //Boss
						if (!isEmpty(this.mire()))
							path3 = {ng:"a"};
						if (!isEmpty(this.mire())) //Sloppy, but andCombiner will take care of BK in BK or boss
							path4 = {ng:"a"};
						path5 = this.isBeatable();
						if (canLightTorches())
							path2 = andCombiner(path1, path3, path4, path5);
						var always = andCombiner(path1, path2, path3, path4, path5);
						var possible = {ng:"p"}; //BK in basement, items on map, compass, big
						return orCombiner(always, possible);
				}
		}
	},
	main: function(){
		var path1 = {}; //Boots DMA
		var path2 = {}; //West DM
		path1 = canBootsClip_path();
		if (items.mirror || (hasHookshot() && items.hammer))
			path2 = regions.westDeathMountain();
		return orCombiner(path1, path2);
	},
	mire: function(){ //TODO -- Add MM key logic smarts
		return convertPossible(andCombiner(canOneFrameClipUW_path(), dungeons[8].isAccessible()));
		var path1 = {}; //Mire w/all keys
		var path2 = {}; //Mire w/all keys, normal (need to get keys in spike chest and Vitty)
						//  If SK in left side, then BK also in left side, then we only need 2 keys, and they can't be in big/Vitty
		var path3 = {}; //Mire w/2 lucky keys possible
		if ((optionVariation === "keysanity" && qtyCounter.ditems_sk8 >= 3)
			|| (optionVariation === "retro" && qtyCounter.hc_sk >= 3))
			path1 = dungeons[8].isAccessible();
		if (optionVariation !== "keysanity" && optionVariation !== "retro" //BK could be bridge, and SKs on Vitty+Spike+x
			&& ((optionVariation !== "timedohko" && optionVariation !== "ohko")
				|| items.byrna || items.cape)
			&& (items.somaria && items.lantern)) //gives access to every MM location for keys
			path2 = andCombiner(dungeons[8].isAccessible(), canBeatBoss(8, qtyCounter.boss8));
		if (optionVariation !== "keysanity" || qtyCounter.ditems_sk8 >= 2) //Can buy keys in retro -- could be keys in bridge, lobby, left side for normal
			path3 = convertPossible(dungeons[8].isAccessible());
		return orCombiner(path1, path2, path3);
	},
	bigkey: function(from_locs = [], type = false){ //Torch, SK
		if (from_locs.indexOf("bigkey") !== -1)
			if (type === false) return {};
			else return {ng:"a"};
		var new_locs = from_locs.slice(0);
		new_locs.push("bigkey");
		return andCombiner(bool2path(canLightTorches()),
			orCombiner(bool2path(qtyCounter.ditems_sk2 >= 1),
				andCombiner(bool2path(optionVariation !== "keysanity" && optionVariation !== "mcs"),
					anyOrAllCombiner([this.cage(), this.compass(new_locs, true), this.big(new_locs, true), this.isBeatable(new_locs, true)]))));
	},
	cage: function(){
		return {ng:"a"};
	},
	map: function(){
		return {ng:"a"};
	},
	compass: function(from_locs = [], type = false){ //main+BK || mire
		if (from_locs.indexOf("compass") !== -1)
			if (type === false) return {};
			else return {ng:"a"};
		var new_locs = from_locs.slice(0);
		new_locs.push("compass");
		path1 = {}; //main
		path2 = {}; //mire
		path3 = {}; //Herapot
		path1 = andCombiner(bool2path(!isEmpty(this.main())),
			orCombiner(bool2path(qtyCounter.ditems_bk2 >= 1),
				andCombiner(bool2path(optionVariation !== "keysanity" && optionVariation !== "mcs"),
					anyOrAllCombiner([this.bigkey(new_locs, true), this.cage(), this.big(new_locs, true), this.isBeatable(new_locs, true)]))));
		path2 = bool2path(!isEmpty(this.mire()));
		if (!isEmpty(this.main()) && hasHookshot())
			path3 = glitched("herapot");
		return orCombiner(path1, path2, path3);
	},
	big: function(from_locs = [], type = false){ //main+BK || mire+BK/BK2
	}
};
dungeons[3] = {
	name: "Palace of Darkness",
	hint: "<img src='images/lantern.png' class='mini'>",
	abbrev: "PoD",
	x: "97.10%", //97.96%
	y: "39.23%",
	image: "boss32.png",
	isBeaten: function(){
		return items.boss3 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize3;
		}
	},
	isAccessible: function(){ //isAccessible also considers kikiskip
		path1 = {}; //Basic
		path2 = {}; //Entry
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle())
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			path2 = orCombiner(andCombiner(orCombiner((items.moonpearl ? {ng:"a"} : {}), canOWYBA_path()),
									regions.northEastDarkWorld()),
								andCombiner(canOneFrameClipUW_path(), regions.westDeathMountain()));
		}
		return andCombiner(path1, path2);
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//BK, ledge, bridge, big, compass, harmless, stalfos, basement L/R, map, maze U/D, shooter, boss
		//Ledge, map: bow
		//BK: SK->SK else hammer+bow+lamp->6SK else 5SK
		//Bridge, stalfos: SK/bow+hammer
		//Big: Lamp, BK, hammer+bow->6SK else 5SK
		//Compass: hammer+bow+lamp->4SK else 3SK
		//Harmless: SK->Hammer+bow+lamp->4SK else 3SK else hammer+bow+lamp->6SK else 5SK
		//Basement L/R: lamp, hammer+bow->4SK else 3SK
		//Maze U/D: Lamp, hammer+bow->6SK else 5SK
		//Boss: boss, hammer, lamp, bow, BK, 6SK, compass, map
		switch (optionVariation) {
			case "keysanity":
				if (items.hammer && items.lantern && qtyCounter.ditems_bk3 && items.moonpearl
					&& qtyCounter.ditems_sk3 >= 6 && qtyCounter.ditems_comp3 && qtyCounter.ditems_map3)
					return andCombiner(canShootArrows_path(), canBeatBoss(3, qtyCounter.boss3));
				return {};
			default:
				var path1 = {}; //Always
				var path2 = {}; //Possible
				if (items.hammer && items.lantern && items.moonpearl) { //pearl in case kikiskip and you need to spawn crystal switches
					if ((optionVariation === "retro" && qtyCounter.hc_sk >= 6)
						|| optionVariation !== "retro")
						path1 = andCombiner(canShootArrows_path(), canBeatBoss(3, qtyCounter.boss3));
					path2 = convertPossible(andCombiner(canShootArrows_path(), canBeatBoss(3, qtyCounter.boss3))); //BK and SK on ledge/map
				}
				return orCombiner(path1, path2);
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionVariation) {
			case "keysanity":
				return multipleChests([{ng:"a"}, this.isBeatable()]); //Lazy
			default: //Also lazy
				var always = this.isBeatable(); //Always
				var possible = {}; //Possible
				if (items.lantern) //SK in shooter, stalfos, compass, items in ledge, basement L/R, maze U/D 
					possible = convertPossible(canShootArrows_path());
				var result = orCombiner(always, possible);
				if (isEmpty(result))
					return {ng:"au"};
				return result;
		}
	}
};
dungeons[4] = {
	name: "Swamp Palace",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/mirror.png' class='mini'><img src='images/flippers.png' class='mini'>",
	abbrev: "SP",
	x: "73.69%",
	y: "93.53%",
	image: "boss42.png",
	isBeaten: function(){
		return items.boss4 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize4;
		}
	},
	isAccessible: function(){ //Entrance does not require pearl/mirror/flippers. MG entrance could also be from mire
		path1 = {}; //Basic
		path2 = {}; //Entry
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle())
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			path2 = orCombiner(this.main(), this.mire());
		}
		return andCombiner(path1, path2);
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){ //isAccessible could be from MM in MG
		if (isEmpty(this.isAccessible()))
			return {};
		//Entrance, big, BK, map, west, compass, flooded L/R, waterfall, boss
		//Entrance: must have SK
		//Big: SK, hammer, BK
		//BK, west, compass: SK, hammer
		//Map: SK
		//Flooded L/R, waterfall: SK, hammer, hookshot
		//Boss: SK, hammer, hookshot, boss, compass, map
		switch (optionLogic) {
			case "nmg":
			case "owg":
				switch (optionVariation) {
					case "keysanity":
						if (items.flippers && items.mirror && items.moonpearl
							&& qtyCounter.ditems_sk4 && items.hammer && hasHookshot()
							&& qtyCounter.ditems_comp4 && qtyCounter.ditems_map4)
							return canBeatBoss(4, qtyCounter.boss4);
						return {};
					default:
						var path1 = {}; //Always
						var path2 = {}; //Possible
						if (items.flippers && items.mirror && items.moonpearl
							&& items.hammer && hasHookshot()) {
							if ((optionVariation === "retro" && qtyCounter.hc_sk >= 1)
								|| optionVariation != "retro") //SK guaranteed in entrance
								path1 = canBeatBoss(4, qtyCounter.boss4);
							if (optionVariation === "retro")
								path2 = convertPossible(canBeatBoss(4, qtyCounter.boss4)); //Can buy keys
						}
						return orCombiner(path1, path2);
				}
			default:
		//Entrance: must have SK, because all other locations require it
		//Map: SK
		//Compass, BK, west: SK, Flippers, mire/(main+hammer)
		//Big: SK, flippers, (mire+BK2/4/8)/(main+hammer+BK)
		//Flooded L/R, waterfall: SK, hookshot, flippers, mire/(main+hammer)
		//Boss: SK, hookshot, flippers, mire/(main+hammer), (sword/hammer/(arrow/magic + rod))
				switch (optionVariation) {
					case "keysanity":
						if (qtyCounter.ditems_sk4 && hasHookshot() && items.flippers)
							if (!isEmpty(this.mire()) || (items.hammer && items.flippers && items.mirror && items.moonpearl && !isEmpty(this.main())))
								return canBeatBoss(4, qtyCounter.boss4);
						return {};
					default:
						var path1 = {}; //Always
						if (hasHookshot() && items.flippers)
							if (!isEmpty(this.mire()) || (items.hammer && items.flippers && items.mirror && items.moonpearl && !isEmpty(this.main()))) //Can always get SK in entrance chest (assume good key usage)
								path1 = canBeatBoss(4, qtyCounter.boss4);
						//No path can be just possible
						return path1;
				}
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionLogic) {
			case "nmg":
			case "owg":
				switch (optionVariation) {
					case "keysanity":
						var path1 = {}; //Entrance
						var path2 = {}; //Big
						var path3 = {}; //BK, west, compass
						var path4 = {}; //Map
						var path5 = {}; //Flooded, waterfall
						var path6 = {}; //Boss
						if (items.flippers && items.mirror && items.moonpearl)
							path1 = {ng:"a"};
						if (qtyCounter.ditems_sk4 && qtyCounter.ditems_bk4 && items.hammer && items.flippers && items.mirror && items.moonpearl)
							path2 = {ng:"a"};
						if (qtyCounter.ditems_sk4 && items.hammer && items.flippers && items.mirror && items.moonpearl)
							path3 = {ng:"a"};
						if (qtyCounter.ditems_sk4 && items.flippers && items.mirror && items.moonpearl)
							path4 = {ng:"a"};
						if (qtyCounter.ditems_sk4 && items.hammer && hasHookshot() && items.flippers && items.mirror && items.moonpearl)
							path5 = {ng:"a"};
						path6 = this.isBeatable();
						return multipleChests([path1, path2, path3, path4, path5, path6]);
					default:
						var path1 = {}; //Entrance
						var path2 = {}; //Big
						var path3 = {}; //BK, west, compass
						var path4 = {}; //Map
						var path5 = {}; //Flooded, waterfall
						var path6 = {}; //Boss
						if (items.flippers && items.mirror && items.moonpearl)
							path1 = {ng:"a"};
						if (items.hammer && items.flippers && items.mirror && items.moonpearl)
							path3 = {ng:"a"};
						if (items.flippers && items.mirror && items.moonpearl && ((optionVariation === "retro" && qtyCounter.hc_sk >= 1)
							|| optionVariation !== "retro"))
							path4 = {ng:"a"};
						if (items.hammer && hasHookshot() && items.flippers && items.mirror && items.moonpearl)
							path5 = {ng:"a"};
						path6 = this.isBeatable();
						if (items.hammer && items.flippers && items.mirror && items.moonpearl)
							path2 = anyOrAllCombiner([path1, path3, path5, path6]);
						var always = andCombiner(path1, path2, path3, path4, path5, path6);
						var possible = {};
						if (items.hammer && hasHookshot() && items.flippers && items.mirror && items.moonpearl)
							possible = {ng:"p"}; //SK in entrance, items in map, BK, west, compass, flooded L/R, buy key
						var result = orCombiner(always, possible);
						if (isEmpty(result)) {
							if (items.flippers && items.mirror && items.moonpearl)
								return {ng:"au"}; //map in normal mode, entrance in retro mode
							return {};
						}
						return result;
				}
			default:
				switch (optionVariation) {
		//Entrance: must have SK, because all other locations require it
		//Map: SK
		//Compass, BK, west: SK, Flippers, mire/(main+hammer)
		//Big: SK, flippers, (mire+BK2/4/8)/(main+hammer+BK)
		//Flooded L/R, waterfall: SK, hookshot, flippers, mire/(main+hammer)
		//Boss: SK, hookshot, flippers, mire/(main+hammer), (sword/hammer/(arrow/magic + rod))
					case "keysanity":
						var path1 = {}; //Entrance free
						var path2 = {}; //Big
						var path3 = {}; //BK, west, compass
						var path4 = {}; //Map
						var path5 = {}; //Flooded, waterfall
						var path6 = {}; //Boss
						path1 = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4)
							path4 = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4 && items.flippers)
							path3 = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4 && items.flippers)
							path2 = orCombiner((!isEmpty(this.mire()) && (qtyCounter.ditems_bk2 || qtyCounter.ditems_bk4 || qtyCounter.ditems_bk8)) ? {ng:"a"} : {},
								(qtyCounter.ditems_bk4 && items.hammer && items.moonpearl && items.flippers && items.mirror && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4 && items.flippers && hasHookshot())
							path5 = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						path6 = this.isBeatable();
						return multipleChests([path1, path2, path3, path4, path5, path6]);
					default:
						var path1 = {}; //Entrance, map free
						var path2 = {}; //Big
						var path3 = {}; //BK, west, compass
						var path5 = {}; //Flooded, waterfall
						var path6 = {}; //Boss
						path1 = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (items.flippers)
							path3 = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						if (items.flippers && hasHookshot())
							path5 = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						path6 = this.isBeatable();
						path2 = andCombiner(path1, path3, path5, path6); //This is sloppy (only finds BK4), but this is for "always" calculation anyways...
						var always = andCombiner(path1, path2, path3, path5, path6);
						var possible = {};
						if (items.flippers && hasHookshot())
							possible = orCombiner(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						var result = orCombiner(always, possible);
						if (isEmpty(result)) {
							return orCombiner(!isEmpty(this.mire()) ? {ng:"a"/*u"*/} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"/*u"*/} : {}); //map in normal mode, entrance in retro mode
						}
						return result;
				}
		}
	},
	main: function(){
		if (items.moonpearl && items.mirror && items.flippers)
			return regions.SouthDarkWorld();
		return {};
	},
	mire: function() { //TODO -- Add MM key logic smarts
		return andCombiner(canOneFrameClipUW_path(), regions.mire());
		var path1 = {}; //Mire w/all keys
		var path2 = {}; //Mire w/all keys, normal (need to get keys in spike chest and Vitty)
						//  If SK in left side, then BK also in left side, and SKs can't be in big/Vitty
		var path3 = {}; //Mire w/3 lucky keys possible
		if ((optionVariation === "keysanity" && qtyCounter.ditems_sk8 >= 3)
			|| (optionVariation === "retro" && qtyCounter.hc_sk >= 3))
			path1 = dungeons[8].isAccessible();
		if (optionVariation !== "keysanity" && optionVariation !== "retro" //BK could be bridge, and SKs on Vitty+Spike+x
			&& ((optionVariation !== "timedohko" && optionVariation !== "ohko")
				|| items.byrna || items.cape)
			&& (items.somaria && items.lantern)) //Lantern also gives access if need to get SK on left side
			path2 = andCombiner(dungeons[8].isAccessible(), canBeatBoss(8, qtyCounter.boss8));
		//Retro -- Can buy keys
		//Normal -- could be keys in bridge and lobby and map
		path3 = convertPossible(dungeons[8].isAccessible());
		return orCombiner(path1, path2, path3);
	}
};
dungeons[5] = {
	name: "Skull Woods",
	hint: "<img src='images/moonpearl.png' class='mini'>",
	abbrev: "SW",
	x: "53.38%", //52.41%
	y: "5.86%", //4.96%
	image: "boss52.png",
	isBeaten: function(){
		return items.boss5 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize5;
		}
	},
	isAccessible: function(){ //isAccessible is only for the front
		return andCombiner([rescueZelda(),
			orCombiner([canAdvancedItems_path(), (optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle()]),
			AccurateLogic(andCombiner([orCombiner([canDungeonRevive_path(), items.moonpearl]),
					regions.northWestDarkWorld()]),
				orCombiner([this.front(2), this.middle(2), this.back()]))]);
	},
	canGetPrize: function(){
		return andCombiner([this.isAccessible(), this.isBeatable()]);
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Boss: pearl, firerod, swordless/sword, 3SK, boss, compass, map
		var path1 = {}; //SK, min req nothing, presence of forced SK doesn't matter
		var path2 = {}; //MC
		path1 = orCombiner([qtyCounter.ditems_sk5 >= 3,
			andCombiner([optionVariation !== "keysanity" && optionVariation !== "mcs",
				anyOrAllCombiner([threshAllCombiner(3, [this.bigkey(), this.compass(), this.compass(), this.compass(), this.compass(), this.bridge()]), //BK in boss or big
					threshAllCombiner(3, [this.big("boss"), this.bigkey(), this.compass(), this.compass(), this.compass(), this.compass(), this.bridge()])])]), //BK elsewhere, might need to open big chest for last key
			{ng:"p"}]);
		path2 = (qtyCounter.ditems_comp5 && qtyCounter.ditems_map5) || optMapCompLogic === false || optionVariation === "none";
		return andCombiner([AccurateLogic(items.moonpearl && items.firerod, this.bridge()),
			optionSwords === "swordless" || hasSword(),
			path1, canBeatBoss(5), path2]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombiner([andCombiner([this.big(), this.bigkey(), this.compass(), this.bridge(), this.isBeatable()]),
			convertPossible(threshCombiner(itemsMax.chest5, [this.big(), this.bigkey(), this.compass(), this.compass(),
						this.bridge(), this.compass(), this.compass(), this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests([this.big(), this.bigkey(), this.compass(), this.bridge(), this.isBeatable()]);
		return hope;
	},
	front: function(must_be_link = false){
		if (must_be_link === true) {
			return orCombiner([regions.northWestDarkWorld(true),
				andCombiner([regions.northWestDarkWorld(), canDungeonRevive_path()])]);
		} else if (must_be_link === 2) {
			return orCombiner([regions.northWestDarkWorld(true),
				andCombiner([regions.northWestDarkWorld(),
					orCombiner([canDungeonRevive_path(), canSuperBunny_path("mirror"), canSuperBunny_path("fall"), canSuperBunny_path("hit")])])]);
		} else
			return regions.northWestDarkWorld();
	},
	middle: function(must_be_link = false){
		if (must_be_link === 2) {
			return orCombiner([regions.northWestDarkWorld(true),
				andCombiner([regions.northWestDarkWorld(),
					orCombiner([canDungeonRevive_path(), canSuperBunny_path("mirror"), canSuperBunny_path("hit")])])]);
		} else
			return this.front(must_be_link);
	},
	back: function(){
		return andCombiner([items.firerod,
			orCombiner([andCombiner([items.moonpearl, this.middle()]), //Pearl to preserve Link state
				andCombiner([this.middle(true), !dungeons[11].isBeaten()]), //Fake dark world, as long as Aga not dead
				andCombiner([glitched("mapwrap"), regions.darkEastDeathMountain(true), orCombiner([canBootsClip_path(), canOneFrameClipOW_path()])])])]); //Map wrap
	},
	big: function(source){ //BK, but allowed to have BK if accessibility !== locations
		var recur_boss = (source === "boss" ? true : this.isBeatable());
		return andCombiner([orCombiner([qtyCounter.ditems_bk5,
				andCombiner([optionVariation !== "keysanity",
					anyOrAllCombiner([this.bigkey(), this.compass(), this.bridge(), recur_boss])])]),
			AccurateLogic(orCombiner([canBombThings(), glitched("hover")]),
				orCombiner([andCombiner([!isEmpty(this.front(true)),
						orCombiner([canBombThings(), glitched("hover")])]),
					andCombiner([!isEmpty(this.front(2)), glitched("hover")])]))]);
	},
	bigkey: function(){
		return AccurateLogic({ng:"a"}, !isEmpty(this.middle(2)));
	},
	compass: function(){
		return AccurateLogic({ng:"a"}, !isEmpty(this.front(2)));
	},
	bridge: function(){ //Pearl && Firerod
		return AccurateLogic(items.moonpearl && items.firerod, this.back());
	}
};
dungeons[6] = {
	name: "Thieves' Town",
	hint: "<img src='images/moonpearl.png' class='mini'>",
	abbrev: "TT",
	x: "56.67%",
	y: "48.61%",
	image: "boss62.png",
	isBeaten: function(){
		return items.boss6 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize6;
		}
	},
	isAccessible: function(){
		return andCombiner([rescueZelda(),
			orCombiner([canAdvancedItems_path(), (optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle()]),
			AccurateLogic(andCombiner([orCombiner([items.moonpearl, canOWYBA_path()]),
					regions.northWestDarkWorld()]),
				regions.northWestDarkWorld(true))]);
	},
	canGetPrize: function(){
		return andCombiner([this.isAccessible(), this.isBeatable()]);
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Boss: SK, BK, boss, compass, map
		var path1 = {}; //SK, min req nothing
		var path2 = {}; //BK
		var path3 = {}; //MC
		path1 = orCombiner([qtyCounter.ditems_sk6 >= 1,
			andCombiner([optionVariation !== "keysanity" && optionVariation !== "mcs",
				anyOrAllCombiner([{ng:"a"}, this.cell(), this.big()])]),
			{ng:"p"}]);
		path2 = this.cell();
		path3 = (qtyCounter.ditems_comp6 && qtyCounter.ditems_map6) || optMapCompLogic === false || optionVariation === "none";
		return andCombiner(path1, path2, canBeatBoss(6), path3);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombiner([andCombiner([this.attic(), this.big(), this.cell(), this.isBeatable()]),
			convertPossible(threshCombiner(itemsMax.chest6, [this.attic(), {ng:"a"}, {ng:"a"}, {ng:"a"}, {ng:"a"}, this.big(), this.cell(), this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests([{ng:"a"}, this.attic(), this.big(), this.cell(), this.isBeatable()]);
		return hope;
	},
	attic: function(){ //SK, BK -- min req BK
		var path1 = {}; //BK
		var path2 = {}; //SK
		path1 = this.cell();
		path2 = orCombiner([qtyCounter.ditems_sk6 >= 1,
			andCombiner([optionVariation !== "keysanity" && optionVariation !== "mcs",
				anyOrAllCombiner([{ng:"a"}, this.cell(), this.big()])]),
			{ng:"p"}]);
		return andCombiner(path1, path2);
	},
	big: function(){ //hammer+BK + SK if SK not inside (accessibility) -- min req hammer+BK
		var path1 = {}; //BK
		var path2 = {}; //SK
		path1 = this.cell();
		path2 = orCombiner([qtyCounter.ditems_sk6 >= 1,
			andCombiner([optionVariation !== "keysanity" && optionVariation !== "mcs",
				anyOrAllCombiner([{ng:"a"}, this.cell()])]),
			{ng:"p"}]);
		var path3 = andCombiner([items.hammer, path1, path2]); //SK outside
		var path4 = andCombiner([items.hammer, path1, optionAccessibility !== "loc"]); //SK inside
		return anyOrAllCombiner([path3, path4]);
	},
	cell: function(){ //BK
		return qtyCounter.ditems_bk6 || optionVariation !== "keysanity";
	}
};
dungeons[7] = {
	name: "Ice Palace",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/flippers.png' class='mini'><img src='images/glove2.png' class='mini'> + <img src='images/bombos.png' class='mini'>/<img src='images/firerod.png' class='mini'>",
	abbrev: "IP",
	x: "89.94%",
	y: "86.30%",
	image: "boss72.png",
	isBeaten: function(){
		return items.boss7 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize7;
		}
	},
	isAccessible: function(){
		var path1 = {}; //Basic
		var path2 = {}; //First room
		var path3 = {}; //Pearl + swim + lift
		var path4 = {}; //MirrorWrap + Linkstate + 1f/bootsclip + South
		var path5 = {}; //one level lower than mirrorwrap, clip in and quickhop to screen wrap, YBA
		var path6 = {}; //flippers IP: entrance of mirrorwrap, spinspeed up second level to screen wrap, do it again, then down, right transition, down
		path1 = orCombiner([canAdvancedItems_path(), (optionSwords === "swordless" || hasSword(2)) && hasHealth(12) && (hasBottle(2) || hasArmor())]);
		path2 = AccurateLogic(orCombiner([canMeltThings(), canOneFrameClipUW_path()]), true);
		path3 = andCombiner([orCombiner([items.moonpearl, canDungeonRevive_path()]),
			orCombiner([items.flippers, canFakeFlipper_path(), AccurateLogic(false, orCombiner([canWaterWalk_path(), canBunnyRevive_path()]))]),
			canLiftDarkRocks()]);
		path4 = andCombiner([canMirrorWrap_path(),
			AccurateLogic(andCombiner([orCombiner([items.moonpearl, canOWYBA_path()]),
					orCombiner([canOneFrameClipOW_path(), canBootsClip_path()]),
					regions.SouthDarkWorld()]),
				orCombiner([andCombiner([canOneFrameClipOW_path(), regions.SouthDarkWorld(false), canDungeonRevive_path()]),
					andCombiner([orCombiner([canBootsClip_path(), canSuperSpeed_path(), canOneFrameClipOW_path()]),
						regions.SouthDarkWorld(true)])]))]);
		path5 = andCombiner([orCombiner([canBootsClip_path(), canSuperSpeed_path(), andCombiner([canOneFrameClipOW_path(), items.boots])]),
			canOWYBA_path(), regions.SouthDarkWorld(true, undefined, 0)]);
		path6 = andCombiner([items.flippers, orCombiner([andCombiner([canBootsClip_path(), regions.SouthDarkWorld(true)]),
						andCombiner([canOneFrameClipOW_path(), regions.SouthDarkWorld()])])]);
		return andCombiner([rescueZelda(), path1, path2, orCombiner([path3, path4, AccurateLogic(false, orCombiner([path5, path6]))])]);
	},
	canGetPrize: function(){
		return andCombiner([this.isAccessible(), this.isBeatable()]);
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Boss: hammer, melt, glove, boss, BK, (somaria+SK)/2SK || basic+2sk), mc
		var path1 = {}; //BK
		var path2 = {}; //keys
		var path3 = {}; //MC
		path1 = orCombiner([
			orCombiner([qtyCounter.ditems_bk7,
				andCombiner([optionVariation !== "keysanity",
					anyOrAllCombiner([this.bigkey(), this.compass(), this.spike(), this.freezor()])])]),
			{ng:"p"}]);
		path2 = 
		path3 = (qtyCounter.ditems_comp7 && qtyCounter.ditems_map7) || optMapCompLogic === false || optionVariation === "none";
		return andCombiner([items.hammer && canMeltThings(), canLiftRocks(), path1, path2, path3]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombiner([andCombiner([this.bigkey(), this.compass(), this.spike(), this.freezor(), this.big(), this.isBeatable()]),
			convertPossible(threshCombiner(itemsMax.chest7, [this.bigkey(), this.compass(), this.bigkey(), this.spike(), this.freezor(), this.compass(), this.big, this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests([this.bigkey(), this.compass(), this.spike(), this.freezor(), this.big(), this.isBeatable()]);
		return hope;
	},
	bigkey: function(){ //hammer+glove+spike room
		return andCombiner([items.hammer && canLiftRocks(), this.spike()]);
	},
	compass: function(){
		return AccurateLogic({ng:"a"}, orCombiner([canMeltThings(), canOneFrameClipUW_path()]));
	},
	spike: function(){ //hookshot or if no BK avail first, then 1SK
		//Hookshot guarantees, min req Hookshot OR SK (which can be gotten from below, so min req possible is nothing
		//If you found the BK first (keysanity), then it must be Hookshot
		//Hookshot
		//keysanity BK, then hookshot
		//kesanity no BK, then hookshot or 1SK OR possible with nothing
		//mcs BK, then hookshot
		//mcs no BK, hookshot or 1SK OR possible with nothing
		//BK, then hookshot
		//no BK, hookshot or look for a key
		
		return andCombiner([this.compass(),
			orCombiner([hasHookshot(),
				andCombiner([(optionVariation === "keysanity" || optionVariation === "mcs") && !qtyCounter.ditems_bk7,
					orCombiner([anyOrAllCombiner([hasHookshot(), qtyCounter.ditems_sk7 >= 1]), {ng:"p"}])]),
				andCombiner([optionVariation !== "keysanity" && optionVariation !== "mcs" && !qtyCounter.ditems_bk7,
					orCombiner([hasHookshot(), {ng:"p"}])])])]);
	},
	freezor: function(){ //Melt
		return canMeltThings();
	},
	big: function(){ //BK
		return andCombiner([this.compass(),
			orCombiner([qtyCounter.ditems_bk7,
				andCombiner([optionVariation !== "keysanity",
					anyOrAllCombiner([this.bigkey(), this.compass(), this.spike(), this.freezor()])])])]);
	}
};
dungeons[8] = {
	name: "Misery Mire",
	hint: "<img src='images/medallion0.png' class='mini'><img src='images/lantern.png' class='mini'>",
	abbrev: "MM",
	x: "56.29%", //54.15%
	y: "80.44%",
	image: "boss82.png",
	isBeaten: function(){
		return items.boss8 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize8;
		}
	},
	isAccessible: function(){ //isAccessible includes boots/hookshot for entry
		path1 = {}; //Basic
		path2 = {}; //Medallion
		path3 = {}; //First room
		path4 = {}; //Glitched
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword(2)) && hasHealth(12) && (hasBottle(2) || hasArmor()))
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			if (optionSwords === "swordless" || hasSword())
				path2 = medallionCheck_path(8);
			if (items.moonpearl) {
				if (items.boots || hasHookshot())
					path3 = {ng:"a"};
				else if (items.boots)
					path3 = canAdvancedItems_path();
				else
					path3 = {};
			}
		}
		return andCombiner(path1, path2, path3, canKillMostThings_path(8), regions.mire());
	},
	canGetPrize: function(){
		switch (optionLogic) {
			case "nmg":
			case "owg":
				return this.isBeatable();
			default:
				if (isEmpty(this.isAccessible()))
					return {};
				//Enter, somaria, lamp, bk8, sword/hammer/arrows (=boss8)
				//Or 3SK/2SK(if BK left), Heraboss/Swampboss
				//  Heraboss = (main+bk2)/mire, boss2
				//  Swampboss = SK4, hookshot, flippers, mire/(main+hammer), sword/hammer/(arrow/magic)+rod (=boss4)
				var path1 = {}; //Kill Vitreous
				var path2 = {}; //Kill Moldorm
				var path3 = {}; //Kill Arrghus
				var path_hera = {}; //Get to Hera
				path1 = this.isBeatable();
				path_hera = dungeons[2].mire();
				path2 = andCombiner(path_hera, canBeatBoss(2, qtyCounter.boss2));
				if (hasHookshot() && items.flippers)
					path3 = andCombiner(path_hera, canBeatBoss(4, qtyCounterr.boss4));
				return orCombiner(path1, path2, path3);
		}
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Big, lobby, BK, compass, bridge, map, spike, boss
		//Big: BK
		//Spike: ohko/byrna/cape
		//Lobby, map: SK or BK
		//BK: torch, BK in compass=SK2/SK3
		//Compass: torch, BK in BK=SK2/SK3
		//Boss: somaria, lantern, BK, boss, compass, map
		//Dungeon notes: BK in left means SK can't be left+lobby+map
		//				BK in lobby/map means SK can't be lobby/map+big+vitty
		switch (optionVariation) {
			case "keysanity":
				if (items.somaria && items.lantern && qtyCounter.ditems_bk8
					&& qtyCounter.ditems_comp8 && qtyCounter.ditems_map8)
					return canBeatBoss(8, qtyCounter.boss8);
				return {};
			default:
				var path1 = {}; //Always
				var path2 = {}; //Possible
				if (items.somaria && items.lantern) {
					if (((optionVariation !== "ohko" && optionVariation !== "timedohko") || items.byrna || items.cape) //BK/SK in spike
						&& canLightTorches() //BK in bk/compass
						&& (optionVariation !== "retro" //Can always get SK
							|| qtyCounter.hc_sk >= 2)) //2SK to access BK in left side
						path1 = canBeatBoss(8, qtyCounter.boss8);
					path2 = convertPossible(canBeatBoss(8, qtyCounter.boss8)); //BK could be free
				}
				return orCombiner(path1, path2);
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionVariation) {
			case "keysanity":
				var path1 = {ng:"a"}; //Bridge, spike free
				var path2 = {}; //Big
				var path3 = {}; //Lobby/map
				var path4 = {}; //BK/compass
				var path5 = {}; //Boss
				if (qtyCounter.ditems_bk8)
					path2 = {ng:"a"};
				if (qtyCounter.ditems_bk8 || qtyCounter.ditems_sk8 >= 1)
					path3 = {ng:"a"};
				if (qtyCounter.ditems_sk8 >= 3)
					path4 = {ng:"a"};
				path5 = canBeatBoss(8, qtyCounter.boss8);
				return multipleChests([path1, path2, path3, path4, path5]);
			default:
				var path1 = {ng:"a"}; //Bridge free
				var path2 = {}; //Big
				var path3 = {}; //Lobby/map
				var path4 = {}; //BK/compass
				var path5 = {}; //Boss
				var path6 = {}; //Spike
				if ((optionVariation !== "ohko" && optionVariation !== "timedohko") || items.byrna || items.cape)
					path6 = {ng:"a"};
				path5 = canBeatBoss(8, qtyCounter.boss8);
				//BK in left, then at least two SK in bridge, spike, lobby, map --> must be at least one SK in bridge or spike
				//BK in lobby/map, then 3SK in bridge,big,lm,boss,spike --> must be at least one SK in bridge or spike
				//BK in bridge/spike
				path3 = anyOrAllCombiner([path1, path6]); //If I can access both then I'm guaranteed SK or BK
				if (canLightTorches() && (optionVariation !== "retro" || qtyCounter.hc_sk >= 3))
					path4 = {ng:"a"};
				var always = andCombiner(path1, path3, path4, path5, path6); //This is sloppy
				var possible = {};
				if ((optionVariation !== "retro") //SK on bridge, items on map+lobby
					|| (canLightTorches()))		//Retro buy keys, items on bridge, map, lobby, BK+compass/boss+spike
					possible = {ng:"p"};
				var result = orCombiner(always, possible);
				if (isEmpty(result)) {
					return {ng:"au"};
				}
				return result;
		}
	}
};
dungeons[9] = {
	name: "Turtle Rock",
	hint: "<img src='images/medallion0.png' class='mini'><img src='images/lantern.png' class='mini'>",
	abbrev: "TR",
	x: "97.09%",
	y: "7.98%",
	image: "boss92.png",
	isBeaten: function(){
		return items.boss9 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return qtyCounter.gotPrize9;
		}
	},
	isAccessible: function(){ //isAccessible doesn't have somaria as req
		path1 = {}; //Basic
		path2 = {}; //Entry
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword(2)) && hasHealth(12) && (hasBottle(2) || hasArmor()))
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			path2 = orCombiner(this.lower(), this.middle(), this.upper());
		}
		return andCombiner(path1, path2);
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Chomps, compass, roller L/R, big, bk, crystaroller, eye 1234, boss
		//Chomps: SK, +somaria
		//Roller L/R: firerod, somaria
		//Compass: somaria
		//Big: somaria/hookshot, BK, 2SK, +somaria
		//BK: NoBK+keysanity: SK->3SK/4SK else 2SK ????, +somaria
		//Crystaroller: BK, 2SK, +somaria
		//Eye: lamp, somaria, BK, 3SK, cape/byrna/canBlockLasers
		//Boss: 4SK, lamp, BK, somaria, boss, comp, map
		switch (optionLogic) {
			case "nmg":
				switch (optionVariation) {
					case "keysanity":
						if (qtyCounter.ditems_sk9 >= 4 && items.lantern && qtyCounter.ditems_bk9
							&& items.somaria && qtyCounter.ditems_comp9 && qtyCounter.ditems_map9)
							return canBeatBoss(9, qtyCounter.boss9);
						return {};
					default:
						var path1 = {}; //Always
						var path2 = {}; //Possible
						if (items.lantern && items.somaria) {
							if (items.firerod && (items.cape || items.byrna || canBlockLasers())
								&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 4))
								path1 = canBeatBoss(9, qtyCounter.boss9);
							path2 = convertPossible(canBeatBoss(9, qtyCounter.boss9)); //SK in compass/chomps, BK in BK, SK in big/crystaroller
						}
						return orCombiner(path1, path2);
				}
		//Chomps: Upper+somaria+SK || middle
		//Roller L/R: firerod, somaria, upper || middle+(BKtop->2SK/4SK)
		//Compass: somaria, upper || middle+(BKtop->2SK/4SK)
		//Big: BK, upper+somaria+2SK || middle+hook/somaria
		//BK: NoBK+keysanity: SK->3SK/4SK else 2SK ????, upper+somaria || middle
		//Crystaroller: BK, upper+somaria+2SK || middle
		//Eye: lamp, somaria, BK, 3SK, cape/byrna/canBlockLasers
		//Boss: 4SK, lamp, BK, somaria, boss, comp, map
			case "owg":
				switch (optionVariation) {
					case "keysanity":
						if (qtyCounter.ditems_sk9 >= 4 && items.lantern && qtyCounter.ditems_bk9
							&& items.somaria && qtyCounter.ditems_comp9 && qtyCounter.ditems_map9)
							return canBeatBoss(9, qtyCounter.boss9);
						return {};
					default:
						var path1 = {}; //Always
						var path2 = {}; //Possible
						if (items.lantern && items.somaria) {
							if (items.firerod && (items.cape || items.byrna || canBlockLasers())
								&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 4))
								path1 = canBeatBoss(9, qtyCounter.boss9);
							//SK in compass/chomps, BK in BK, SK in big/crystaroller
							//BK in BK, SK in chomps/crystaroller/compass/big
							path2 = convertPossible(canBeatBoss(9, qtyCounter.boss9));
						}
						return orCombiner(path1, path2);
				}
		//Chomps: Upper+somaria+SK || middle || lower+lamp+somaria
		//Roller L/R: firerod, somaria, upper || middle+(BKtop->2SK/4SK) || lower+lamp+4SK
		//Compass: somaria, upper || middle+(BKtop->2SK/4SK) || lower+lamp+4SK
		//Big: BK, upper+somaria+2SK || middle+hook/somaria || lower+lamp+somaria
		//BK: upper+somaria/middle + 2SK || lower+lamp+somaria+4SK
		//Crystaroller: BK, upper+somaria+2SK || middle || lower+lamp+somaria
		//Eye: lower || (upper||middle + (lamp, somaria, BK, 3SK, cape/byrna/canBlockLasers))
		//Boss: firerod, icerod, BK, somaria, hammer/sword2, 4SK
			default:
				switch (optionVariation) {
					case "keysanity":
						if (qtyCounter.ditems_sk9 >= 4 && qtyCounter.ditems_bk9
							&& items.somaria && !isEmpty(this.lower())) //Added lower entry because there's no lamp req for upper/middle
							return canBeatBoss(9, qtyCounter.boss9); //Adjusted to real boss req
						return {};
					default:
						var path1 = {}; //Always
						var path2 = {}; //Possible
						if (items.lantern && items.somaria
							&& items.firerod && (items.cape || items.byrna || canBlockLasers())) {
							if (optionVariation !== "retro"
								&& !isEmpty(this.lower()) //Must have lower access in case BK in lower (with lower access, always have mid access
								&& !isEmpty(this.upper())) //SK in upper can be inaccessible with bad key usage
								path1 = canBeatBoss(9, qtyCounter.boss9);
							if (optionVariation === "retro"
								&& !isEmpty(this.lower()) && qtyCounter.hc_sk >= 4)
								path1 = canBeatBoss(9, qtyCounter.boss9);
						}
						if (items.somaria) {
							if (!isEmpty(this.lower()) && (items.cape || items.byrna || canBlockLasers() || items.lantern))
								//SK+BK on bridge or BK in crystaroller, SK in Big
								path2 = {ng:"p"};
							if ((!isEmpty(this.middle()) || !isEmpty(this.upper())) && items.lantern)
								path2 = {ng:"p"};
						}
						return orCombiner(path1, path2);
				}
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionLogic) {
			case "nmg":
				switch (optionVariation) {
					case "keysanity":
						var i = {};
						if (items.somaria && canBeatTrinexx() && items.firerod && qtyCounter.ditems_bk9 && qtyCounter.ditems_sk9 >= 4
							&& items.lantern
							&& (items.cape || items.byrna || canBlockLasers()))
							i = canBeatBoss(9, qtyCounter.boss9);
						if (!isEmpty(i))
							return i;
						return {ng:"au"};
					case "retro":
						var i = {};
						if (items.somaria && canBeatTrinexx() && items.firerod && sphereCounter.smallkey >= 4
							&& items.lantern
							&& (items.cape || items.byrna || canBlockLasers()))
							i = canBeatBoss(9, qtyCounter.boss9);
						if (!isEmpty(i))
							return i;
						//laserbridge means crystalroller,big,compass,chainchomps
						//trinexx means roller access
						if (items.somaria && items.firerod //mc in trinexx/BK
							&& items.lantern
							&& (items.cape || items.byrna || canBlockLasers()))
							i = {ng:"p"};
						if (!isEmpty(i))
							return i;
						return {ng:"au"};
					default:
						var i = {};
						if (items.somaria && canBeatTrinexx() && items.firerod
							&& items.lantern
							&& (items.cape || items.byrna || canBlockLasers()))
							i = canBeatBoss(9, qtyCounter.boss9);
						if (!isEmpty(i))
							return i;
						//no laserbridge means 5 items+BK in 8 locations, but cannot have 2SK on laserbridge
						//no roller means 2SK in compass/chainchomps, BK in BK (scenario #1, no trinexx, no roller)
						//scenario #2 no trinexx, no BK -- inferior to scenario #1
						if (items.somaria
							&& items.lantern
							&& (items.cape || items.byrna || canBlockLasers()))
							return {ng:"p"};
						return {ng:"au"};
				}
			default:
				return undefined;
		}
	},
	upper: function(){
		var path1 = {}; //Normal
		var path2 = {}; //Clip
		if ((optionSwords === "swordless" || hasSword())
			&& items.moonpearl && items.somaria) {
			if (items.hammer)
				path1 = andCombiner(orCombiner((canLiftDarkRocks() ? {ng:"a"} : {}), canBootsClip_path()), regions.eastDeathMountain());
			path2 = andCombiner(canBootsClip_path(), regions.darkEastDeathMountain());
		}
		return andCombiner(medallionCheck_path(9), orCombiner(path1, path2));
	},
	middle: function(){
		return andCombiner(orCombiner(canMirrorClip_path(), andCombiner(canSuperSpeed_path(), (items.moonpearl ? {ng:"a"} : {})), andCombiner(canOneFrameClipOW_path(), canOWYBA_path())),
			(items.boots || items.somaria || hasHookshot() || items.cape || items.byrna ? {ng:"a"} : {}),
			regions.darkEastDeathMountain());
	},
	lower: function(){
		return andCombiner(canMirrorClip_path(),
			orCombiner((items.moonpearl ? {ng:"a"} : {}), andCombiner(canOWYBA_path(), canBootsClip_path())),
			orCombiner(canBootsClip_path(), canOneFrameClipOW_path()),
			regions.westDeathMountain());
	}
};
dungeons[10] = {
	name: "Ganon's Tower",
	abbrev: "GT",
	x: "78.33%",
	y: "5.86%", //1.73%
	image: "boss102.png",
	isBeaten: function(){
		return items.boss10 === 2;
	},
	gotPrize: function(){
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return this.isBeaten();
		}
	},
	isAccessible: function(){ //Needs to handle crystal requirements specially for goModeCalc (may not have all crystals yet)
		var crystalCount = 0;
		for(var i = 0; i < 10; i++)
			if ((qtyCounter["dungeonPrize"+i] === 2 || qtyCounter["dungeonPrize"+i] === 1) && dungeons[i].gotPrize())
				crystalCount++;
		path1 = {}; //Basic
		path2 = {}; //Entry
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword(2)) && hasHealth(12) && (hasBottle(2) || hasArmor()))
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			path2 = orCombiner(canOneFrameClipOW_path(),
				andCombiner((items.moonpearl ? {ng:"a"} : {}),
					orCombiner(canBootsClip_path(), (optionTower === "random" ? {ng:"p"} : (crystalCount >= optionTower ? {ng:"a"} : {})))));
		}
		return andCombiner(path1, path2, regions.darkEastDeathMountain());
	},
	canGetPrize: function(){
		return this.isBeatable(true);
	},
	isBeatable: function(ignoreEntry = false){ //Need isBeatable calculation for gomode when isAccessible might be missing...
		if (ignoreEntry === false)
			if (isEmpty(this.isAccessible()))
				return {};
		switch (optionVariation) {
			case "keysanity":
				if (hasHookshot() && canLightTorches() && qtyCounter.ditems_bk10 && qtyCounter.ditems_sk10 >= 4)
					return andCombiner(canBeatBoss(2, qtyCounter.boss15), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14));
				return {};
			default:
				var always = {};
				var possible = {};
				if (hasHookshot() && canLightTorches()
					&& items.boots && items.firerod && items.somaria && items.hammer
					&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 4))
					always = andCombiner(canBeatBoss(2, qtyCounter.boss15), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(0, qtyCounter.boss13));
				if (hasHookshot() && canLightTorches())
					possible = convertPossible(andCombiner(canBeatBoss(2, qtyCounter.boss15), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14)));
				return orCombiner(always, possible);
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Entire logic is lazy, based on old tracker
		switch (optionVariation) {
			case "keysanity":
				var i = {};
				if (hasHookshot() && canLightTorches() //reqs for upstairs
					&& items.boots //Bob's Torch BK
					&& items.hammer //DMs Room BK
					&& items.somaria //Tile Room BK
					&& items.firerod //Compass Room BK
					&& qtyCounter.ditems_bk10 && qtyCounter.ditems_sk10 >= 4)
					i = andCombiner(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss13), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(2, qtyCounter.boss15));
				if (isEmpty(i))
					return {ng:"au"};
				return i;
			case "retro":
				var i = {};
				if (hasHookshot() && canLightTorches() //reqs for upstairs
					&& items.boots //Bob's Torch BK
					&& items.hammer //DMs Room BK
					&& items.somaria //Tile Room BK
					&& items.firerod //Compass Room BK
					&& qtyCounter.hc_sk >= 4)
					i = andCombiner(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss13), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(2, qtyCounter.boss15));
				if (!isEmpty(i))
					return i;
				if (hasHookshot() && canLightTorches()
					&& items.hammer && items.somaria && items.firerod
					&& (items.boots //mc in Moldorm+pre-moldorm
						|| qtyCounter.hc_sk >= 1)) //mc in torch/moldorm
					i = convertPossible(andCombiner(canBeatBoss(0, qtyCounter.boss13), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14)));
				if (!isEmpty(i))
					return i;
				return {ng:"au"};
			default:
				var i = {};
				if (hasHookshot() && canLightTorches() //reqs for upstairs
					&& items.boots //Bob's Torch BK
					&& items.hammer //DMs Room BK
					&& items.somaria //Tile Room BK
					&& items.firerod) //Compass Room BK
					i = andCombiner(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss13), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(2, qtyCounter.boss15));
				if (!isEmpty(i))
					return i;
				//must have hammer & hookshot for left
				//upstairs required (lanmolas, arrows, torches, BK) (only 1SK possible, no BK)
				//compass required (only 1SK possible)
				//=hopex2+DMx4+randox4+firesnake+Big+Bob+BKx3+helmx2+compassx4+tile
				//torch(boots)+pre-moldorm(SK)+moldorm+map(SK)
				if (hasHookshot() && canLightTorches() //reqs for upstairs
					&& items.hammer //DMs Room BK
					&& items.somaria //Tile Room BK
					&& items.firerod) //Compass Room BK
					i = convertPossible(andCombiner(canBeatBoss(0, qtyCounter.boss13), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14)));
				if (!isEmpty(i))
					return i;
				return {ng:"au"};
		}
	}
};
dungeons[11] = {
	name: "Castle Tower",
	abbrev: "CT",
	x: "24.75%",
	y: "40.01%",
	image: "agahnim.png",
	isBeaten: function(){
		return items.boss11 === 2;
	},
	gotPrize: function(){ //Something must happen when you try to dupe CT
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return this.isBeaten();
		}
	},
	isAccessible: function(){ //isAccessible also contains canKillMostThings -- OK because you can't do anything otherwise
		if (rescueZelda() && (items.cape || hasSword(2) || (optionSwords === "swordless" && items.hammer)))
			return canKillMostThings_path(10);
		return {};
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(goModeCalc = true){
		//TODO: Ignore this if doing goModeCalc
		if (isEmpty(this.isAccessible()))
			return {};
		//Room3, darkmaze, boss
		//Darkmaze: lamp, SK
		//Boss: 2SK, lamp, sword/(swordless+hammer/net)
		if (items.lantern && (hasSword() || (optionSwords === "swordless" && (items.hammer || items.net)))) {
			if ((optionVariation === "keysanity" && qtyCounter.ditems_sk11 >= 2)
				|| (optionVariation === "retro" && qtyCounter.hc_sk >= 2)
				|| (optionVariation !== "keysanity" && optionVariation !== "retro"))
				return {ng:"a"};
			if (optionVariation === "retro") //Can buy keys
				return {ng:"p"};
		}
		return {};
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var path1 = {ng:"a"}; //Free room3
		var path2 = {}; //Darkmaze
		if (items.lantern
			&& ((optionVariation === "keysanity" && qtyCounter.ditems_sk11 >= 1)
				|| (optionVariation === "retro" && qtyCounter.hc_sk >= 1)
				|| (optionVariation !== "keysanity" && optionVariation !== "retro")))
			path2 = {ng:"a"};
		if (items.lantern && optionVariation === "retro") //Can buy keys
			path2 = {ng:"p"};
		return multipleChests([path1, path2]); //only for keysanity and retro
	}
};
dungeons[12] = {
	name: "Ganon",
	abbrev: "Ganon",
	x: "75.14%",
	y: "40.80%",
	image: "ganon.png",
	isBeaten: function(){
		return items.boss12 === 2;
	},
	gotPrize: function(){ //Does anything happen if you dupe Ganon "prize"???
		switch(optionLogic) {
			case "nmg":
			case "owg":
			case "major":
				return this.isBeaten();
			default:
				return this.isBeaten();
		}
	},
	isAccessible: function(){
		if (optionGoal === "fastganon"
			|| dungeons[10].isBeaten())
			return regions.northEastDarkWorld();
		return {};
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(goModeCalc = false){
		if (items.moonpearl && (dungeons[10].isBeaten() || goModeCalc)
			&& ((optionSwords === "swordless" && items.hammer)
				|| (optionDifficulty !== "easy" && (hasSword(2) && (items.lantern || (items.firerod && canExtendMagic(3)))))
				|| (hasSword(3) && (items.lantern || (items.firerod && canExtendMagic(2)))))) {
			if (optionDifficulty !== "easy" && optionSwords !== "swordless")
				return {ng:"a"};
			return canShootArrows_path(2);
		}
		return {};
	},
	canGetChests: function(){
		return this.isBeatable();
	},
	canReachHole: function(){ //for go mode calcs, TODO it needs to understand bunny states
		return regions.northEastDarkWorld();
	}
};

var chests = new Array;

//Logic bug involving MG bootsless seeds for: magic bat, graveyard ledge, lake hylia
//	Issue #664 filed
//Floating island MG logic is bad
//	Issue #664 filed
//Mire MG logic has no reqs
//	Issue #664 filed

/*NEED TO CHECK BOTTLE REQS WHEN DOING MULTIPLE REGIONS*/

//NorthEast LightWorld chests, region is always accessible from Link's House
chests[0] = {
	name: "Sahasrahla's Hut",
	family: "Sahasrahla's Hut",
	hint: "<img src='images/bombs.png' class='mini'>/<img src='images/boots.png' class='mini'>",
	x: "40.13%",
	y: "42.33%", //45.26%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canBombThings() || items.boots)
				return regions.northEastLightWorld();
			return {};
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny mirror
					var path3 = {}; //Superbunny hit
					var path4 = {}; //Unbunny
					if (canBombThings() || items.boots)
						path1 = regions.northEastLightWorld(true);
					if (items.boots && items.mirror)
						path2 = andCombiner(glitched("superbunny_mirror"), regions.northEastLightWorld());
					if (items.boots && optionVariation !== "ohko" && optionVariation !== "timedohko")
						path3 = andCombiner(glitched("superbunny_hit"), regions.northEastLightWorld());
					if ((canBombThings() || items.boots) && items.mirror)
						path4 = andCombiner(glitched("unbunny"), glitched("superbunny_mirror"), regions.northEastLightWorld());
					return orCombiner(path1, path2, path3, path4);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny
					var path4 = {}; //Unbunny
					if (canBombThings() || items.boots)
						path1 = regions.northEastLightWorld(true);
					if (items.boots && (items.mirror || (optionVariation !== "ohko" && optionVariation !== "timedohko")))
						path2 = regions.northEastLightWorld();
					if ((canBombThings() || items.boots) && items.mirror)
						path3 = andCombiner(glitched("unbunny"), regions.northEastLightWorld());
					return orCombiner(path1, path2, path3);
			}
	}
};
chests[1] = {
	name: "Sahasrahla",
	hint: "<img src='images/pendant0.png' class='mini'>",
	x: "40.13%",
	y: "48.19%", //45.26%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		var pendants = 0;
		for (var i = 0; i < 10; i++)
			if (qtyCounter["dungeonPrize"+i] === 3 && dungeons[i].gotPrize())
				pendants++;
		if (pendants === 1)
			return regions.northEastLightWorld();
		return {};
	}
};
chests[2] = {
	name: "King Zora",
	hint: "<img src='images/glove1.png' class='mini'>/<img src='images/flippers.png' class='mini'> + <img src='images/stunprize2.png' class='mini'>x500",
	x: "48.07%", //47.48%
	y: "9.74%", //12.67%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Waterwalk
			var path3 = {}; //Fake flipper
			var path4 = {}; //Fairy revive
			var path5 = {}; //Fairy revive from enemy RNG
			var path6 = {}; //Bootsclip
			if (canLiftRocks() || items.flippers)
				path1 = regions.northEastLightWorld();
			//if (items.boots)
			//	path2 = andCombiner(glitched("waterwalk_boots"), regions.northEastLightWorld());
			path3 = andCombiner(canFakeFlipper_path(), regions.northEastLightWorld());
			//if (canBombThings())
			//	path4 = andCombiner(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			//path5 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			path6 = andCombiner(canBootsClip_path(), regions.northEastLightWorld());
			return orCombiner(path1, path2, path3, path4, path5, path6);
		} else {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Waterwalk
					var path3 = {}; //Fake flipper
					var path4 = {}; //Fairy revive
					var path5 = {}; //Surfing bunny via mirror
					var path6 = {}; //Fairy revive via enemy RNG
					if (canLiftRocks() || items.flippers)
						path1 = regions.northEastLightWorld(true);
					if (items.boots)
						path2 = andCombiner(glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					path3 = andCombiner(glitched("fakeflipper"), regions.northEastLightWorld(true));
					if (canBombThings())
						path4 = andCombiner(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					if (items.mirror && items.flippers)
						path5 = andCombiner(glitched("surfingbunny_mirror"), regions.northEastLightWorld());
					path6 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombiner(path1, path2, path3, path4, path5, path6);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Surfing bunny via mirror
					var path3 = {}; //Fairy revive via enemy RNG
					path1 = regions.northEastLightWorld(true);
					if (items.mirror && items.flippers)
						path2 = andCombiner(glitched("surfingbunny_mirror"), regions.northEastLightWorld());
					path3 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombiner(path1, path2, path3);
			}
		}
	}
};
chests[3] = {
	name: "Potion Shop",
	hint: "<img src='images/mushroom.png' class='mini'>",
	x: "39.65%",
	y: "33.37%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (hasMushroom())
				return regions.northEastLightWorld();
			return {};
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Wriggle through portal
			if (hasMushroom())
				path1 = regions.northEastLightWorld(true);
			if (hasMushroom() && items.flippers)
				path2 = andCombiner(glitched("wriggle"), regions.SouthLightWorld());
			return orCombiner(path1, path2);
		}
	}
};
chests[4] = {
	name: "Zora's Ledge",
	hint: "<img src='images/flippers.png' class='mini'> (check with <img src='images/glove1.png' class='mini'>)",
	x: "48.07%", //47.48%
	y: "15.60%", //12.67%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Get item
			var path2 = {}; //Fake flipper w/waterwalk through Zora's Domain
			var path3 = {}; //Fake flipper w/moonpearl w/stored waterwalk
			var path4 = {}; //Fake flipper w/moonpearl into fairy revive
			var path5 = {}; //Bomb revive w/moonpearl into fairy revive
			var path6 = {}; //RNG revive w/moonpearl into fairy revive <-- same as path5
			var path7 = {}; //Waterwalk into fairy revive
			var path8 = {}; //Logical access
			var pathv = {}; //View item
			if (items.flippers)
				path1 = regions.northEastLightWorld();
			//if (items.boots)
			//	path2 = andCombiner(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld());
			//if (items.moonpearl && items.boots)
			//	path3 = andCombiner(glitched("fakeflipper"), glitched("waterwalk_boots"), regions.northEastLightWorld());
			//if (items.moonpearl && canBombThings())
			//	path4 = andCombiner(glitched("fakeflipper"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			//if (items.moonpearl && canBombThings())
			//	path5 = andCombiner(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 2));
			//if (items.boots && canBombThings())
			//	path7 = andCombiner(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			path8 = andCombiner(canWaterWalk_path(), orCombiner(canFakeFlipper_path(), canBootsClip_path()));
			pathv = convertView(chests[2].isAvailable());
			return orCombiner(orCombiner(path1, path2, path3, path4, path5, path7), path8, pathv);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //Fake flipper w/waterwalk through Zora's Domain (setup at fairy cave if no pearl)
					var path3 = {}; //Fake flipper w/moonpearl w/stored waterwalk
					var path4 = {}; //Fake flipper w/moonpearl into fairy revive
					var path5 = {}; //Bomb revive w/moonpearl into fairy revive
					var path6 = {}; //RNG revive w/moonpearl into fairy revive <-- same as path5
					var path7 = {}; //Waterwalk into fairy revive (setup at fairy cave if no pearl)
					var pathv = {}; //View item
					if (items.flippers)
						path1 = regions.northEastLightWorld(true);
					if (items.boots)
						path2 = andCombiner(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.moonpearl && items.boots)
						path3 = andCombiner(glitched("fakeflipper"), glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.moonpearl && canBombThings())
						path4 = andCombiner(glitched("fakeflipper"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					if (items.moonpearl && canBombThings())
						path5 = andCombiner(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 2));
					if (items.boots && canBombThings())
						path7 = andCombiner(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					pathv = convertView(chests[2].isAvailable());
					return orCombiner(orCombiner(path1, path2, path3, path4, path5, path7), pathv);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //Fake flipper w/waterwalk through Zora's Domain (setup at fairy cave if no pearl)
					var path4 = {}; //Fake flipper w/moonpearl into fairy revive
					var path5 = {}; //Bomb revive w/moonpearl into fairy revive
					var path6 = {}; //RNG revive w/moonpearl into fairy revive <-- same as path5
					var path7 = {}; //Waterwalk into fairy revive (setup at fairy cave if no pearl)
					var pathv = {}; //View item
					if (items.flippers || (items.boots && items.moonpearl))
						path1 = regions.northEastLightWorld(true);
					if (items.boots)
						path2 = andCombiner(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.moonpearl && canBombThings())
						path4 = andCombiner(canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					if (items.moonpearl && canBombThings())
						path5 = andCombiner(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 2));
					if (items.boots && canBombThings())
						path7 = andCombiner(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					pathv = convertView(chests[2].isAvailable());
					return orCombiner(path1, path2, path4, path5, path7, pathv);
			}
	}
};
chests[5] = {
	name: "Waterfall Fairy",
	family: "Waterfall Fairy",
	hint: "<img src='images/flippers.png' class='mini'>",
	x: "45.16%", //44.57%
	y: "13.43%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Fake flipper
			var path3 = {}; //Waterwalk
			var path4 = {}; //regular Fake flipper
			if (items.flippers)
				path1 = regions.northEastLightWorld(undefined, undefined, undefined, true);
			//if (items.moonpearl)
			//	path2 = orCombiner(andCombiner(glitched("fakeflipper"), regions.northEastLightWorld()),
			//		andCombiner(orCombiner(canBombThings() ? andCombiner(canGetFairy_path(), glitched("bombfairy_fakeflipper")) : {}, glitched("enemyfairy_fakeflipper")), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1)));
			path3 = andCombiner(canWaterWalk_path(), regions.northEastLightWorld(undefined, undefined, undefined, true));
			if (items.moonpearl)
				path4 = andCombiner(canFakeFlipper_path(), regions.northEastLightWorld(undefined, undefined, undefined, true));
			return orCombiner(path1, path2, path3, path4);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Fake flipper
					var path3 = {}; //Waterwalk
					var path4 = {}; //Surf and superbunny
					var path5 = {}; //Enemy RNG fairy revive and superbunny
					var path6 = {}; //Enemy RNG fairy revive and swim in with flippers
					if (items.flippers)
						path1 = regions.northEastLightWorld(true);
					path2 = orCombiner(andCombiner(glitched("fakeflipper"), regions.northEastLightWorld(true)),
						andCombiner(orCombiner(canBombThings() ? andCombiner(canGetFairy_path(), glitched("bombfairy_fakeflipper")) : {}, andCombiner(canGetFairy_path(), glitched("enemyfairy_fakeflipper"))),
						regions.northEastLightWorld(true, undefined, bottleCount() - 1)));
					if (items.boots)
						path3 = andCombiner(glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.mirror && items.flippers)
						path4 = andCombiner(glitched("surfingbunny_mirror"), glitched("superbunny_mirror"), regions.northEastLightWorld());
					if (items.mirror)
						path5 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), glitched("superbunny_mirror"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					if (items.flippers)
						path6 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombiner(path1, path2, path3, path4, path5, path6);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Surf and superbunny
					var path3 = {}; //Enemy RNG fairy revive and superbunny
					var path4 = {}; //Enemy RNG fairy revive and swim in with flippers
					path1 = regions.northEastLightWorld(true);
					if (items.mirror && items.flippers)
						path2 = andCombiner(glitched("surfingbunny_mirror"), regions.northEastLightWorld());
					if (items.mirror)
						path3 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					if (items.flippers)
						path4 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombiner(path1, path2, path3, path4);
			}
	}
};

//NorthWest LightWorld chests, region is always accessible from Link's House
chests[6] = {
	name: "Master Sword Pedestal",
	hint: "<img src='images/pendant0.png' class='mini'><img src='images/pendant1.png' class='mini'><img src='images/pendant2.png' class='mini'> (check with <img src='images/book.png' class='mini'>)",
	x: "2.04%",
	y: "5.03%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		var pendantCountg = 0;
		var pendantCountrb = 0;
		for (var i = 0; i < 10; i++)
			if ((qtyCounter["dungeonPrize"+i] === 3) && dungeons[i].gotPrize())
				pendantCountg++;
			else if ((qtyCounter["dungeonPrize"+i] === 4) && dungeons[i].gotPrize())
				pendantCountrb++;
		var path1 = {}; //Get item
		var path2 = {}; //View item
		if (pendantCountg === 1 && pendantCountrb === 2)
			path1 = andCombiner(orCombiner(canAdvancedItems_path(), (items.book ? {ng:"a"} : {})),
				regions.northWestLightWorld());
		if (items.book)
			path2 = convertView(regions.northWestLightWorld());
		return orCombiner(path1, path2);
	}
};
chests[7] = {
	name: "King's Tomb",
	hint: "<img src='images/boots.png' class='mini'> + <img src='images/glove2.png' class='mini'>/(<img src='images/mirror.png' class='mini'><img src='images/moonpearl.png' class='mini'>)",
	x: "30.39%", //29.78%
	y: "29.64%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (items.boots) {
				var path1 = {}; //Light world
				var path2 = {}; //Dark world
				var path3 = {}; //Bootsclip
				if (canLiftDarkRocks())
					path1 = regions.northWestLightWorld();
				if (items.mirror && items.moonpearl)
					path2 = andCombiner(regions.northWestDarkWorld(), regions.northWestLightWorld());
				path3 = canBootsClip_path();
				return orCombiner(path1, path2, path3);
			}
			return {};
		} else
			switch (optionLogic) {
				case "nmg":
					if (canLiftDarkRocks() && items.boots)
						return regions.northWestLightWorld(true);
					return {};
				default:
					var path1 = {}; //Light world
					var path2 = {}; //Dark world
					var path3 = {}; //GYL
					if (items.boots) {
						if (canLiftDarkRocks())
							path1 = regions.northWestLightWorld(true);
						if (items.mirror)
							path2 = andCombiner(regions.westDeathMountain(true), regions.northWestLightWorld(true));
						path3 = andCombiner(glitched("kingtomb"), regions.westDeathMountain(true));
					}
					return orCombiner(path1, path2, path3);
			}
	}
};
chests[8] = {
	name: "Kakariko Tavern",
	x: "7.94%",
	y: "58.16%", //56.79%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted")
			return regions.northWestLightWorld();
		else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					var path3 = {}; //Superbunny via hit
					//No unbunny because it's the same req as mirror superbunny
					path1 = regions.northWestLightWorld(true);
					if (items.mirror)
						path2 = andCombiner(glitched("superbunny_mirror"), regions.northWestLightWorld());
					if (optionVariation !== "ohko" && optionVariation !== "timedohko")
						path3 = andCombiner(glitched("superbunny_hit"), regions.northWestLightWorld());
					return orCombiner(path1, path2, path3);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny
					path1 = regions.northWestLightWorld(true);
					if (items.mirror
						|| (optionVariation !== "ohko" && optionVariation !== "timedohko"))
						path2 = regions.northWestLightWorld();
					return orCombiner(path1, path2);
			}
	}
};
chests[9] = {
	name: "Chicken House",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "4.83%",
	y: "54.08%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canBombThings())
				return regions.northWestLightWorld();
			return {};
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Unbunny
			if (canBombThings())
				path1 = regions.northWestLightWorld(true);
			if (items.mirror && canBombThings())
				path2 = andCombiner(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.northWestLightWorld());
			return orCombiner(path1, path2);
		}
	}
};
chests[10] = {
	name: "Kakariko Well",
	family: "Kakariko Well",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "1.45%", //1.17%
	y: "42.53%", 
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canBombThings())
				return regions.northWestLightWorld();
			else
				return multipleChests([regions.northWestLightWorld(), {}]);
			return {};
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Top Chest
					var path2 = {}; //Unbunny
					var path3 = {}; //Bottom chests
					var path4 = {}; //Superbunny
					if (canBombThings())
						path1 = regions.northWestLightWorld(true);
					if (canBombThings() && items.mirror)
						path2 = andCombiner(glitched("unbunny"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld(true);
					path4 = andCombiner(glitched("superbunny"), regions.northWestLightWorld());
					return multipleChests([orCombiner(path1, path2), orCombiner(path3, path4)]);
				default:
					var path1 = {}; //Top Chest
					var path2 = {}; //Unbunny
					var path3 = {}; //Bottom chests
					var path4 = {}; //Superbunny
					if (canBombThings())
						path1 = regions.northWestLightWorld(true);
					if (canBombThings() && items.mirror)
						path2 = andCombiner(glitched("unbunny"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld();
					return multipleChests([orCombiner(path1, path2), path3]);
			}
	}
};
chests[11] = {
	name: "Blind's Hideout",
	family: "Blind's Hideout",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "6.38%",
	y: "41.13%", //41.94%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canBombThings())
				return regions.northWestLightWorld();
			else
				return multipleChests([regions.northWestLightWorld(), {}]);
			return {};
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Top
					var path2 = {}; //Unbunny
					var path3 = {}; //Bottom
					var path4 = {}; //Superbunny mirror
					var path5 = {}; //Can't superbunny hit
					if (canBombThings())
						path1 = regions.northWestLightWorld(true);
					if (canBombThings() && items.mirror)
						path2 = andCombiner(glitched("unbunny"), glitched("superbunny_mirror"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld(true);
					if (items.mirror)
						path4 = andCombiner(glitched("superbunny_mirror"), regions.northWestLightWorld());
					return multipleChests([orCombiner(path1, path2), orCombiner(path3, path4)]);
				default:
					var path1 = {}; //Top
					var path2 = {}; //Unbunny
					var path3 = {}; //Bottom
					var path4 = {}; //Superbunny mirror
					var path5 = {}; //Can't superbunny hit
					if (canBombThings())
						path1 = regions.northWestLightWorld(true);
					if (canBombThings() && items.mirror)
						path2 = andCombiner(glitched("unbunny"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld(true);
					if (items.mirror)
						path4 = regions.northWestLightWorld();
					return multipleChests([orCombiner(path1, path2), orCombiner(path3, path4)]);
			}
	}
};
chests[12] = {
	name: "Pegasus Rocks",
	hint: "<img src='images/boots.png' class='mini'>",
	x: "18.74%", //19.34%
	y: "29.27%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.boots)
			return regions.northWestLightWorld(true);
		return {};
	}
};
chests[13] = {
	name: "Bottle Merchant",
	hint: "<img src='images/stunprize2.png' class='mini'>x100",
	x: "4.73%",
	y: "46.99%", //46.18%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
};
chests[14] = {
	name: "Magic Bat",
	hint: "<img src='images/powder.png' class='mini'> + <img src='images/hammer.png' class='mini'>/(<img src='images/moonpearl.png' class='mini'><img src='images/mirror.png' class='mini'><img src='images/glove2.png' class='mini'>)",
	x: "16.05%",
	y: "56.20%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Fake powder
			var pathi = {}; //Hammer
			var pathj = {}; //Bootsclip
			var pathk = {}; //Mirror [V31 Bug]
			var pathl = {}; //DarkWorld
			if (items.hammer)
				pathi = regions.northWestLightWorld();
			pathj = andCombiner(canBootsClip_path(), regions.northWestLightWorld());
			if (items.mirror)
			//pathk = ???
			if (items.moonpearl && items.mirror && canLiftDarkRocks())
				pathl = andCombiner(regions.northWestDarkWorld(), regions.northWestLightWorld());
			return andCombiner((hasPowder() ? {ng:"a"} : ((hasMushroom() && items.somaria) ? glitched("fakepowder") : {})),
				orCombiner(pathi, pathj, pathk, pathl));
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Fake powder
					if (hasPowder() && items.hammer)
						path1 = regions.northWestLightWorld(true);
					if (hasMushroom() && items.somaria && items.hammer)
						path2 = andCombiner(glitched("fakepowder"), regions.northWestLightWorld(true));
					return orCombiner(path1, path2);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Fake powder
					if (hasPowder() && (items.hammer || items.boots))
						path1 = regions.northWestLightWorld(true);
					if (hasMushroom() && items.somaria && (items.hammer || items.boots))
						path2 = andCombiner(glitched("fakepowder"), regions.northWestLightWorld(true));
					return orCombiner(path1, path2);
			}
	}
};
chests[15] = {
	name: "Sick Kid",
	hint: "<img src='images/bottle0.png' class='mini'>",
	x: "7.74%",
	y: "52.29%", //53.66%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (hasABottle())
			return regions.northWestLightWorld();
		return {};
	}
};
chests[16] = {
	name: "Lost Woods Hideout",
	x: "9.39%",
	y: "13.06%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		var path1 = {}; //Normal
		var path2 = {}; //View
		path1 = regions.northWestLightWorld(true);
		path2 = convertView(regions.northWestLightWorld());
		return orCombiner(path1, path2);
	}
};
chests[17] = {
	name: "Lumberjack Tree",
	hint: "<img src='images/agahnim.png' class='mini'><img src='images/boots.png' class='mini'>",
	x: "14.89%",
	y: "7.20%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if ((dungeons[11].isBeaten()) && items.boots)
			return regions.northWestLightWorld(true);
		return convertView(regions.northWestLightWorld());
	}
};
chests[18] = {
	name: "Graveyard Ledge",
	hint: "<img src='images/mirror.png' class='mini'><img src='images/moonpearl.png' class='mini'>",
	x: "27.47%", //28.23%
	y: "27.49%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //DMA then teleport down (WOW)
			var path2 = {}; //NMG
			path1 = andCombiner(canBootsClip_path(), regions.northWestLightWorld());
			if (items.mirror && items.moonpearl)
				path2 = andCombiner(regions.northWestDarkWorld(), regions.northWestLightWorld());
			return orCombiner(path1, path2);
		} else {
			if (canBombThings())
				return regions.northWestLightWorld(true);
			return {};
		}
	}
};
chests[19] = {
	name: "Mushroom",
	x: "5.89%",
	y: "8.39%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		var path1 = {}; //Normal
		var path2 = {}; //View
		path1 = regions.northWestLightWorld(true);
		path2 = convertView(regions.northWestLightWorld());
		return orCombiner(path1, path2);
	}
};

//South LightWorld chests, region is always accessible from Link's House
chests[20] = {
	name: "Floodgate Chest",
	x: "24.33%", //23.22%
	y: "93.51%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted")
			return regions.SouthLightWorld();
		else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Mirror via superbunny
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = andCombiner(glitched("superbunny_mirror"), regions.SouthLightWorld());
					return orCombiner(path1, path2);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Mirror via superbunny
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = regions.SouthLightWorld();
					return orCombiner(path1, path2);
			}
	}
};
chests[21] = { //Technically this should be SouthLightWorld, but then it's gated by RescueZelda
	name: "Link's House",
	x: "27.09%",
	y: "68.92%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return {ng:"a"};
	}
};
chests[22] = {
	name: "Aginah's Cave",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "9.87%",
	y: "83.08%", //82.59%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canBombThings())
				return regions.SouthLightWorld();
			return {};
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Unbunny
			if (canBombThings())
				path1 = regions.SouthLightWorld(true);
			if (items.mirror && canBombThings())
				path2 = andCombiner(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.SouthLightWorld());
			return orCombiner(path1, path2);
		}
	}
};
chests[23] = {
	name: "Mini Moldorm Cave",
	family: "Mini Moldorm Cave",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "32.30%",
	y: "93.92%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(must_be_link = false){
		if (optionState !== "inverted") {
			if (canBombThings())
				return regions.SouthLightWorld();
			return {};
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Superbunny
			var path3 = {}; //Unbunny
			if (canBombThings())
				path1 = regions.SouthLightWorld(true);
			var crystalCount = 0;
			for(var i = 0; i < 10; i++)
				if (qtyCounter["dungeonPrize"+i] === 2 && dungeons[i].gotPrize())
					crystalCount++;
			if (crystalCount === 2) { //Can bomb cave open
				if (items.mirror) {
					var kill1 = canKillMostThings_path();
					var kill2 = {};
					if (hasHookshot() || items.icerod) //Bombos/ether req sword anyways
						kill2 = {ng:"a"};
					killpath = orCombiner(kill1, kill2);
					path3 = andCombiner(glitched("bigbomb"), glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, killpath, regions.SouthLightWorld());
				}
				var superb1 = {};
				if (items.mirror)
					superb1 = optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"};
				var superb2 = {};
				if (optionVariation !== "ohko" && optionVariation !== "timedohko")
					superb2 = optionLogic === "nmg" ? glitched("superbunny_hit") : {ng:"a"};
				superb_path = orCombiner(superb1, superb2);
				var kill1 = {}; //Sword beams
				var kill2 = canGetBee_path(); //Bee
				var kill3 = {}; //Hover
				if (hasSword(2))
					kill1 = {ng:"a"};
				if (hasSword())
					kill3 = glitched("hover");
				killpath = orCombiner(kill1, kill2, kill3);
				path2 = orCombiner(andCombiner(glitched("bigbomb"), superb_path, kill1, regions.SouthLightWorld()),
					andCombiner(glitched("bigbomb"), superb_path, kill2, regions.SouthLightWorld(undefined, undefined, bottleCount() - 1)));
				if (must_be_link)
					path2 = {};
			}
			return orCombiner(path1, path2, path3);
		}
	}
};
chests[24] = {
	name: "Ice Rod Cave",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "44.30%",
	y: "77.10%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canBombThings())
				return regions.SouthLightWorld();
			return {};
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Superbunny mirror
			var path3 = {}; //Superbunny hit
			if (canBombThings())
				path1 = regions.SouthLightWorld(true);
			var crystalCount = 0;
			for(var i = 0; i < 10; i++)
				if (qtyCounter["dungeonPrize"+i] === 2 && dungeons[i].gotPrize())
					crystalCount++;
			if (crystalCount === 2) { //Can bomb cave open
				if (items.mirror)
					path2 = andCombiner(glitched("bigbomb"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.SouthLightWorld());
				if (optionVariation !== "ohko" && optionVariation !== "timedohko")
					path3 = andCombiner(glitched("bigbomb"), optionLogic === "nmg" ? glitched("superbunny_hit") : {ng:"a"}, regions.SouthLightWorld());
			}
			return orCombiner(path1, path2, path3);
		}
	}
};
chests[25] = {
	name: "Hobo",
	hint: "<img src='images/flippers.png' class='mini'>",
	x: "35.09%",
	y: "69.63%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Waterwalk
			var path3 = {}; //Fake flipper
			var path4 = {}; //Fairy revive
			var path5 = {}; //Enemy RNG
			if (items.flippers)
				path1 = regions.SouthLightWorld();
			path2 = andCombiner(canWaterWalk_path(), regions.SouthLightWorld());
			path3 = andCombiner(canFakeFlipper_path(), regions.SouthLightWorld());
			//if (canBombThings())
			//	path4 = andCombiner(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
			//path5 = andCombiner(canGetFairy_path(), glitched("enemyfairy_fakeflipper"), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
			return orCombiner(path1, path2, path3, path4, path5);
		} else {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Waterwalk
					var path3 = {}; //Fake flipper
					var path4 = {}; //Revive via bomb
					var path5 = {}; //Surfing bunny via mirror
					var path6 = {}; //Surfing bunny via enemy RNG
					if (items.flippers)
						path1 = regions.SouthLightWorld(true);
					if (items.boots)
						path2 = andCombiner(glitched("waterwalk_boots"), regions.SouthLightWorld(true));
					path3 = andCombiner(glitched("fakeflipper"), regions.SouthLightWorld(true));
					if (canBombThings())
						path4 = andCombiner(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(true, undefined, bottleCount() - 1));
					if (items.mirror && items.flippers)
						path5 = andCombiner(glitched("surfingbunny_mirror"), regions.SouthLightWorld());
					path6 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombiner(path1, path2, path3, path4, path5, path6);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Surfing bunny via mirror
					var path3 = {}; //Surfing bunny via enemy RNG
					path1 = regions.SouthLightWorld(true);
					if (items.mirror && items.flippers)
						path2 = andCombiner(glitched("surfingbunny_mirror"), regions.SouthLightWorld());
					path3 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombiner(path1, path2, path3);
			}
		}
	}
};
chests[26] = {
	name: "Bombos Tablet",
	hint: "<img src='images/book.png' class='mini'><img src='images/sword2.png' class='mini'><img src='images/mirror.png' class='mini'> (check with <img src='images/book.png' class='mini'><img src='images/mirror.png' class='mini'>)",
	x: "10.83%",
	y: "91.39%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Get item from light
			var path2 = {}; //View item from light
			var path3 = {}; //Get item from dark
			var path4 = {}; //View item from dark
			if (items.book) {
				if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
					path1 = andCombiner(canBootsClip_path(), regions.SouthLightWorld());
				path2 = convertView(canBootsClip_path(), regions.SouthLightWorld());
				if (items.mirror) {
					if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
						path3 = andCombiner(regions.SouthDarkWorld(), regions.SouthLightWorld());
					path4 = convertView(andCombiner(regions.SouthDarkWorld(), regions.SouthLightWorld()));
				}
			}
			return orCombiner(path1, path2, path3, path4);
		} else {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			if (items.book
				&& (hasSword(2) || (optionSwords === "swordless" && items.hammer)))
				path1 = regions.SouthLightWorld();
			if (items.book)
				path2 = convertView(regions.SouthLightWorld());
			return orCombiner(path1, path2);
		}
	}
};
chests[27] = {
	name: "Cave 45",
	hint: "<img src='images/mirror.png' class='mini'>",
	x: "13.16%",
	y: "82.57%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //1f
			var path2 = {}; //Bootsclip
			var path3 = {}; //Dark world
			path1 = andCombiner(canOneFrameClipOW_path(), regions.SouthLightWorld());
			path2 = andCombiner(canBootsClip_path(), regions.SouthLightWorld());
			if (items.mirror)
				path3 = andCombiner(regions.SouthDarkWorld(), regions.SouthLightWorld());
			return orCombiner(path1, path2, path3);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					var path3 = {}; //Superbunny via hit
					var path4 = {}; //View
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = andCombiner(glitched("superbunny_mirror"), regions.SouthLightWorld());
					if (optionVariation !== "ohko" && optionVariation !== "timedohko")
						path3 = andCombiner(glitched("superbunny_hit"), regions.SouthLightWorld());
					path4 = convertView(regions.SouthLightWorld());
					return orCombiner(path1, path2, path3, path4);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny
					var path3 = {}; //View
					path1 = regions.SouthLightWorld(true);
					if (items.mirror || (optionVariation !== "ohko" && optionVariation !== "timedohko"))
						path2 = regions.SouthLightWorld();
					path3 = convertView(regions.SouthLightWorld());
					return orCombiner(path1, path2, path3);
			}
	}
};
chests[28] = {
	name: "Checkerboard Cave",
	hint: "<img src='images/flute.png' class='mini'><img src='images/glove2.png' class='mini'><img src='images/mirror.png' class='mini'>",
	x: "8.70%",
	y: "77.22%", //77.71%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted"){ 
			var path1 = {}; //1f
			var path2 = {}; //Bootsclip
			var path3 = {}; //Dark world
			if (canLiftRocks()) {
				path1 = andCombiner(canOneFrameClipOW_path(), regions.SouthLightWorld());
				path2 = andCombiner(canBootsClip_path(), regions.SouthLightWorld());
				if (items.mirror)
					path3 = andCombiner(regions.mire(), regions.SouthLightWorld());
			}
			return orCombiner(path1, path2, path3);
		} else {
			if (canLiftRocks())
				return regions.SouthLightWorld(true);
			return {};
		}
	}
};
chests[29] = {
	name: "Library",
	hint: "<img src='images/boots.png' class='mini'>",
	x: "7.73%",
	y: "65.80%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			if (items.boots)
				path1 = regions.SouthLightWorld();
			path2 = convertView(regions.SouthLightWorld());
			return orCombiner(path1, path2);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					var path3 = {}; //Superbunny via hit
					var path4 = {}; //View
					if (items.boots)
						path1 = regions.SouthLightWorld(true);
					if (items.mirror && items.boots)
						path2 = andCombiner(glitched("superbunny_mirror"), regions.SouthLightWorld());
					if (items.boots && optionVariation !== "ohko" && optionVariation !== "timedohko" && dungeons[11].isBeaten())
						path3 = andCombiner(glitched("superbunny_hit"), regions.SouthLightWorld());
					path4 = convertView(regions.SouthLightWorld());
					return orCombiner(path1, path2, path3, path4);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					var path3 = {}; //Superbunny via hit
					var path4 = {}; //View
					if (items.boots)
						path1 = regions.SouthLightWorld(true);
					if (items.mirror && items.boots)
						path2 = regions.SouthLightWorld();
					if (items.boots && optionVariation !== "ohko" && optionVariation !== "timedohko" && dungeons[11].isBeaten())
						path3 = andCombiner(glitched("library"), regions.SouthLightWorld());
					path4 = convertView(regions.SouthLightWorld());
					return orCombiner(path1, path2, path3, path4);
			}
	}
};
chests[30] = {
	name: "Maze Race",
	hint: "<img src='images/bombs.png' class='mini'>/<img src='images/boots.png' class='mini'>",
	x: "1.45%", //1.44%
	y: "70.12%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			if (canBombThings() || items.boots)
				path1 = regions.SouthLightWorld();
			path2 = convertView(regions.SouthLightWorld());
			return orCombiner(path1, path2);
		} else {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			if (canBombThings() || items.boots)
				path1 = regions.SouthLightWorld(true);
			path2 = convertView(regions.SouthLightWorld());
			return orCombiner(path1, path2);
		}
	}
};
chests[31] = {
	name: "Desert Ledge",
	hint: "<img src='images/book.png' class='mini'>/(<img src='images/flute.png' class='mini'><img src='images/glove2.png' class='mini'><img src='images/mirror.png' class='mini'>)",
	x: "1.45%", //1.25%
	y: "91.60%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			path1 = andCombiner(dungeons[1].isAccessible(), regions.SouthLightWorld());
			path2 = convertView(regions.SouthLightWorld());
			return orCombiner(path1, path2);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //Bunny
					var path3 = {}; //View item
					path1 = andCombiner(dungeons[1].isAccessible(), regions.SouthLightWorld(true));
					path2 = andCombiner(glitched("dungeonrevival"), dungeons[1].isAccessible(), regions.SouthLightWorld());
					path3 = convertView(regions.SouthLightWorld());
					return orCombiner(path1, path2, path3);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //Bootclip
					var path3 = {}; //View item
					path1 = andCombiner(dungeons[1].isAccessible(), regions.SouthLightWorld());
					if (items.boots)
						path2 = regions.SouthLightWorld(true);
					path3 = convertView(regions.SouthLightWorld());
					return orCombiner(path1, path2, path3);
			}
	}
};
chests[32] = {
	name: "Lake Hylia Island",
	hint: "<img src='images/flippers.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/mirror.png' class='mini'>",
	x: "35.87%",
	y: "82.62%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //1f
			var path2 = {}; //Bootsclip
			var path3 = {}; //From NE
			var path4 = {}; //From S
			var pathv = {}; //View item
			path1 = andCombiner(canOneFrameClipOW_path(), regions.SouthLightWorld());
			path2 = andCombiner(canBootsClip_path(), regions.SouthLightWorld());
			if (items.flippers && items.mirror) {
				path3 = andCombiner(orCombiner(canBunnySurf_path(), (items.moonpearl ? {ng:"a"} : {})),
					regions.northEastDarkWorld(), regions.SouthLightWorld());
				if (items.moonpearl)
					path4 = andCombiner(regions.SouthDarkWorld(), regions.northEastDarkWorld());
			}
			pathv = convertView(regions.SouthLightWorld());
			return orCombiner(path1, path2, path3, path4, pathv);
			//var path1 = {}; //Normal
			//var path2 = {}; //Surfing bunny from mirror, then wriggle
			//var path3 = {}; //Waterwalk
			//if (items.flippers && items.mirror) {
			//	path1 = andCombiner(orCombiner(regions.SouthDarkWorld(true), regions.northEastDarkWorld(true)), regions.SouthLightWorld());
			//	path2 = andCombiner(glitched("surfingbunny_mirror"), glitched("wriggle"), regions.northEastDarkWorld());
			// }
			//if (items.boots && items.mirror)
			//	path3 = andCombiner(glitched("waterwalk_boots"), regions.northWestDarkWorld(true));
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Waterwalk
					var path3 = {}; //Fake flippers
					var path4 = {}; //Bomb fairy revive
					var path5 = {}; //RNG fairy revive
					var pathv = {}; //View item
					if (items.flippers)
						path1 = regions.SouthLightWorld(true);
					if (items.boots)
						path2 = andCombiner(glitched("waterwalk_boots"), regions.SouthLightWorld(true));
					path3 = andCombiner(glitched("fakeflipper"), regions.SouthLightWorld(true));
					if (canBombThings())
						path4 = andCombiner(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(true, undefined, bottleCount() - 1));
					path5 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					pathv = regions.SouthLightWorld();
					return orCombiner(path1, path2, path3, path4, path5, pathv);
				default:
					var path3 = {}; //Fake flippers
					var path5 = {}; //RNG fairy revive
					var pathv = {}; //View item
					path3 = regions.SouthLightWorld(true);
					path5 = andCombiner(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					pathv = regions.SouthLightWorld();
					return orCombiner(path3, path5, pathv);
			}
	}
};
chests[33] = {
	name: "Sunken Treasure",
	x: "21.42%", //22.53%
	y: "93.14%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted")
			return regions.SouthLightWorld();
		else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = andCombiner(glitched("superbunny_mirror"), regions.SouthLightWorld());
					return orCombiner(path1, path2);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = regions.SouthLightWorld();
					return orCombiner(path1, path2);
			}
	}
};
chests[34] = {
	name: "Flute Spot",
	hint: "<img src='images/shovel.png' class='mini'>",
	x: "14.21%",
	y: "66.20%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (hasShovel())
			return regions.SouthLightWorld(true);
		return {};
	}
};

//West DeathMountain chests region
chests[35] = {
	name: "Old Man",
	hint: "<img src='images/lantern.png' class='mini'>",
	x: "20.11%",
	y: "18.92%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Dark back
			var path3 = {}; //Dark front
			if (items.lantern)
				path1 = regions.westDeathMountain();
			path2 = andCombiner(glitched("oldMan_back"), regions.westDeathMountain());
			if (canLiftRocks())
				path3 = andCombiner(glitched("oldMan"), regions.northWestLightWorld());
			return orCombiner(path1, path2, path3);
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Dark back
			var path3 = {}; //Dark front
			if (items.lantern)
				path1 = regions.westDeathMountain();
			path2 = andCombiner(glitched("oldMan_back"), regions.darkWestDeathMountain());
			if (canLiftRocks())
				path3 = andCombiner(glitched("oldMan"), regions.northWestDarkWorld());
			return orCombiner(path1, path2, path3);
		}
	}
};
chests[36] = {
	name: "Spectacle Rock Cave",
	x: "24.17%",
	y: "14.63%", //14.60%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.westDeathMountain();
	}
};
chests[37] = {
	name: "Ether Tablet",
	hint: "<img src='images/book.png' class='mini'><img src='images/sword2.png' class='mini'> + <img src='images/mirror.png' class='mini'>/(<img src='images/hammer.png' class='mini'><img src='images/hookshot2.png' class='mini'>) (check with <img src='images/book.png' class='mini'> + <img src='images/mirror.png' class='mini'>/(<img src='images/hammer.png' class='mini'><img src='images/hookshot2.png' class='mini'>))",
	x: "20.79%",
	y: "2.93%", //1.16%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			if (items.book) {
				if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
					path1 = andCombiner(dungeons[2].isAccessible(), regions.westDeathMountain());
				path2 = convertView(andCombiner(dungeons[2].isAccessible(), regions.westDeathMountain()));
			}
			return orCombiner(path1, path2);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.book && items.hammer && (optionSwords === "swordless" || hasSword(2)))
						path1 = regions.eastDeathMountain(true);
					if (items.book && items.hammer)
						path2 = convertView(regions.eastDeathMountain(true));
					return orCombiner(path1, path2);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.book && ((optionSwords === "swordless" && items.hammer)
						|| (optionSwords !== "swordless" && hasSword(2) && (items.hammer || items.boots))))
						path1 = regions.eastDeathMountain(true);
					if (items.book && ((optionSwords === "swordless" && items.hammer)
						|| (optionSwords !== "swordless" && (items.hammer || items.boots))))
						path2 = convertView(regions.eastDeathMountain(true));
					return orCombiner(path1, path2);
			}
	}
};
chests[38] = {
	name: "Spectacle Rock",
	hint: "<img src='images/mirror.png' class='mini'>",
	x: "25.24%",
	y: "8.79%", //8.76%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Get item
			var path2 = {}; //Bootsclip
			var path3 = {}; //1f
			var pathv = {}; //View item
			if (items.mirror)
				path1 = regions.westDeathMountain();
			path2 = canBootsClip_path();
			path3 = canOneFrameClipOW_path();
			pathv = convertView(regions.westDeathMountain());
			return orCombiner(path1, path2, path3, pathv);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.hammer)
						path1 = regions.eastDeathMountain(true);
					path2 = convertView(regions.westDeathMountain());
					return orCombiner(path1, path2);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.hammer || items.boots)
						path1 = regions.eastDeathMountain(true);
					path2 = convertView(regions.westDeathMountain());
					return orCombiner(path1, path2);
			}
	}
};

//East DeathMountain chests region
chests[39] = {
	name: "Spiral Cave",
	x: "39.15%", //39.45%
	y: "9.13%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted")
			return regions.eastDeathMountain();
		else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror w/sword
					var path3 = {}; //Superbunny via mirror w/bee
					var path4 = {}; //Superbunny via mirror
					var path5 = {}; //Unbunny via middle of TR
					path1 = regions.eastDeathMountain(true);
					if (items.mirror && hasSword())
						path2 = andCombiner(glitched("superbunny_mirror"), regions.eastDeathMountain());
					if (items.mirror)
						path3 = andCombiner(glitched("superbunny_mirror"), canGetBee_path(), regions.eastDeathMountain(undefined, undefined, bottleCount() - 1));
					if (items.mirror)
						path4 = andCombiner(glitched("superbunny_mirror"), glitched("spiralcave"), regions.eastDeathMountain());
					if (items.mirror)
						path5 = andCombiner(glitched("unbunny"), glitched("superbunny_mirror"), regions.eastDeathMountain());
					return orCombiner(path1, path2, path3, path4, path5);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror w/sword
					var path3 = {}; //Superbunny via mirror w/bee
					var path4 = {}; //Superbunny via mirror
					var path5 = {}; //Unbunny via middle of TR
					path1 = regions.eastDeathMountain(true);
					if (items.mirror && hasSword())
						path2 = regions.eastDeathMountain();
					if (items.mirror)
						path3 = andCombiner(glitched("true"), canGetBee_path(), regions.eastDeathMountain(undefined, undefined, bottleCount() - 1));
					if (items.mirror)
						path4 = andCombiner(glitched("spiralcave"), regions.eastDeathMountain());
					if (items.mirror)
						path5 = andCombiner(glitched("unbunny"), regions.eastDeathMountain());
					return orCombiner(path1, path2, path3, path4, path5);
			}
	}
};
chests[40] = { //TODO TR Key logic intelligence
	name: "Mimic Cave",
	hint: "<img src='images/mirror.png' class='mini'><img src='images/medallion0.png' class='mini'><img src='images/sword1.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/somaria.png' class='mini'><img src='images/glove2.png' class='mini'><img src='images/hammer.png' class='mini'> (possibly <img src='images/firerod.png' class='mini'>)",
	x: "42.06%", //41.76%
	y: "8.94%", //9.13%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Mirrorclip
			var path2 = {}; //Bootsclip
			var path3 = {}; //Possible through TR -- TODO: Key logic smarts
			if (items.hammer && items.mirror) {
				path1 = andCombiner(canMirrorClip_path(), regions.eastDeathMountain());
				if (items.moonpearl)
					path2 = andCombiner(canBootsClip_path(), regions.darkEastDeathMountain(), regions.eastDeathMountain());
				path3 = convertPossible(andCombiner(dungeons[9].isAccessible(), regions.eastDeathMountain()));
			}
			return orCombiner(path1, path2, path3);
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Unbunny
			if (items.hammer)
				path1 = regions.eastDeathMountain(true);
			if (items.hammer)
				path2 = andCombiner(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.eastDeathMountain());
			return orCombiner(path1, path2);
		}
	}
};
chests[41] = {
	name: "Paradox Cave Lower",
	family: "Paradox Cave Lower",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "42.25%", //42.35%
	y: "14.81%", //14.62%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canBombThings())
				return regions.eastDeathMountain();
			return {};
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Unbunny
			if (canBombThings())
				path1 = regions.eastDeathMountain(true);
			if (items.mirror && canBombThings())
				path2 = andCombiner(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.eastDeathMountain());
			return orCombiner(path1, path2);
		}
	}
};
chests[42] = {
	name: "Paradox Cave Upper",
	family: "Paradox Cave Upper",
	hint: "<img src='images/sword2.png' class='mini'>/<img src='images/allbow10.png' class='mini'>/<img src='images/blueboom.png' class='mini'>/<img src='images/bombs.png' class='mini'>/<img src='images/firerod.png' class='mini'>/<img src='images/icerod.png' class='mini'>/<img src='images/somaria.png' class='mini'>",
	x: "42.74%",
	y: "21.66%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Non-arrow
			var path2 = {}; //Arrow
			if (hasSword(2) || hasBoomerang() || canBombThings()
				|| items.firerod || items.icerod || items.somaria)
				path1 = regions.eastDeathMountain();
			path2 = andCombiner(canShootArrows_path(), regions.eastDeathMountain());
			return orCombiner(path1, path2);
		} else {
			var path1 = {}; //Non-arrow
			var path2 = {}; //Arrow
			var path3 = {}; //Unbunny non-arrow
			var path4 = {}; //Unbunny arrow
			if (hasSword(2) || hasBoomerang() || canBombThings()
				|| items.firerod || items.icerod || items.somaria)
				path1 = regions.eastDeathMountain(true);
			path2 = andCombiner(canShootArrows_path(), regions.eastDeathMountain(true));
			if (items.mirror) {
				if (hasSword(2) || hasBoomerang() || canBombThings()
					|| items.firerod || items.icerod || items.somaria)
					path3 = andCombiner(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.eastDeathMountain());
				path4 = andCombiner(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, canShootArrows_path(), regions.eastDeathMountain());
			}
			return orCombiner(path1, path2, path3, path4);
		}
	}
};
chests[43] = {
	name: "Floating Island",
	hint: "<img src='images/mirror.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/glove2.png' class='mini'><img src='images/bombs.png' class='mini'>",
	x: "40.13%",
	y: "2.93%", //1.37%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Bootsclip
			var path2 = {}; //NMG
			var pathv = {}; //View item
			path1 = andCombiner(canBootsClip_path(), regions.eastDeathMountain());
			if (items.mirror && items.moonpearl && canBombThings() && canLiftRocks())
				path2 = andCombiner(regions.darkEastDeathMountain(), regions.eastDeathMountain());
			pathv = convertView(regions.eastDeathMountain());
			return orCombiner(path1, path2, pathv);
		} else
			return regions.eastDeathMountain();
	}
};

//NorthEast DarkWorld chests region
chests[44] = {
	name: "Catfish",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/glove1.png' class='mini'>",
	x: "96.18%", //94.77%
	y: "16.78%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		/*from deDM
  spinspeed/bootsclip/(1f?)
  (to catfish)*/
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Bootsclip
			if (items.moonpearl) {
				if (canLiftRocks())
					path1 = regions.northEastDarkWorld();
				path2 = andCombiner(canBootsClip_path(), {});//regions.northEastDarkWorld());
			}
			return orCombiner(path1, path2);
		} else
			switch (optionLogic) {
				case "nmg":
					if (canLiftRocks())
						return regions.northEastDarkWorld();
					return {};
				default:
					var path1 = {}; //Dark world
					var path2 = {}; //Light world
					var path3 = {}; //Mirror from zora
					if (items.boots || canLiftRocks())
						path1 = regions.northEastDarkWorld();
					if (items.mirror)
						path2 = regions.northEastLightWorld(true);
					if (items.mirror)
						path3 = chests[2].isAvailable();
					return orCombiner(path1, path2, path3);
			}
	}
};
chests[45] = {
	name: "Pyramid",
	x: "79.50%", //79.20%
	y: "44.73%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northEastDarkWorld();
	}
};
chests[46] = {
	name: "Fat Fairy",
	family: "Fat Fairy",
	hint: "<img src='images/dungeon2.png' class='mini'><img src='images/dungeon2.png' class='mini'><img src='images/moonpearl.png' class='mini'> + <img src='images/hammer.png' class='mini'>/(<img src='images/mirror.png' class='mini'><img src='images/agahnim.png' class='mini'>)",
	x: "73.69%",
	y: "49.60%", //48.61%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false){
		if (bottles < 0) return {}; //Used too many bottles
	//	if (!newcalc) //return cache
	//		return region_cache_lookup("dNE", must_be_link, bottles);
		if (from_locs.indexOf("fatfairy") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("fatfairy"); //new array of visited locations (prevent infinite recursion)
		var crystalCount = 0;
		for(var i = 0; i < 10; i++)
			if (qtyCounter["dungeonPrize"+i] === 2 && dungeons[i].gotPrize())
				crystalCount++;
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Dupe via mirror
			var path3 = {}; //Dupe via waterwalk
			var path4 = {}; //Dupe via swim
			var path5 = {}; //Dupe via Qirn blob
			var path6 = {}; //Screenwrap mirror portal
			if (crystalCount === 2 && items.moonpearl) {
				if (items.hammer || (items.mirror && dungeons[11].isBeaten()))
					path1 = andCombiner(regions.SouthDarkWorld(undefined, new_locs, undefined, true), regions.northEastDarkWorld(undefined, new_locs, undefined, true));
				//if (items.mirror && items.flippers)
				//	path2 = andCombiner(glitched("bigbombdupe_mirror"), regions.SouthDarkWorld(true));
				//if (canLiftDarkRocks() && items.boots)
				//	path3 = andCombiner(glitched("bigbombdupe_transition"), glitched("waterwalk_boots"), regions.SouthDarkWorld(true));
				//if (canLiftDarkRocks() && items.flippers)
				//	path4 = andCombiner(glitched("bigbombdupe_swim"), regions.SouthDarkWorld(true));
				//if (canLiftDarkRocks() && (items.icerod || items.ether) && items.quake)
				//	path5 = andCombiner(glitched("bigbombdupe_hinox"), regions.SouthDarkWorld(true));
			}
			path6 = andCombiner(canSuperSpeed_path(), canMirrorClip_path(), regions.westDeathMountain(), regions.northEastDarkWorld(undefined, new_locs, undefined, true));
			return orCombiner(path1, path2, path3, path4, path5, path6);
		} else {
			if (crystalCount === 2 && items.mirror)
				return regions.SouthLightWorld();
			return {};
		}
	}
};

//NorthWest DarkWorld chests region
chests[47] = {
	name: "Brewery",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "55.89%",
	y: "58.37%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted")
			if (canBombThings())
				return andCombiner(orCombiner((items.moonpearl ? {ng:"a"} : {}), canOWYBA_path()),
					regions.northWestDarkWorld());
		else {
			if (canBombThings())
				return regions.northWestDarkWorld();
			return {};
		}
	}
};
chests[48] = {
	name: "C-Shaped House",
	x: "61.03%", //60.73%
	y: "48.22%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombiner(orCombiner((items.moonpearl ? {ng:"a"} : {}), canSuperBunny_path("mirror")),
			regions.northWestDarkWorld());
	}
};
chests[49] = {
	name: "Chest Game",
	hint: "<img src='images/stunprize2.png' class='mini'>x30",
	x: "52.31%", //53.00%
	y: "46.66%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombiner(orCombiner((items.moonpearl ? {ng:"a"} : {}), canSuperBunny_path("mirror")),
			regions.northWestDarkWorld());
	}
};
chests[50] = {
	name: "Hammer Pegs",
	hint: "<img src='images/glove2.png' class='mini'><img src='images/hammer.png' class='mini'>",
	x: "66.14%",
	y: "60.53%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Moat
			if (items.hammer) {
				if (canLiftDarkRocks())
					path1 = {ng:"a"};
				path2 = andCombiner(canFakeFlipper_path(), orCombiner(canOneFrameClipOW_path(), canBootsClip_path()));
			}
			return andCombiner(orCombiner(path1, path2), regions.northWestDarkWorld());
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Dark world
					var path2 = {}; //Light world
					if (items.hammer && canLiftDarkRocks())
						path1 = regions.northWestDarkWorld();
					if (items.hammer && items.mirror)
						path2 = andCombiner(regions.northWestDarkWorld(), regions.northWestLightWorld());
					return orCombiner(path1, path2);
				default:
					var path1 = {}; //Dark world
					var path2 = {}; //Light world
					if (items.hammer && (canLiftDarkRocks() || items.boots))
						path1 = regions.northWestDarkWorld();
					if (items.hammer && items.mirror)
						path2 = andCombiner(regions.northWestDarkWorld(), regions.northWestLightWorld());
					return orCombiner(path1, path2);
			}
	},
};
chests[51] = {
	name: "Bumper Cave",
	hint: "<img src='images/glove1.png' class='mini'><img src='images/cape.png' class='mini'>",
	x: "67.60%",
	y: "15.82%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			var path1 = {}; //Normal
			var path2 = {}; //Clip
			var pathv = {}; //View
			if (canLiftRocks() && items.cape)
				path1 = orCombiner((hasHookshot() ? {ng:"a"} : {}), canAdvancedItems_path());
			path2 = orCombiner(canOneFrameClipOW_path(), canBootsClip_path());
			pathv = convertView(regions.northWestDarkWorld());
			return orCombiner(andCombiner(orCombiner(path1, path2), regions.northWestDarkWorld()), pathv);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (canLiftRocks() && items.cape && items.mirror)
						path1 = regions.northWestLightWorld(true);
					path2 = convertView(regions.northWestDarkWorld());
					return orCombiner(path1, path2);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //Clip
					var path3 = {}; //View item
					if (canLiftRocks() && items.cape && items.mirror)
						path1 = regions.northWestLightWorld(true);
					if (items.boots)
						path2 = regions.northWestDarkWorld();
					path3 = convertView(regions.northWestDarkWorld());
					return orCombiner(path1, path2, path3);
			}
	}
};
chests[52] = {
	name: "Blacksmith",
	hint: "<img src='images/glove2.png' class='mini'> + <img src='images/stunprize2.png' class='mini'>x10",
	x: "57.92%",
	y: "66.16%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			if (canLiftDarkRocks())
				return andCombiner(orCombiner((items.mirror ? {ng:"a"} : {}), canAdvancedItems_path()), regions.northWestDarkWorld());
			return {};
			//var path2 = {}; //Screenwrap mirror portal
			//var path3 = {}; //Mirrorjump
			//var path4 = {}; //YBA
			//if (items.boots && items.mirror && (canBombThings() || items.flute))
			//	path2 = andCombiner(glitched("blacksmith_wrap"), regions.northWestDarkWorld(true));
			//if (items.mirror)
			//	path3 = andCombiner(glitched("mirrorjump"), regions.northWestDarkWorld());
			//if (hasABottle() && items.boots)
			//	path4 = andCombiner(glitched("OW_YBA"), regions.northWestDarkWorld(true, undefined, bottleCount() - 1));
			//return orCombiner(path1, path2, path3, path4);
		} else
			switch (optionLogic) {
				case "nmg":
					if (canLiftDarkRocks() || items.mirror)
						return regions.northWestLightWorld();
					return {};
				default:
					var path1 = {}; //Normal
					var path2 = {}; //YBA
					if (canLiftDarkRocks() || items.mirror)
						path1 = regions.northWestLightWorld();
					if (hasABottle() && items.boots)
						path2 = andCombiner(glitched("OW_YBA"), regions.northWestDarkWorld(undefined, undefined, bottleCount() - 1));
					return orCombiner(path1, path2);
			}
	}
};
chests[53] = {
	name: "Purple Chest",
	hint: "<img src='images/glove2.png' class='mini'>",
	x: "65.47%",
	y: "51.75%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (optionState !== "inverted") {
			return andCombiner(chests[52].isAvailable(),
				orCombiner((canLiftDarkRocks() ? {ng:"a"} : {}), canFakeFlipper_path()),
				regions.northWestDarkWorld());
			//var path2 = {}; //NE
			//var path3 = {}; //Mirrorwrap
			//if (items.boots)
			//	path2 = andCombiner(andCombiner(chests[52].isAvailable(), regions.northEastDarkWorld(true)), regions.northWestDarkWorld(true));
			//if (items.mirror)
			//	path3 = andCombiner(glitched("mirrorwrap"), chests[52].isAvailable(), regions.northWestDarkWorld());
		} else
			switch (optionLogic) {
				case "nmg":
					if (canLiftDarkRocks() || items.mirror)
						return andCombiner(chests[52].isAvailable(), regions.northWestLightWorld(), regions.SouthLightWorld());
					return {};
				default:
					if (canLiftDarkRocks() || items.mirror || items.boots)
						return andCombiner(chests[52].isAvailable(), regions.northWestLightWorld(), regions.SouthLightWorld());
					return {};
			}
	}
};

//South DarkWorld chests region
chests[54] = {
	name: "Hype Cave",
	family: "Hype Cave",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "80.07%",
	y: "77.88%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (canBombThings())
			return regions.SouthDarkWorld();
		return {};
	}
};
chests[55] = {
	name: "Stumpy",
	x: "65.76%",
	y: "67.69%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthDarkWorld();
	}
};
chests[56] = {
	name: "Digging Game",
	hint: "<img src='images/stunprize2.png' class='mini'>x80",
	x: "53.28%",
	y: "69.21%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthDarkWorld();
	}
};

//Mire DarkWorld chests region
chests[57] = {
	name: "Mire Shed",
	family: "Mire Shed",
	hint: "<img src='images/moonpearl.png' class='mini'>",
	x: "51.93%", //52.41%
	y: "80.05%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombiner(orCombiner((items.moonpearl ? {ng:"a"}:{}), canSuperBunny_path("mirror")), regions.mire());
		var path1 = {}; //Superbunny
		var path2 = {}; //1f DMA, then 1f DMD, then 1f into mire as Link
		var path3 = {}; //Superbunny by enemy hit
		if (items.moonpearl || items.mirror) //Added to get close to only mire req
			path1 = regions.mire();
		if (glitchedLinkInDarkWorld()) //Added, still have base mire reqs, link state outside and 1f back to mire
			path2 = regions.mire();
		if (qtyCounter.tunic > 1 || (qtyCounter.heart_full + (qtyCounter.heart_piece / 4) >= 4))
			path3 = regions.mire();
		return orCombiner(path1, path2, path3);
	}
};

//West DeathMountain DarkWorld chests region
chests[58] = {
	name: "Spike Cave",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/hammer.png' class='mini'><img src='images/glove1.png' class='mini'> + <img src='images/byrna.png' class='mini'>/(<img src='images/cape.png' class='mini'> + <img src='images/bottle0.png' class='mini'>/<img src='images/magic2.png' class='mini'>)",
	x: "78.91%",
	y: "14.65%", //14.62%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.moonpearl && items.hammer && canLiftRocks()
			&& ((canExtendMagic() && items.cape)
				|| items.byrna))
			return andCombiner(regions.westDeathMountain(), regions.darkWestDeathMountain());
		return {};
	}
};

//East DeathMountain DarkWorld chests region
chests[59] = {
	name: "Superbunny Cave",
	family: "Superbunny Cave",
	hint: "<img src='images/moonpearl.png' class='mini'>",
	x: "91.23%", //93.03%
	y: "15.01%", //14.62%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombiner(orCombiner((items.moonpearl ? {ng:"a"} : {}), canSuperBunny_path("fall")), regions.darkEastDeathMountain());
	}
};
chests[60] = {
	name: "Hookshot Cave - Bottom Right",
	hint: "<img src='images/moonpearl.png' class='mini'> + <img src='images/hookshot2.png' class='mini'>/<img src='images/boots.png' class='mini'>",
	x: "91.68%",
	y: "9.15%", //6.62%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		var path1 = {}; //gap
		var path2 = {}; //entry
		if (items.moonpearl) {
			path1 = orCombiner((hasHookshot() ? {ng:"a"} : {}), (items.boots ? glitched("hover") : {}), (items.boots ? canAdvancedItems_path() : {}));
			path2 = orCombiner((canLiftDarkRocks() ? {ng:"a"} : {}), canBootsClip_path());
		}
		return andCombiner(path1, path2, regions.darkEastDeathMountain());
	}
};
chests[61] = {
	name: "Hookshot Cave",
	family: "Hookshot Cave",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/hookshot2.png' class='mini'>",
	x: "91.68%",
	y: "3.30%", //6.62%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		var path1 = {}; //gap
		var path2 = {}; //entry
		if (items.moonpearl) {
			path1 = orCombiner((hasHookshot() ? {ng:"a"} : {}), (items.boots ? glitched("hover") : {}));
			path2 = orCombiner((canLiftDarkRocks() ? {ng:"a"} : {}), canBootsClip_path());
		}
		return andCombiner(path1, path2, regions.darkEastDeathMountain());
	}
};

//HyruleCastleEscape chests region
chests[62] = {
	name: "Sanctuary",
	x: "21.65%", //22.82%
	y: "26.74%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		switch (optionState) {
			case "open":
				return {ng:"a"};
			case "standard":
				return canKillMostThings_path(); //need a key, but guaranteed to get one in any mode
			case "inverted":
				return {};
		}
	}
};
chests[63] = {
	name: "Sewers - Secret Room",
	family: "Sewers - Secret Room",
	hint: "<img src='images/bombs.png' class='mini'>/<img src='images/boots.png' class='mini'>",
	x: "24.56%", //25.72%
	y: "29.25%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		switch (optionState) {
			case "open":
				var path1 = {}; //Graveyard
				var path2 = {}; //Front w/key
				var path3 = {}; //Front without key
				if (canBombThings() || items.boots) {
					if (canLiftRocks())
						path1 = {ng:"a"};
					if (qtyCounter.hc_sk >= 1)
						path2 = orCombiner((items.lantern ? {ng:"a"} : {}), glitched("sewers"), (items.firerod ? glitched("sewers_fr") : {}))
					if (optionVariation !== "keysanity" && optionVariation !== "mcs") //SK in map, dark cross, or sanctuary
						path3 = convertPossible(orCombiner((items.lantern ? {ng:"a"} : {}), glitched("sewers"), (items.firerod ? glitched("sewers_fr") : {})))
				}
				return orCombiner(path1, path2, path3);
			case "standard":
				if (canBombThings() || items.boots) //need a key, but guaranteed to get one in any mode
					return canKillEscapeThings_path();
				return {};
			case "inverted":
				return {};
		}
	}
};
chests[64] = {
	name: "Sewers - Dark Cross",
	x: "24.75%",
	y: "48.80%", //43.92%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		switch (optionState) {
			case "open":
				var path1 = {}; //Lamp
				var path2 = {}; //Fire rod
				var path3 = {}; //Back fire rod
				var path4 = {}; //Dark
				var path5 = {}; //Dark back
				if (items.lantern)
					path1 = {ng:"a"};
				if (items.firerod) {
					path2 = canAdvancedItems_path();
					if (canLiftRocks())
						path3 = glitched("darkCross_back_fr");
				}
				path4 = glitched("darkCross_front");
				if (canLiftRocks())
					path5 = glitched("darkCross_back");
				return orCombiner(path1, path2, path3, path4, path5);
			case "standard":
				return canKillEscapeThings_path();
			case "inverted":
				return {};
		}
	}
};
chests[65] = {
	name: "Hyrule Castle",
	family: "Hyrule Castle",
	x: "24.75%",
	y: "54.66%", //43.92%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		switch (optionState) {
			case "open":
				var path1 = {}; //Map
				var path2 = {}; //Boomerang, Zelda
				path1 = {ng:"a"};
				if (qtyCounter.hc_sk >= 1)
					path2 = {ng:"a"};
				else
					path2 = anyOrAllCombiner([path1, chests[63].isAvailable(), chests[64].isAvailable()]);
				return multipleChests([path1, path2]);
			case "standard":
				return canKillEscapeThings_path();
			case "inverted":
				return {};
		}
	}
};
chests[66] = { //Some funny, not understood logic regarding Sanc here
	name: "Link's Uncle / Secret Passage",
	x: "29.49%",
	y: "41.55%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		switch (optionState) {
			case "open":
				return {ng:"a"};
			case "standard":
				var path1 = {}; //Secret passage
				var path2 = {}; //Link's Uncle
				path1 = canKillEscapeThings_path();
				path2 = {ng:"a"};
				return multipleChests([path1, path2]);
			case "inverted":
				return {};
		}
	}
};

//Bug: NMG, Dark Lake Hylia fairy doesn't require moon pearl, but all the other entrances do
//	Issue #666 filed
//Bug: glitched, NE entrances inherit moon pearl requirements from NMG, but shouldn't have that requirements
//	Issue #666 filed
//Bug: glitched, south dark entrances don't have any requirements (need requirements like nmg)
//	Issue #666 filed
//Bug: All, Dark shopping mall can only flipper from south dark world, not northeast dark world
//	Issue #666 filed
//Bug: Dark death mountain fairy is in MG logic with just dark WDM entry, which is always true
//	Issue #666 filed
var entrances = new Array;
entrances[0] = {
	name: "Lumberjack House",
	x: "17.37%", //16.63%
	y: "6.03%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[1] = {
	name: "Lost Woods Gamble",
	x: "9.18%",
	y: "2.08%", //1.54%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[2] = {
	name: "Fortune Teller (Light)",
	x: "9.28%",
	y: "32.18%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[3] = {
	name: "Snitch Lady West",
	x: "2.52%",
	y: "47.54%", //46.66%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[4] = {
	name: "Snitch Lady East",
	x: "10.25%",
	y: "48.22%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[5] = {
	name: "Bush Covered House",
	x: "10.22%", //10.05%
	y: "53.27%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[6] = {
	name: "Bomb Hut",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "1.35%",
	y: "59.52%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (canBombThings())
			return regions.northWestLightWorld();
		return {};
	}
}
entrances[7] = {
	name: "Kakariko Gamble Game",
	x: "10.63%",
	y: "70.07%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthLightWorld();
	}
}
entrances[8] = {
	name: "Bonk Fairy (Light)",
	hint: "<img src='images/boots.png' class='mini'>",
	x: "23.40%",
	y: "65.19%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.boots)
			return regions.SouthLightWorld();
		return {};
	}
}
entrances[9] = {
	name: "Desert Fairy",
	x: "13.74%",
	y: "89.21%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthLightWorld();
	}
}
entrances[10] = {
	name: "50 Rupee Cave",
	hint: "<img src='images/glove1.png' class='mini'>",
	x: "15.48%",
	y: "95.65%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (canLiftRocks())
			return regions.SouthLightWorld();
		return {};
	}
}
entrances[11] = {
	name: "Light Hype Fairy",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "29.60%",
	y: "77.88%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (canBombThings())
			return regions.SouthLightWorld();
		return {};
	}
}
entrances[12] = {
	name: "Lake Hylia Fortune Teller",
	x: "32.10%",
	y: "80.22%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthLightWorld();
	}
}
entrances[13] = {
	name: "Lake Hylia Fairy",
	x: "40.81%",
	y: "64.62%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northEastLightWorld();
	}
}
entrances[14] = {
	name: "Long Fairy Cave",
	x: "48.56%",
	y: "70.07%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northEastLightWorld();
	}
}
entrances[15] = {
	name: "Good Bee Cave",
	x: "46.78%", //45.27%
	y: "77.10%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthLightWorld();
	}
}
entrances[16] = {
	name: "20 Rupee Cave",
	hint: "<img src='images/glove1.png' class='mini'>",
	x: "44.69%",
	y: "82.10%", //78.47%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (canLiftRocks())
			return regions.SouthLightWorld();
		return {};
	}
}
entrances[17] = {
	name: "Hookshot Fairy",
	x: "40.07%", //41.77%
	y: "14.60%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.eastDeathMountain();
	}
}
entrances[18] = {
	name: "Fortune Teller (Dark)",
	x: "59.76%",
	y: "32.20%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
}
entrances[19] = {
	name: "Archery Game",
	x: "61.12%",
	y: "70.09%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthDarkWorld();
	}
}
entrances[20] = {
	name: "Dark Sanctuary Hint",
	x: "73.30%",
	y: "27.51%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
}
entrances[21] = {
	name: "Bonk Fairy (Dark)",
	hint: "<img src='images/boots.png' class='mini'>",
	x: "73.34%",
	y: "65.21%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.boots)
			return regions.SouthDarkWorld();
		return {};
	}
}
entrances[22] = {
	name: "Dark Desert Fairy",
	x: "60.22%", //55.89%
	y: "80.05%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombiner(orCombiner((items.moonpearl ? {ng:"a"}:{}), canSuperBunny_path("mirror")), regions.mire());
	}
}
entrances[23] = {
	name: "Dark Desert Hint",
	x: "60.34%",
	y: "83.59%", //82.59%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombiner(orCombiner((items.moonpearl ? {ng:"a"}:{}), canSuperBunny_path("mirror")), regions.mire());
	}
}
entrances[24] = {
	name: "Dark Lake Hylia Fairy",
	x: "91.29%",
	y: "64.62%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northEastDarkWorld();
	}
}
entrances[25] = {
	name: "Palace of Darkness Hint",
	x: "92.55%",
	y: "50.17%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.moonpearl)
			return regions.northEastDarkWorld();
		return {};
	}
}
entrances[26] = {
	name: "East Dark World Hint",
	x: "99.03%",
	y: "70.09%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.moonpearl)
			return regions.northEastDarkWorld();
		return {};
	}
}
entrances[27] = {
	name: "Dark Lake Hylia Ledge Fairy",
	hint: "<img src='images/bombs.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/flippers.png' class='mini'>",
	x: "94.38%", //94.77%
	y: "77.12%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.flippers && canBombThings())
			return regions.SouthDarkWorld();
		return {};
		/*case "owg":
			var path1 = {}; //South flippers
			var path2 = {}; //NE surfing or wriggle to transition
			var path3 = {}; //Portal 5 bootsclip
			var path4 = {}; //Lake Hylia setup mapwrap
			if (items.moonpearl && items.flippers && canBombThings()) //Added -- logic bug in app says no req
				path1 = regions.SouthDarkWorld();
			if (items.flippers && items.mirror && canBombThings() && items.moonpearl) //Added -- surfing bunny in logic per Lake Hylia item
				path2 = regions.northEastDarkWorld();
			if (items.moonpearl && items.boots && canBombThings()) //Added -- maximum flexibility to get close to no req
				path3 = regions.northEastDarkWorld();
			if (items.moonpearl && items.boots && canBombThings()) //Added -- maximum flexibility to get close to no req
				path4 = regions.SouthDarkWorld();
			return orCombiner(path1, path2, path3, path4);
		default:
			var path1 = {}; //South flippers
			var path2 = {}; //NE surfing or wriggle to transition
			var path3 = {}; //Portal 5 1f up to ledge, citrus to map wrap, jump up to get FAWT
			var path4 = {}; //Lake Hylia setup mapwrap
			if (glitchedLinkInDarkWorld() && items.flippers && canBombThings()) //Added -- logic bug in app says no req
				path1 = regions.SouthDarkWorld();
			if (items.flippers && items.mirror && canBombThings() && glitchedLinkInDarkWorld()) //Added -- surfing bunny in logic per Lake Hylia item
				path2 = regions.northEastDarkWorld();
			if (canBombThings() && glitchedLinkInDarkWorld()) //Added -- maximum flexibility to get close to no req
				path3 = regions.northEastDarkWorld();
			if (glitchedLinkInDarkWorld() && items.boots && canBombThings()) //Added -- maximum flexibility to get close to no req
				path4 = regions.SouthDarkWorld();
			return orCombiner(path1, path2, path3, path4);*/
	}
}
entrances[28] = {
	name: "Dark Lake Hylia Ledge Hint",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/flippers.png' class='mini'>",
	x: "96.13%", //95.74%
	y: "77.12%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.flippers)
			return regions.SouthDarkWorld();
		return {};
	}
}
entrances[29] = {
	name: "Dark Lake Hylia Ledge Spike Cave",
	hint: "<img src='images/glove1.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/flippers.png' class='mini'>",
	x: "95.16%",
	y: "80.30%", //78.49%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.flippers && canLiftRocks())
			return regions.SouthDarkWorld();
		return {};
	}
}
entrances[30] = {
	name: "Dark Death Mountain Fairy",
	x: "70.59%",
	y: "18.92%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.moonpearl)
			return andCombiner(regions.westDeathMountain(), regions.darkWestDeathMountain());
		return {};
	}
}
/*entrances[31] = { //This is now always a capacity store
	name: "Capacity Upgrade",
	hint: "<img src='images/flippers.png' class='mini'>",
	x: "39.26%",
	y: "85.33%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombiner(orCombiner(canFakeFlipper_path(), (items.flippers ? {ng:"a"} : {})),
			regions.SouthLightWorld());
	}
}*/

//Bug: Dark world outcast shop in logic without hammer for glitched modes
//	Issue #666 filed
//Bug: Dark world death mountain shop is in NMG logic with no moon pearl
//	Issue #666 filed
//Bug: Dark world potion shop needs just inherits NMG logic, which seems wrong (should be similar to catfish logic)
//	Issue #666 filed
var shops = new Array;
shops[0] = {
	name: "Light World Kakariko Shop",
	x: "5.41%",
	y: "59.08%", //58.35%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
shops[1] = {
	name: "Light World Lake Hylia Shop",
	x: "35.97%",
	y: "76.71%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthLightWorld();
	}
}
shops[2] = {
	name: "Light World Death Mountain Shop",
	hint: "<img src='images/bombs.png' class='mini'>",
	x: "42.25%", //42.66%
	y: "14.81%", //14.62%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (canBombThings())
			return regions.eastDeathMountain();
		return {};
	}
}
shops[3] = {
	name: "Dark World Potion Shop",
	hint: "<img src='images/moonpearl.png' class='mini'> + <img src='images/glove1.png' class='mini'>/<img src='images/hammer.png' class='mini'>/<img src='images/flippers.png' class='mini'>",
	x: "90.32%",
	y: "33.76%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(must_be_link = false, from_locs = [], bottles = bottleCount(), newcalc = false){
		if (bottles < 0) return {}; //Used too many bottles
		//if (!newcalc) //return cache
		//	return region_cache_lookup("wDM", must_be_link, bottles);
		if (from_locs.indexOf("darkPotionShop") !== -1) //already visited
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("darkPotionShop"); //new array of visited locations (prevent infinite recursion)
		return AccurateLogic(andCombiner([items.moonpearl && (canLiftRocks() || items.hammer || items.flippers),
				regions.northEastDarkWorld(undefined, new_locs, undefined, newcalc)]),
			orCombiner([andCombiner([canLiftRocks(), regions.northEastDarkWorld(2, new_locs, bottles, newcalc)]),
				andCombiner([items.hammer, regions.northEastDarkWorld(true, new_locs, bottles, newcalc)]),
				andCombiner([orCombiner([items.flippers, canFakeFlipper_path()]),
					orCombiner([regions.northEastDarkWorld(true, new_locs, bottles, newcalc),
						regions.SouthDarkWorld(true, new_locs, bottles, newcalc),
						chests[44].isAvailable(true, new_locs, bottles, newcalc)])]),
				andCombiner([canBunnyRevive_path(), canGetFairy_path(1, true, new_locs),
					orCombiner([regions.northEastDarkWorld(undefined, new_locs, bottles - 1, newcalc),
						regions.SouthDarkWorld(undefined, new_locs, bottles - 1, newcalc),
						chests[44].isAvailable(undefined, new_locs, bottles - 1, newcalc)])]),
				andCombiner([canMirrorWrap_path(), must_be_link !== false ? items.moonpearl : true,
					regions.northWestDarkWorld(undefined, new_locs, bottles, newcalc)]),
				andCombiner([orCombiner([canSuperSpeed_path(), canBootsClip_path()]),
					regions.darkEastDeathMountain(true, new_locs, bottles, newcalc)]),
				andCombiner([canOneFrameClipOW_path(), regions.darkEastDeathMountain(must_be_link !== false, new_locs, bottles, newcalc)]),
				andCombiner([canBootsClip_path(), items.mirror && must_be_link === false,
					regions.darkEastDeathMountain(false, new_locs, bottles, newcalc)])]));
	}
/*from NW
  mirror wrap (to potion shop)
from deDM
  spinspeed/bootsclip/1f fawt
  (to potion shop)
  from catfish?*/
}
shops[4] = {
	name: "Dark World Forest Shop",
	x: "66.92%",
	y: "45.87%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
}
shops[5] = {
	name: "Dark World Lumberjack Hut Shop",
	x: "67.11%",
	y: "5.64%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
}
shops[6] = {
	name: "Dark World Lake Hylia Shop",
	x: "82.59%",
	y: "80.25%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.SouthDarkWorld();
	}
}
shops[7] = {
	name: "Dark World Outcasts Shop",
	hint: "<img src='images/hammer.png' class='mini'>",
	x: "60.54%",
	y: "53.30%",
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		if (items.hammer)
			return regions.northWestDarkWorld();
		return {};
	}
}
shops[8] = {
	name: "Dark World Death Mountain Shop",
	x: "93.71%", //92.84%
	y: "14.92%", //14.62%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return regions.darkEastDeathMountain();
	}
}

var uw_poi = new Array;
uw_poi[0] = {
	name: "EP - Compass Chest",
	x: "7%",
	y: "23%",
	dungeon: 0, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[1] = {
	name: "EP - Big Chest",
	x: "50%",
	y: "29%",
	dungeon: 0, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[2] = {
	name: "EP - Cannonball Chest",
	x: "60%",
	y: "52%",
	dungeon: 0, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[3] = {
	name: "EP - Big Key Chest",
	x: "25.5%",
	y: "45%",
	dungeon: 0, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[4] = {
	name: "EP - Map Chest",
	x: "95%",
	y: "35%",
	dungeon: 0, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[5] = {
	name: "EP - Boss",
	x: "25%",
	y: "75%",
	dungeon: 0, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[6] = {
	name: "EP - Dark Square Pot Key",
	x: "96.5%",
	y: "44%",
	dungeon: 0, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[7] = {
	name: "EP - Dark Eyegore Key Drop",
	x: "52%",
	y: "14.5%",
	dungeon: 0, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[8] = {
	name: "EP - Lobby Bridge N",
	x: "50.3%",
	y: "62%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[9] = {
	name: "EP - Cannonball S",
	x: "50.3%",
	y: "59%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[10] = {
	name: "EP - Cannonball N",
	x: "50.3%",
	y: "42%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[11] = {
	name: "EP - Courtyard Ledge S",
	x: "50.3%",
	y: "39%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[12] = {
	name: "EP - Courtyard Ledge E",
	x: "64.5%",
	y: "30.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[13] = {
	name: "EP - Courtyard Ledge W",
	x: "36%",
	y: "30.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[14] = {
	name: "EP - East Wing W",
	x: "69.5%",
	y: "30.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[15] = {
	name: "EP - West Wing E",
	x: "31%",
	y: "30.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[16] = {
	name: "EP - Hint Tile EN",
	x: "31%",
	y: "25.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[17] = {
	name: "EP - Hint Tile Blocked Path SE",
	x: "25.4%",
	y: "39%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[18] = {
	name: "EP - Courtyard WN",
	x: "36%",
	y: "25.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[19] = {
	name: "EP - Courtyard EN",
	x: "64.5%",
	y: "25.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[20] = {
	name: "EP - Courtyard N",
	x: "50.3%",
	y: "22%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[21] = {
	name: "EP - Map Valley WN",
	x: "69.5%",
	y: "25.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[22] = {
	name: "EP - Map Valley SW",
	x: "75.3%",
	y: "39%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[23] = {
	name: "EP - Dark Square NW",
	x: "75.3%",
	y: "42%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[24] = {
	name: "EP - Dark Square Key Door WN",
	x: "69.5%",
	y: "45.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[25] = {
	name: "EP - Cannonball Ledge Key Door EN",
	x: "64.5%",
	y: "45.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[26] = {
	name: "EP - Cannonball Ledge WN",
	x: "36%",
	y: "45.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[27] = {
	name: "EP - Eastern Big Key EN",
	x: "31%",
	y: "45.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[28] = {
	name: "EP - Eastern Big Key NE",
	x: "25.4%",
	y: "42%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[29] = {
	name: "EP - Darkness S",
	x: "50.3%",
	y: "19%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[30] = {
	name: "EP - Darkness Up Stairs",
	x: "42%",
	y: "12%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[31] = {
	name: "EP - Attic Start Down Stairs",
	x: "75.3%",
	y: "92%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[32] = {
	name: "EP - Attic Start WS",
	x: "69.5%",
	y: "95.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[33] = {
	name: "EP - False Switches ES",
	x: "64.5%",
	y: "95.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[34] = {
	name: "EP - Cannonball Hell WS",
	x: "36%",
	y: "95.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[35] = {
	name: "EP - Single Eyegore ES",
	x: "31%",
	y: "95.5%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[36] = {
	name: "EP - Duo Eyegores NE",
	x: "25.4%",
	y: "82%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[37] = {
	name: "EP - Eastern Boss SE",
	x: "25.4%",
	y: "79%",
	dungeon: 0, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[38] = {
	name: "EP - Telepathic Tile",
	x: "25.4%",
	y: "24%",
	dungeon: 0, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[0].isAccessible();
	}
}
uw_poi[39] = {
	name: "DP - Big Chest",
	x: "31.2%",
	y: "56%",
	dungeon: 1, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[40] = {
	name: "DP - Map Chest",
	x: "62.5%",
	y: "56%",
	dungeon: 1, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[41] = {
	name: "DP - Torch",
	x: "41%",
	y: "55%",
	dungeon: 1, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[42] = {
	name: "DP - Big Key Chest",
	x: "93.7%",
	y: "54%",
	dungeon: 1, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[43] = {
	name: "DP - Compass Chest",
	x: "93.7%",
	y: "80%",
	dungeon: 1, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[44] = {
	name: "DP - Boss",
	x: "6%",
	y: "19%",
	dungeon: 1, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[45] = {
	name: "DP - Desert Tiles 1 Pot Key",
	x: "3%",
	y: "85%",
	dungeon: 1, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[46] = {
	name: "DP - Beamos Hall Pot Key",
	x: "20%",
	y: "59%",
	dungeon: 1, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[47] = {
	name: "DP - Desert Tiles 2 Pot Key",
	x: "22%",
	y: "41%",
	dungeon: 1, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[48] = {
	name: "DP - Compass NW",
	x: "94%",
	y: "77.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[49] = {
	name: "DP - Cannonball S",
	x: "94%",
	y: "73.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[50] = {
	name: "DP - Tiles 1 Up Stairs",
	x: "6.5%",
	y: "77.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[51] = {
	name: "DP - Bridge Down Stairs",
	x: "6.5%",
	y: "52.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[52] = {
	name: "DP - Beamos Hall NE",
	x: "19%",
	y: "52.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[53] = {
	name: "DP - Tiles 2 SE",
	x: "19%",
	y: "48.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[54] = {
	name: "DP - Wall Slide NW",
	x: "6.5%",
	y: "27.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[55] = {
	name: "DP - Boss SW",
	x: "6.5%",
	y: "23.5%",
	dungeon: 1, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[56] = {
	name: "DP - Telepathic Tile",
	x: "43.7%",
	y: "52.7%",
	dungeon: 1, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[1].isAccessible();
	}
}
uw_poi[57] = {
	name: "Hera - Big Key Chest",
	x: "87.5%",
	y: "94%",
	dungeon: 2, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[58] = {
	name: "Hera - Basement Cage",
	x: "63%",
	y: "94%",
	dungeon: 2, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[59] = {
	name: "Hera - Map Chest",
	x: "75%",
	y: "41%",
	dungeon: 2, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[60] = {
	name: "Hera - Compass Chest",
	x: "25%",
	y: "86.3%",
	dungeon: 2, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[61] = {
	name: "Hera - Big Chest",
	x: "25%",
	y: "72%",
	dungeon: 2, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[62] = {
	name: "Hera - Boss",
	x: "25%",
	y: "18%",
	dungeon: 2, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[63] = {
	name: "Hera - Lobby Down Stairs",
	x: "64%",
	y: "56%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[64] = {
	name: "Hera - Basement Cage Up Stairs",
	x: "64%",
	y: "88%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[65] = {
	name: "Hera - Lobby Key Stairs",
	x: "63%",
	y: "38%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[66] = {
	name: "Hera - Tile Room Up Stairs",
	x: "63%",
	y: "70%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[67] = {
	name: "Hera - Lobby Up Stairs",
	x: "86%",
	y: "56%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[68] = {
	name: "Hera - Beetles Down Stairs",
	x: "86%",
	y: "21%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[69] = {
	name: "Hera - Startile Wide Up Stairs",
	x: "94%",
	y: "8%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[70] = {
	name: "Hera - 4F Down Stairs",
	x: "44%",
	y: "75%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[71] = {
	name: "Hera - 4F Up Stairs",
	x: "7%",
	y: "75%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[72] = {
	name: "Hera - 5F Down Stairs",
	x: "7%",
	y: "42%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[73] = {
	name: "Hera - 5F Up Stairs",
	x: "43%",
	y: "42%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[74] = {
	name: "Hera - Boss Down Stairs",
	x: "43%",
	y: "8%",
	dungeon: 2, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[75] = {
	name: "Hera - Telepathic Tile Entrance",
	x: "75%",
	y: "49%",
	dungeon: 2, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[76] = {
	name: "Hera - Telepathic Tile Floor 4",
	x: "25%",
	y: "83.5%",
	dungeon: 2, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[2].isAccessible();
	}
}
uw_poi[77] = {
	name: "PoD - Shooter Room",
	x: "10%",
	y: "84%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[78] = {
	name: "PoD - Big Key Chest",
	x: "37.5%",
	y: "57%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[79] = {
	name: "PoD - The Arena - Ledge",
	x: "47%",
	y: "41.5%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[80] = {
	name: "PoD - The Arena - Bridge",
	x: "43.5%",
	y: "42%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[81] = {
	name: "PoD - Stalfos Basement",
	x: "12%",
	y: "59%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[82] = {
	name: "PoD - Map Chest",
	x: "56.2%",
	y: "45%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[83] = {
	name: "PoD - Big Chest",
	x: "29%",
	y: "12%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[84] = {
	name: "PoD - Compass Chest",
	x: "44%",
	y: "6.5%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[85] = {
	name: "PoD - Harmless Hellway",
	x: "40%",
	y: "19%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[86] = {
	name: "PoD - Dark Basement - Left",
	x: "90%",
	y: "68%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[87] = {
	name: "PoD - Dark Basement - Right",
	x: "97%",
	y: "68%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[88] = {
	name: "PoD - Dark Maze - Top",
	x: "13%",
	y: "3%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[89] = {
	name: "PoD - Dark Maze - Bottom",
	x: "22%",
	y: "21%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[90] = {
	name: "PoD - Boss",
	x: "93.7%",
	y: "44%",
	dungeon: 3, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[91] = {
	name: "PoD - Left Cage Down Stairs",
	x: "31.5%",
	y: "77.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[92] = {
	name: "PoD - Shooter Room Up Stairs",
	x: "6.5%",
	y: "77.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[93] = {
	name: "PoD - Middle Cage N",
	x: "37.7%",
	y: "77.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[94] = {
	name: "PoD - Pit Room S",
	x: "37.7%",
	y: "73.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[95] = {
	name: "PoD - Middle Cage Down Stairs",
	x: "44%",
	y: "77.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[96] = {
	name: "PoD - Warp Room Up Stairs",
	x: "19%",
	y: "77.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[97] = {
	name: "PoD - Pit Room NW",
	x: "31.5%",
	y: "52.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[98] = {
	name: "PoD - Pit Room NE",
	x: "44%",
	y: "52.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[99] = {
	name: "PoD - Basement Ledge Up Stairs",
	x: "12.7%",
	y: "52.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[100] = {
	name: "PoD - Big Key Landing Down Stairs",
	x: "37.7%",
	y: "52.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[101] = {
	name: "PoD - Mimics 1 NW",
	x: "56.4%",
	y: "77.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[102] = {
	name: "PoD - PoD Conveyor SW",
	x: "56.4%",
	y: "73.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[103] = {
	name: "PoD - Arena Main SW",
	x: "31.5%",
	y: "49%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[104] = {
	name: "PoD - Arena Bridge SE",
	x: "44%",
	y: "49%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[105] = {
	name: "PoD - Arena Ledge ES",
	x: "48.5%",
	y: "44.3%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[106] = {
	name: "PoD - Map Balcony WS",
	x: "51.5%",
	y: "44.3%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[107] = {
	name: "PoD - Arena Crystals E",
	x: "47.5%",
	y: "38%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[108] = {
	name: "PoD - Sexy Statue W",
	x: "53%",
	y: "38%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[109] = {
	name: "PoD - Arena Main NW",
	x: "31.5%",
	y: "27.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[110] = {
	name: "PoD - Falling Bridge SW",
	x: "31.5%",
	y: "24%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[111] = {
	name: "PoD - Falling Bridge WN",
	x: "26.5%",
	y: "7%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[112] = {
	name: "PoD - Dark Maze EN",
	x: "23.5%",
	y: "7%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[113] = {
	name: "PoD - Dark Maze E",
	x: "23.5%",
	y: "13%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[114] = {
	name: "PoD - Big Chest Balcony W",
	x: "26.5%",
	y: "13%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[115] = {
	name: "PoD - Harmless Hellway SE",
	x: "44%",
	y: "24%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[116] = {
	name: "PoD - Arena Main NE",
	x: "44%",
	y: "27.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[117] = {
	name: "PoD - Compass Room W Down Stairs",
	x: "41.5%",
	y: "2.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[118] = {
	name: "PoD - Dark Basement W Up Stairs",
	x: "91.5%",
	y: "52.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[119] = {
	name: "PoD - Dark Basement E Up Stairs",
	x: "96.2%",
	y: "52.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[120] = {
	name: "PoD - Compass Room E Down Stairs",
	x: "46.2%",
	y: "2.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[121] = {
	name: "PoD - Sexy Statue NW",
	x: "56.4%",
	y: "27.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[122] = {
	name: "PoD - Mimics 2 SW",
	x: "56.4%",
	y: "24%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[123] = {
	name: "PoD - Dark Alley NE",
	x: "93.9%",
	y: "52.5%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[124] = {
	name: "PoD - Boss SE",
	x: "93.9%",
	y: "49%",
	dungeon: 3, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[125] = {
	name: "PoD - Telepathic Tile",
	x: "68.9%",
	y: "77.5%",
	dungeon: 3, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[3].isAccessible();
	}
}
uw_poi[126] = {
	name: "SP - Entrance",
	x: "87%",
	y: "45%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[127] = {
	name: "SP - Big Chest",
	x: "49.6%",
	y: "70%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[128] = {
	name: "SP - Big Key Chest",
	x: "27%",
	y: "65.5%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[129] = {
	name: "SP - Map Chest",
	x: "73%",
	y: "65.5%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[130] = {
	name: "SP - West Chest",
	x: "7%",
	y: "65.5%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[131] = {
	name: "SP - Compass Chest",
	x: "45%",
	y: "84%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[132] = {
	name: "SP - Flooded Room - Left",
	x: "72%",
	y: "54%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[133] = {
	name: "SP - Flooded Room - Right",
	x: "75.5%",
	y: "54%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[134] = {
	name: "SP - Waterfall Room",
	x: "71%",
	y: "35%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[135] = {
	name: "SP - Boss",
	x: "45%",
	y: "15%",
	dungeon: 4, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[136] = {
	name: "SP - Pot Row Pot Key",
	x: "86%",
	y: "72%",
	dungeon: 4, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[137] = {
	name: "SP - Trench 1 Pot Key",
	x: "70%",
	y: "64%",
	dungeon: 4, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[138] = {
	name: "SP - Hookshot Pot Key",
	x: "57.5%",
	y: "70.5%",
	dungeon: 4, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[139] = {
	name: "SP - Trench 2 Pot Key",
	x: "30%",
	y: "64%",
	dungeon: 4, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[140] = {
	name: "SP - Waterway Pot Key",
	x: "58%",
	y: "32.5%",
	dungeon: 4, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[141] = {
	name: "SP - Entrance Down Stairs",
	x: "85%",
	y: "42%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[142] = {
	name: "SP - Pot Row Up Stairs",
	x: "85%",
	y: "62%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[143] = {
	name: "SP - Pot Row WN",
	x: "81.5%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[144] = {
	name: "SP - Swamp Map Ledge EN",
	x: "78.7%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[145] = {
	name: "SP - Pot Row WS",
	x: "81.5%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[146] = {
	name: "SP - Trench 1 Approach ES",
	x: "78.7%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[147] = {
	name: "SP - Hammer Switch WN",
	x: "61.5%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[148] = {
	name: "SP - Hub Dead Ledge EN",
	x: "58.7%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[149] = {
	name: "SP - Trench 1 Departure WS",
	x: "61.5%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[150] = {
	name: "SP - Hub ES",
	x: "58.7%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[151] = {
	name: "SP - Hub S",
	x: "50.2%",
	y: "78.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[152] = {
	name: "SP - Donut Top N",
	x: "50.2%",
	y: "83%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[153] = {
	name: "SP - Hub WN",
	x: "41.5%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[154] = {
	name: "SP - Crystal Switch EN",
	x: "38.7%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[155] = {
	name: "SP - Hub WS",
	x: "41.5%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[156] = {
	name: "SP - Trench 2 Pots ES",
	x: "38.7%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[157] = {
	name: "SP - Trench 2 Departure WS",
	x: "21.5%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[158] = {
	name: "SP - West Shallows ES",
	x: "18.7%",
	y: "75.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[159] = {
	name: "SP - West Block Path Up Stairs",
	x: "5%",
	y: "72%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[160] = {
	name: "SP - Attic Down Stairs",
	x: "5%",
	y: "52%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[161] = {
	name: "SP - Barrier EN",
	x: "18.7%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[162] = {
	name: "SP - Big Key Ledge WN",
	x: "21.5%",
	y: "65.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[163] = {
	name: "SP - Hub North Ledge N",
	x: "50.2%",
	y: "62%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[164] = {
	name: "SP - Push Statue S",
	x: "50.2%",
	y: "59%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[165] = {
	name: "SP - Left Elbow Down Stairs",
	x: "52.5%",
	y: "42%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[166] = {
	name: "SP - Drain Left Up Stairs",
	x: "72.5%",
	y: "42%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[167] = {
	name: "SP - Right Elbow Down Stairs",
	x: "57%",
	y: "42%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[168] = {
	name: "SP - Drain Right Up Stairs",
	x: "77%",
	y: "42%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[169] = {
	name: "SP - Push Statue Down Stairs",
	x: "58%",
	y: "52%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[170] = {
	name: "SP - Flooded Room Up Stairs",
	x: "77.5%",
	y: "51.5%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[171] = {
	name: "SP - Basement Shallows NW",
	x: "65%",
	y: "43%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[172] = {
	name: "SP - Waterfall Room SW",
	x: "65%",
	y: "38%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[173] = {
	name: "SP - Behind Waterfall Up Stairs",
	x: "75.3%",
	y: "22%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[174] = {
	name: "SP - C Down Stairss",
	x: "55%",
	y: "22%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[175] = {
	name: "SP - T NW",
	x: "45.3%",
	y: "22%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[176] = {
	name: "SP - Boss SW",
	x: "45.3%",
	y: "19%",
	dungeon: 4, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[177] = {
	name: "SP - Telepathic Tile",
	x: "92%",
	y: "48%",
	dungeon: 4, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[4].isAccessible();
	}
}
uw_poi[178] = {
	name: "SW - Big Chest",
	x: "56.2%",
	y: "56%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[179] = {
	name: "SW - Big Key Chest",
	x: "31.7%",
	y: "41.5%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[180] = {
	name: "SW - Compass Chest",
	x: "44%",
	y: "82%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[181] = {
	name: "SW - Map Chest",
	x: "72%",
	y: "55%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[182] = {
	name: "SW - Bridge Room",
	x: "83%",
	y: "91%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[183] = {
	name: "SW - Pot Prison",
	x: "40%",
	y: "54%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[184] = {
	name: "SW - Pinball Room",
	x: "63%",
	y: "82%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[185] = {
	name: "SW - Boss",
	x: "69%",
	y: "25%",
	dungeon: 5, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[186] = {
	name: "SW - West Lobby Pot Key",
	x: "3%",
	y: "55%",
	dungeon: 5, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[187] = {
	name: "SW - Spike Corner Key Drop",
	x: "79.5%",
	y: "22%",
	dungeon: 5, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[188] = {
	name: "SW - 1 Lobby WS",
	x: "51.7%",
	y: "59%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[189] = {
	name: "SW - Pot Prison ES",
	x: "48.7%",
	y: "59%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[190] = {
	name: "SW - Pot Prison SE",
	x: "44%",
	y: "65%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[191] = {
	name: "SW - Compass Room NE",
	x: "44%",
	y: "70%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[192] = {
	name: "SW - Compass Room ES",
	x: "48.7%",
	y: "92.3%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[193] = {
	name: "SW - Pinball WS",
	x: "51.7%",
	y: "92.3%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[194] = {
	name: "SW - Pinball NE",
	x: "69%",
	y: "70%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[195] = {
	name: "SW - Map Room SE",
	x: "69%",
	y: "65%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[196] = {
	name: "SW - 2 East Lobby WS",
	x: "26.5%",
	y: "59%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[197] = {
	name: "SW - Small Hall ES",
	x: "23.5%",
	y: "59%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[198] = {
	name: "SW - 3 Lobby NW",
	x: "81.4%",
	y: "70%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[199] = {
	name: "SW - Star Pits SW",
	x: "81.4%",
	y: "65%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[200] = {
	name: "SW - Vines NW",
	x: "81.4%",
	y: "36.7%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[201] = {
	name: "SW - Spike Corner SW",
	x: "81.4%",
	y: "32%",
	dungeon: 5, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[5].isAccessible();
	}
}
uw_poi[202] = {
	name: "TT - Attic",
	x: "41%",
	y: "16%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[203] = {
	name: "TT - Big Key Chest",
	x: "69%",
	y: "93%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[204] = {
	name: "TT - Map Chest",
	x: "56.5%",
	y: "83%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[205] = {
	name: "TT - Compass Chest",
	x: "84.3%",
	y: "90.2%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[206] = {
	name: "TT - Ambush Chest",
	x: "59.4%",
	y: "65%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[207] = {
	name: "TT - Big Chest",
	x: "6.5%",
	y: "43.5%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[208] = {
	name: "TT - Blind's Cell",
	x: "46%",
	y: "30%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[209] = {
	name: "TT - Boss",
	x: "93.8%",
	y: "19%",
	dungeon: 6, type: "uwchest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[210] = {
	name: "TT - Hallway Pot Key",
	x: "95%",
	y: "29%",
	dungeon: 6, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[211] = {
	name: "TT - Spike Switch Pot Key",
	x: "54%",
	y: "19%",
	dungeon: 6, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[212] = {
	name: "TT - Lobby E",
	x: "73.5%",
	y: "88%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[213] = {
	name: "TT - Ambush E",
	x: "73.5%",
	y: "63%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[214] = {
	name: "TT - Rail Ledge W",
	x: "76.8%",
	y: "63%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[215] = {
	name: "TT - Rail Ledge NW",
	x: "81.5%",
	y: "52.5%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[216] = {
	name: "TT - Compass Room W",
	x: "76.8%",
	y: "88%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[217] = {
	name: "TT - BK Corner NE",
	x: "94%",
	y: "52.5%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[218] = {
	name: "TT - Pot Alcove Bottom SW",
	x: "81.5%",
	y: "49%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[219] = {
	name: "TT - Thieves Hallway SE",
	x: "94%",
	y: "49%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[220] = {
	name: "TT - Pot Alcove Mid WS",
	x: "76.8%",
	y: "44.3%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[221] = {
	name: "TT - Spike Track ES",
	x: "73.5%",
	y: "44.3%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[222] = {
	name: "TT - Hellway NW",
	x: "56.5%",
	y: "27.5%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[223] = {
	name: "TT - Spike Switch SW",
	x: "56.5%",
	y: "24%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[224] = {
	name: "TT - Spike Switch Up Stairs",
	x: "56.5%",
	y: "15%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[225] = {
	name: "TT - Attic Down Stairs",
	x: "6.5%",
	y: "15%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[226] = {
	name: "TT - Triple Bypass EN",
	x: "73.5%",
	y: "32%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[227] = {
	name: "TT - Conveyor Maze WN",
	x: "76.8%",
	y: "32%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[228] = {
	name: "TT - Conveyor Maze Down Stairs",
	x: "81.5%",
	y: "27.5%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[229] = {
	name: "TT - Basement Block Up Stairs",
	x: "31.5%",
	y: "27.5%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[230] = {
	name: "TT - Lonely Zazak WS",
	x: "26.8%",
	y: "44.3%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[231] = {
	name: "TT - Conveyor Bridge ES",
	x: "23.5%",
	y: "44.3%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[232] = {
	name: "TT - Conveyor Bridge EN",
	x: "23.5%",
	y: "32%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[233] = {
	name: "TT - Basement Block WN ",
	x: "26.8%",
	y: "32%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[234] = {
	name: "TT - Hallway NE",
	x: "94%",
	y: "27.5%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[235] = {
	name: "TT - Boss SE",
	x: "94%",
	y: "24%",
	dungeon: 6, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[236] = {
	name: "TT - Telepathic Tile",
	x: "4.2%",
	y: "15.5%",
	dungeon: 6, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[6].isAccessible();
	}
}
uw_poi[237] = {
	name: "IP - Big Key Chest",
	x: "42%",
	y: "15%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[238] = {
	name: "IP - Compass Chest",
	x: "18.8%",
	y: "22%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[239] = {
	name: "IP - Map Chest",
	x: "34%",
	y: "48%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[240] = {
	name: "IP - Spike Room",
	x: "30.5%",
	y: "82%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[241] = {
	name: "IP - Freezor Chest",
	x: "56%",
	y: "13%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[242] = {
	name: "IP - Iced T Room",
	x: "66%",
	y: "56%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[243] = {
	name: "IP - Big Chest",
	x: "54%",
	y: "45%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[244] = {
	name: "IP - Boss",
	x: "94%",
	y: "88%",
	dungeon: 7, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[245] = {
	name: "IP - Jelly Key Drop",
	x: "29%",
	y: "30%",
	dungeon: 7, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[246] = {
	name: "IP - Conveyor Key Drop",
	x: "13%",
	y: "46%",
	dungeon: 7, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[247] = {
	name: "IP - Hammer Block Key Drop",
	x: "31%",
	y: "45.5%",
	dungeon: 7, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[248] = {
	name: "IP - Many Pots Pot Key",
	x: "78%",
	y: "44%",
	dungeon: 7, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[249] = {
	name: "IP - Jelly Key Down Stairs",
	x: "31.5%",
	y: "27%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[250] = {
	name: "IP - Floor Switch Up Stairs",
	x: "6.5%",
	y: "10.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[251] = {
	name: "IP - Cross Bottom SE",
	x: "19%",
	y: "15.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[252] = {
	name: "IP - Compass Room NE",
	x: "19%",
	y: "18.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[253] = {
	name: "IP - Cross Right ES",
	x: "23%",
	y: "13%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[254] = {
	name: "IP - Pengator Switch WS",
	x: "27.5%",
	y: "13%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[255] = {
	name: "IP - Conveyor SW",
	x: "6.5%",
	y: "49%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[256] = {
	name: "IP - Bomb Jump NW",
	x: "6.5%",
	y: "52%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[257] = {
	name: "IP - Narrow Corridor Down Stairs",
	x: "22.2%",
	y: "54%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[258] = {
	name: "IP - Pengator Trap Up Stairs",
	x: "22.2%",
	y: "87.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[259] = {
	name: "IP - Pengator Trap NE",
	x: "19%",
	y: "85%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[260] = {
	name: "IP - Spike Cross SE",
	x: "19%",
	y: "82.2%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[261] = {
	name: "IP - Spike Cross ES",
	x: "23%",
	y: "79.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[262] = {
	name: "IP - Spike Room WS",
	x: "27.5%",
	y: "79.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[263] = {
	name: "IP - Spike Room Up Stairs",
	x: "34.5%",
	y: "77%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[264] = {
	name: "IP - Hammer Block Down Stairs",
	x: "34.5%",
	y: "43.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[265] = {
	name: "IP - Spike Room Down Stairs",
	x: "28.5%",
	y: "77%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[266] = {
	name: "IP - Spikeball Up Stairs",
	x: "78.5%",
	y: "10.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[267] = {
	name: "IP - Hookshot Ledge WN",
	x: "77.5%",
	y: "4.7%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[268] = {
	name: "IP - Tall Hint EN",
	x: "73%",
	y: "4.7%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[269] = {
	name: "IP - Tall Hint SE",
	x: "69%",
	y: "15.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[270] = {
	name: "IP - Lonely Freezor NE",
	x: "69%",
	y: "18.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[271] = {
	name: "IP - Lonely Freezor Down Stairs",
	x: "66%",
	y: "18.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[272] = {
	name: "IP - Iced T Up Stairs",
	x: "66%",
	y: "52%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[273] = {
	name: "IP - Iced T EN",
	x: "73%",
	y: "54.6%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[274] = {
	name: "IP - Catwalk WN",
	x: "77.5%",
	y: "54.6%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[275] = {
	name: "IP - Catwalk NW",
	x: "81.5%",
	y: "52%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[276] = {
	name: "IP - Many Pots SW",
	x: "81.5%",
	y: "49%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[277] = {
	name: "IP - Many Pots WS",
	x: "77.5%",
	y: "46.3%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[278] = {
	name: "IP - Crystal Right ES",
	x: "73%",
	y: "46.3%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[279] = {
	name: "IP - Backwards Room Down Stairs",
	x: "69%",
	y: "35.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[280] = {
	name: "IP - Anti-Fairy Up Stairs",
	x: "69%",
	y: "68.7%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[281] = {
	name: "IP - Switch Room ES",
	x: "73%",
	y: "79.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[282] = {
	name: "IP - Refill WS",
	x: "77.5%",
	y: "79.5%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[283] = {
	name: "IP - Switch Room SE",
	x: "69%",
	y: "82.2%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[284] = {
	name: "IP - Antechamber NE",
	x: "69%",
	y: "85%",
	dungeon: 7, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[285] = {
	name: "IP - Telepathic Tile Entrance",
	x: "44%",
	y: "27%",
	dungeon: 7, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[286] = {
	name: "IP - Telepathic Tile Stalfos Knights Room",
	x: "19%",
	y: "35.5%",
	dungeon: 7, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[287] = {
	name: "IP - Telepathic Tile Large Room",
	x: "69%",
	y: "2%",
	dungeon: 7, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[7].isAccessible();
	}
}
uw_poi[288] = {
	name: "MM - Big Chest",
	x: "94%",
	y: "63%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[289] = {
	name: "MM - Main Lobby",
	x: "63%",
	y: "63%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[290] = {
	name: "MM - Big Key Chest",
	x: "44%",
	y: "95%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[291] = {
	name: "MM - Compass Chest",
	x: "31%",
	y: "65%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[292] = {
	name: "MM - Bridge Chest",
	x: "69%",
	y: "25%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[293] = {
	name: "MM - Map Chest",
	x: "80%",
	y: "65%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[294] = {
	name: "MM - Spike Chest",
	x: "83%",
	y: "56%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[295] = {
	name: "MM - Boss",
	x: "6%",
	y: "15%",
	dungeon: 8, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[296] = {
	name: "MM - Spikes Pot Key",
	x: "78%",
	y: "53%",
	dungeon: 8, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[297] = {
	name: "MM - Fishbone Pot Key",
	x: "30%",
	y: "24%",
	dungeon: 8, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[298] = {
	name: "MM - Conveyor Crystal Key Drop",
	x: "40.5%",
	y: "77%",
	dungeon: 8, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[299] = {
	name: "MM - Post-Gap Down Stairs",
	x: "95%",
	y: "92%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[300] = {
	name: "MM - 2 Up Stairs",
	x: "70%",
	y: "92%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[301] = {
	name: "MM - 2 NE",
	x: "69%",
	y: "82%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[302] = {
	name: "MM - Hub SE",
	x: "69%",
	y: "79%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[303] = {
	name: "MM - Hub ES",
	x: "73.3%",
	y: "75.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[304] = {
	name: "MM - Lone Shooter WS",
	x: "77%",
	y: "75.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[305] = {
	name: "MM - Hub E",
	x: "73.3%",
	y: "70.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[306] = {
	name: "MM - Failure Bridge W",
	x: "77%",
	y: "70.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[307] = {
	name: "MM - Hub Right EN",
	x: "73.3%",
	y: "65.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[308] = {
	name: "MM - Map Spot WN",
	x: "77%",
	y: "65.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[309] = {
	name: "MM - Crystal Dead End NW",
	x: "81.5%",
	y: "62%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[310] = {
	name: "MM - Spikes SW",
	x: "81.5%",
	y: "59%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[311] = {
	name: "MM - Spikes WS",
	x: "77%",
	y: "55.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[312] = {
	name: "MM - Hidden Shooters ES",
	x: "73.3%",
	y: "55.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[313] = {
	name: "MM - Hub NE",
	x: "69%",
	y: "62%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[314] = {
	name: "MM - Hidden Shooters SE",
	x: "69%",
	y: "59%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[315] = {
	name: "MM - Hub Top NW",
	x: "56.5%",
	y: "62%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[316] = {
	name: "MM - Cross SW",
	x: "56.5%",
	y: "59%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[317] = {
	name: "MM - Minibridge NE",
	x: "69%",
	y: "42%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[318] = {
	name: "MM - Right Bridge SE",
	x: "69%",
	y: "39%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[319] = {
	name: "MM - Ledgehop NW",
	x: "81.5%",
	y: "42%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[320] = {
	name: "MM - Bent Bridge SW",
	x: "81.5%",
	y: "39%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[321] = {
	name: "MM - Bent Bridge W",
	x: "77%",
	y: "30.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[322] = {
	name: "MM - Over Bridge E",
	x: "73.3%",
	y: "30.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[323] = {
	name: "MM - Over Bridge W",
	x: "52%",
	y: "30.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[324] = {
	name: "MM - Fishbone E",
	x: "48.5%",
	y: "30.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[325] = {
	name: "MM - Fishbone SE",
	x: "44%",
	y: "39%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[326] = {
	name: "MM - Spike Barrier NE",
	x: "44%",
	y: "42%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[327] = {
	name: "MM - Spike Barrier SE",
	x: "44%",
	y: "59%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[328] = {
	name: "MM - Wizzrobe Bypass NE",
	x: "44%",
	y: "62%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[329] = {
	name: "MM - Wizzrobe Bypass EN",
	x: "48.5%",
	y: "65.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[330] = {
	name: "MM - Hub WN",
	x: "52%",
	y: "65.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[331] = {
	name: "MM - Hub WS",
	x: "52%",
	y: "75.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[332] = {
	name: "MM - Conveyor Crystal ES",
	x: "48.5%",
	y: "75.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[333] = {
	name: "MM - Conveyor Crystal SE",
	x: "44%",
	y: "79%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[334] = {
	name: "MM - Neglected Room NE",
	x: "44%",
	y: "82%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[335] = {
	name: "MM - Tile Room SW",
	x: "31.5%",
	y: "79%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[336] = {
	name: "MM - Conveyor Barrier NW",
	x: "31.5%",
	y: "82%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[337] = {
	name: "MM - Conveyor Barrier Up Stairs",
	x: "34%",
	y: "82%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[338] = {
	name: "MM - Torches Top Down Stairs",
	x: "9%",
	y: "82%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[339] = {
	name: "MM - Ledgehop WN",
	x: "78%",
	y: "45.3%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[340] = {
	name: "MM - BK Door Room EN",
	x: "72.5%",
	y: "45.3%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[341] = {
	name: "MM - BK Door Room N",
	x: "62.7%",
	y: "42%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[342] = {
	name: "MM - Left Bridge S",
	x: "62.7%",
	y: "39%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[343] = {
	name: "MM - Left Bridge Down Stairs",
	x: "62.7%",
	y: "23%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[344] = {
	name: "MM - Dark Shooters Up Stairs",
	x: "88%",
	y: "2%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[345] = {
	name: "MM - Block X WS",
	x: "77%",
	y: "15.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[346] = {
	name: "MM - Tall Dark and Roomy ES",
	x: "73.3%",
	y: "15.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[347] = {
	name: "MM - Crystal Left WS",
	x: "52%",
	y: "15.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[348] = {
	name: "MM - Falling Foes ES",
	x: "48.5%",
	y: "15.5%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[349] = {
	name: "MM - Falling Foes Up Stairs",
	x: "44%",
	y: "7%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[350] = {
	name: "MM - Firesnake Skip Down Stairs",
	x: "19%",
	y: "27%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[351] = {
	name: "MM - Antechamber NW",
	x: "6.5%",
	y: "22%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[352] = {
	name: "MM - Boss SW",
	x: "6.5%",
	y: "19%",
	dungeon: 8, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[353] = {
	name: "MM - Telepathic Tile",
	x: "15.5%",
	y: "87%",
	dungeon: 8, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[8].isAccessible();
	}
}
uw_poi[354] = {
	name: "TR - Chain Chomps",
	x: "45%",
	y: "5%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[355] = {
	name: "TR - Compass Chest",
	x: "45%",
	y: "52%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[356] = {
	name: "TR - Roller Room - Left",
	x: "63%",
	y: "4%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[357] = {
	name: "TR - Roller Room - Right",
	x: "67%",
	y: "4%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[358] = {
	name: "TR - Big Chest",
	x: "75%",
	y: "94%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[359] = {
	name: "TR - Big Key Chest",
	x: "69%",
	y: "68%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[360] = {
	name: "TR - Crystaroller Room",
	x: "62%",
	y: "45%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[361] = {
	name: "TR - Eye Bridge Bottom Left",
	x: "22%",
	y: "72%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[362] = {
	name: "TR - Eye Bridge Bottom Right",
	x: "28%",
	y: "69.5%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[363] = {
	name: "TR - Eye Bridge Top Left",
	x: "22%",
	y: "67%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[364] = {
	name: "TR - Eye Bridge Top Right",
	x: "28%",
	y: "64.5%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[365] = {
	name: "TR - Boss",
	x: "5%",
	y: "14%",
	dungeon: 9, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[366] = {
	name: "TR - Pokey 1 Key Drop",
	x: "45%",
	y: "13%",
	dungeon: 9, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[367] = {
	name: "TR - Pokey 2 Key Drop",
	x: "54%",
	y: "75%",
	dungeon: 9, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[368] = {
	name: "TR - Lobby Ledge NE",
	x: "55.2%",
	y: "42%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[369] = {
	name: "TR - Hub SE",
	x: "55.2%",
	y: "39%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[370] = {
	name: "TR - Hub SW",
	x: "45.2%",
	y: "39%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[371] = {
	name: "TR - Compass Room NW",
	x: "45.2%",
	y: "42%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[372] = {
	name: "TR - Hub ES",
	x: "58.7%",
	y: "35.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[373] = {
	name: "TR - Torches Ledge WS",
	x: "61.5%",
	y: "35.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[374] = {
	name: "TR - Hub EN",
	x: "58.7%",
	y: "25.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[375] = {
	name: "TR - Torches WN",
	x: "61.5%",
	y: "25.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[376] = {
	name: "TR - Torches NW",
	x: "65.3%",
	y: "22%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[377] = {
	name: "TR - Roller Room SW",
	x: "65.3%",
	y: "19%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[378] = {
	name: "TR - Hub NE",
	x: "55.2%",
	y: "22%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[379] = {
	name: "TR - Tile Room SE",
	x: "55.2%",
	y: "19%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[380] = {
	name: "TR - Hub NW",
	x: "45.2%",
	y: "22%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[381] = {
	name: "TR - Pokey 1 SW",
	x: "45.2%",
	y: "19%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[382] = {
	name: "TR - Chain Chomps Down Stairs",
	x: "45.2%",
	y: "2%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[383] = {
	name: "TR - Pipe Pit Up Stairs",
	x: "85.5%",
	y: "62%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[384] = {
	name: "TR - Pipe Pit WN",
	x: "81.5%",
	y: "65.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[385] = {
	name: "TR - Lava Dual Pipes EN",
	x: "79%",
	y: "65.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[386] = {
	name: "TR - Lava Dual Pipes WN",
	x: "61.5%",
	y: "65.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[387] = {
	name: "TR - Pokey 2 EN",
	x: "58.7%",
	y: "65.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[388] = {
	name: "TR - Pokey 2 ES",
	x: "58.7%",
	y: "75.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[389] = {
	name: "TR - Lava Island WS",
	x: "61.5%",
	y: "75.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[390] = {
	name: "TR - Lava Island ES",
	x: "79%",
	y: "75.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[391] = {
	name: "TR - Pipe Ledge WS",
	x: "81.5%",
	y: "75.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[392] = {
	name: "TR - Lava Dual Pipes SW",
	x: "65.3%",
	y: "79%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[393] = {
	name: "TR - Twin Pokeys NW",
	x: "65.3%",
	y: "82%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[394] = {
	name: "TR - Hallway WS",
	x: "61.5%",
	y: "95.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[395] = {
	name: "TR - Lazy Eyes ES",
	x: "58.7%",
	y: "95.5%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[396] = {
	name: "TR - Dodgers NE",
	x: "75.2%",
	y: "82%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[397] = {
	name: "TR - Lava Escape SE",
	x: "75.2%",
	y: "79%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[398] = {
	name: "TR - Lava Escape NW",
	x: "65.3%",
	y: "62%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[399] = {
	name: "TR - Dash Room SW",
	x: "65.3%",
	y: "59%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[400] = {
	name: "TR - Crystaroller Down Stairs",
	x: "65.3%",
	y: "42%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[401] = {
	name: "TR - Dark Ride Up Stairs",
	x: "25.2%",
	y: "22%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[402] = {
	name: "TR - Dark Ride SW",
	x: "25.2%",
	y: "39%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[403] = {
	name: "TR - Dash Bridge NW",
	x: "25.2%",
	y: "42%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[404] = {
	name: "TR - Dash Bridge SW",
	x: "25.2%",
	y: "59%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[405] = {
	name: "TR - Eye Bridge NW",
	x: "25.2%",
	y: "62%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[406] = {
	name: "TR - Dash Bridge WS",
	x: "21.5%",
	y: "55.3%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[407] = {
	name: "TR - Crystal Maze ES",
	x: "19%",
	y: "55.3%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[408] = {
	name: "TR - Final Abyss NW",
	x: "5.2%",
	y: "22%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[409] = {
	name: "TR - Boss SW",
	x: "5.2%",
	y: "19%",
	dungeon: 9, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[410] = {
	name: "TR - Telepathic Tile",
	x: "52.5%",
	y: "56%",
	dungeon: 9, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[9].isAccessible();
	}
}
uw_poi[411] = {
	name: "GT - Bob's Torch",
	x: "26%",
	y: "65%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[412] = {
	name: "GT - DMs Room - Top Left",
	x: "2%",
	y: "52%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[413] = {
	name: "GT - DMs Room - Top Right",
	x: "8%",
	y: "52%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[414] = {
	name: "GT - DMs Room - Bottom Left",
	x: "2%",
	y: "55.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[415] = {
	name: "GT - DMs Room - Bottom Right",
	x: "8%",
	y: "55.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[416] = {
	name: "GT - Randomizer Room - Top Left",
	x: "33%",
	y: "44%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[417] = {
	name: "GT - Randomizer Room - Top Right",
	x: "37%",
	y: "44%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[418] = {
	name: "GT - Randomizer Room - Bottom Left",
	x: "33%",
	y: "47.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[419] = {
	name: "GT - Randomizer Room - Bottom Right",
	x: "37%",
	y: "47.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[420] = {
	name: "GT - Firesnake Room",
	x: "45%",
	y: "45%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[421] = {
	name: "GT - Map Chest",
	x: "15.5%",
	y: "75%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[422] = {
	name: "GT - Big Chest",
	x: "25%",
	y: "75%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[423] = {
	name: "GT - Hope Room - Left",
	x: "32%",
	y: "62.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[424] = {
	name: "GT - Hope Room - Right",
	x: "38%",
	y: "62.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[425] = {
	name: "GT - Bob's Chest",
	x: "38%",
	y: "78%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[426] = {
	name: "GT - Tile Room",
	x: "45%",
	y: "62.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[427] = {
	name: "GT - Compass Room - Top Left",
	x: "43%",
	y: "83%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[428] = {
	name: "GT - Compass Room - Top Right",
	x: "47%",
	y: "83%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[429] = {
	name: "GT - Compass Room - Bottom Left",
	x: "43%",
	y: "86.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[430] = {
	name: "GT - Compass Room - Bottom Right",
	x: "47%",
	y: "86.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[431] = {
	name: "GT - Big Key Chest",
	x: "75%",
	y: "25.5%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[432] = {
	name: "GT - Big Key Room - Left",
	x: "73%",
	y: "22%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[433] = {
	name: "GT - Big Key Room - Right",
	x: "77%",
	y: "22%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[434] = {
	name: "GT - Mini Helmasaur Room - Left",
	x: "92%",
	y: "22%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[435] = {
	name: "GT - Mini Helmasaur Room - Right",
	x: "98%",
	y: "22%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[436] = {
	name: "GT - Pre-Moldorm Chest",
	x: "85%",
	y: "35%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[437] = {
	name: "GT - Moldorm Chest",
	x: "91%",
	y: "54%",
	dungeon: 10, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[438] = {
	name: "GT - Conveyor Cross Pot Key",
	x: "18%",
	y: "68%",
	dungeon: 10, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[439] = {
	name: "GT - Double Switch Pot Key",
	x: "8%",
	y: "88%",
	dungeon: 10, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[440] = {
	name: "GT - Conveyor Star Pits Pot Key",
	x: "10.5%",
	y: "42.5%",
	dungeon: 10, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[441] = {
	name: "GT - Mini Helmasaur Key Drop",
	x: "95%",
	y: "25%",
	dungeon: 10, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[442] = {
	name: "GT - Lobby Left Down Stairs",
	x: "65%",
	y: "3%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[443] = {
	name: "GT - Torch Up Stairs",
	x: "25%",
	y: "62%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[444] = {
	name: "GT - Torch WN",
	x: "21.8%",
	y: "65.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[445] = {
	name: "GT - Conveyor Cross EN",
	x: "18.5%",
	y: "65.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[446] = {
	name: "GT - Hookshot NW",
	x: "5%",
	y: "62%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[447] = {
	name: "GT - DMs Room SW",
	x: "5%",
	y: "59%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[448] = {
	name: "GT - Hookshot SW",
	x: "5%",
	y: "79%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[449] = {
	name: "GT - Double Switch NW",
	x: "5%",
	y: "82%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[450] = {
	name: "GT - Warp Maze (Rails) WS",
	x: "41.8%",
	y: "55.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[451] = {
	name: "GT - Randomizer Room ES",
	x: "38.5%",
	y: "55.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[452] = {
	name: "GT - Warp Maze (Pits) ES",
	x: "18.5%",
	y: "95.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[453] = {
	name: "GT - Invisible Catwalk WS",
	x: "21.8%",
	y: "95.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[454] = {
	name: "GT - Invisible Catwalk NW",
	x: "25%",
	y: "82%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[455] = {
	name: "GT - Big Chest SW",
	x: "25%",
	y: "79%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[456] = {
	name: "GT - Invisible Catwalk NE",
	x: "35%",
	y: "82%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[457] = {
	name: "GT - Bob's Room SE",
	x: "35%",
	y: "79%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[458] = {
	name: "GT - Four Torches Up Stairs",
	x: "62.5%",
	y: "32%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[459] = {
	name: "GT - Blocked Stairs Down Stairs",
	x: "22.5%",
	y: "72%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[460] = {
	name: "GT - Lobby Right Down Stairs",
	x: "75%",
	y: "3%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[461] = {
	name: "GT - Hope Room Up Stairs",
	x: "35%",
	y: "62%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[462] = {
	name: "GT - Hope Hope Room EN",
	x: "38.5%",
	y: "65.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[463] = {
	name: "GT - Tile Room WN",
	x: "41.8%",
	y: "65.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[464] = {
	name: "GT - Speed Torch NE",
	x: "55%",
	y: "62%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[465] = {
	name: "GT - Trap Room SE",
	x: "55%",
	y: "59%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[466] = {
	name: "GT - Speed Torch SE",
	x: "55%",
	y: "79%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[467] = {
	name: "GT - Crystal Conveyor NE",
	x: "55%",
	y: "82%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[468] = {
	name: "GT - Conveyor Star Pits EN",
	x: "18.5%",
	y: "45.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[469] = {
	name: "GT - Falling Bridge WN",
	x: "21.8%",
	y: "45.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[470] = {
	name: "GT - Falling Bridge WS",
	x: "21.8%",
	y: "55.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[471] = {
	name: "GT - Hidden Star ES",
	x: "18.5%",
	y: "55.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[472] = {
	name: "GT - Invisible Bridges WS",
	x: "38.5%",
	y: "95.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[473] = {
	name: "GT - Invisible Catwalk ES",
	x: "41.8%",
	y: "95.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[474] = {
	name: "GT - Lobby Up Stairs",
	x: "70%",
	y: "2%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[475] = {
	name: "GT - Crystal Paths Down Stairs",
	x: "10%",
	y: "22%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[476] = {
	name: "GT - Dash Hall NE",
	x: "15%",
	y: "22%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[477] = {
	name: "GT - Hidden Spikes SE",
	x: "15%",
	y: "19%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[478] = {
	name: "GT - Hidden Spikes EN",
	x: "18.5%",
	y: "5.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[479] = {
	name: "GT - Cannonball Bridge WN",
	x: "21.8%",
	y: "5.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[480] = {
	name: "GT - Cannonball Bridge Up Stairs",
	x: "35%",
	y: "2%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[481] = {
	name: "GT - Gauntlet 1 Down Stairs",
	x: "55%",
	y: "2%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[482] = {
	name: "GT - Gauntlet 3 SW",
	x: "45%",
	y: "19%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[483] = {
	name: "GT - Gauntlet 4 NW",
	x: "45%",
	y: "22%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[484] = {
	name: "GT - Gauntlet 5 WS",
	x: "41.8%",
	y: "35.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[485] = {
	name: "GT - Beam Dash ES",
	x: "38.5%",
	y: "35.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[486] = {
	name: "GT - Quad Pot Up Stairs",
	x: "25%",
	y: "22%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[487] = {
	name: "GT - Wizzrobes 1 Down Stairs",
	x: "65%",
	y: "82%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[488] = {
	name: "GT - Wizzrobes 2 NE",
	x: "75%",
	y: "82%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[489] = {
	name: "GT - Conveyor Bridge SE",
	x: "75%",
	y: "79%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[490] = {
	name: "GT - Conveyor Bridge EN",
	x: "78.5%",
	y: "65.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[491] = {
	name: "GT - Torch Cross WN",
	x: "81.8%",
	y: "65.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[492] = {
	name: "GT - Crystal Circles SW",
	x: "85%",
	y: "39%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[493] = {
	name: "GT - Left Moldorm Ledge NW",
	x: "85%",
	y: "42%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[494] = {
	name: "GT - Moldorm Pit Up Stairs",
	x: "95%",
	y: "82%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[495] = {
	name: "GT - Right Moldorm Ledge Down Stairs",
	x: "95%",
	y: "42%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[496] = {
	name: "GT - Validation WS",
	x: "81.8%",
	y: "55.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[497] = {
	name: "GT - Frozen Over ES",
	x: "78.5%",
	y: "55.5%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[498] = {
	name: "GT - Frozen Over Up Stairs",
	x: "75%",
	y: "42%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[499] = {
	name: "GT - Brightly Lit Hall Down Stairs",
	x: "95%",
	y: "12%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[500] = {
	name: "GT - Brightly Lit Hall NW",
	x: "85%",
	y: "12%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[501] = {
	name: "GT - Agahnim 2 SW",
	x: "85%",
	y: "9%",
	dungeon: 10, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[10].isAccessible();
	}
}
uw_poi[502] = {
	name: "CT - Room 03",
	x: "92%",
	y: "84%",
	dungeon: 11, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[503] = {
	name: "CT - Dark Maze",
	x: "55%",
	y: "61%",
	dungeon: 11, type: "chest", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[504] = {
	name: "CT - Dark Archer Key Drop",
	x: "82%",
	y: "34%",
	dungeon: 11, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[505] = {
	name: "CT - Circle of Pots Key Drop",
	x: "63%",
	y: "19%",
	dungeon: 11, type: "key", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[506] = {
	name: "CT - Room 03 Up Stairs",
	x: "88%",
	y: "77.5%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[507] = {
	name: "CT - Lone Statue Down Stairs",
	x: "88%",
	y: "52.5%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[508] = {
	name: "CT - Dark Chargers Up Stairs",
	x: "91%",
	y: "65%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[509] = {
	name: "CT - Dual Statues Down Stairs",
	x: "91%",
	y: "40%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[510] = {
	name: "CT - Dark Archers Up Stairs",
	x: "88%",
	y: "27.5%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[511] = {
	name: "CT - Red Spears Down Stairs",
	x: "88%",
	y: "2.5%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[512] = {
	name: "CT - Pacifist Run Up Stairs",
	x: "91%",
	y: "15%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[513] = {
	name: "CT - Push Statue Down Stairs",
	x: "41%",
	y: "91%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[514] = {
	name: "CT - Altar NW",
	x: "13%",
	y: "52.5%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}
uw_poi[515] = {
	name: "CT - Agahnim 1 SW",
	x: "13%",
	y: "49%",
	dungeon: 11, type: "door", highlight: 0, connector: [], contype: [], icon: 0,
	isConnected: false, isOpened: false, isHighlight: false,
	isAvailable: function(){
		return dungeons[11].isAccessible();
	}
}