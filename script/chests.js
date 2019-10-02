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
var regions_cache;
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
				return andCombinator([rescueZelda(),
					orCombinator([canFly_path(), //Flute
						canOneFrameClipOW_path(), //1f
						canOWYBA_path(bottles), //Fake flute
						canBootsClip_path(), //Bootsclip
						canLiftRocks() && items.lantern, //Old man cave
						andCombinator([canLiftRocks(), glitched("oldMan")]), //Dark room
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
							path4 = andCombinator(glitched("fakeflute"),
								orCombinator(regions.eastDeathMountain(must_be_link, new_locs, bottles - 1),
								regions.northEastLightWorld(must_be_link, new_locs, bottles - 1),
								regions.northWestLightWorld(must_be_link, new_locs, bottles - 1),
								regions.SouthLightWorld(must_be_link, new_locs, bottles - 1)));
						return orCombinator(path1, path2, path3, path4);
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
				return andCombinator([rescueZelda(), orCombinator([
						andCombinator([AccurateLogic(regions.westDeathMountain(), regions.westDeathMountain(undefined, new_locs, bottles)),
							orCombinator([canOneFrameClipOW_path(), //1f
								canMirrorClip_path(), //Mirror clip
								canBootsClip_path(), //Bootsclip
								(items.hammer && items.mirror)
								|| hasHookshot(),
								AccurateLogic(false, orCombinator([canMirrorWrap_path(), canSuperSpeed_path()])), //Superspeed/mirror wrap [V31 bug]
								AccurateLogic(false, andCombinator([canBombClipOW_path(), items.hammer]))])]), //bombclip
					AccurateLogic(false, andCombinator([regions.westDeathMountain(undefined, new_locs, bottles - 1),
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
						return orCombinator(path1, path2);
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
						return orCombinator(path1, path2);
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
				return andCombinator([rescueZelda(),
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
						return orCombinator(path1, path2, path3);
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
						return orCombinator(path1, path2, path3, path4);
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
				var superbunny_at_dwDM = andCombinator([rgn_fakeflute2link(new_locs, bottles), //fake flute to DM instead of linkstate (1-2 bottles)
					glitched("fakefluteDM")]); //preserve superbunny state by dodging boulders
				return AccurateLogic(orCombinator([andCombinator([canLiftDarkRocks(),
							regions.eastDeathMountain(undefined, new_locs)]),
						andCombinator([canBootsClip_path(),
							items.moonpearl || items.hammer]),
						canOneFrameClipOW_path()]),
					orCombinator([rgn_link2here("darkEastDeathMountain", new_locs, bottles),
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
							path3 = andCombinator(regions.darkWestDeathMountain(undefined, new_locs, bottles), glitched("DM_lynels"));
						return orCombinator(path1, path2, path3);
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
							path3 = andCombinator(regions.darkWestDeathMountain(undefined, new_locs, bottles), glitched("DM_lynels"));
						return orCombinator(path1, path2, path3);
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
				return AccurateLogic(orCombinator([canOWYBA_path(bottles),
						dungeons[11].isBeaten(), convertAga(dungeons[11].canGetPrize()),
						items.hammer && canLiftRocks() && items.moonpearl,
						andCombinator([canLiftDarkRocks(),
							orCombinator([items.flippers,
								andCombinator([canBootsClip_path(), canFakeFlipper_path()]),
								canWaterWalk_path()]),
							items.moonpearl]),
						andCombinator([canSuperSpeed_path(), canMirrorClip_path(),
							regions.westDeathMountain(undefined, new_locs)])]),
					orCombinator([rgn_link2here("northEastDarkWorld", new_locs, bottles),
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
						return orCombinator(path1, path2, path3, path4);
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
						return orCombinator(path1, path2, path3, path4);
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
				return AccurateLogic(orCombinator([canOneFrameClipOW_path(),
						andCombinator([orCombinator([items.moonpearl, canOWYBA_path(bottles)]),
							orCombinator([andCombinator([regions.northEastDarkWorld(undefined, new_locs),
									hasHookshot() && (items.flippers || canLiftRocks() || items.hammer)]),
								(items.hammer && canLiftRocks)
								|| canLiftDarkRocks()])])]),
					orCombinator([rgn_link2here("northWestDarkWorld", new_locs, bottles),
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
				return AccurateLogic(orCombinator([canOWYBA_path(bottles),
						andCombinator([items.moonpearl,
							orCombinator([andCombinator([regions.northEastDarkWorld(undefined, new_locs), items.hammer
										|| (hasHookshot() && (items.flippers || canLiftRocks()))]),
								(items.hammer && canLiftRocks())
								|| canLiftDarkRocks()])])]),
					orCombinator([rgn_link2here("SouthDarkWorld", new_locs, bottles),
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
				return AccurateLogic(orCombinator([andCombinator([canLiftDarkRocks(), orCombinator([canFly_path(), canBootsClip_path()])]),
						andCombinator([items.moonpearl, canBootsClip_path(), regions.SouthDarkWorld(undefined, from_locs)]),
						canOWYBA_path(bottles)]),
					orCombinator([rgn_link2here("mire", new_locs, bottles),
						must_be_link ? false : rgn_bunny2here("mire", new_locs, bottles)]));
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						var path1 = {}; //Fly
						var path2 = {}; //Mirror
						path1 = canFly_path(new_locs);
						if (items.mirror)
							path2 = regions.SouthLightWorld(undefined, new_locs, bottles);
						return orCombinator(path1, path2);
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
						return orCombinator(path1, path2, path3, path4);
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
		return andCombinator([this.isAccessible(), this.isBeatable()]);
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Boss: arrow, darkness, BK, boss, MC
		var path1 = {}; //Dark back
		var path2 = {}; //Big Key
		var path3 = {}; //MC
		path1 = orCombinator([items.lantern, andCombinator([items.firerod, canAdvancedItems_path()]), glitched("ep_back")]);
		path2 = this.big();
		path3 = (qtyCounter.ditems_comp0 && qtyCounter.ditems_map0) || optMapCompLogic === false || optionVariation === "none";
		return andCombinator([canShootArrows_path(), path1, path2, canBeatBoss(0), path3]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombinator([andCombinator([this.big(), this.bigkey(), this.isBeatable()]),
			convertPossible(threshCombinator(items.maxChest0, [{ng:"a"}, this.big(), {ng:"a"}, this.bigkey(), {ng:"a"}, this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests({ng:"a"}, this.big(), this.bigkey(), this.isBeatable());
		return hope;
	},
	big: function(){ //BK
		return orCombinator([qtyCounter.ditems_bk0,
			andCombinator([optionVariation !== "keysanity",
				anyOrAllCombinator([{ng:"a"}, this.bigkey()])])]);
	},
	bigkey: function(){ //Lamp
		return orCombinator([items.lantern, glitched("ep_dark")]);
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
	kChestCount: 6,
	isAccessible: function(){ //isAccessible only gets you to the front
		return andCombinator([rescueZelda(),
			orCombinator([items.book, //Front
				canBootsClip_path(), //Bootsclip
				andCombinator([items.mirror, AccurateLogic(canOWYBA_path(), regions.mire())]), //Fake Flute [V31 bug]
				andCombinator([items.mirror && canLiftDarkRocks(), canFly_path()]), //Dark world
				andCombinator([glitched("true"), canOneFrameClipOW_path()])])]); //1f
	},
	canGetPrize: function(){
		return andCombinator([this.isAccessible(), this.isBeatable(true)]);
	},
	isBeatable: function(ignore_entry = false){
		if (!ignore_entry && isEmpty(this.isAccessible()))
			return {};
		//Boss: glove/clip, torches, bk, sk, boss, MC
		var path1 = {}; //Entry
		var path2 = {}; //BK
		var path3 = {}; //SK, min req nothing
		var path4 = {}; //MC
		path1 = orCombinator([canLiftRocks(), canBootsClip_path(),
			andCombinator([glitched("true"), canOneFrameClipOW_path()])]);
		path2 = this.big();
		path3 = this.bigkey();
		path4 = (qtyCounter.ditems_comp1 && qtyCounter.ditems_map1) || optMapCompLogic === false || optionVariation === "none";
		return andCombinator([path1, canLightTorches(), path2, path3, canBeatBoss(1), path4]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombinator([andCombinator([this.big(), this.torch(), this.bigkey(), this.isBeatable()]),
			convertPossible(threshCombinator(itemsMax.chest1, [this.big(), {ng:"a"}, this.torch(), this.bigkey(), this.bigkey(), this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests(this.big(), {ng:"a"}, this.torch(), this.bigkey(), this.isBeatable());
		return hope;
	},
	big: function(from_locs = [], type = false){ //BK
		if (from_locs.indexOf("big") !== -1)
			if (type === false) return {};
			else return {ng:"a"};
		var new_locs = from_locs.slice(0);
		new_locs.push("big");
		return orCombinator([qtyCounter.ditems_bk1,
			andCombinator([optionVariation !== "keysanity",
				anyOrAllCombinator([{ng:"a"}, this.torch(), this.bigkey(new_locs, true)])])]);
	},
	torch: function(){ //Boots
		return orCombinator([items.boots, {ngv:"a"}]);
	},
	bigkey: function(from_locs = [], type = false){ //SK, min req nothing
		if (from_locs.indexOf("bigkey") !== -1)
			if (type === false) return {};
			else return {ng:"a"};
		var new_locs = from_locs.slice(0);
		new_locs.push("bigkey");
		return orCombinator([
			orCombinator([qtyCounter.ditems_sk1 >= 1,
				andCombinator([optionVariation !== "keysanity" && optionVariation !== "mcs",
					anyOrAllCombinator([{ng:"a"}, this.torch(), this.big(new_locs, true)])])]),
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
	kChestCount: 6,
	isAccessible: function(){
		var path1 = {}; //Main
		var path2 = {}; //Mire
		if (rescueZelda()) {
			path1 = this.main();
			path2 = this.mire();
		}
		return orCombinator(path1, path2);
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
						return orCombinator(path1, path2);
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
						return orCombinator(path1, path2);
					default:
						var path1 = {}; //Can always access boss from mire
										//From main, might not be able to access boss, which means mire access needed
						var path2 = {}; //Possible lucky BK in map from main entrance
						if (!isEmpty(this.mire()))
							path1 = canBeatBoss(2, qtyCounter.boss2);
						path2 = convertPossible(andCombinator(!isEmpty(this.main()) ? {ng:"a"} : {}, canBeatBoss(2, qtyCounter.boss2)));
						return orCombinator(path1, path2);
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
						return multipleChests(path1, path2, path3, path4);
					default:
						var path1 = {ng:"a"}; //Free basement, map
						var path2 = {}; //BK
						var path3 = {}; //Big, compass
						var path4 = {}; //Boss
						if (canLightTorches()
							&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 1))
							path2 = {ng:"a"};
						path3 = anyOrAllCombinator(path1, path2);
						path4 = this.isBeatable();
						var always = andCombinator(path1, path2, path3, path4);
						var possible = {ng:"p"}; //BK in basement, items on map, compass, big
						return orCombinator(always, possible);
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
						return multipleChests(path1, path2, path3, path4, path5);
					default: //BK and SK can be anywhere, so main&BK is not guaranteed -- mire gives access to compass/boss/map/basement
						var path1 = {ng:"a"}; //Basement, map
						var path2 = {}; //BK
						var path3 = {}; //Compass
						var path4 = {}; //Big
						var path5 = {}; //Boss
						if (!isEmpty(this.mire()))
							path3 = {ng:"a"};
						if (!isEmpty(this.mire())) //Sloppy, but andCombinator will take care of BK in BK or boss
							path4 = {ng:"a"};
						path5 = this.isBeatable();
						if (canLightTorches())
							path2 = andCombinator(path1, path3, path4, path5);
						var always = andCombinator(path1, path2, path3, path4, path5);
						var possible = {ng:"p"}; //BK in basement, items on map, compass, big
						return orCombinator(always, possible);
				}
		}
	},
	main: function(){
		var path1 = {}; //Boots DMA
		var path2 = {}; //West DM
		path1 = canBootsClip_path();
		if (items.mirror || (hasHookshot() && items.hammer))
			path2 = regions.westDeathMountain();
		return orCombinator(path1, path2);
	},
	mire: function(){ //TODO -- Add MM key logic smarts
		return convertPossible(andCombinator(canOneFrameClipUW_path(), dungeons[8].isAccessible()));
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
			path2 = andCombinator(dungeons[8].isAccessible(), canBeatBoss(8, qtyCounter.boss8));
		if (optionVariation !== "keysanity" || qtyCounter.ditems_sk8 >= 2) //Can buy keys in retro -- could be keys in bridge, lobby, left side for normal
			path3 = convertPossible(dungeons[8].isAccessible());
		return orCombinator(path1, path2, path3);
	},
	bigkey: function(from_locs = [], type = false){ //Torch, SK
		if (from_locs.indexOf("bigkey") !== -1)
			if (type === false) return {};
			else return {ng:"a"};
		var new_locs = from_locs.slice(0);
		new_locs.push("bigkey");
		return andCombinator(bool2path(canLightTorches()),
			orCombinator(bool2path(qtyCounter.ditems_sk2 >= 1),
				andCombinator(bool2path(optionVariation !== "keysanity" && optionVariation !== "mcs"),
					anyOrAllCombinator([this.cage(), this.compass(new_locs, true), this.big(new_locs, true), this.isBeatable(new_locs, true)]))));
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
		path1 = andCombinator(bool2path(!isEmpty(this.main())),
			orCombinator(bool2path(qtyCounter.ditems_bk2 >= 1),
				andCombinator(bool2path(optionVariation !== "keysanity" && optionVariation !== "mcs"),
					anyOrAllCombinator([this.bigkey(new_locs, true), this.cage(), this.big(new_locs, true), this.isBeatable(new_locs, true)]))));
		path2 = bool2path(!isEmpty(this.mire()));
		if (!isEmpty(this.main()) && hasHookshot())
			path3 = glitched("herapot");
		return orCombinator(path1, path2, path3);
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
	kChestCount: 14,
	isAccessible: function(){ //isAccessible also considers kikiskip
		path1 = {}; //Basic
		path2 = {}; //Entry
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle())
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			path2 = orCombinator(andCombinator(orCombinator((items.moonpearl ? {ng:"a"} : {}), canOWYBA_path()),
									regions.northEastDarkWorld()),
								andCombinator(canOneFrameClipUW_path(), regions.westDeathMountain()));
		}
		return andCombinator(path1, path2);
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
					return andCombinator(canShootArrows_path(), canBeatBoss(3, qtyCounter.boss3));
				return {};
			default:
				var path1 = {}; //Always
				var path2 = {}; //Possible
				if (items.hammer && items.lantern && items.moonpearl) { //pearl in case kikiskip and you need to spawn crystal switches
					if ((optionVariation === "retro" && qtyCounter.hc_sk >= 6)
						|| optionVariation !== "retro")
						path1 = andCombinator(canShootArrows_path(), canBeatBoss(3, qtyCounter.boss3));
					path2 = convertPossible(andCombinator(canShootArrows_path(), canBeatBoss(3, qtyCounter.boss3))); //BK and SK on ledge/map
				}
				return orCombinator(path1, path2);
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionVariation) {
			case "keysanity":
				return multipleChests({ng:"a"}, this.isBeatable()); //Lazy
			default: //Also lazy
				var always = this.isBeatable(); //Always
				var possible = {}; //Possible
				if (items.lantern) //SK in shooter, stalfos, compass, items in ledge, basement L/R, maze U/D 
					possible = convertPossible(canShootArrows_path());
				var result = orCombinator(always, possible);
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
	kChestCount: 10,
	isAccessible: function(){ //Entrance does not require pearl/mirror/flippers. MG entrance could also be from mire
		path1 = {}; //Basic
		path2 = {}; //Entry
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle())
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			path2 = orCombinator(this.main(), this.mire());
		}
		return andCombinator(path1, path2);
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
						return orCombinator(path1, path2);
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
						return multipleChests(path1, path2, path3, path4, path5, path6);
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
							path2 = anyOrAllCombinator(path1, path3, path5, path6);
						var always = andCombinator(path1, path2, path3, path4, path5, path6);
						var possible = {};
						if (items.hammer && hasHookshot() && items.flippers && items.mirror && items.moonpearl)
							possible = {ng:"p"}; //SK in entrance, items in map, BK, west, compass, flooded L/R, buy key
						var result = orCombinator(always, possible);
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
						path1 = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4)
							path4 = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4 && items.flippers)
							path3 = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4 && items.flippers)
							path2 = orCombinator((!isEmpty(this.mire()) && (qtyCounter.ditems_bk2 || qtyCounter.ditems_bk4 || qtyCounter.ditems_bk8)) ? {ng:"a"} : {},
								(qtyCounter.ditems_bk4 && items.hammer && items.moonpearl && items.flippers && items.mirror && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (qtyCounter.ditems_sk4 && items.flippers && hasHookshot())
							path5 = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						path6 = this.isBeatable();
						return multipleChests(path1, path2, path3, path4, path5, path6);
					default:
						var path1 = {}; //Entrance, map free
						var path2 = {}; //Big
						var path3 = {}; //BK, west, compass
						var path5 = {}; //Flooded, waterfall
						var path6 = {}; //Boss
						path1 = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"} : {});
						if (items.flippers)
							path3 = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						if (items.flippers && hasHookshot())
							path5 = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						path6 = this.isBeatable();
						path2 = andCombinator(path1, path3, path5, path6); //This is sloppy (only finds BK4), but this is for "always" calculation anyways...
						var always = andCombinator(path1, path2, path3, path5, path6);
						var possible = {};
						if (items.flippers && hasHookshot())
							possible = orCombinator(!isEmpty(this.mire()) ? {ng:"a"} : {},
								(!isEmpty(this.main()) && items.hammer && items.moonpearl && items.mirror && items.flippers) ? {ng:"a"} : {});
						var result = orCombinator(always, possible);
						if (isEmpty(result)) {
							return orCombinator(!isEmpty(this.mire()) ? {ng:"a"/*u"*/} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"a"/*u"*/} : {}); //map in normal mode, entrance in retro mode
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
		return andCombinator(canOneFrameClipUW_path(), regions.mire());
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
			path2 = andCombinator(dungeons[8].isAccessible(), canBeatBoss(8, qtyCounter.boss8));
		//Retro -- Can buy keys
		//Normal -- could be keys in bridge and lobby and map
		path3 = convertPossible(dungeons[8].isAccessible());
		return orCombinator(path1, path2, path3);
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
	kChestCount: 8,
	isAccessible: function(){ //isAccessible is only for the front
		return andCombinator([rescueZelda(),
			orCombinator([canAdvancedItems_path(), (optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle()]),
			AccurateLogic(andCombinator([orCombinator([canDungeonRevive_path(), items.moonpearl]),
					regions.northWestDarkWorld()]),
				orCombinator([this.front(2), this.middle(2), this.back()]))]);
	},
	canGetPrize: function(){
		return andCombinator([this.isAccessible(), this.isBeatable(true)]);
	},
	isBeatable: function(ignore_entry = false, from_locs = [], type = false){
		if (!ignore_entry && isEmpty(this.isAccessible()))
			return {};
		if (from_locs.indexOf("boss") !== -1)
			if (type === false) return {};
			else return {ng:"a"};
		var new_locs = from_locs.slice(0);
		new_locs.push("boss");
		//Boss: pearl, firerod, swordless/sword, 3SK, boss, compass, map
		var path1 = {}; //SK, min req nothing
		var path2 = {}; //MC
		path1 = orCombinator([
			orCombinator([qtyCounter.ditems_sk5 >= 3,
				andCombinator([optionVariation !== "keysanity" && optionVariation !== "mcs",
					anyOrAllCombinator([this.big(new_locs, true), {ng:"a"}, this.bridge()])])]), //3 chests are always accessible
			{ng:"p"}]);
		path2 = (qtyCounter.ditems_comp5 && qtyCounter.ditems_map5) || optMapCompLogic === false || optionVariation === "none";
		return andCombinator([AccurateLogic(items.moonpearl && items.firerod, this.bridge()),
			optionSwords === "swordless" || hasSword(),
			path1, canBeatBoss(5), path2]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombinator([andCombinator([this.big(), this.bridge(), this.isBeatable()]),
			convertPossible(threshCombinator(itemsMax.chest5, [this.big(), {ng:"a"}, {ng:"a"}, {ng:"a"}, this.bridge(), {ng:"a"}, {ng:"a"}, this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests(this.big(), {ng:"a"}, this.bridge(), this.isBeatable());
		return hope;
	},
	front: function(must_be_link = false){
		if (must_be_link === true) {
			return orCombinator([regions.northWestDarkWorld(true),
				andCombinator([regions.northWestDarkWorld(), canDungeonRevive_path()])]);
		} else if (must_be_link === 2) {
			return orCombinator([regions.northWestDarkWorld(true),
				andCombinator([regions.northWestDarkWorld(),
					orCombinator([canDungeonRevive_path(), canSuperBunny_path("mirror"), canSuperBunny_path("fall"), canSuperBunny_path("hit")])])]);
		} else
			return regions.northWestDarkWorld();
	},
	middle: function(must_be_link = false){
		if (must_be_link === true) {
			return orCombinator([regions.northWestDarkWorld(true),
				andCombinator([regions.northWestDarkWorld(), canDungeonRevive_path()])]);
		} else if (must_be_link === 2) {
			return orCombinator([regions.northWestDarkWorld(true),
				andCombinator([regions.northWestDarkWorld(),
					orCombinator([canDungeonRevive_path(), canSuperBunny_path("mirror"), canSuperBunny_path("hit")])])]);
		} else
			return regions.northWestDarkWorld();
	},
	back: function(){
		return andCombinator([items.firerod,
			orCombinator([andCombinator([items.moonpearl, this.middle()]), //Pearl to preserve Link state
				andCombinator([glitched("true"), this.middle(true), !dungeons[11].isBeaten()]), //Fake dark world, as long as Aga not dead
				andCombinator([glitched("mapwrap"), regions.darkEastDeathMountain(true), orCombinator([canBootsClip_path(), canOneFrameClipOW_path()])])])]); //Map wrap
	},
	big: function(from_locs = [], type = false){ //BK, but allowed to have BK if accessibility !== locations
		if (from_locs.indexOf("big") !== -1)
			if (type === false) return {};
			else return {ng:"a"};
		var new_locs = from_locs.slice(0);
		new_locs.push("big");
		return andCombinator([orCombinator([qtyCounter.ditems_bk5,
				andCombinator([optionVariation !== "keysanity",
					anyOrAllCombinator([{ng:"a"}, this.bridge(), this.isBeatable(undefined, new_locs, true)])])]),
			AccurateLogic(true,
				orCombinator([!isEmpty(this.front(true)),
					andCombinator([!isEmpty(this.front(2)), glitched("hover")])]))]);
	},
	bridge: function(){ //Pearl && Firerod
		return AccurateLogic(items.moonpearl && items.firerod, this.back());
	},
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
	kChestCount: 8,
	isAccessible: function(){
		return andCombinator([rescueZelda(),
			orCombinator([canAdvancedItems_path(), (optionSwords === "swordless" || hasSword()) && hasHealth(7) && hasBottle()]),
			AccurateLogic(andCombinator([orCombinator([items.moonpearl, canOWYBA_path()]),
					regions.northWestDarkWorld()]),
				regions.northWestDarkWorld(true))]);
	},
	canGetPrize: function(){
		return andCombinator([this.isAccessible(), this.isBeatable(true)]);
	},
	isBeatable: function(ignore_entry = false){
		if (!ignore_entry && isEmpty(this.isAccessible()))
			return {};
		//Boss: SK, BK, boss, compass, map
		var path1 = {}; //SK, min req nothing
		var path2 = {}; //BK
		var path3 = {}; //MC
		path1 = orCombinator([
			orCombinator([qtyCounter.ditems_sk6 >= 1,
				andCombinator([optionVariation !== "keysanity" && optionVariation !== "mcs",
					anyOrAllCombinator([{ng:"a"}, this.cell(), this.big()])])]),
			{ng:"p"}]);
		path2 = this.cell();
		path3 = (qtyCounter.ditems_comp6 && qtyCounter.ditems_map6) || optMapCompLogic === false || optionVariation === "none";
		return andCombinator(path1, path2, canBeatBoss(6), path3);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombinator([andCombinator([this.attic(), this.big(), this.cell(), this.isBeatable()]),
			convertPossible(threshCombinator(itemsMax.chest6, [this.attic(), {ng:"a"}, {ng:"a"}, {ng:"a"}, {ng:"a"}, this.big(), this.cell(), this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests({ng:"a"}, this.attic(), this.big(), this.cell(), this.isBeatable());
		return hope;
	},
	attic: function(){ //SK, BK -- min req BK
		var path1 = {}; //BK
		var path2 = {}; //SK
		path1 = this.cell();
		path2 = orCombinator([
			orCombinator([qtyCounter.ditems_sk6 >= 1,
				andCombinator([optionVariation !== "keysanity" && optionVariation !== "mcs",
					anyOrAllCombinator([{ng:"a"}, this.cell(), this.big()])])]),
			{ng:"p"}]);
		return andCombinator(path1, path2);
	},
	big: function(){ //hammer+BK + SK if SK not inside (accessibility) -- min req hammer+BK
		var path1 = {}; //BK
		var path2 = {}; //SK
		path1 = this.cell();
		path2 = orCombinator([
			orCombinator([qtyCounter.ditems_sk6 >= 1,
				andCombinator([optionVariation !== "keysanity" && optionVariation !== "mcs",
					anyOrAllCombinator([{ng:"a"}, this.cell()])])]),
			{ng:"p"}]);
		var path3 = {}; //SK outside
		var path4 = {}; //SK inside
		path3 = andCombinator([items.hammer, path1, path2]);
		path4 = andCombinator([items.hammer, path1]);
		return anyOrAllCombinator([path3, path4]);
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
	kChestCount: 8,
	isAccessible: function(){
		var path1 = {}; //Basic
		var path2 = {}; //First room
		var path3 = {}; //Pearl + swim + lift
		var path4 = {}; //MirrorWrap + Linkstate + 1f/bootsclip + South
		var path5 = {}; //YBA
		var path6 = {}; //Flippers
		path1 = orCombinator([canAdvancedItems_path(), (optionSwords === "swordless" || hasSword(2)) && hasHealth(12) && (hasBottle(2) || hasArmor())]);
		path2 = AccurateLogic(orCombinator([canMeltThings(), canOneFrameClipUW_path()]), true);
		path3 = andCombinator([orCombinator([items.moonpearl, canDungeonRevive_path()]),
			orCombinator([items.flippers, canFakeFlipper_path(), AccurateLogic(false, orCombinator([canWaterWalk_path(), canBunnyRevive_path()]))]),
			canLiftDarkRocks()]);
		path4 = andCombinator([canMirrorWrap_path(),
			AccurateLogic(orCombinator([items.moonpearl, canOWYBA_path()]),
					orCombinator([canOneFrameClipOW_path(), canBootsClip_path()]),
					regions.SouthDarkWorld(),
				orCombinator([andCombinator([canOneFrameClipOW_path(), regions.SouthDarkWorld(false)]),
					andCombinator([orCombinator([canBootsClip_path(), canSuperSpeed_path()]), regions.SouthDarkWorld(true)])]))]);
		path5 = andCombinator([orCombinator([canBootsClip_path(), canSuperSpeed_path(), andCombinator([canOneFrameClipOW_path(), items.boots])]), canOWYBA_path(), regions.SouthDarkWorld(true)]);
		path6 = andCombinator([items.flippers, orCombinator([andCombinator([canBootsClip_path(), regions.SouthDarkWorld(true)]),
						andCombinator([canOneFrameClipOW_path(), regions.SouthDarkWorld()])])]);
		return andCombinator([rescueZelda(), path1, path2, orCombinator([path3, path4, AccurateLogic(false, orCombinator([path5, path6]))])]);
	},
	canGetPrize: function(){
		return andCombinator([this.isAccessible(), this.isBeatable(true)]);
	},
	isBeatable: function(ignore_entry = false){
		if (!ignore_entry && isEmpty(this.isAccessible()))
			return {};
		//Boss: hammer, melt, glove, boss, BK, (somaria+SK)/2SK || basic+2sk), mc
		var path1 = {}; //BK
		var path2 = {}; //keys
		var path3 = {}; //MC
		path1 = orCombinator([
			orCombinator([qtyCounter.ditems_bk7,
				andCombinator([optionVariation !== "keysanity",
					anyOrAllCombinator([this.bigkey(), this.compass(), this.spike(), this.freezor()])])]),
			{ng:"p"}]);
		path2 = 
		path3 = (qtyCounter.ditems_comp7 && qtyCounter.ditems_map7) || optMapCompLogic === false || optionVariation === "none";
		return andCombinator([items.hammer && canMeltThings(), canLiftRocks(), path1, path2, path3]);
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		var hope = orCombinator([andCombinator([this.bigkey(), this.compass(), this.spike(), this.freezor(), this.big(), this.isBeatable()]),
			convertPossible(threshCombinator(itemsMax.chest7, [this.bigkey(), this.compass(), this.bigkey(), this.spike(), this.freezor(), this.compass(), this.big, this.isBeatable()]))]);
		if (isEmpty(hope))
			return multipleChests(this.bigkey(), this.compass(), this.spike(), this.freezor(), this.big(), this.isBeatable());
		return hope;
	},
	bigkey: function(){ //hammer+glove+spike room
		return andCombinator([items.hammer && canLiftRocks(), this.spike()]);
	},
	compass: function(){
		return AccurateLogic(true, orCombinator([canMeltThings(), canOneFrameClipUW_path()]));
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
		
		return andCombinator([this.compass(),
			orCombinator([hasHookshot(),
				andCombinator([(optionVariation === "keysanity" || optionVariation === "mcs") && !qtyCounter.ditems_bk7,
					orCombinator([anyOrAllCombinator([hasHookshot(), qtyCounter.ditems_sk7 >= 1]), {ng:"p"}])]),
				andCombinator([optionVariation !== "keysanity" && optionVariation !== "mcs" && !qtyCounter.ditems_bk7,
					orCombinator([hasHookshot(), {ng:"p"}])])])]);
	},
	freezor: function(){ //Melt
		return canMeltThings();
	},
	big: function(){ //BK
		return andCombinator([this.compass(),
			orCombinator([qtyCounter.ditems_bk7,
				andCombinator([optionVariation !== "keysanity",
					anyOrAllCombinator([this.bigkey(), this.compass(), this.spike(), this.freezor()])])])]);
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
	kChestCount: 8,
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
		return andCombinator(path1, path2, path3, canKillMostThings_path(8), regions.mire());
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
				path2 = andCombinator(path_hera, canBeatBoss(2, qtyCounter.boss2));
				if (hasHookshot() && items.flippers)
					path3 = andCombinator(path_hera, canBeatBoss(4, qtyCounterr.boss4));
				return orCombinator(path1, path2, path3);
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
				return orCombinator(path1, path2);
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
				return multipleChests(path1, path2, path3, path4, path5);
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
				path3 = anyOrAllCombinator(path1, path6); //If I can access both then I'm guaranteed SK or BK
				if (canLightTorches() && (optionVariation !== "retro" || qtyCounter.hc_sk >= 3))
					path4 = {ng:"a"};
				var always = andCombinator(path1, path3, path4, path5, path6); //This is sloppy
				var possible = {};
				if ((optionVariation !== "retro") //SK on bridge, items on map+lobby
					|| (canLightTorches()))		//Retro buy keys, items on bridge, map, lobby, BK+compass/boss+spike
					possible = {ng:"p"};
				var result = orCombinator(always, possible);
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
	kChestCount: 12,
	isAccessible: function(){ //isAccessible doesn't have somaria as req
		path1 = {}; //Basic
		path2 = {}; //Entry
		if (rescueZelda()) {
			if ((optionSwords === "swordless" || hasSword(2)) && hasHealth(12) && (hasBottle(2) || hasArmor()))
				path1 = {ng:"a"};
			else
				path1 = canAdvancedItems_path();
			path2 = orCombinator(this.lower(), this.middle(), this.upper());
		}
		return andCombinator(path1, path2);
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
						return orCombinator(path1, path2);
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
						return orCombinator(path1, path2);
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
						return orCombinator(path1, path2);
				}
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
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
				path1 = andCombinator(orCombinator((canLiftDarkRocks() ? {ng:"a"} : {}), canBootsClip_path()), regions.eastDeathMountain());
			path2 = andCombinator(canBootsClip_path(), regions.darkEastDeathMountain());
		}
		return andCombinator(medallionCheck_path(9), orCombinator(path1, path2));
	},
	middle: function(){
		return andCombinator(orCombinator(canMirrorClip_path(), andCombinator(canSuperSpeed_path(), (items.moonpearl ? {ng:"a"} : {})), andCombinator(canOneFrameClipOW_path(), canOWYBA_path())),
			(items.boots || items.somaria || hasHookshot() || items.cape || items.byrna ? {ng:"a"} : {}),
			regions.darkEastDeathMountain());
	},
	lower: function(){
		return andCombinator(canMirrorClip_path(),
			orCombinator((items.moonpearl ? {ng:"a"} : {}), andCombinator(canOWYBA_path(), canBootsClip_path())),
			orCombinator(canBootsClip_path(), canOneFrameClipOW_path()),
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
	kChestCount: 27,
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
			path2 = orCombinator(canOneFrameClipOW_path(),
				andCombinator((items.moonpearl ? {ng:"a"} : {}),
					orCombinator(canBootsClip_path(), (optionTower === "random" ? {ng:"p"} : (crystalCount >= optionTower ? {ng:"a"} : {})))));
		}
		return andCombinator(path1, path2, regions.darkEastDeathMountain());
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){ //Need isBeatable calculation for gomode when isAccessible might be missing...
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionVariation) {
			case "keysanity":
				if (hasHookshot() && canLightTorches() && qtyCounter.ditems_bk10 && qtyCounter.ditems_sk10 >= 4)
					return andCombinator(canBeatBoss(2, qtyCounter.boss15), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14));
				return {};
			default:
				var always = {};
				var possible = {};
				if (hasHookshot() && canLightTorches()
					&& items.boots && items.firerod && items.somaria && items.hammer
					&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 4))
					always = andCombinator(canBeatBoss(2, qtyCounter.boss15), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(0, qtyCounter.boss13));
				if (hasHookshot() && canLightTorches())
					possible = convertPossible(andCombinator(canBeatBoss(2, qtyCounter.boss15), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14)));
				return orCombinator(always, possible);
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
					i = andCombinator(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss13), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(2, qtyCounter.boss15));
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
					i = andCombinator(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss13), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(2, qtyCounter.boss15));
				if (!isEmpty(i))
					return i;
				if (hasHookshot() && canLightTorches()
					&& items.hammer && items.somaria && items.firerod
					&& (items.boots //mc in Moldorm+pre-moldorm
						|| qtyCounter.hc_sk >= 1)) //mc in torch/moldorm
					i = convertPossible(andCombinator(canBeatBoss(0, qtyCounter.boss13), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14)));
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
					i = andCombinator(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss13), canBeatBoss(1, qtyCounter.boss14), canBeatBoss(2, qtyCounter.boss15));
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
					i = convertPossible(andCombinator(canBeatBoss(0, qtyCounter.boss13), canShootArrows_path(), canBeatBoss(1, qtyCounter.boss14)));
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
	kChestCount: 2,
	isAccessible: function(){ //isAccessible also contains canKillMostThings -- OK because you can't do anything otherwise
		if (rescueZelda() && (items.cape || hasSword(2) || (optionSwords === "swordless" && items.hammer)))
			return canKillMostThings_path(8);
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
		return multipleChests(path1, path2); //only for keysanity and retro
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
	kChestCount: 0,
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
						path2 = andCombinator(glitched("superbunny_mirror"), regions.northEastLightWorld());
					if (items.boots && optionVariation !== "ohko" && optionVariation !== "timedohko")
						path3 = andCombinator(glitched("superbunny_hit"), regions.northEastLightWorld());
					if ((canBombThings() || items.boots) && items.mirror)
						path4 = andCombinator(glitched("unbunny"), glitched("superbunny_mirror"), regions.northEastLightWorld());
					return orCombinator(path1, path2, path3, path4);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny
					var path4 = {}; //Unbunny
					if (canBombThings() || items.boots)
						path1 = regions.northEastLightWorld(true);
					if (items.boots && (items.mirror || (optionVariation !== "ohko" && optionVariation !== "timedohko")))
						path2 = regions.northEastLightWorld();
					if ((canBombThings() || items.boots) && items.mirror)
						path3 = andCombinator(glitched("unbunny"), regions.northEastLightWorld());
					return orCombinator(path1, path2, path3);
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
			//	path2 = andCombinator(glitched("waterwalk_boots"), regions.northEastLightWorld());
			path3 = andCombinator(canFakeFlipper_path(), regions.northEastLightWorld());
			//if (canBombThings())
			//	path4 = andCombinator(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			//path5 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			path6 = andCombinator(canBootsClip_path(), regions.northEastLightWorld());
			return orCombinator(path1, path2, path3, path4, path5, path6);
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
						path2 = andCombinator(glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					path3 = andCombinator(glitched("fakeflipper"), regions.northEastLightWorld(true));
					if (canBombThings())
						path4 = andCombinator(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					if (items.mirror && items.flippers)
						path5 = andCombinator(glitched("surfingbunny_mirror"), regions.northEastLightWorld());
					path6 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3, path4, path5, path6);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Surfing bunny via mirror
					var path3 = {}; //Fairy revive via enemy RNG
					path1 = regions.northEastLightWorld(true);
					if (items.mirror && items.flippers)
						path2 = andCombinator(glitched("surfingbunny_mirror"), regions.northEastLightWorld());
					path3 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3);
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
				path2 = andCombinator(glitched("wriggle"), regions.SouthLightWorld());
			return orCombinator(path1, path2);
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
			//	path2 = andCombinator(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld());
			//if (items.moonpearl && items.boots)
			//	path3 = andCombinator(glitched("fakeflipper"), glitched("waterwalk_boots"), regions.northEastLightWorld());
			//if (items.moonpearl && canBombThings())
			//	path4 = andCombinator(glitched("fakeflipper"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			//if (items.moonpearl && canBombThings())
			//	path5 = andCombinator(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 2));
			//if (items.boots && canBombThings())
			//	path7 = andCombinator(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
			path8 = andCombinator(canWaterWalk_path(), orCombinator(canFakeFlipper_path(), canBootsClip_path()));
			pathv = convertView(chests[2].isAvailable());
			return orCombinator(orCombinator(path1, path2, path3, path4, path5, path7), path8, pathv);
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
						path2 = andCombinator(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.moonpearl && items.boots)
						path3 = andCombinator(glitched("fakeflipper"), glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.moonpearl && canBombThings())
						path4 = andCombinator(glitched("fakeflipper"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					if (items.moonpearl && canBombThings())
						path5 = andCombinator(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 2));
					if (items.boots && canBombThings())
						path7 = andCombinator(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					pathv = convertView(chests[2].isAvailable());
					return orCombinator(orCombinator(path1, path2, path3, path4, path5, path7), pathv);
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
						path2 = andCombinator(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.moonpearl && canBombThings())
						path4 = andCombinator(canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					if (items.moonpearl && canBombThings())
						path5 = andCombinator(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 2));
					if (items.boots && canBombThings())
						path7 = andCombinator(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
					pathv = convertView(chests[2].isAvailable());
					return orCombinator(path1, path2, path4, path5, path7, pathv);
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
			//	path2 = orCombinator(andCombinator(glitched("fakeflipper"), regions.northEastLightWorld()),
			//		andCombinator(orCombinator(canBombThings() ? andCombinator(canGetFairy_path(), glitched("bombfairy_fakeflipper")) : {}, glitched("enemyfairy_fakeflipper")), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1)));
			path3 = andCombinator(canWaterWalk_path(), regions.northEastLightWorld(undefined, undefined, undefined, true));
			if (items.moonpearl)
				path4 = andCombinator(canFakeFlipper_path(), regions.northEastLightWorld(undefined, undefined, undefined, true));
			return orCombinator(path1, path2, path3, path4);
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
					path2 = orCombinator(andCombinator(glitched("fakeflipper"), regions.northEastLightWorld(true)),
						andCombinator(orCombinator(canBombThings() ? andCombinator(canGetFairy_path(), glitched("bombfairy_fakeflipper")) : {}, andCombinator(canGetFairy_path(), glitched("enemyfairy_fakeflipper"))),
						regions.northEastLightWorld(true, undefined, bottleCount() - 1)));
					if (items.boots)
						path3 = andCombinator(glitched("waterwalk_boots"), regions.northEastLightWorld(true));
					if (items.mirror && items.flippers)
						path4 = andCombinator(glitched("surfingbunny_mirror"), glitched("superbunny_mirror"), regions.northEastLightWorld());
					if (items.mirror)
						path5 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), glitched("superbunny_mirror"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					if (items.flippers)
						path6 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3, path4, path5, path6);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Surf and superbunny
					var path3 = {}; //Enemy RNG fairy revive and superbunny
					var path4 = {}; //Enemy RNG fairy revive and swim in with flippers
					path1 = regions.northEastLightWorld(true);
					if (items.mirror && items.flippers)
						path2 = andCombinator(glitched("surfingbunny_mirror"), regions.northEastLightWorld());
					if (items.mirror)
						path3 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					if (items.flippers)
						path4 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3, path4);
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
			path1 = andCombinator(orCombinator(canAdvancedItems_path(), (items.book ? {ng:"a"} : {})),
				regions.northWestLightWorld());
		if (items.book)
			path2 = convertView(regions.northWestLightWorld());
		return orCombinator(path1, path2);
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
					path2 = andCombinator(regions.northWestDarkWorld(), regions.northWestLightWorld());
				path3 = canBootsClip_path();
				return orCombinator(path1, path2, path3);
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
							path2 = andCombinator(regions.westDeathMountain(true), regions.northWestLightWorld(true));
						path3 = andCombinator(glitched("kingtomb"), regions.westDeathMountain(true));
					}
					return orCombinator(path1, path2, path3);
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
						path2 = andCombinator(glitched("superbunny_mirror"), regions.northWestLightWorld());
					if (optionVariation !== "ohko" && optionVariation !== "timedohko")
						path3 = andCombinator(glitched("superbunny_hit"), regions.northWestLightWorld());
					return orCombinator(path1, path2, path3);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny
					path1 = regions.northWestLightWorld(true);
					if (items.mirror
						|| (optionVariation !== "ohko" && optionVariation !== "timedohko"))
						path2 = regions.northWestLightWorld();
					return orCombinator(path1, path2);
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
				path2 = andCombinator(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.northWestLightWorld());
			return orCombinator(path1, path2);
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
				return multipleChests(regions.northWestLightWorld(), {});
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
						path2 = andCombinator(glitched("unbunny"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld(true);
					path4 = andCombinator(glitched("superbunny"), regions.northWestLightWorld());
					return multipleChests(orCombinator(path1, path2), orCombinator(path3, path4));
				default:
					var path1 = {}; //Top Chest
					var path2 = {}; //Unbunny
					var path3 = {}; //Bottom chests
					var path4 = {}; //Superbunny
					if (canBombThings())
						path1 = regions.northWestLightWorld(true);
					if (canBombThings() && items.mirror)
						path2 = andCombinator(glitched("unbunny"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld();
					return multipleChests(orCombinator(path1, path2), path3);
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
				return multipleChests(regions.northWestLightWorld(), {});
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
						path2 = andCombinator(glitched("unbunny"), glitched("superbunny_mirror"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld(true);
					if (items.mirror)
						path4 = andCombinator(glitched("superbunny_mirror"), regions.northWestLightWorld());
					return multipleChests(orCombinator(path1, path2), orCombinator(path3, path4));
				default:
					var path1 = {}; //Top
					var path2 = {}; //Unbunny
					var path3 = {}; //Bottom
					var path4 = {}; //Superbunny mirror
					var path5 = {}; //Can't superbunny hit
					if (canBombThings())
						path1 = regions.northWestLightWorld(true);
					if (canBombThings() && items.mirror)
						path2 = andCombinator(glitched("unbunny"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld(true);
					if (items.mirror)
						path4 = regions.northWestLightWorld();
					return multipleChests(orCombinator(path1, path2), orCombinator(path3, path4));
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
			pathj = andCombinator(canBootsClip_path(), regions.northWestLightWorld());
			if (items.mirror)
			//pathk = ???
			if (items.moonpearl && items.mirror && canLiftDarkRocks())
				pathl = andCombinator(regions.northWestDarkWorld(), regions.northWestLightWorld());
			return andCombinator((hasPowder() ? {ng:"a"} : ((hasMushroom() && items.somaria) ? glitched("fakepowder") : {})),
				orCombinator(pathi, pathj, pathk, pathl));
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Fake powder
					if (hasPowder() && items.hammer)
						path1 = regions.northWestLightWorld(true);
					if (hasMushroom() && items.somaria && items.hammer)
						path2 = andCombinator(glitched("fakepowder"), regions.northWestLightWorld(true));
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Fake powder
					if (hasPowder() && (items.hammer || items.boots))
						path1 = regions.northWestLightWorld(true);
					if (hasMushroom() && items.somaria && (items.hammer || items.boots))
						path2 = andCombinator(glitched("fakepowder"), regions.northWestLightWorld(true));
					return orCombinator(path1, path2);
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
		return orCombinator(path1, path2);
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
			path1 = andCombinator(canBootsClip_path(), regions.northWestLightWorld());
			if (items.mirror && items.moonpearl)
				path2 = andCombinator(regions.northWestDarkWorld(), regions.northWestLightWorld());
			return orCombinator(path1, path2);
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
		return orCombinator(path1, path2);
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
						path2 = andCombinator(glitched("superbunny_mirror"), regions.SouthLightWorld());
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Mirror via superbunny
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = regions.SouthLightWorld();
					return orCombinator(path1, path2);
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
				path2 = andCombinator(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.SouthLightWorld());
			return orCombinator(path1, path2);
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
					killpath = orCombinator(kill1, kill2);
					path3 = andCombinator(glitched("bigbomb"), glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, killpath, regions.SouthLightWorld());
				}
				var superb1 = {};
				if (items.mirror)
					superb1 = optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"};
				var superb2 = {};
				if (optionVariation !== "ohko" && optionVariation !== "timedohko")
					superb2 = optionLogic === "nmg" ? glitched("superbunny_hit") : {ng:"a"};
				superb_path = orCombinator(superb1, superb2);
				var kill1 = {}; //Sword beams
				var kill2 = canGetBee_path(); //Bee
				var kill3 = {}; //Hover
				if (hasSword(2))
					kill1 = {ng:"a"};
				if (hasSword())
					kill3 = glitched("hover");
				killpath = orCombinator(kill1, kill2, kill3);
				path2 = orCombinator(andCombinator(glitched("bigbomb"), superb_path, kill1, regions.SouthLightWorld()),
					andCombinator(glitched("bigbomb"), superb_path, kill2, regions.SouthLightWorld(undefined, undefined, bottleCount() - 1)));
				if (must_be_link)
					path2 = {};
			}
			return orCombinator(path1, path2, path3);
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
					path2 = andCombinator(glitched("bigbomb"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.SouthLightWorld());
				if (optionVariation !== "ohko" && optionVariation !== "timedohko")
					path3 = andCombinator(glitched("bigbomb"), optionLogic === "nmg" ? glitched("superbunny_hit") : {ng:"a"}, regions.SouthLightWorld());
			}
			return orCombinator(path1, path2, path3);
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
			path2 = andCombinator(canWaterWalk_path(), regions.SouthLightWorld());
			path3 = andCombinator(canFakeFlipper_path(), regions.SouthLightWorld());
			//if (canBombThings())
			//	path4 = andCombinator(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
			//path5 = andCombinator(canGetFairy_path(), glitched("enemyfairy_fakeflipper"), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
			return orCombinator(path1, path2, path3, path4, path5);
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
						path2 = andCombinator(glitched("waterwalk_boots"), regions.SouthLightWorld(true));
					path3 = andCombinator(glitched("fakeflipper"), regions.SouthLightWorld(true));
					if (canBombThings())
						path4 = andCombinator(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(true, undefined, bottleCount() - 1));
					if (items.mirror && items.flippers)
						path5 = andCombinator(glitched("surfingbunny_mirror"), regions.SouthLightWorld());
					path6 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3, path4, path5, path6);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Surfing bunny via mirror
					var path3 = {}; //Surfing bunny via enemy RNG
					path1 = regions.SouthLightWorld(true);
					if (items.mirror && items.flippers)
						path2 = andCombinator(glitched("surfingbunny_mirror"), regions.SouthLightWorld());
					path3 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3);
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
					path1 = andCombinator(canBootsClip_path(), regions.SouthLightWorld());
				path2 = convertView(canBootsClip_path(), regions.SouthLightWorld());
				if (items.mirror) {
					if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
						path3 = andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld());
					path4 = convertView(andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld()));
				}
			}
			return orCombinator(path1, path2, path3, path4);
		} else {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			if (items.book
				&& (hasSword(2) || (optionSwords === "swordless" && items.hammer)))
				path1 = regions.SouthLightWorld();
			if (items.book)
				path2 = convertView(regions.SouthLightWorld());
			return orCombinator(path1, path2);
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
			path1 = andCombinator(canOneFrameClipOW_path(), regions.SouthLightWorld());
			path2 = andCombinator(canBootsClip_path(), regions.SouthLightWorld());
			if (items.mirror)
				path3 = andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld());
			return orCombinator(path1, path2, path3);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					var path3 = {}; //Superbunny via hit
					var path4 = {}; //View
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = andCombinator(glitched("superbunny_mirror"), regions.SouthLightWorld());
					if (optionVariation !== "ohko" && optionVariation !== "timedohko")
						path3 = andCombinator(glitched("superbunny_hit"), regions.SouthLightWorld());
					path4 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3, path4);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny
					var path3 = {}; //View
					path1 = regions.SouthLightWorld(true);
					if (items.mirror || (optionVariation !== "ohko" && optionVariation !== "timedohko"))
						path2 = regions.SouthLightWorld();
					path3 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3);
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
				path1 = andCombinator(canOneFrameClipOW_path(), regions.SouthLightWorld());
				path2 = andCombinator(canBootsClip_path(), regions.SouthLightWorld());
				if (items.mirror)
					path3 = andCombinator(regions.mire(), regions.SouthLightWorld());
			}
			return orCombinator(path1, path2, path3);
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
			return orCombinator(path1, path2);
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
						path2 = andCombinator(glitched("superbunny_mirror"), regions.SouthLightWorld());
					if (items.boots && optionVariation !== "ohko" && optionVariation !== "timedohko" && dungeons[11].isBeaten())
						path3 = andCombinator(glitched("superbunny_hit"), regions.SouthLightWorld());
					path4 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3, path4);
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
						path3 = andCombinator(glitched("library"), regions.SouthLightWorld());
					path4 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3, path4);
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
			return orCombinator(path1, path2);
		} else {
			var path1 = {}; //Get item
			var path2 = {}; //View item
			if (canBombThings() || items.boots)
				path1 = regions.SouthLightWorld(true);
			path2 = convertView(regions.SouthLightWorld());
			return orCombinator(path1, path2);
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
			path1 = andCombinator(dungeons[1].isAccessible(), regions.SouthLightWorld());
			path2 = convertView(regions.SouthLightWorld());
			return orCombinator(path1, path2);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //Bunny
					var path3 = {}; //View item
					path1 = andCombinator(dungeons[1].isAccessible(), regions.SouthLightWorld(true));
					path2 = andCombinator(glitched("dungeonrevival"), dungeons[1].isAccessible(), regions.SouthLightWorld());
					path3 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //Bootclip
					var path3 = {}; //View item
					path1 = andCombinator(dungeons[1].isAccessible(), regions.SouthLightWorld());
					if (items.boots)
						path2 = regions.SouthLightWorld(true);
					path3 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3);
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
			path1 = andCombinator(canOneFrameClipOW_path(), regions.SouthLightWorld());
			path2 = andCombinator(canBootsClip_path(), regions.SouthLightWorld());
			if (items.flippers && items.mirror) {
				path3 = andCombinator(orCombinator(canBunnySurf_path(), (items.moonpearl ? {ng:"a"} : {})),
					regions.northEastDarkWorld(), regions.SouthLightWorld());
				if (items.moonpearl)
					path4 = andCombinator(regions.SouthDarkWorld(), regions.northEastDarkWorld());
			}
			pathv = convertView(regions.SouthLightWorld());
			return orCombinator(path1, path2, path3, path4, pathv);
			//var path1 = {}; //Normal
			//var path2 = {}; //Surfing bunny from mirror, then wriggle
			//var path3 = {}; //Waterwalk
			//if (items.flippers && items.mirror) {
			//	path1 = andCombinator(orCombinator(regions.SouthDarkWorld(true), regions.northEastDarkWorld(true)), regions.SouthLightWorld());
			//	path2 = andCombinator(glitched("surfingbunny_mirror"), glitched("wriggle"), regions.northEastDarkWorld());
			// }
			//if (items.boots && items.mirror)
			//	path3 = andCombinator(glitched("waterwalk_boots"), regions.northWestDarkWorld(true));
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
						path2 = andCombinator(glitched("waterwalk_boots"), regions.SouthLightWorld(true));
					path3 = andCombinator(glitched("fakeflipper"), regions.SouthLightWorld(true));
					if (canBombThings())
						path4 = andCombinator(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(true, undefined, bottleCount() - 1));
					path5 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					pathv = regions.SouthLightWorld();
					return orCombinator(path1, path2, path3, path4, path5, pathv);
				default:
					var path3 = {}; //Fake flippers
					var path5 = {}; //RNG fairy revive
					var pathv = {}; //View item
					path3 = regions.SouthLightWorld(true);
					path5 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					pathv = regions.SouthLightWorld();
					return orCombinator(path3, path5, pathv);
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
						path2 = andCombinator(glitched("superbunny_mirror"), regions.SouthLightWorld());
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Superbunny via mirror
					path1 = regions.SouthLightWorld(true);
					if (items.mirror)
						path2 = regions.SouthLightWorld();
					return orCombinator(path1, path2);
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
			path2 = andCombinator(glitched("oldMan_back"), regions.westDeathMountain());
			if (canLiftRocks())
				path3 = andCombinator(glitched("oldMan"), regions.northWestLightWorld());
			return orCombinator(path1, path2, path3);
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Dark back
			var path3 = {}; //Dark front
			if (items.lantern)
				path1 = regions.westDeathMountain();
			path2 = andCombinator(glitched("oldMan_back"), regions.darkWestDeathMountain());
			if (canLiftRocks())
				path3 = andCombinator(glitched("oldMan"), regions.northWestDarkWorld());
			return orCombinator(path1, path2, path3);
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
					path1 = andCombinator(dungeons[2].isAccessible(), regions.westDeathMountain());
				path2 = convertView(andCombinator(dungeons[2].isAccessible(), regions.westDeathMountain()));
			}
			return orCombinator(path1, path2);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.book && items.hammer && (optionSwords === "swordless" || hasSword(2)))
						path1 = regions.eastDeathMountain(true);
					if (items.book && items.hammer)
						path2 = convertView(regions.eastDeathMountain(true));
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.book && ((optionSwords === "swordless" && items.hammer)
						|| (optionSwords !== "swordless" && hasSword(2) && (items.hammer || items.boots))))
						path1 = regions.eastDeathMountain(true);
					if (items.book && ((optionSwords === "swordless" && items.hammer)
						|| (optionSwords !== "swordless" && (items.hammer || items.boots))))
						path2 = convertView(regions.eastDeathMountain(true));
					return orCombinator(path1, path2);
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
			return orCombinator(path1, path2, path3, pathv);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.hammer)
						path1 = regions.eastDeathMountain(true);
					path2 = convertView(regions.westDeathMountain());
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.hammer || items.boots)
						path1 = regions.eastDeathMountain(true);
					path2 = convertView(regions.westDeathMountain());
					return orCombinator(path1, path2);
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
						path2 = andCombinator(glitched("superbunny_mirror"), regions.eastDeathMountain());
					if (items.mirror)
						path3 = andCombinator(glitched("superbunny_mirror"), canGetBee_path(), regions.eastDeathMountain(undefined, undefined, bottleCount() - 1));
					if (items.mirror)
						path4 = andCombinator(glitched("superbunny_mirror"), glitched("spiralcave"), regions.eastDeathMountain());
					if (items.mirror)
						path5 = andCombinator(glitched("unbunny"), glitched("superbunny_mirror"), regions.eastDeathMountain());
					return orCombinator(path1, path2, path3, path4, path5);
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
						path3 = andCombinator(glitched("true"), canGetBee_path(), regions.eastDeathMountain(undefined, undefined, bottleCount() - 1));
					if (items.mirror)
						path4 = andCombinator(glitched("spiralcave"), regions.eastDeathMountain());
					if (items.mirror)
						path5 = andCombinator(glitched("unbunny"), regions.eastDeathMountain());
					return orCombinator(path1, path2, path3, path4, path5);
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
				path1 = andCombinator(canMirrorClip_path(), regions.eastDeathMountain());
				if (items.moonpearl)
					path2 = andCombinator(canBootsClip_path(), regions.darkEastDeathMountain(), regions.eastDeathMountain());
				path3 = convertPossible(andCombinator(dungeons[9].isAccessible(), regions.eastDeathMountain()));
			}
			return orCombinator(path1, path2, path3);
		} else {
			var path1 = {}; //Normal
			var path2 = {}; //Unbunny
			if (items.hammer)
				path1 = regions.eastDeathMountain(true);
			if (items.hammer)
				path2 = andCombinator(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.eastDeathMountain());
			return orCombinator(path1, path2);
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
				path2 = andCombinator(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.eastDeathMountain());
			return orCombinator(path1, path2);
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
			path2 = andCombinator(canShootArrows_path(), regions.eastDeathMountain());
			return orCombinator(path1, path2);
		} else {
			var path1 = {}; //Non-arrow
			var path2 = {}; //Arrow
			var path3 = {}; //Unbunny non-arrow
			var path4 = {}; //Unbunny arrow
			if (hasSword(2) || hasBoomerang() || canBombThings()
				|| items.firerod || items.icerod || items.somaria)
				path1 = regions.eastDeathMountain(true);
			path2 = andCombinator(canShootArrows_path(), regions.eastDeathMountain(true));
			if (items.mirror) {
				if (hasSword(2) || hasBoomerang() || canBombThings()
					|| items.firerod || items.icerod || items.somaria)
					path3 = andCombinator(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, regions.eastDeathMountain());
				path4 = andCombinator(glitched("unbunny"), optionLogic === "nmg" ? glitched("superbunny_mirror") : {ng:"a"}, canShootArrows_path(), regions.eastDeathMountain());
			}
			return orCombinator(path1, path2, path3, path4);
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
			path1 = andCombinator(canBootsClip_path(), regions.eastDeathMountain());
			if (items.mirror && items.moonpearl && canBombThings() && canLiftRocks())
				path2 = andCombinator(regions.darkEastDeathMountain(), regions.eastDeathMountain());
			pathv = convertView(regions.eastDeathMountain());
			return orCombinator(path1, path2, pathv);
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
					path1 = {};//regions.northEastDarkWorld();
				path2 = andCombinator(canBootsClip_path(), {});//regions.northEastDarkWorld());
			}
			return orCombinator(path1, path2);
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
					return orCombinator(path1, path2, path3);
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
					path1 = andCombinator(regions.SouthDarkWorld(undefined, new_locs, undefined, true), regions.northEastDarkWorld(undefined, new_locs, undefined, true));
				//if (items.mirror && items.flippers)
				//	path2 = andCombinator(glitched("bigbombdupe_mirror"), regions.SouthDarkWorld(true));
				//if (canLiftDarkRocks() && items.boots)
				//	path3 = andCombinator(glitched("bigbombdupe_transition"), glitched("waterwalk_boots"), regions.SouthDarkWorld(true));
				//if (canLiftDarkRocks() && items.flippers)
				//	path4 = andCombinator(glitched("bigbombdupe_swim"), regions.SouthDarkWorld(true));
				//if (canLiftDarkRocks() && (items.icerod || items.ether) && items.quake)
				//	path5 = andCombinator(glitched("bigbombdupe_hinox"), regions.SouthDarkWorld(true));
			}
			path6 = andCombinator(canSuperSpeed_path(), canMirrorClip_path(), regions.westDeathMountain(), regions.northEastDarkWorld(undefined, new_locs, undefined, true));
			return orCombinator(path1, path2, path3, path4, path5, path6);
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
				return andCombinator(orCombinator((items.moonpearl ? {ng:"a"} : {}), canOWYBA_path()),
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
		return andCombinator(orCombinator((items.moonpearl ? {ng:"a"} : {}), canSuperBunny_path("mirror")),
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
		return andCombinator(orCombinator((items.moonpearl ? {ng:"a"} : {}), canSuperBunny_path("mirror")),
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
				path2 = andCombinator(canFakeFlipper_path(), orCombinator(canOneFrameClipOW_path(), canBootsClip_path()));
			}
			return andCombinator(orCombinator(path1, path2), regions.northWestDarkWorld());
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Dark world
					var path2 = {}; //Light world
					if (items.hammer && canLiftDarkRocks())
						path1 = regions.northWestDarkWorld();
					if (items.hammer && items.mirror)
						path2 = andCombinator(regions.northWestDarkWorld(), regions.northWestLightWorld());
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Dark world
					var path2 = {}; //Light world
					if (items.hammer && (canLiftDarkRocks() || items.boots))
						path1 = regions.northWestDarkWorld();
					if (items.hammer && items.mirror)
						path2 = andCombinator(regions.northWestDarkWorld(), regions.northWestLightWorld());
					return orCombinator(path1, path2);
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
				path1 = orCombinator((hasHookshot() ? {ng:"a"} : {}), canAdvancedItems_path());
			path2 = orCombinator(canOneFrameClipOW_path(), canBootsClip_path());
			pathv = convertView(regions.northWestDarkWorld());
			return orCombinator(andCombinator(orCombinator(path1, path2), regions.northWestDarkWorld()), pathv);
		} else
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (canLiftRocks() && items.cape && items.mirror)
						path1 = regions.northWestLightWorld(true);
					path2 = convertView(regions.northWestDarkWorld());
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //Clip
					var path3 = {}; //View item
					if (canLiftRocks() && items.cape && items.mirror)
						path1 = regions.northWestLightWorld(true);
					if (items.boots)
						path2 = regions.northWestDarkWorld();
					path3 = convertView(regions.northWestDarkWorld());
					return orCombinator(path1, path2, path3);
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
				return andCombinator(orCombinator((items.mirror ? {ng:"a"} : {}), canAdvancedItems_path()), regions.northWestDarkWorld());
			return {};
			//var path2 = {}; //Screenwrap mirror portal
			//var path3 = {}; //Mirrorjump
			//var path4 = {}; //YBA
			//if (items.boots && items.mirror && (canBombThings() || items.flute))
			//	path2 = andCombinator(glitched("blacksmith_wrap"), regions.northWestDarkWorld(true));
			//if (items.mirror)
			//	path3 = andCombinator(glitched("mirrorjump"), regions.northWestDarkWorld());
			//if (hasABottle() && items.boots)
			//	path4 = andCombinator(glitched("OW_YBA"), regions.northWestDarkWorld(true, undefined, bottleCount() - 1));
			//return orCombinator(path1, path2, path3, path4);
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
						path2 = andCombinator(glitched("OW_YBA"), regions.northWestDarkWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2);
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
			return andCombinator(chests[52].isAvailable(),
				orCombinator((canLiftDarkRocks() ? {ng:"a"} : {}), canFakeFlipper_path()),
				regions.northWestDarkWorld());
			//var path2 = {}; //NE
			//var path3 = {}; //Mirrorwrap
			//if (items.boots)
			//	path2 = andCombinator(andCombinator(chests[52].isAvailable(), regions.northEastDarkWorld(true)), regions.northWestDarkWorld(true));
			//if (items.mirror)
			//	path3 = andCombinator(glitched("mirrorwrap"), chests[52].isAvailable(), regions.northWestDarkWorld());
		} else
			switch (optionLogic) {
				case "nmg":
					if (canLiftDarkRocks() || items.mirror)
						return andCombinator(chests[52].isAvailable(), regions.northWestLightWorld(), regions.SouthLightWorld());
					return {};
				default:
					if (canLiftDarkRocks() || items.mirror || items.boots)
						return andCombinator(chests[52].isAvailable(), regions.northWestLightWorld(), regions.SouthLightWorld());
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
		return andCombinator(orCombinator((items.moonpearl ? {ng:"a"}:{}), canSuperBunny_path("mirror")), regions.mire());
		var path1 = {}; //Superbunny
		var path2 = {}; //1f DMA, then 1f DMD, then 1f into mire as Link
		var path3 = {}; //Superbunny by enemy hit
		if (items.moonpearl || items.mirror) //Added to get close to only mire req
			path1 = regions.mire();
		if (glitchedLinkInDarkWorld()) //Added, still have base mire reqs, link state outside and 1f back to mire
			path2 = regions.mire();
		if (qtyCounter.tunic > 1 || (qtyCounter.heart_full + (qtyCounter.heart_piece / 4) >= 4))
			path3 = regions.mire();
		return orCombinator(path1, path2, path3);
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
			return andCombinator(regions.westDeathMountain(), regions.darkWestDeathMountain());
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
		return andCombinator(orCombinator((items.moonpearl ? {ng:"a"} : {}), canSuperBunny_path("fall")), regions.darkEastDeathMountain());
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
			path1 = orCombinator((hasHookshot() ? {ng:"a"} : {}), (items.boots ? glitched("hover") : {}), (items.boots ? canAdvancedItems_path() : {}));
			path2 = orCombinator((canLiftDarkRocks() ? {ng:"a"} : {}), canBootsClip_path());
		}
		return andCombinator(path1, path2, regions.darkEastDeathMountain());
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
			path1 = orCombinator((hasHookshot() ? {ng:"a"} : {}), (items.boots ? glitched("hover") : {}));
			path2 = orCombinator((canLiftDarkRocks() ? {ng:"a"} : {}), canBootsClip_path());
		}
		return andCombinator(path1, path2, regions.darkEastDeathMountain());
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
						path2 = orCombinator((items.lantern ? {ng:"a"} : {}), glitched("sewers"), (items.firerod ? glitched("sewers_fr") : {}))
					if (optionVariation !== "keysanity" && optionVariation !== "mcs") //SK in map, dark cross, or sanctuary
						path3 = convertPossible(orCombinator((items.lantern ? {ng:"a"} : {}), glitched("sewers"), (items.firerod ? glitched("sewers_fr") : {})))
				}
				return orCombinator(path1, path2, path3);
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
				return orCombinator(path1, path2, path3, path4, path5);
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
					path2 = anyOrAllCombinator(anyOrAllCombinator(path1, chests[63].isAvailable()), chests[64].isAvailable());
				return multipleChests(path1, path2);
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
				return multipleChests(path1, path2);
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
		return andCombinator(orCombinator((items.moonpearl ? {ng:"a"}:{}), canSuperBunny_path("mirror")), regions.mire());
	}
}
entrances[23] = {
	name: "Dark Desert Hint",
	x: "60.34%",
	y: "83.59%", //82.59%
	isOpened: false,
	isHighlight: false,
	isAvailable: function(){
		return andCombinator(orCombinator((items.moonpearl ? {ng:"a"}:{}), canSuperBunny_path("mirror")), regions.mire());
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
			return orCombinator(path1, path2, path3, path4);
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
			return orCombinator(path1, path2, path3, path4);*/
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
			return andCombinator(regions.westDeathMountain(), regions.darkWestDeathMountain());
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
		return andCombinator(orCombinator(canFakeFlipper_path(), (items.flippers ? {ng:"a"} : {})),
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
		return AccurateLogic(andCombinator([items.moonpearl && (canLiftRocks() || items.hammer || items.flippers),
				regions.northEastDarkWorld(undefined, new_locs, undefined, newcalc)]),
			orCombinator([andCombinator([canLiftRocks(), regions.northEastDarkWorld(2, new_locs, bottles, newcalc)]),
				andCombinator([items.hammer, regions.northEastDarkWorld(true, new_locs, bottles, newcalc)]),
				andCombinator([orCombinator([items.flippers, canFakeFlipper_path()]),
					orCombinator([regions.northEastDarkWorld(true, new_locs, bottles, newcalc),
						regions.SouthDarkWorld(true, new_locs, bottles, newcalc),
						chests[44].isAvailable(true, new_locs, bottles, newcalc)])]),
				andCombinator([canBunnyRevive_path(), canGetFairy_path(1, true, new_locs),
					orCombinator([regions.northEastDarkWorld(undefined, new_locs, bottles - 1, newcalc),
						regions.SouthDarkWorld(undefined, new_locs, bottles - 1, newcalc),
						chests[44].isAvailable(undefined, new_locs, bottles - 1, newcalc)])]),
				andCombinator([canMirrorWrap_path(), must_be_link !== false ? items.moonpearl : true,
					regions.northWestDarkWorld(undefined, new_locs, bottles, newcalc)]),
				andCombinator([orCombinator([canSuperSpeed_path(), canBootsClip_path()]),
					regions.darkEastDeathMountain(true, new_locs, bottles, newcalc)]),
				andCombinator([canOneFrameClipOW_path(), regions.darkEastDeathMountain(must_be_link !== false, new_locs, bottles, newcalc)]),
				andCombinator([canBootsClip_path(), items.mirror && must_be_link === false,
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


