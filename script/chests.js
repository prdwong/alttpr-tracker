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

//Glitch reminders: Can use big bomg as a regular bomb

//Bug: Pretty sure MG logic here (dark EDM) is wrong, and they meant to put in (pearl || bottle) && boots
//	Issue #664 filed
//Bug: MG logic needs bottle to get up DM and then another bottle to other dark world areas
//	Issue #664 filed
//Bug: MG logic should be able to get to NE darkworld from S darkworld
//	Issue #664 filed
//Some WOW paths seem incorrect
//Bug: Can't you get to NE overworld in MG using kikiskip?

//must_be_link -- only return routes that end with Link state
//from_locs -- route has already been through these regions, don't go through here again or it will be infinite loop
//bottles -- # of bottles remaining that can be used (for fake fluting)
//TODO: Add OBR and unbunny/superbunny pull as possible Link states
var regions = {
	westDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount()) { //Later: Add 1f access to owg+ (all regions)
		if (from_locs.indexOf("westDeathMountain") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("westDeathMountain");
		if (optionState === "inverted") {
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
		} else {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Old man cave
					var path2 = {}; //Flute
					var path3 = {}; //Dark room glitch
					if (rescueZelda()) {
						if (canLiftRocks() && items.lantern)
							path1 = {ng:"a"};
						path2 = canFly_path(new_locs); //Assume all of light world accessible
						if (canLiftRocks())
							path3 = glitched("oldMan");
					}
					return orCombinator(path1, path2, path3);
				case "owg":
					var path1 = {}; //DMA or old man cave
					var path2 = {}; //Flute
					var path3 = {}; //Dark room glitch
					var path4 = {}; //Fake flute
					var path5 = {}; //From EDM
					if (rescueZelda()) {
						if (items.boots || (canLiftRocks() && items.lantern))
							path1 = {ng:"a"};
						path2 = canFly_path(new_locs);
						if (canLiftRocks())
							path3 = glitched("oldMan");
						if (hasABottle() && bottles >= 1)
							path4 = glitched("fakeflute");
						if (items.boots || items.hammer || hasHookshot())
							path5 = regions.eastDeathMountain(undefined, new_locs, bottles);
					}
					return orCombinator(path1, path2, path3, path4, path5);
				default:
					var path1 = {}; //DMA, fake flute, or old man cave
					var path2 = {}; //Flute
					var path3 = {}; //Dark room glitch
					if (rescueZelda()) {
						if (items.boots || hasABottle() || (canLiftRocks() && items.lantern))
							path1 = {ng:"a"};
						path2 = canFly_path(new_locs);
						if (canLiftRocks())
							path3 = glitched("oldMan");
					}
					return orCombinator(path1, path2, path3, path4);
			}
		}
	},
	eastDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("eastDeathMountain") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("eastDeathMountain");
		if (optionState === "inverted") {
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
		} else {
			switch (optionLogic) {
				case "nmg":
					if (rescueZelda() && ((items.hammer && items.mirror) || hasHookshot()))
						return regions.westDeathMountain(undefined, new_locs, bottles);
					return {};
				default:
					var path1 = {}; //DMA + DM climb
					var path2 = {}; //Hookshot or mirrorclip
					if (rescueZelda()) {
						if (items.boots)
							path1 = {ng:"a"};
						if (hasHookshot() || items.mirror)
							path2 = regions.westDeathMountain(undefined, new_locs, bottles);
					}
					return orCombinator(path1, path2);
			}
		}
	},
	darkEastDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("darkEastDeathMountain") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("darkEastDeathMountain");
		switch (optionState) {
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
			default:
				switch (optionLogic) {
					case "nmg":
						if (rescueZelda() && canLiftDarkRocks()
							&& ((items.moonpearl && must_be_link)
								|| !must_be_link))
							return regions.eastDeathMountain(undefined, new_locs, bottles);
						return {};
					case "owg":
						if (rescueZelda()) {
							var path1 = {}; //DM climb frorm dark WDM
							var path2 = {}; //Mirrorclip from dark WDM
							var path3 = {}; //EDM portals
							if (items.boots)
								path1 = regions.darkWestDeathMountain(true, new_locs, bottles);
							if (items.mirror)
								path2 = regions.darkWestDeathMountain(must_be_link, new_locs, bottles);
							if (canLiftDarkRocks() || (items.hammer && items.boots)
								&& ((items.moonpearl && must_be_link)
									|| !must_be_link))
								path3 = regions.eastDeathMountain(undefined, new_locs, bottles);
							return orCombinator(path1, path2, path3);
						}
						return {};
					default:
						if (rescueZelda()) {
							var path1 = {}; //Buggy logic
							var path2 = {}; //Mirrorclip
							var path3 = {}; //EDM portals
							if (items.moonpearl || (hasABottle() && items.boots)) //Req 1f clip, leaving it in for now because it is possible (though not intended)
								path1 = {ng:"a"};
							if (items.mirror
								&& ((items.moonpearl && must_be_link)
									|| !must_be_link))
								path2 = regions.westDeathMountain(undefined, new_locs, bottles);
							if (canLiftDarkRocks() || (items.hammer && items.boots)
								&& ((items.moonpearl && must_be_link)
									|| !must_be_link))
								path3 = regions.eastDeathMountain(undefined, new_locs, bottles);
							return orCombinator(path1, path2, path3);
						}
						return {};
				}
		}
	},
	darkWestDeathMountain: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("darkWestDeathMountain") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("darkWestDeathMountain");
		switch (optionState) {
			case "inverted":
				switch (optionLogic) {
					case "nmg":
						var path1 = {}; //Old man cave
						var path2 = {}; //Flute
						var path3 = {}; //Dark room glitch
						if (canLiftRocks() && items.lantern)
							path1 = {ng:"a"};
						path2 = canFly_path();
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
						path2 = canFly_path();
						if (canLiftRocks())
							path3 = glitched("oldMan");
						if (hasABottle() && bottles >= 1)
							path4 = glitched("fakeflute");
						return orCombinator(path1, path2, path3, path4);
				}
			default:
				switch (optionLogic) {
					case "nmg":
						if (rescueZelda()) {
							if ((moonpearl && must_be_link)
								|| !must_be_link)
								return regions.westDeathMountain(undefined, new_locs, bottles);
						}
						return {};
					default:
						var path1 = {}; //From WDM
						var path2 = {}; //DMA
						var path3 = {}; //Fake flute
						if (rescueZelda()) {
							if ((moonpearl && must_be_link)
								|| !must_be_link)
								return regions.westDeathMountain(undefined, new_locs, bottles);
							if (items.boots)
								return regions.northWestDarkWorld(true, new_locs, bottles);
							if (bottles >= 1)
								path3 = andCombinator(glitched("fakeflute"),
									orCombinator(regions.darkEastDeathMountain(must_be_link, new_locs, bottles - 1),
									regions.northEastDarkWorld(must_be_link, new_locs, bottles - 1),
									regions.northWestDarkWorld(must_be_link, new_locs, bottles - 1),
									regions.SouthDarkWorld(must_be_link, new_locs, bottles - 1),
									regions.mire(must_be_link, new_locs, bottles - 1)));
						}
						return orCombinator(path1, path2, path3);
				}
		}
	},
	northEastDarkWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount()) { //Later: Add aga info
		if (from_locs.indexOf("northEastDarkWorld") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northEastDarkWorld");
		if (optionState === "inverted") {
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
		} else {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal access
					var path2 = {}; //Waterwalk from NW
					var path3 = {}; //Qirn jump
					if (rescueZelda()) {
						if ((dungeons[11].isBeaten() && ((items.moonpearl && must_be_link) || !must_be_link))
							|| (items.hammer && canLiftRocks() && items.moonpearl)
							|| (canLiftDarkRocks() && items.flippers && items.moonpearl))
							path1 = {ng:"a"};
						if (items.boots && items.moonpearl && canLiftDarkRocks())
							path2 = glitched("waterwalk_boots");
						if (canBombThings() && items.moonpearl && canLiftDarkRocks())
							path3 = glitched("qirn_jump");
					}
					return orCombinator(path1, path2, path3);
				case "owg":
					var path1 = {}; //Aga or portal
					var path2 = {}; //Waterwalk/swim from NW
					var path3 = {}; //DM screenwrap portal to pyramid
					var path4 = {}; //DMD to potion shop area and jump to screen transition to fake flipper (must be link)
					var path5 = {}; //Fake flute
					var path6 = {}; //Qirn jump from NW
					var path7 = {}; //From south
					if (rescueZelda()) {
						if ((dungeons[11].isBeaten() && ((items.moonpearl && must_be_link) || !must_be_link))
							|| (items.moonpearl && items.hammer && canLiftRocks()))
							path1 = {ng:"a"};
						if (items.boots || items.flippers)
							path2 = regions.northWestDarkWorld(true, new_locs, bottles);
						if (items.mirror && canSpinSpeed())
							path3 = regions.darkWestDeathMountain(must_be_link, new_locs, bottles);
						if (items.mirror)
							path4 = regions.darkWestDeathMountain(true, new_locs, bottles);
						if (hasABottle() && bottles >= 1) //Can always pull pyramid statue for link state
							path5 = andCombinator(glitched("fakeflute"), orCombinator(
								regions.darkWestDeathMountain(undefined, new_locs, bottles - 1),
								regions.darkEastDeathMountain(undefined, new_locs, bottles - 1),
								regions.northWestDarkWorld(undefined, new_locs, bottles - 1),
								regions.SouthDarkWorld(undefined, new_locs, bottles - 1),
								regions.mire(undefined, new_locs, bottles - 1)));
						if (canBombThings())
							path6 = andCombinator(glitched("qirn_jump"), regions.northWestDarkWorld(true, new_locs, bottles));
						if (items.hammer || items.flippers || items.boots)
							path7 = andCombinator(regions.SouthDarkWorld(true, new_locs, bottles));
					}
					return orCombinator(orCombinator(path1, path2, path3, path4, path5, path6), path7);
				default:
					var path1 = {}; //Aga, NW waterwalk/flippers, or portal
					var path2 = {}; //Buggy logic (fake flute using too many bottles), DM screenwrap portal to pyramid, potion shop DMD fake flipper to portal, or DMD waterwalk
					var path3 = {}; //Qirn jump from NW
					if (rescueZelda()) {
						if ((dungeons[11].isBeaten() && ((items.moonpearl && must_be_link) || !must_be_link))
							|| (items.moonpearl && ((canLiftDarkRocks() && (items.boots || items.flippers))
								|| (items.hammer && canLiftRocks()))))
							path1 = {ng:"a"};
						if (hasABottle() //1f possible, leaving in even though it's not intended
							|| ((items.mirror && canSpinSpeed()) && ((items.moonpearl && must_be_link) || !must_be_link))
							|| (items.moonpearl && (items.mirror || items.boots)))
							path2 = regions.westDeathMountain();
						if (canBombThings() && (items.moonpearl && canLiftDarkRocks()))
							path3 = glitched("qirn_jump");
					}
					return orCombinator(path1, path2, path3);
			}
		}
	},
	northWestDarkWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("northWestDarkWorld") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northWestDarkWorld");
		if (optionState === "inverted") {
			return {ng:"a"};
		} else {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Portal
					var path2 = {}; //NE
					if (items.moonpearl && rescueZelda()) {
						if ((items.hammer && canLiftRocks())
							|| canLiftDarkRocks())
							path1 = {ng:"a"};
						if (hasHookshot() && (items.flippers || canLiftRocks() || items.hammer))
							path2 = regions.northEastDarkWorld();
					}
					return orCombinator(path1, path2);
				case "owg":
					var path1 = {}; //Portal
					var path2 = {}; //From NE
					var path3 = {}; //Mirrorclip DMD
					var path4 = {}; //DMD
					var path5 = {}; //1f DMD
					var path6 = {}; //Fake flute
					if (rescueZelda()) {
						if (items.moonpearl
							&& (canLiftDarkRocks() || (items.hammer && canLiftRocks())))
							path1 = {ng:"a"};
						if (hasHookshot() && (items.hammer || canLiftRocks() || items.flippers))
							path2 = regions.northEastDarkWorld(true, new_locs, bottles);
						if (items.mirror)
							path3 = regions.darkWestDeathMountain(must_be_link, new_locs, bottles);
						if (items.boots)
							path4 = regions.darkWestDeathMountain(true, new_locs, bottles);
						path5 = andCombinator(glitched("clip1f"), regions.darkWestDeathMountain(must_be_link, new_locs, bottles));
						if (hasABottle() && bottles >= 1)
							path6 = andCombinator(glitched("fakeflute"),
								orCombinator(regions.darkWestDeathMountain(undefined, new_locs, bottles - 1)),
								orCombinator(regions.darkEastDeathMountain(undefined, new_locs, bottles - 1)),
								orCombinator(regions.northEastDarkWorld(undefined, new_locs, bottles - 1)),
								orCombinator(regions.SouthDarkWorld(undefined, new_locs, bottles - 1)),
								orCombinator(regions.mire(undefined, new_locs, bottles - 1)));
					}
					return orCombinator(path1, path2, path3, path4, path5, path6);
				default:
					var path1 = {}; //Portal or NE
					var path2 = {}; //1f DMD
					if (rescueZelda()) {
						if (items.moonpearl
							&& (canLiftDarkRocks()
								|| (items.hammer && canLiftRocks())
								|| (dungeons[11].isBeaten() && hasHookshot()
									&& (items.hammer || canLiftRocks() || items.flippers))))
							path1 = {ng:"a"};
						path2 = regions.westDeathMountain(must_be_link, new_locs, bottles);
					}
					return orCombinator(path1, path2);
			}
		}
	},
	SouthDarkWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("SouthDarkWorld") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("SouthDarkWorld");
		if (optionState === "inverted") {
			return {ng:"a"};
		} else {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Portal or NW
					var path2 = {}; //NE
					if (items.moonpearl && rescueZelda()) {
						if ((items.hammer && canLiftRocks())
							|| canLiftDarkRocks())
							path1 = {ng:"a"};
						if (items.hammer
							|| (hasHookshot()
								&& (items.flippers || canLiftRocks())))
							path2 = regions.northEastDarkWorld(undefined, new_locs, bottles);
					}
					return orCombinator(path1, path2);
				case "owg":
					var path1 = {}; //NW
					var path2 = {}; //NE
					var path3 = {}; //NE 1f moat clip
					var path4 = {}; //Fake flute
					var path5 = {}; //Clip from mire
					if (rescueZelda()) {
						path1 = regions.northWestDarkWorld(must_be_link, new_locs, bottles);
						if (items.hammmer)
							path2 = regions.northEastDarkWorld(true, new_locs, bottles);
						path3 = andCombinator(glitched("clip1f"), regions.northEastDarkWorld(must_be_link, new_locs, bottles));
						if (hasABottle() && bottles >= 1)
							path4 = andCombinator(glitched("fakeflute"),
								orCombinator(regions.northEastDarkWorld(undefined, new_locs, bottles - 1),
								regions.northWestDarkWorld(undefined, new_locs, bottles - 1),
								regions.mire(undefined, new_locs, bottles - 1),
								regions.darkWestDeathMountain(undefined, new_locs, bottles - 1),
								regions.darkEastDeathMountain(undefined, new_locs, bottles - 1)));
						if (items.boots)
							path5 = regions.mire(true, new_locs, bottles);
					}
					return orCombinator(path1, path2, path3, path4);
				default:
					var path1 = {}; //NMG
					var path2 = {}; //NW
					if (rescueZelda()) {
						if (items.moonpearl
							&& (canLiftDarkRocks()
								|| (items.hammer && canLiftRocks())
								|| (dungeons[11].isBeaten() && (items.hammer
									|| (hasHookshot() && (canLiftRocks() || items.flippers))))))
							path1 = {ng:"a"};
						path2 = regions.darkWestDeathMountain(must_be_link, new_locs, bottles);
					}
					return orCombinator(path1, path2);
			}
		}
	},
	mire: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("mire") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("mire");
		if (optionState === "inverted") {
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
		} else {
			switch (optionLogic) {
				case "nmg":
					if (rescueZelda() && canLiftDarkRocks())
						return canFly_path(new_locs);
					return {};
				case "owg":
					var path1 = {}; //Bootsclip portal
					var path2 = {}; //Portal
					var path3 = {}; //Bootsclip DW
					var path4 = {}; //Fake flute
					if (rescueZelda()) {
						if (canLiftDarkRocks() && items.boots)
							path1 = {ng:"a"};
						if (canLiftDarkRocks())
							path2 = canFly_path(new_locs);
						if (items.boots)
							path3 = regions.SouthDarkWorld(true, new_locs, bottles);
						if (hasABottle() && bottles >= 1)
							path4 = andCombinator(glitched("fakeflute"),
								orCombinator(regions.northEastDarkWorld(must_be_link, new_locs, bottles - 1),
								regions.northWestDarkWorld(must_be_link, new_locs, bottles - 1),
								regions.SouthDarkWorld(must_be_link, new_locs, bottles - 1),
								regions.darkWestDeathMountain(must_be_link, new_locs, bottles - 1),
								regions.darkEastDeathMountain(must_be_link, new_locs, bottles - 1)));
					}
					return orCombinator(path1, path2, path3, path4);
				default:
					var path1 = {}; //Fake flute or bootsclip portal
					var path2 = {}; //Portal
					var path3 = {}; //Buggy logic (fake flute using too many bottles)
					var path4 = {}; //Bootsclip DW
					if (rescueZelda()) {
						if (canLiftDarkRocks() && (hasABottle() || items.boots))
							path1 = {ng:"a"};
						if (canLiftDarkRocks())
							path2 = canFly_path(new_locs);
						if (hasABottle())
							path3 = regions.darkWestDeathMountain(must_be_link, new_locs, bottles+4); //1f possible, so leaving this in even though not intended
						if (items.boots)
							path4 = regions.SouthDarkWorld(true, new_locs, bottles);
					}
					return orCombinator(path1, path2, path3, path4);
			}
		}
	},
	northEastLightWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount()) { //Later: Add aga info
		if (from_locs.indexOf("northEastLightWorld") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northEastLightWorld");
		switch (optionLogic) {
			case "nmg":
				if ((optionState !== "inverted" && rescueZelda())
					|| (optionState === "inverted"
						&& ((dungeons[11].isBeaten() && ((items.moonpearl && must_be_link) || !must_be_link))
							|| (items.moonpearl && (canLiftDarkRocks() || (items.hammer && canLiftRocks()))))))
					return {ng:"a"};
				return {};
			default:
				if (optionState !== "inverted" && rescueZelda())
					return {ng:"a"};
				if (optionState === "inverted") {
					var path1 = {}; //Normal
					var path2 = {}; //Fake flute
					if ((dungeons[11].isBeaten() && ((items.moonpearl && must_be_link) || !must_be_link))
							|| (items.moonpearl && (canLiftDarkRocks() || (items.hammer && canLiftRocks())))
							|| (items.moonpearl && items.boots)
							|| ((items.boots && items.mirror) && ((items.moonpearl && must_be_link) || !must_be_link)))
						path1 = {ng:"a"};
					if (hasABottle() && bottles >= 1)
						path2 = andCombinator(glitched("fakeflute"),
							orCombinator(regions.westDeathMountain(undefined, new_locs, bottles - 1),
							regions.eastDeathMountain(undefined, new_locs, bottles - 1)));
					return orCombinator(path1, path2);
				}
				return {};
		}
	},
	northWestLightWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("northWestLightWorld") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("northWestLightWorld");
		return regions.northEastLightWorld(must_be_link, new_locs, bottles);
	},
	SouthLightWorld: function(must_be_link = false, from_locs = [], bottles = bottleCount()) {
		if (from_locs.indexOf("SouthLightWorld") !== -1)
			return {};
		var new_locs = from_locs.slice(0);
		new_locs.push("SouthLightWorld");
		return regions.northEastLightWorld(must_be_link, new_locs, bottles);
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
	kChestCount: 6,
	isAccessible: function(){
		if (rescueZelda())
			return {ng:"a"};
		return {};
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Compass, big, cannonball, big key, map, boss
		//Big: BK
		//Big key: lantern
		//Boss: arrow, lantern, BK, boss, compass, map
		switch (optionVariation) {
			case "keysanity":
				if (items.lantern && qtyCounter.ditems_bk0
					&& qtyCounter.ditems_comp0 && qtyCounter.ditems_map0)
					return andCombinator(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss0));
				return {};
			default:
				//Case where it is always beatable
				if (items.lantern) { //BK is always accessible with this item set
					return andCombinator(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss0));
				}
				//No case where it might be beatable
				return {};
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionVariation) {
			case "keysanity":
				var path1 = {ng:"a"}; //Free
				var path2 = {}; //Big
				var path3 = {}; //BK
				var path4 = {}; //Boss
				if (qtyCounter.ditems_bk0)
					path2 = {ng:"a"};
				if (items.lantern)
					path3 = {ng:"a"};
				if (items.lantern && qtyCounter.ditems_bk0
					&& qtyCounter.ditems_comp0 && qtyCounter.ditems_map0)
					path4 = andCombinator(canShootArrows_path(), canBeatBoss(0, qtyCounter.boss0));
				return multipleChests(path1, path2, path3, path4);
			default:
				var path1 = {ng:"a"}; //Free
				var path2 = {}; //Big
				var path3 = {}; //BK
				var path4 = {}; //Boss
				var p_bk = {}; //BK availability, can only be path1 or path3
				if (items.lantern)
					path3 = {ng:"a"};
				p_bk = anyOrAllCombinator(path1, path3);
				path2 = p_bk;
				if (items.lantern)
					path4 = andCombinator(canShootArrows_path(), p_bk, canBeatBoss(0, qtyCounter.boss0));
				var always = andCombinator(path1, path2, path3, path4);
				var possible = {ng:"p"}; //Lucky items in compass, cannonball, map
				return orCombinator(always, possible);
		}
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
		switch(optionLogic) {
			case "nmg":
				var path1 = {}; //Front
				var path2 = {}; //Dark world
				if (rescueZelda()) {
					if (items.book)
						path1 = {ng:"a"};
					if (items.mirror && canLiftDarkRocks())
						path2 = canFly_path();
				}
				return orCombinator(path1, path2);
			default:
				var path1 = {}; //Front
				var path2 = {}; //Dark world
				if (rescueZelda()) {
					if (items.book || items.boots)
						path1 = {ng:"a"};
					if (items.mirror)
						path2 = regions.mire();
				}
				return orCombinator(path1, path2);
		}
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Big, map, torch, big key, compass, boss
		//Big: BK
		//Big key, compass: SK
		//Torch: boots
		//Boss: glove, torch, BK, SK, boss, compass, map
		//BossOWG: torch, BK, SK, boss, modified entry
		//Dungeon notes:
		//SK must be in big/map/torch. If SK is in Big, then BK cannot be in compass/BK
		//  Access to big/map/torch = guaranteed SK.
		switch (optionLogic) {
			case "nmg":
				switch (optionVariation) {
					case "keysanity":
						if (canLiftRocks()
							&& canLightTorches() && qtyCounter.ditems_bk1 && qtyCounter.ditems_sk1
							&& qtyCounter.ditems_map1 && qtyCounter.ditems_comp1)
							return canBeatBoss(1, qtyCounter.boss1);
						return {};
					default:
						var path1 = {}; //Always
						var path2 = {}; //Possible
						if (canLiftRocks() && canLightTorches()) {
							if (items.boots //Guaranteed SK and hence guaranteed BK
								&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 1)) //BK might be on right side
								path1 = canBeatBoss(1, qtyCounter.boss1);
							path2 = convertPossible(canBeatBoss(1, qtyCounter.boss1)); //BK at map, SK in big chest
						}
						return orCombinator(path1, path2);
				}
			default:
				switch (optionVariation) {
					case "keysanity":
						var path1 = {}; //Light world
						var path2 = {}; //Dark world
						if (canLightTorches() && qtyCounter.ditems_bk1 && qtyCounter.ditems_sk1) {
							if ((items.book && canLiftRocks())
								|| items.boots)
								path1 = canBeatBoss(1, qtyCounter.boss1);
							if (items.mirror)
								path2 = andCombinator(regions.mire(), canBeatBoss(1, qtyCounter.boss1));
						}
						return orCombinator(path1, path2);
					default:
						var path1 = {}; //Always
						var path2 = {}; //Possible from light world
						var path3 = {}; //Possible from dark world
						if (canLightTorches()) {
							if (items.boots //Guaranteed SK and hence guaranteed BK, also fulfills modified entry
								&& (optionVariation !== "retro" || qtyCounter.hc_sk >= 1)) //BK might be right side
								path1 = canBeatBoss(1, qtyCounter.boss1);
							if ((items.book && canLiftRocks()) //BK at map, SK in big chest
								|| items.boots)
								path2 = convertPossible(canBeatBoss(1, qtyCounter.boss1));
							if (items.mirror) //BK at map, SK in big chest
								path3 = convertPossible(andCombinator(regions.mire(), canBeatBoss(1, qtyCounter.boss1)));
						}
						return orCombinator(path1, path2, path3);
				}
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Big, map, torch, big key, compass, boss
		//Big: BK
		//Big key, compass: SK
		//Torch: boots
		//Boss: glove, torch, BK, SK, boss, compass, map
		//BossOWG: torch, BK, SK, boss, modified entry
		//Dungeon notes:
		//SK must be in big/map/torch. If SK is in Big, then BK cannot be in compass/BK
		//  Access to big/map/torch = guaranteed SK.
		switch (optionVariation) {
			case "keysanity":
				var path1 = {ng:"a"}; //Free map
				var path2 = {}; //Big
				var path3 = {}; //BK, compass
				var path4 = {}; //Torch
				var path5 = {}; //Boss
				if (qtyCounter.ditems_bk1)
					path2 = {ng:"a"};
				if (qtyCounter.ditems_sk1 >= 1)
					path3 = {ng:"a"};
				if (items.boots)
					path4 = {ng:"a"};
				path5 = this.isBeatable();
				return multipleChests(path1, path2, path3, path4, path5);
			default:
				var path1 = {ng:"a"}; //Free map
				var path2 = {}; //Big
				var path3 = {}; //BK, compass
				var path4 = {}; //Torch
				var path5 = {}; //Boss
				var p_sk = {}; //SK availability, must be torch/map/big (only can be big if BK is map/torch)
				if (items.boots)
					path4 = {ng:"a"};
				p_sk = anyOrAllCombinator(path1, path4);
				if (optionVariation === "retro" && qtyCounter.hc_sk >= 1)
					path3 = {ng:"a"};
				else if (optionVariation === "retro")
					path3 = {ng:"p"}; //Can buy key
				else
					path3 = p_sk;
				path2 = anyOrAllCombinator(anyOrAllCombinator(path1, path4), path3);
				path5 = this.isBeatable();
				var always = andCombinator(path1, path2, path3, path4, path5);
				var possible = {ng:"p"}; //SK/item in map, items on BK/compass
				return orCombinator(always, possible);
		}
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
	isAccessible: function(){ //isAccessible could be from MM for MG
		switch (optionLogic) {
			case "nmg":
				if (rescueZelda()
					&& (items.mirror || (hasHookshot() && items.hammer)))
					return regions.westDeathMountain();
				return {};
			case "owg":
				var path1 = {}; //Boots DMA
				var path2 = {}; //West DM
				if (rescueZelda()) {
					if (items.boots)
						path1 = {ng:"a"};
					if (items.mirror || (hasHookshot() && items.hammer))
						path2 = regions.westDeathMountain();
				}
				return orCombinator(path1, path2);
			default:
				var path1 = {}; //Main
				var path2 = {}; //Mire
				if (rescueZelda()) {
					path1 = this.main();
					path2 = this.mire();
				}
				return orCombinator(path1, path2);
		}
	},
	canGetPrize: function(){
		switch (optionLogic) {
			case "nmg":
			case "owg":
				return this.isBeatable();
			default:
				return this.isBeatable(); //Changed because app function is wrong, you can't dupe Hera in SP
		}
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
		if (items.boots)
			path1 = {ng:"a"};
		if (items.mirror || (hasHookshot() && items.hammer))
			path2 = regions.westDeathMountain();
		return orCombinator(path1, path2);
	},
	mire: function(){
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
		switch (optionLogic) {
			case "nmg":
			case "owg":
				if (rescueZelda() && items.moonpearl)
					return regions.northEastDarkWorld();
				return {};
			default:
				var path1 = {}; //NE
				var path2 = {}; //Kikiskip
				if (rescueZelda()) {
					if (glitchedLinkInDarkWorld())
						path1 = regions.northEastDarkWorld();
					path2 = regions.westDeathMountain();
				}
				return orCombinator(path1, path2);
		}
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
		switch (optionLogic) {
			case "nmg":
			case "owg":
				if (rescueZelda() && (items.moonpearl || items.mirror)) //NMG guaranteed pearl. OWG needs pearl or mirror to read hint
					return regions.SouthDarkWorld();
				return {};
			default:
				path1 = {}; //Main
				path2 = {}; //Mire
				if (rescueZelda()) {
					path1 = this.main();
					path2 = this.mire();
				}
				return orCombinator(path1, path2);
		}
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
							return orCombinator(!isEmpty(this.mire()) ? {ng:"au"} : {}, (items.moonpearl && items.mirror && items.flippers && !isEmpty(this.main())) ? {ng:"au"} : {}); //map in normal mode, entrance in retro mode
						}
						return result;
				}
		}
	},
	main: function(){ //changed so you need glitchedLink or mirror to read hint. Need pearl+mirror+flippers to access rest, per logic
		if (glitchedLinkInDarkWorld() || items.mirror)
			return regions.SouthDarkWorld();
		return {};
	},
	mire: function() { //This is more restrictive than it needs to be, but it's how the logic is right now
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
		switch (optionLogic) {
			case "nmg":
				if (rescueZelda() && items.moonpearl)
					return regions.northWestDarkWorld();
				return {};
			default:
				if (rescueZelda())
					return regions.northWestDarkWorld(); //expects dungeon bunny revival
				return {};
		}
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Big, BK, compass, map, bridge, prison, pinball, boss
		//Big: BK
		//Bridge: pearl, firerod
		//Pinball: always has SK
		//Boss: pearl, firerod, swordless/sword, 3SK, boss, compass, map
		switch (optionVariation) {
			case "keysanity":
				if (items.moonpearl && items.firerod
					&& (optionSwords === "swordless" || hasSword())
					&& qtyCounter.ditems_sk5 >= 2 && qtyCounter.ditems_comp5 && qtyCounter.ditems_map5)
					return canBeatBoss(5, qtyCounter.boss5);
				return {};
			default:
				var path1 = {}; //Always
				var path2 = {}; //Possible
				if (items.moonpearl && items.firerod
					&& (optionSwords === "swordless" || hasSword())) {
					if ((optionVariation === "retro" && qtyCounter.hc_sk >= 2)
						|| optionVariation !== "retro")
						path1 = canBeatBoss(5, qtyCounter.boss5);
					path2 = convertPossible(5, qtyCounter.boss5); //Can buy keys
				}
				return orCombinator(path1, path2);
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionVariation) {
			case "keysanity":
				var path1 = {ng:"a"}; //Free BK, compass, map, prison, pinball(SK)
				var path2 = {}; //Big
				var path3 = {}; //Bridge
				var path4 = {}; //Boss
				if (qtyCounter.ditems_bk5)
					path2 = {ng:"a"};
				if (items.moonpearl && items.firerod)
					path3 = {ng:"a"};
				path4 = this.isBeatable();
				return multipleChests(path1, path2, path3, path4);
			default:
				var path1 = {ng:"a"}; //Free BK, compass, map, prison, pinball(SK)
				var path2 = {}; //Big
				var path3 = {}; //Bridge
				var path4 = {}; //Boss
				if (items.moonpearl && items.firerod)
					path3 = {ng:"a"};
				path4 = this.isBeatable();
				path2 = anyOrAllCombinator(anyOrAllCombinator(path1, path3), path4);
				var always = andCombinator(path1, path2, path3, path4);
				var possible = {ng:"p"}; //Items in BK, compass, map, prison, pinball(SK)
				return orCombinator(always, possible);
		}
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
	kChestCount: 8,
	isAccessible: function(){
		switch (optionLogic) {
			case "nmg":
			case "owg":
				if (rescueZelda() && items.moonpearl)
					return regions.northWestDarkWorld();
				return {};
			default:
				if (rescueZelda() && glitchedLinkInDarkWorld())
					return regions.northWestDarkWorld();
				return {};
		}
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//Attic, BK, map, compass, ambush, big, cell, boss
		//Attic: SK, BK
		//Big: Hammer, SK, BK (if SK then hammer, BK)
		//Cell: BK
		//Boss: SK, BK, boss, compass, map
		switch (optionVariation) {
			case "keysanity":
				if (qtyCounter.ditems_sk6 >= 1 && qtyCounter.ditems_bk6 && qtyCounter.ditems_comp6 && qtyCounter.ditems_map6)
					return canBeatBoss(6, qtyCounter.boss6);
				return {};
			default:
				//BK is always in a free chest -> Cell is free too
				//SK could be in big chest
				var path1 = {}; //Always
				var path2 = {}; //Possible
				if ((optionVariation === "retro" && qtyCounter.hc_sk >= 1)
					|| (optionVariation !== "retro" && items.hammer)) //SK could be in big chest, meaning we need hammer to get SK
					path1 = canBeatBoss(6, qtyCounter.boss6);
				path2 = convertPossible(canBeatBoss(6, qtyCounter.boss6)); //BK and SK could be free
				return orCombinator(path1, path2);
		}
	},
	canGetChests: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		switch (optionVariation) {
			case "keysanity":
				var path1 = {ng:"a"}; //BK, map, compass, ambush free
				var path2 = {}; //Attic
				var path3 = {}; //Big
				var path4 = {}; //Cell
				var path5 = {}; //Boss
				if (qtyCounter.ditems_bk6 && qtyCounter.ditems_sk6 >= 1)
					path2 = {ng:"a"};
				if (items.hammer && qtyCounter.ditems_bk6 && qtyCounter.ditems_sk6 >= 1)
					path3 = {ng:"a"};
				if (qtyCounter.ditems_bk6)
					path4 = {ng:"a"};
				path5 = this.isBeatable();
				return multipleChests(path1, path2, path3, path4, path5);
			default:
				var path1 = {ng:"a"}; //BK, map, compass, ambush free
				var path2 = {}; //Attic
				var path3 = {}; //Big
				var path4 = {}; //Cell
				var path5 = {}; //Boss
				path4 = path1; //BK always free
				if (items.hammer) {
					if (optionVariation === "retro" && qtyCounter.hc_sk >= 1)
						path3 = {ng:"a"};
					else if (optionVariation === "retro") //Can buy key
						path3 = {ng:"p"};
					else
						path3 = {ng:"a"}; //Already have SK from other locations, if SK here, then only need hammer+BK
				}
				path2 = anyOrAllCombinator(path1, path3); //SK location, BK location is free
				path5 = this.isBeatable();
				var always = andCombinator(path1, path2, path3, path4, path5);
				var possible = {ng:"p"} //3 items+BK in front, 1 item/SK in cell, 1 item in attic
				return orCombinator(always, possible);
		}
	},
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
	isAccessible: function(){ //Took out canMeltThings req for NMG/OWG
		switch (optionLogic) {
			case "nmg":
				if (rescueZelda() && items.moonpearl && items.flippers && canLiftDarkRocks())
					return {ng:"a"};
				return {};
			case "owg":
				if (rescueZelda() && canLiftDarkRocks())
					return {ng:"a"};
				return {};
			default:
				var path1 = {}; //Portal
				var path2 = {}; //Mirrorwrap with 1f? - WOW
				if (rescueZelda()) {
					if (canLiftDarkRocks())
						path1 = {ng:"a"};
					if (items.mirror && glitchedLinkInDarkWorld())
						path2 = regions.SouthDarkWorld();
				}
				return orCombinator(path1, path2);
		}
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		if (isEmpty(this.isAccessible()))
			return {};
		//BK, compass, map, spike, freezor, icedT, big, boss
		//BK, map: melt, hammer, glove, non-ohko/byrna/cape/hookshot, spike
		//Compass, icedT: melt
		//Spike: melt, non-ohko/byrna/cape/hookshot, hookshot/BK+hookshot/noBK+SK
		//Freezor: melt*
		//Big: melt, BK
		//Boss: hammer, melt*, glove, boss, BK, (somaria+SK)/2SK, compass, map
		switch (optionVariation) {
			case "keysanity":
				if (items.hammer && canMeltThings() && canLiftRocks() && qtyCounter.ditems_bk7
					&& ((items.somaria && qtyCounter.ditems_sk7 >= 1)
						|| qtyCounter.ditems_sk7 >= 2)
					&& qtyCounter.ditems_comp7 && qtyCounter.ditems_map7)
					return canBeatBoss(7, qtyCounter.boss7);
				return {};
			default:
				var path1 = {}; //Always
				var path2 = {}; //Possible
				if (items.hammer && canMeltThings() && canLiftRocks()) {
					if ((optionVariation !== "retro"
						&& items.somaria //if Kholdstare has SK
						&& hasHookshot()) //if BK and both SK are hookshot locked
						|| (optionVariation === "retro"
							&& ((items.somaria && qtyCounter.hc_sk >= 1) || qtyCounter.hc_sk >= 2)
							//Now if BK is outside of right, we can already get it
							&& ((hasHookshot() || qtyCounter.hc_sk >= 1) //If BK is right side
								&& ((optionVariation !== "ohko" && optionVariation !== "timedohko")
									|| items.byrna || items.cape || hasHookshot())))) //BK in spike/BK/map
						path1 = canBeatBoss(7, qtyCounter.boss7);
					path2 = convertPossible(canBeatBoss(7, qtyCounter.boss7)); //BK in freezor, SK in big and compass
				}
				return orCombinator(path1, path2);
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
						var path1 = {}; //Compass, icedT, freezor
						var path2 = {}; //Spike
						var path3 = {}; //BK, map
						var path4 = {}; //Big
						var path5 = {}; //Boss
						if (canMeltThings())
							path1 = {ng:"a"};
						if (canMeltThings()
							&& (hasHookshot() || qtyCounter.ditems_sk7 >= 1))
							path2 = {ng:"a"};
						if (canMeltThings() && items.hammer && canLiftRocks())
							path3 = path2;
						if (canMeltThings() && qtyCounter.ditems_bk7)
							path4 = {ng:"a"};
						path5 = this.isBeatable();
						return multipleChests(path1, path2, path3, path4, path5);
					default:
						var path1 = {}; //Compass, icedT, freezor
						var path2 = {}; //Spike
						var path3 = {}; //BK, map
						var path4 = {}; //Big
						var path5 = {}; //Boss
						if (canMeltThings())
							path1 = {ng:"a"};
						if (canMeltThings() && hasHookshot())
							path2 = {ng:"a"};
						else if (canMeltThings()
								&& ((optionVariation !== "ohko" && optionVariation !== "timedohko")
									|| items.byrna || items.cape))
							path2 = {ng:"p"}; //Could be SK outside/bought and BK on right side
						if (canMeltThings() && items.hammer && canLiftRocks()
							&& ((optionVariation !== "ohko" && optionVariation !== "timedohko")
								|| items.byrna || items.cape || hasHookshot()))
							path3 = path2;
						if (canMeltThings())
							path4 = anyOrAllCombinator(anyOrAllCombinator(path1, path2), path3);
						path5 = this.isBeatable();
						var always = andCombinator(path1, path2, path3, path4, path5);
						var possible = {};
						if (canMeltThings() && optionVariation !== "retro")
							possible = {ng:"p"}; //Lucky items in compass, icedT, freezor
						else if (optionVariation === "retro" && canMeltThings() //Lucky 2 more items & BK in spike+BK+compass
							&& items.hammer && items.glove)
							possible = {ng:"p"};
						var result = orCombinator(always, possible);
						if (isEmpty(result)) {
							if (canMeltThings())
								return {ng:"au"};
							return {};
						}
						return result;
				}
			default:
				switch (optionVariation) {
					case "keysanity":
						var path1 = {ng:"a"}; //Compass, icedT free
						var path2 = {}; //Spike
						var path3 = {}; //BK, map
						var path4 = {}; //Big
						var path5 = {}; //Boss
						var path6 = {}; //Freezor
						if (canMeltThings())
							path6 = {ng:"a"};
						if (hasHookshot() || qtyCounter.ditems_sk7 >= 1)
							path2 = {ng:"a"};
						if (items.hammer && canLiftRocks())
							path3 = path2;
						if (qtyCounter.ditems_bk7)
							path4 = {ng:"a"};
						path5 = this.isBeatable();
						return multipleChests(path1, path2, path3, path4, path5, path6);
					default:
						var path1 = {ng:"a"}; //Compass, icedT free
						var path2 = {}; //Spike
						var path3 = {}; //BK, map
						var path4 = {}; //Big
						var path5 = {}; //Boss
						var path6 = {}; //Freezor
						if (hasHookshot())
							path2 = {ng:"a"};
						else if ((optionVariation !== "ohko" && optionVariation !== "timedohko")
									|| items.byrna || items.cape)
							path2 = {ng:"p"}; //Could be SK outside/bought and BK on right side
						if (items.hammer && canLiftRocks()
							&& ((optionVariation !== "ohko" && optionVariation !== "timedohko")
								|| items.byrna || items.cape || hasHookshot()))
							path3 = path2;
						path4 = anyOrAllCombinator(anyOrAllCombinator(path1, path2), path3);
						path5 = this.isBeatable();
						if (canMeltThings())
							path6 = {ng:"a"};
						var always = andCombinator(path1, path2, path3, path4, path5, path6);
						var possible = {};
						if (canMeltThings() && optionVariation !== "retro")
							possible = {ng:"p"}; //Lucky items in compass, icedT, freezor
						else if (optionVariation !== "retro" //Lucky items in compass, icedT, spike
							&& ((optionVariation !== "ohko" && optionVariation !== "timedohko")
								|| items.byrna || items.cape || hasHookshot()))
							possible = {ng:"p"};
						//Lucky items in compass, icedT, boss no good, because need BK from elsewhere
						else if (optionVariation === "retro" //Lucky items in compass, icedT, spike, compass, big (BK in BK)
							&& items.hammer && items.glove)
							possible = {ng:"p"};
						var result = orCombinator(always, possible);
						if (isEmpty(result)) {
							return {ng:"au"};
						}
						return result;
				}
		}
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
		switch (optionLogic) {
			case "nmg":
			case "owg":
				if (rescueZelda() && (optionSwords === "swordless" || hasSword())
					&& items.moonpearl && (items.boots || hasHookshot()))
					return andCombinator(andCombinator(canKillMostThings_path(), regions.mire()), medallionCheck_path(8));
				return {};
			default:
				if (rescueZelda() && (optionSwords === "swordless" || hasSword())
					&& (items.moonpearl || (hasABottle() && items.boots))
					&& (items.boots || hasHookshot())) {
					var kill = canKillMostThings_path();
					if (items.icerod && hasHookshot()) //kill wizzrobes and popos
						kill = {ng:"a"};
					return andCombinator(andCombinator(kill, regions.mire()), medallionCheck_path(8)); //Adding canKillMostThings as the intent.
				}
				return {};
		}
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
		switch(optionLogic) {
			case "nmg":
				if (rescueZelda() && (optionSwords === "swordless" || hasSword())
					&& items.moonpearl && canLiftDarkRocks() && items.hammer)
					return andCombinator(medallionCheck_path(9), regions.eastDeathMountain());
				return {};
			case "owg":
				if (rescueZelda())
					return orCombinator(this.upper(), this.middle());
				return {};
			default:
				if (rescueZelda())
					return orCombinator(this.lower(), this.middle(), this.upper());
				return {};
		}
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
		switch (optionLogic) {
			case "nmg":
				return {};
			case "owg":
				if ((optionSwords === "swordless" || hasSword())
					&& items.moonpearl && items.hammer
					&& (canLiftDarkRocks() || items.boots))
					return andCombinator(medallionCheck_path(9), regions.eastDeathMountain());
				return {};
			default:
				if ((optionSwords === "swordless" || hasSword())
					&& (items.moonpearl || (hasABottle() && items.boots)) && items.hammer
					&& (canLiftDarkRocks() || items.boots))
					return andCombinator(medallionCheck_path(9), regions.eastDeathMountain());
				return {};
		}
	},
	middle: function(){
		switch (optionLogic) {
			case "nmg":
				return {};
			case "owg":
				if ((items.mirror || (items.moonpearl && canSpinSpeed()))
					&& (items.boots || items.somaria || hasHookshot() //Big chest entrance
						|| (canBombThings() && ((optionVariation !== "ohko" && optionVariation !== "timedohko") || items.cape || items.byrna)))) //Laser wall entrance
					return regions.darkEastDeathMountain();
				return {};
			default:
				if ((items.mirror || (glitchedLinkInDarkWorld() && canSpinSpeed()))
					&& (items.boots || items.somaria || hasHookshot() //Big chest entrance
						|| (canBombThings() && ((optionVariation !== "ohko" && optionVariation !== "timedohko") || items.cape || items.byrna)))) //Laser wall entrance
					return regions.darkEastDeathMountain();
				return {};
		}
	},
	lower: function(){
		if (items.mirror && (items.moonpearl || (hasABottle() && items.boots))) //Have to 1f up to wrap?
			return regions.westDeathMountain();
		return {};
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
	isAccessible: function(){
		switch (optionLogic) {
			case "nmg":
				var crystals = 0;
				for (i = 0; i < 10; i++)
					if (dungeons[i].gotPrize() && qtyCounter["dungeonPrize"+i] >= 1 && qtyCounter["dungeonPrize"+i] <= 2)
						crystals++;
				if (rescueZelda() && items.moonpearl && crystals === 7)
					return regions.darkEastDeathMountain();
				return {};
			case "owg":
				if (rescueZelda() && items.boots && items.moonpearl)
					return {ng:"a"};
				return {};
			default:
				if (rescueZelda())
					return regions.westDeathMountain();
				return {};
		}
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
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
	isBeatable: function(){
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
		if (dungeons[10].isBeaten())
			return regions.northEastDarkWorld();
		return {};
	},
	canGetPrize: function(){
		return this.isBeatable();
	},
	isBeatable: function(){
		switch (optionGoal) {
			case "alldungeons":
				for (var i = 0; i < 10; i++)
					if (!dungeons[i].gotPrize())
						return {};
				if (!dungeons[10].isBeaten() || !dungeons[11].isBeaten())
					return {};
				break;
			case "ganon":
				var count = 0;
				for (var i = 0; i < 10; i++)
					if (qtyCounter["dungeonPrize"+i] >= 1 && qtyCounter["dungeonPrize"+i] <= 2) {
						count++;
						if (!dungeons[i].gotPrize())
							return {};
					}
				if (count !== 7)
					return {};
				break;
		}
		if (items.moonpearl && dungeons[10].isBeaten()
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
	}
};

var chests = new Array;

//Logic bug involving MG bootsless seeds for: magic bat, graveyard ledge, lake hylia
//	Issue #664 filed
//Floating island MG logic is bad
//	Issue #664 filed
//Mire MG logic has no reqs
//	Issue #664 filed

//NorthEast LightWorld chests, region is always accessible from Link's House
chests[0] = {
	name: "Sahasrahla's Hut",
	family: "Sahasrahla's Hut",
	hint: "<img src='images/bombs.png' class='mini'>/<img src='images/boots.png' class='mini'>",
	x: "40.13%",
	y: "42.33%", //45.26%
	isOpened: false,
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
						path3 = andCombinator(glitched("unbunny"), glitched("superbunny_mirror"), regions.northEastLightWorld());
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
	isAvailable: function(){
		if (optionState !== "inverted") {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Waterwalk
					var path3 = {}; //Fake flipper
					var path4 = {}; //Fairy revive
					var path5 = {}; //Fairy revive from enemy RNG
					if (canLiftRocks() || items.flippers)
						path1 = regions.northEastLightWorld();
					if (items.boots)
						path2 = andCombinator(glitched("waterwalk_boots"), regions.northEastLightWorld());
					path3 = andCombinator(glitched("fakeflipper"), regions.northEastLightWorld());
					if (canBombThings())
						path4 = andCombinator(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					path5 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3, path4, path5);
				default:
					return regions.northEastLightWorld(); //Fake flipper from south or NE
			}
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //Fake flipper w/waterwalk through Zora's Domain
					var path3 = {}; //Fake flipper w/moonpearl w/stored waterwalk
					var path4 = {}; //Fake flipper w/moonpearl into fairy revive
					var path5 = {}; //Bomb revive w/moonpearl into fairy revive
					var path6 = {}; //RNG revive w/moonpearl into fairy revive <-- same as path5
					var path7 = {}; //Waterwalk into fairy revive
					var pathv = {}; //View item
					if (items.flippers)
						path1 = regions.northEastLightWorld();
					if (items.boots)
						path2 = andCombinator(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld());
					if (items.moonpearl && items.boots)
						path3 = andCombinator(glitched("fakeflipper"), glitched("waterwalk_boots"), regions.northEastLightWorld());
					if (items.moonpearl && canBombThings())
						path4 = andCombinator(glitched("fakeflipper"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					if (items.moonpearl && canBombThings())
						path5 = andCombinator(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 2));
					if (items.boots && canBombThings())
						path7 = andCombinator(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					pathv = convertView(chests[2].isAvailable());
					return orCombinator(orCombinator(path1, path2, path3, path4, path5, path7), pathv);
				default:
					var path1 = {}; //Get item
					var path2 = {}; //Fake flipper w/waterwalk through Zora's Domain
					var path4 = {}; //Fake flipper w/moonpearl into fairy revive
					var path5 = {}; //Bomb revive w/moonpearl into fairy revive
					var path6 = {}; //RNG revive w/moonpearl into fairy revive <-- same as path5
					var path7 = {}; //Waterwalk into fairy revive
					var pathv = {}; //View item
					if (items.flippers || (items.boots && items.moonpearl))
						path1 = regions.northEastLightWorld();
					if (items.boots)
						path2 = andCombinator(glitched("fakeflipper_zora"), glitched("waterwalk_boots"), regions.northEastLightWorld());
					if (items.moonpearl && canBombThings())
						path4 = andCombinator(glitched("fakeflipper"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					if (items.moonpearl && canBombThings())
						path5 = andCombinator(canGetFairy_path(2), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 2));
					if (items.boots && canBombThings())
						path7 = andCombinator(glitched("waterwalk_boots"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
					pathv = convertView(chests[2].isAvailable());
					return orCombinator(path1, path2, path4, path5, path7, pathv);
			}
		else
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
						path4 = andCombinator(glitched("fakeflipper"), canGetFairy_path(), glitched("bombfairy_fakeflipper"), regions.northEastLightWorld(true, undefined, bottleCount() - 1));
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Fake flipper
					var path3 = {}; //Waterwalk
					if (items.flippers)
						path1 = regions.northEastLightWorld();
					if (items.moonpearl)
						path2 = orCombinator(andCombinator(glitched("fakeflipper"), regions.northEastLightWorld()),
							andCombinator(orCombinator(canBombThings() ? andCombinator(canGetFairy_path(), glitched("bombfairy_fakeflipper")) : {}, glitched("enemyfairy_fakeflipper")), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1)));
					if (items.boots)
						path3 = andCombinator(glitched("waterwalk_boots"), regions.northEastLightWorld());
					return orCombinator(path1, path2, path3);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Waterwalk
					if (items.flippers || items.moonpearl)
						path1 = regions.northEastLightWorld();
					if (items.boots)
						path2 = andCombinator(glitched("waterwalk_boots"), regions.northEastLightWorld());
					return orCombinator(path1, path2);
			}
		else
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
						path2 = andCombinator(glitched("surfingbunny_mirror"), glitched("superbunny_mirror"), regions.northEastLightWorld());
					if (items.mirror)
						path3 = andCombinator(glitched("enemyfairy_fakeflipper"), canGetFairy_path(), glitched("superbunny_mirror"), regions.northEastLightWorld(undefined, undefined, bottleCount() - 1));
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
			path1 = regions.northWestLightWorld();
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					if (items.boots) {
						var path1 = {}; //Light world
						var path2 = {}; //Dark world
						if (canLiftDarkRocks())
							path1 = regions.northWestLightWorld();
						if (items.mirror)
							path2 = andCombinator(regions.northWestDarkWorld(true), regions.northWestLightWorld());
						return orCombinator(path1, path2);
					}
					return {};
				default:
					var path1 = {}; //Light world
					var path2 = {}; //Dark world
					var path3 = {}; //GYL
					if (items.boots) {
						if (canLiftDarkRocks())
							path1 = regions.northWestLightWorld();
						if (items.mirror)
							path2 = andCombinator(regions.northWestDarkWorld(true), regions.northWestLightWorld());
						path3 = andCombinator(glitched("kingtomb"), regions.westDeathMountain());
					}
					return orCombinator(path1, path2, path3);
			}
		else
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
				path2 = andCombinator(glitched("unbunny"), glitched("superbunny_mirror"), regions.northWestLightWorld());
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
					var path5 = {}; //Superbunny hit
					if (canBombThings())
						path1 = regions.northWestLightWorld(true);
					if (canBombThings() && items.mirror)
						path2 = andCombinator(glitched("unbunny"), glitched("superbunny_mirror"), regions.northWestLightWorld());
					path3 = regions.northWestLightWorld(true);
					if (items.mirror)
						path4 = andCombinator(glitched("superbunny_mirror"), regions.northWestLightWorld());
					if (optionVariation !== "ohko" && optionVariation !== "timedohko")
						path5 = andCombinator(glitched("superbunny_hit"), regions.northWestLightWorld());
					return multipleChests(orCombinator(path1, path2), orCombinator(path3, path4, path5));
				default:
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
					return multipleChests(orCombinator(path1, path2), orCombinator(path3, path4, path5));
			}
	}
};
chests[12] = {
	name: "Pegasus Rocks",
	hint: "<img src='images/boots.png' class='mini'>",
	x: "18.74%", //19.34%
	y: "29.27%",
	isOpened: false,
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Fake powder
					if (hasPowder()
						&& (items.hammer || (items.moonpearl && items.mirror && canLiftDarkRocks())))
						path1 = regions.northWestLightWorld();
					if (hasMushroom() && items.somaria
						&& (items.hammer || (items.moonpearl && items.mirror && canLiftDarkRocks())))
						path2 = andCombinator(glitched("fakepowder"), regions.northWestLightWorld());
					return orCombinator(path1, path2);
				case "owg":
					var path1 = {}; //Normal
					var path2 = {}; //Fake powder
					if (hasPowder()
						&& (items.hammer || items.boots || (items.moonpearl && items.mirror && canLiftDarkRocks())))
						path1 = regions.northWestLightWorld();
					if (hasMushroom() && items.somaria
						&& (items.hammer || items.boots || (items.moonpearl && items.mirror && canLiftDarkRocks())))
						path2 = andCombinator(glitched("fakepowder"), regions.northWestLightWorld());
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Normal
					var path2 = {}; //Fake powder
					if (hasPowder()
						&& (items.hammer || items.boots || items.mirror)) //Buggy logic, need to 1f DMA, then mirrorclip DMA and mirrorwrap bat
						path1 = regions.northWestLightWorld();
					if (hasMushroom() && items.somaria
						&& (items.hammer || items.boots || items.mirror)) //Buggy logic, need to 1f DMA, then mirrorclip DMA and mirrorwrap bat
						path2 = andCombinator(glitched("fakepowder"), regions.northWestLightWorld());
					return orCombinator(path1, path2);
			}
		else
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					if (items.mirror && items.moonpearl)
						return andCombinator(regions.northWestDarkWorld(), regions.northWestLightWorld());
					return {};
				case "owg":
					var path1 = {}; //DMA then teleport down (WOW)
					var path2 = {}; //NMG
					if (items.boots)
						path1 = regions.northWestLightWorld();
					if (items.mirror && items.moonpearl)
						path2 = andCombinator(regions.northWestDarkWorld(), regions.northWestLightWorld());
					return orCombinator(path1, path2);
				default:
					if (items.boots
						|| (items.mirror && glitchedLinkInDarkWorld())) //Buggy logic, 1f DMA, then fake flute
						return regions.northWestLightWorld();
					return {};
			}
		else {
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
				path2 = andCombinator(glitched("unbunny"), glitched("superbunny_mirror"), regions.SouthLightWorld());
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
					path3 = andCombinator(glitched("bigbomb"), glitched("unbunny"), glitched("superbunny_mirror"), killpath, regions.SouthLightWorld());
				}
				var superb1 = {};
				if (items.mirror)
					superb1 = glitched("superbunny_mirror");
				var superb2 = {};
				if (optionVariation !== "ohko" && optionVariation !== "timedohko")
					superb2 = glitched("superbunny_hit");
				superb_path = orCombinator(superb1, superb2);
				var kill1 = {}; //Sword beams
				var kill2 = orCombinator(canGetGoodBee_path(), canGetBee_path()); //Bee
				if (hasSword(2))
					kill1 = {ng:"a"};
				killpath = orCombinator(kill1, kill2);
				path2 = andCombinator(glitched("bigbomb"), superb_path, killpath, regions.SouthLightWorld());
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
					path2 = andCombinator(glitched("bigbomb"), glitched("superbunny_mirror"), regions.SouthLightWorld());
				if (optionVariation !== "ohko" && optionVariation !== "timedohko")
					path3 = andCombinator(glitched("bigbomb"), glitched("superbunny_hit"), regions.SouthLightWorld());
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
	isAvailable: function(){
		if (optionState !== "inverted") {
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Waterwalk
					var path3 = {}; //Fake flipper
					var path4 = {}; //Fairy revive
					var path5 = {}; //Enemy RNG
					if (items.flippers)
						path1 = regions.SouthLightWorld();
					if (items.boots)
						path2 = andCombinator(glitched("waterwalk_boots"), regions.SouthLightWorld());
					path3 = andCombinator(glitched("fakeflipper"), regions.SouthLightWorld());
					if (canBombThings())
						path4 = andCombinator(glitched("bombfairy_fakeflipper"), canGetFairy_path(), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					path5 = andCombinator(canGetFairy_path(), glitched("enemyfairy_fakeflipper"), regions.SouthLightWorld(undefined, undefined, bottleCount() - 1));
					return orCombinator(path1, path2, path3, path4, path5);
				default:
					return regions.SouthLightWorld();
			}
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Get item
					var path2 = {}; //View item
					if (items.book
						&& (hasSword(2) || (optionSwords === "swordless" && items.hammer))
						&& items.mirror)
						path1 = andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld());
					if (items.book && items.mirror)
						path2 = convertView(andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld()));
					return orCombinator(path1, path2);
				default:
					var path1 = {}; //Get item from light
					var path2 = {}; //View item from light
					var path3 = {}; //Get item from dark
					var path4 = {}; //View item from dark
					if (items.book) {
						if (items.boots) {
							if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
								path1 = regions.SouthLightWorld();
							path2 = convertView(regions.SouthLightWorld());
						}
						if (items.mirror) {
							if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
								path3 = andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld());
							path4 = convertView(andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld()));
						}
					}
					return orCombinator(path1, path2, path3, path4);
			}
		else {
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					if (items.mirror)
						return andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld());
					return {};
				default:
					var path1 = {}; //Light world
					var path2 = {}; //Dark world
					if (items.boots)
						path1 = regions.SouthLightWorld();
					if (items.mirror)
						path2 = andCombinator(regions.SouthDarkWorld(), regions.SouthLightWorld());
					return orCombinator(path1, path2);
			}
		else
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					if (canLiftDarkRocks() && items.mirror)
						return andCombinator(canFly_path(), regions.SouthLightWorld());
					return {};
				default:
					var path1 = {}; //Light world
					var path2 = {}; //Dark world
					if (canLiftRocks()) {
						if (items.boots)
							path1 = regions.SouthLightWorld();
						if (items.mirror)
							path2 = andCombinator(regions.mire(), regions.SouthLightWorld());
					}
					return orCombinator(path1, path2);
			}
		else {
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
						path3 = andCombinator(glitched("superbunny_hit"), regions.SouthLightWorld());
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
	isAvailable: function(){
		if (optionState !== "inverted")
			switch (optionLogic) {
				case "nmg":
					var path1 = {}; //Normal
					var path2 = {}; //Surfing bunny from mirror, then wriggle
					var path3 = {}; //Waterwalk
					var pathv = {}; //View item
					if (items.flippers && items.mirror) {
						path1 = andCombinator(orCombinator(regions.SouthDarkWorld(true), regions.northEastDarkWorld(true)), regions.SouthLightWorld());
						path2 = andCombinator(glitched("surfingbunny_mirror"), glitched("wriggle"), regions.northEastDarkWorld());
					}
					if (items.boots && items.mirror)
						path3 = andCombinator(glitched("waterwalk_boots"), regions.northWestDarkWorld(true));
					pathv = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3, pathv);
				case "owg":
					var path1 = {}; //Light world
					var path2 = {}; //Dark world
					var path3 = {}; //Surfing bunny from NE, then wriggle
					var path4 = {}; //View item
					if (items.boots)
						path1 = regions.SouthLightWorld();
					if (items.flippers && items.mirror) {
						path2 = andCombinator(regions.SouthDarkWorld(true), regions.SouthLightWorld());
						path3 = andCombinator(regions.northEastDarkWorld(), regions.SouthLightWorld());
					}
					path4 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3, path4);
				default:
					var path1 = {}; //Light world
					var path2 = {}; //Buggy logic, 1f DMA, then mirrorclip DMD, then linkstate
					var path3 = {}; //Surfing bunny from NE
					var path4 = {}; //View item
					if (items.boots)
						path1 = regions.SouthLightWorld();
					if (items.flippers && items.mirror) {
						if (glitchedLinkInDarkWorld())
							path2 = regions.SouthLightWorld();
						path3 = andCombinator(regions.northEastDarkWorld(), regions.SouthLightWorld());
					}
					path4 = convertView(regions.SouthLightWorld());
					return orCombinator(path1, path2, path3, path4);
			}
		else
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
	isAvailable: function(){
		if (items.lantern)
			return regions.westDeathMountain();
		return {};
	}
};
chests[36] = {
	name: "Spectacle Rock Cave",
	x: "24.17%",
	y: "14.63%", //14.60%
	isOpened: false,
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (items.book
					&& (items.mirror || (items.hammer && hasHookshot()))) {
					if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
						path1 = regions.westDeathMountain();
					path2 = convertView(regions.westDeathMountain());
				}
				return orCombinator(path1, path2);
		default:
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (items.book) {
					if (hasSword(2) || (optionSwords === "swordless" && items.hammer))
						path1 = andCombinator(dungeons[2].isAccessible(), regions.westDeathMountain());
					path2 = convertView(andCombinator(dungeons[2].isAccessible(), regions.westDeathMountain()));
				}
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (items.mirror)
					path1 = regions.westDeathMountain();
				path2 = convertView(regions.westDeathMountain());
				return orCombinator(path1, path2);
			default:
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (items.boots || items.mirror)
					path1 = regions.westDeathMountain();
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
	isAvailable: function(){
		return regions.eastDeathMountain();
	}
};
chests[40] = { //check dungeon[9].isAccessible assumptions
	name: "Mimic Cave",
	hint: "<img src='images/mirror.png' class='mini'><img src='images/medallion0.png' class='mini'><img src='images/sword1.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/somaria.png' class='mini'><img src='images/glove2.png' class='mini'><img src='images/hammer.png' class='mini'> (possibly <img src='images/firerod.png' class='mini'>)",
	x: "42.06%", //41.76%
	y: "8.94%", //9.13%
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.mirror && items.somaria && items.hammer) {
					if ((items.firerod && optionVariation !== "retro" && optionVariation !== "keysanity") //no SK in compass, need SK in roller room
						|| (qtyCounter.hc_sk >= 2 && optionVariation === "retro")
						|| (qtyCounter.ditems_sk9 >= 2 && optionVariation === "keysanity"))
						return andCombinator(dungeons[9].isAccessible(), regions.eastDeathMountain());
					if ((optionVariation !== "retro" && optionVariation !== "keysanity") //SK in compass and chainchomps
						|| optionVariation === "retro") //possible, but need more keys
						return convertPossible(andCombinator(dungeons[9].isAccessible(), regions.eastDeathMountain()));
				}
				return {};
			default:
				if (items.hammer && items.mirror)
					return andCombinator(regions.darkEastDeathMountain(), regions.eastDeathMountain());
				return {};
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
	isAvailable: function(){
		if (canBombThings())
			return regions.eastDeathMountain();
		return {};
	}
};
chests[42] = {
	name: "Paradox Cave Upper",
	family: "Paradox Cave Upper",
	hint: "<img src='images/sword2.png' class='mini'>/<img src='images/allbow10.png' class='mini'>/<img src='images/blueboom.png' class='mini'>/<img src='images/bombs.png' class='mini'>/<img src='images/firerod.png' class='mini'>/<img src='images/icerod.png' class='mini'>/<img src='images/somaria.png' class='mini'>",
	x: "42.74%",
	y: "21.66%",
	isOpened: false,
	isAvailable: function(){
		var path1 = {}; //Non-arrow
		var path2 = {}; //Arrow
		if (hasSword(2) || hasBoomerang() || canBombThings()
			|| items.firerod || items.icerod || items.somaria)
			path1 = regions.eastDeathMountain();
		path2 = andCombinator(canShootArrows_path(), regions.eastDeathMountain());
		return orCombinator(path1, path2);
	}
};
chests[43] = {
	name: "Floating Island",
	hint: "<img src='images/mirror.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/glove2.png' class='mini'><img src='images/bombs.png' class='mini'>",
	x: "40.13%",
	y: "2.93%", //1.37%
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (items.mirror && items.moonpearl && canLiftDarkRocks() && canBombThings())
					path1 = andCombinator(regions.darkEastDeathMountain(), regions.eastDeathMountain());
				path2 = convertView(regions.eastDeathMountain());
				return orCombinator(path1, path2);
			case "owg":
				var path1 = {}; //Light world
				var path2 = {}; //Dark world
				var path3 = {}; //View item
				if (items.boots)
					path1 = regions.eastDeathMountain();
				if (items.mirror && items.moonpearl && canLiftRocks() && canBombThings())
					path2 = andCombinator(regions.darkEastDeathMountain(), regions.eastDeathMountain());
				path3 = convertView(regions.eastDeathMountain());
				return orCombinator(path1, path2, path3);
			default:
				var path1 = {}; //Light world
				var path2 = {}; //Buggy logic, 1f multiple times to save bottle for link state
				var path3 = {}; //View item
				if (items.boots)
					path1 = regions.eastDeathMountain();
				if (items.mirror && glitchedLinkInDarkWorld() && canLiftRocks() && canBombThings())
					path2 = andCombinator(regions.darkEastDeathMountain(), regions.eastDeathMountain());
				path3 = convertView(regions.eastDeathMountain());
				return orCombinator(path1, path2, path3);
		}
	}
};

//NorthEast DarkWorld chests region
chests[44] = {
	name: "Catfish",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/glove1.png' class='mini'>",
	x: "96.18%", //94.77%
	y: "16.78%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.moonpearl && canLiftRocks())
					return regions.northEastDarkWorld();
				return {};
			case "owg":
				if (items.moonpearl && (canLiftRocks() || items.boots)) //instead go DMA, DMD, waterwalk, clip past rock
					return regions.northEastDarkWorld();
				return {};
			default:
				if (glitchedLinkInDarkWorld() && (canLiftRocks() || items.boots))
					return regions.northEastDarkWorld();
				return {};
	}	}
};
chests[45] = {
	name: "Pyramid",
	x: "79.50%", //79.20%
	y: "44.73%",
	isOpened: false,
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
	isAvailable: function(){
		var crystalCount = 0;
		for(var i = 0; i < 10; i++)
			if (qtyCounter["dungeonPrize"+i] === 2 && dungeons[i].gotPrize())
				crystalCount++;
		switch (optionLogic) {
			case "nmg":
				if (crystalCount === 2 && items.moonpearl) {
					if (items.hammer || (items.mirror && dungeons[11].isBeaten()))
						return andCombinator(regions.SouthDarkWorld(), regions.northEastDarkWorld());
				}
				return {};
			case "owg":
				var path1 = {}; //Screenwrap mirror portal
				var path2 = {}; //NMG
				if (items.mirror && canSpinSpeed())
					path1 = regions.northEastDarkWorld();
				if (crystalCount === 2) {
					if ((items.hammer && items.moonpearl) || (items.mirror && dungeons[11].isBeaten()))
						path2 = andCombinator(regions.SouthDarkWorld(), regions.northEastDarkWorld());
				}
				return orCombinator(path1, path2);
			default:
				var path1 = {}; //Screenwrap mirror portal
				var path2 = {}; //NMG
				if (items.mirror && canSpinSpeed())
					path1 = regions.northEastDarkWorld();
				if (crystalCount === 2) {
					if ((items.hammer && glitchedLinkInDarkWorld()) || (items.mirror && dungeons[11].isBeaten()))
						path2 = andCombinator(regions.SouthDarkWorld(), regions.northEastDarkWorld());
				}
				return orCombinator(path1, path2);
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (canBombThings())
					return regions.northWestDarkWorld();
				return {};
			case "owg":
				if (items.moonpearl && canBombThings())
					return regions.northWestDarkWorld();
				return {};
			default:
				if (glitchedLinkInDarkWorld() && canBombThings())
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
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
};
chests[49] = {
	name: "Chest Game",
	hint: "<img src='images/stunprize2.png' class='mini'>x30",
	x: "52.31%", //53.00%
	y: "46.66%",
	isOpened: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
};
chests[50] = {
	name: "Hammer Pegs",
	hint: "<img src='images/glove2.png' class='mini'><img src='images/hammer.png' class='mini'>",
	x: "66.14%",
	y: "60.53%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.hammer && canLiftDarkRocks())
					return regions.northWestDarkWorld();
				return {};
			case "owg":
				var path1 = {}; //NW
				var path2 = {}; //NE
				if (items.hammer && items.moonpearl) {
					if (canLiftDarkRocks())
						path1 = regions.northWestDarkWorld();
					if (items.boots) //Don't need spinspeed
						path2 = andCombinator(regions.northEastDarkWorld(), regions.northWestDarkWorld());
				}
				return orCombinator(path1, path2);
			default:
				if (items.hammer && glitchedLinkInDarkWorld()) //1f clip near pyramid
					return regions.northWestDarkWorld();
				return {};
		}
	}
};
chests[51] = {
	name: "Bumper Cave",
	hint: "<img src='images/glove1.png' class='mini'><img src='images/cape.png' class='mini'>",
	x: "67.60%",
	y: "15.82%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (canLiftRocks() && items.cape)
					path1 = regions.northWestDarkWorld();
				path2 = convertView(regions.northWestDarkWorld());
				return orCombinator(path1, path2);
			case "owg":
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (items.moonpearl
					&& (items.boots
						|| (canLiftRocks() && items.cape)))
					path1 = regions.northWestDarkWorld();
				path2 = convertView(regions.northWestDarkWorld());
				return orCombinator(path1, path2);
			default:
				var path1 = {}; //Get item
				var path2 = {}; //View item
				if (glitchedLinkInDarkWorld()
					&& (items.boots
						|| (canLiftRocks() && items.cape)))
					path1 = regions.northWestDarkWorld();
				path2 = convertView(regions.northWestDarkWorld());
				return orCombinator(path1, path2);
s		}
	}
};
chests[52] = {
	name: "Blacksmith",
	hint: "<img src='images/glove2.png' class='mini'> + <img src='images/stunprize2.png' class='mini'>x10",
	x: "57.92%",
	y: "66.16%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (canLiftDarkRocks())
					return regions.northWestDarkWorld();
				return {};
			case "owg":
				if (items.moonpearl && canLiftDarkRocks())
					return regions.northWestDarkWorld();
				return {};
			default:
				if (glitchedLinkInDarkWorld() && canLiftDarkRocks())
					return regions.northWestDarkWorld();
				return {};
		}
	}
};
chests[53] = {
	name: "Purple Chest",
	hint: "<img src='images/glove2.png' class='mini'>",
	x: "65.47%",
	y: "51.75%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (canLiftDarkRocks())
					return regions.northWestDarkWorld();
				return {};
			case "owg":
				var path1 = {}; //NMG
				var path2 = {}; //NE
				if (items.moonpearl && canLiftDarkRocks())
					path1 = andCombinator(chests[52].isAvailable(), regions.northWestDarkWorld());
				if (items.moonpearl && items.boots)
					path2 = andCombinator(andCombinator(chests[52].isAvailable(), regions.northEastDarkWorld()), regions.northWestDarkWorld());
				return orCombinator(path1, path2);
			default:
				var path1 = {}; //mirrorwrap
				var path2 = {}; //NMG
				var path3 = {}; //NE
				if (items.mirror)
					path1 = andCombinator(chests[52].isAvailable(), regions.northWestDarkWorld());
				if (glitchedLinkInDarkWorld() && canLiftDarkRocks())
					path2 = andCombinator(chests[52].isAvailable(), regions.northWestDarkWorld());
				if (items.boots && glitchedLinkInDarkWorld())
					path3 = andCombinator(andCombinator(chests[52].isAvailable(), regions.northEastDarkWorld()), regions.northWestDarkWorld());
				return orCombinator(path1, path2, path3);
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (canBombThings())
					return regions.SouthDarkWorld();
				return {};
			case "owg":
				if (canBombThings() && items.moonpearl)
					return regions.SouthDarkWorld();
				return {};
			default:
				if (canBombThings() && glitchedLinkInDarkWorld())
					return regions.SouthDarkWorld();
				return {};
		}
	}
};
chests[55] = {
	name: "Stumpy",
	x: "65.76%",
	y: "67.69%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				return regions.SouthDarkWorld();
			case "owg":
				if (items.moonpearl)
					return regions.SouthDarkWorld();
				return {};
			default:
				if (glitchedLinkInDarkWorld())
					return regions.SouthDarkWorld();
				return {};
		}
	}
};
chests[56] = {
	name: "Digging Game",
	hint: "<img src='images/stunprize2.png' class='mini'>x80",
	x: "53.28%",
	y: "69.21%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				return regions.SouthDarkWorld();
			case "owg":
				if (items.moonpearl)
					return regions.SouthDarkWorld();
				return {};
			default:
				if (glitchedLinkInDarkWorld())
					return regions.SouthDarkWorld();
				return {};
		}
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.moonpearl)
					return regions.mire();
				return {};
			case "owg":
				if (items.moonpearl || items.mirror)
					return regions.mire();
				return {};
			default:
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
	}
};

//West DeathMountain DarkWorld chests region
chests[58] = {
	name: "Spike Cave",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/hammer.png' class='mini'><img src='images/glove1.png' class='mini'> + <img src='images/byrna.png' class='mini'>/(<img src='images/cape.png' class='mini'> + <img src='images/bottle0.png' class='mini'>/<img src='images/magic2.png' class='mini'>)",
	x: "78.91%",
	y: "14.65%", //14.62%
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
			case "owg":
				if (items.moonpearl && items.hammer && canLiftRocks()
					&& ((canExtendMagic() && items.cape)
						|| (((optionVariation !== "timedohko" && optionVariation !== "ohko")
							 || canExtendMagic())
							&& items.byrna)))
					return andCombinator(regions.westDeathMountain(), regions.darkWestDeathMountain());
				return {};
			default:
				if (items.hammer && canLiftRocks()
					&& (items.moonpearl || (hasABottle() && items.boots))
					&& ((canExtendMagic() && items.cape)
						|| (((optionVariation !== "timedohko" && optionVariation !== "ohko")
							 || canExtendMagic())
							&& items.byrna)))
					return andCombinator(regions.westDeathMountain(), regions.darkWestDeathMountain());
				return {};
		}
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.moonpearl)
					return regions.darkEastDeathMountain();
				return {};
			default:
				return regions.darkEastDeathMountain();
		}
	}
};
chests[60] = {
	name: "Hookshot Cave - Bottom Right",
	hint: "<img src='images/moonpearl.png' class='mini'> + <img src='images/hookshot2.png' class='mini'>/<img src='images/boots.png' class='mini'>",
	x: "91.68%",
	y: "9.15%", //6.62%
	isOpened: false,
	isAvailable: function(){
		switch(optionLogic) {
			case "nmg":
				if (items.moonpearl && (hasHookshot() || items.boots))
					return regions.darkEastDeathMountain();
				return {};
			default:
				if (items.moonpearl && (items.boots || (canLiftRocks() && hasHookshot())))
					return regions.darkEastDeathMountain();
				return {};
		}
	}
};
chests[61] = {
	name: "Hookshot Cave",
	family: "Hookshot Cave",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/hookshot2.png' class='mini'>",
	x: "91.68%",
	y: "3.30%", //6.62%
	isOpened: false,
	isAvailable: function(){
		switch(optionLogic) {
			case "nmg":
				if (items.moonpearl && hasHookshot())
					return regions.darkEastDeathMountain();
				return {};
			default:
				if (items.moonpearl && hasHookshot() && (canLiftRocks() || items.boots))
					return regions.darkEastDeathMountain();
				return {};
		}
	}
};

//HyruleCastleEscape chests region
chests[62] = {
	name: "Sanctuary",
	x: "21.65%", //22.82%
	y: "26.74%",
	isOpened: false,
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
	isAvailable: function(){
		switch (optionState) {
			case "open":
				var path1 = {}; //Graveyard
				var path2 = {}; //Front w/key
				var path3 = {}; //Front without key
				if (canBombThings() || items.boots) {
					if (canLiftRocks())
						path1 = {ng:"a"};
					if (items.lantern && qtyCounter.hc_sk >= 1)
						path2 = {ng:"a"};
					if (items.lantern && optionVariation !== "keysanity") //SK in map, dark cross, or sanctuary, or buy
						path3 = {ng:"p"};
				}
				return orCombinator(path1, path2, path3);
			case "standard":
				if (canBombThings() || items.boots) //need a key, but guaranteed to get one in any mode
					return canKillMostThings_path();
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
	isAvailable: function(){
		switch (optionState) {
			case "open":
				if (items.lantern)
					return {ng:"a"};
				return {};
			case "standard":
				return canKillMostThings_path();
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
	isAvailable: function(){
		switch (optionState) {
			case "open":
				var path1 = {}; //Map
				var path2 = {}; //Boomerang, Zelda
				path1 = {ng:"a"};
				if ((optionVariation !== "keysanity" && optionVariation !== "retro"
					&& ((canLiftRocks() && items.lantern) || qtyCounter.hc_sk >= 1)) //SK in secret room or dark cross, or marked key
					|| (optionVariation === "keysanity" && qtyCounter.hc_sk >= 1)
					|| (optionVariation === "retro" && qtyCounter.hc_sk >= 1))
					path2 = {ng:"a"};
				else if ((optionVariation !== "keysanity" && optionVariation !== "retro") //Possible SK in map
					|| optionVariation === "retro") //Possible buy SK
					path2 = {ng:"p"};
				return multipleChests(path1, path2);
			case "standard":
				return canKillMostThings_path();
			case "inverted":
				return {};
		}
	}
};
chests[66] = { //Some funny, not understood logic regarding Sanc here, and also keys/map/compass
	name: "Link's Uncle / Secret Passage",
	x: "29.49%",
	y: "41.55%",
	isOpened: false,
	isAvailable: function(){
		switch (optionState) {
			case "open":
				return {ng:"a"};
			case "standard":
				var path1 = {}; //Secret passage
				var path2 = {}; //Link's Uncle
				path1 = canKillMostThings_path();
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
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[1] = {
	name: "Lost Woods Gamble",
	x: "9.18%",
	y: "2.08%", //1.54%
	isOpened: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[2] = {
	name: "Fortune Teller (Light)",
	x: "9.28%",
	y: "32.18%",
	isOpened: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[3] = {
	name: "Snitch Lady West",
	x: "2.52%",
	y: "47.54%", //46.66%
	isOpened: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[4] = {
	name: "Snitch Lady East",
	x: "10.25%",
	y: "48.22%",
	isOpened: false,
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
entrances[5] = {
	name: "Bush Covered House",
	x: "10.22%", //10.05%
	y: "53.27%",
	isOpened: false,
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
	isAvailable: function(){
		return regions.SouthLightWorld();
	}
}
entrances[13] = {
	name: "Lake Hylia Fairy",
	x: "40.81%",
	y: "64.62%",
	isOpened: false,
	isAvailable: function(){
		return regions.northEastLightWorld();
	}
}
entrances[14] = {
	name: "Long Fairy Cave",
	x: "48.56%",
	y: "70.07%",
	isOpened: false,
	isAvailable: function(){
		return regions.northEastLightWorld();
	}
}
entrances[15] = {
	name: "Good Bee Cave",
	x: "46.78%", //45.27%
	y: "77.10%",
	isOpened: false,
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
	isAvailable: function(){
		return regions.eastDeathMountain();
	}
}
entrances[18] = {
	name: "Fortune Teller (Dark)",
	x: "59.76%",
	y: "32.20%",
	isOpened: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
}
entrances[19] = {
	name: "Archery Game",
	x: "61.12%",
	y: "70.09%",
	isOpened: false,
	isAvailable: function(){
		return regions.SouthDarkWorld();
	}
}
entrances[20] = {
	name: "Dark Sanctuary Hint",
	x: "73.30%",
	y: "27.51%",
	isOpened: false,
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.boots)
					return regions.SouthDarkWorld();
				return {};
			case "owg":
				if (items.moonpearl && items.boots) //Added -- this req is not in logic, but is bug in app, not tracker
					return regions.SouthDarkWorld();
				return {};
			default:
				if (glitchedLinkInDarkWorld() && items.boots) //Added -- this req is not in logic, but is bug in app, not tracker
					return regions.SouthDarkWorld();
				return {};
		}
	}
}
entrances[22] = {
	name: "Dark Desert Fairy",
	x: "60.22%", //55.89%
	y: "80.05%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.moonpearl)
					return regions.mire();
				return {};
			default:
				return regions.mire();
		}
	}
}
entrances[23] = {
	name: "Dark Desert Hint",
	x: "60.34%",
	y: "83.59%", //82.59%
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.moonpearl)
					return regions.mire();
				return {};
			default:
				return regions.mire();
		}
	}
}
entrances[24] = {
	name: "Dark Lake Hylia Fairy",
	x: "91.29%",
	y: "64.62%",
	isOpened: false,
	isAvailable: function(){
		return regions.northEastDarkWorld();
	}
}
entrances[25] = {
	name: "Palace of Darkness Hint",
	x: "92.55%",
	y: "50.17%",
	isOpened: false,
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.flippers && canBombThings())
					return regions.SouthDarkWorld();
				return {};
			case "owg":
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
				return orCombinator(path1, path2, path3, path4);
		}
	}
}
entrances[28] = {
	name: "Dark Lake Hylia Ledge Hint",
	hint: "<img src='images/moonpearl.png' class='mini'><img src='images/flippers.png' class='mini'>",
	x: "96.13%", //95.74%
	y: "77.12%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.flippers)
					return regions.SouthDarkWorld();
				return {};
			case "owg":
				var path1 = {}; //South flippers
				var path2 = {}; //NE surfing or wriggle to transition
				var path3 = {}; //Portal 5 bootsclip
				var path4 = {}; //Lake Hylia setup mapwrap
				if (items.moonpearl && items.flippers) //Added -- logic bug in app says no req
					path1 = regions.SouthDarkWorld();
				if (items.flippers && items.mirror) //Added -- surfing bunny in logic per Lake Hylia item
					path2 = regions.northEastDarkWorld();
				if (items.moonpearl && items.boots) //Added -- maximum flexibility to get close to no req
					path3 = regions.northEastDarkWorld();
				if (items.moonpearl && items.boots) //Added -- maximum flexibility to get close to no req
					path4 = regions.SouthDarkWorld();
				return orCombinator(path1, path2, path3, path4);
			default:
				var path1 = {}; //South flippers
				var path2 = {}; //NE surfing or wriggle to transition
				var path3 = {}; //Portal 5 1f up to ledge, citrus to map wrap, jump up to get FAWT
				var path4 = {}; //Lake Hylia setup mapwrap
				if (glitchedLinkInDarkWorld() && items.flippers) //Added -- logic bug in app says no req
					path1 = regions.SouthDarkWorld();
				if (items.flippers && items.mirror) //Added -- surfing bunny in logic per Lake Hylia item
					path2 = regions.northEastDarkWorld();
				if (true) //Added -- maximum flexibility to get close to no req
					path3 = regions.northEastDarkWorld();
				if (glitchedLinkInDarkWorld() && items.boots) //Added -- maximum flexibility to get close to no req
					path4 = regions.SouthDarkWorld();
				return orCombinator(path1, path2, path3, path4);
		}
	}
}
entrances[29] = {
	name: "Dark Lake Hylia Ledge Spike Cave",
	hint: "<img src='images/glove1.png' class='mini'><img src='images/moonpearl.png' class='mini'><img src='images/flippers.png' class='mini'>",
	x: "95.16%",
	y: "80.30%", //78.49%
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.flippers && canLiftRocks())
					return regions.SouthDarkWorld();
				return {};
			case "owg":
				var path1 = {}; //South flippers
				var path2 = {}; //NE surfing or wriggle to transition
				var path3 = {}; //Portal 5 bootsclip
				var path4 = {}; //Lake Hylia setup mapwrap
				if (items.moonpearl && items.flippers && canLiftRocks()) //Added -- logic bug in app says no req
					path1 = regions.SouthDarkWorld();
				if (items.flippers && items.mirror && canLiftRocks() && items.moonpearl) //Added -- surfing bunny in logic per Lake Hylia item
					path2 = regions.northEastDarkWorld();
				if (items.moonpearl && items.boots && canLiftRocks()) //Added -- maximum flexibility to get close to no req
					path3 = regions.northEastDarkWorld();
				if (items.moonpearl && items.boots && canLiftRocks()) //Added -- maximum flexibility to get close to no req
					path4 = regions.SouthDarkWorld();
				return orCombinator(path1, path2, path3, path4);
			default:
				var path1 = {}; //South flippers
				var path2 = {}; //NE surfing or wriggle to transition
				var path3 = {}; //Portal 5 1f up to ledge, citrus to map wrap, jump up to get FAWT
				var path4 = {}; //Lake Hylia setup mapwrap
				if (glitchedLinkInDarkWorld() && items.flippers && canLiftRocks()) //Added -- logic bug in app says no req
					path1 = regions.SouthDarkWorld();
				if (items.flippers && items.mirror && canLiftRocks() && glitchedLinkInDarkWorld()) //Added -- surfing bunny in logic per Lake Hylia item
					path2 = regions.northEastDarkWorld();
				if (canLiftRocks() && glitchedLinkInDarkWorld()) //Added -- maximum flexibility to get close to no req
					path3 = regions.northEastDarkWorld();
				if (glitchedLinkInDarkWorld() && items.boots && canLiftRocks()) //Added -- maximum flexibility to get close to no req
					path4 = regions.SouthDarkWorld();
				return orCombinator(path1, path2, path3, path4);
		}
	}
}
entrances[30] = {
	name: "Dark Death Mountain Fairy",
	x: "70.59%",
	y: "18.92%",
	isOpened: false,
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
			case "owg":
				if (items.moonpearl)
					return andCombinator(regions.westDeathMountain(), regions.darkWestDeathMountain());
				return {};
			default:
				return regions.darkWestDeathMountain(); //1f DMA to get to darkWestDeathMountain
		}
	}
}
/*entrances[31] = { //This is now always a capacity store
	name: "Capacity Upgrade",
	hint: "<img src='images/flippers.png' class='mini'>",
	x: "39.26%",
	y: "85.33%",
	isOpened: false,
	isAvailable: function(){
		if (items.flippers || optionLogic !== "nmg")
			return "available";
		if (glitches.fakeflippers)
			return "available glitched";
		return {};
	}
}*/

//Bug: Light World Death Mountain Shop is in logic without bombs for glitched modes
//	Issue #666 filed
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
	isAvailable: function(){
		return regions.northWestLightWorld();
	}
}
shops[1] = {
	name: "Light World Lake Hylia Shop",
	x: "35.97%",
	y: "76.71%",
	isOpened: false,
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (canBombThings())
					return regions.eastDeathMountain();
				return {};
			default:
				if (canBombThings()) //Added this -- logic doesn't require this, but app doesn't care about bombs anyways
					return regions.eastDeathMountain();
				return {};
		}
	}
}
shops[3] = {
	name: "Dark World Potion Shop",
	hint: "<img src='images/moonpearl.png' class='mini'> + <img src='images/glove1.png' class='mini'>/<img src='images/hammer.png' class='mini'>/<img src='images/flippers.png' class='mini'>",
	x: "90.32%",
	y: "33.76%",
	isOpened: false,
	isAvailable: function(){
		if (items.moonpearl && (canLiftRocks() || items.hammer || items.flippers))
			return regions.northEastDarkWorld();
		return {};
	}
}
shops[4] = {
	name: "Dark World Forest Shop",
	x: "66.92%",
	y: "45.87%",
	isOpened: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
}
shops[5] = {
	name: "Dark World Lumberjack Hut Shop",
	x: "67.11%",
	y: "5.64%",
	isOpened: false,
	isAvailable: function(){
		return regions.northWestDarkWorld();
	}
}
shops[6] = {
	name: "Dark World Lake Hylia Shop",
	x: "82.59%",
	y: "80.25%",
	isOpened: false,
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
	isAvailable: function(){
		switch (optionLogic) {
			case "nmg":
				if (items.hammer)
					return regions.northWestDarkWorld();
				return {};
			case "owg":
				if (items.hammer && items.moonpearl) //Added this -- logic doesn't require this, but it is app bug, not tracker bug
					return regions.northWestDarkWorld();
				return {};
			default:
				if (items.hammer && glitchedLinkInDarkWorld()) //Added this -- logic doesn't require this, but it is app bug, not tracker bug
					return regions.northWestDarkWorld();
				return {};
		}
	}
}
shops[8] = {
	name: "Dark World Death Mountain Shop",
	x: "93.71%", //92.84%
	y: "14.92%", //14.62%
	isOpened: false,
	isAvailable: function(){
		return regions.darkEastDeathMountain();
	}
}


