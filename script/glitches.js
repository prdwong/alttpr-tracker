var glitches = {
	//Dark rooms
	darkCross_front: { category: "darkrooms", name: "Dark Cross Front", tip: "Open Dark Cross in the dark, from Hyrule Castle", def:"top"
	},
	darkCross_back_fr: { category: "darkrooms", name: "Dark Cross Back w/Fire Rod", tip: "Open Dark Cross using fire rod, from Graveyard", def:"top"
	},
	darkCross_back: { category: "darkrooms", name: "Dark Cross Back", tip: "Open Dark Cross in the dark, from Graveyard"
	},
	sewers_fr: { category: "darkrooms", name: "Hyrule Sewers w/Fire Rod", tip: "Get to Secret Room using fire rod, from Hyrule Castle", def:"top"
	},
	sewers: { category: "darkrooms", name: "Hyrule Sewers", tip: "Get to Secret Room in the dark, from Hyrule Castle"
	},
	ep_dark: { category: "darkrooms", name: "Eastern Palace Big Key Chest", tip: "Get to big key chest in the dark", def:"top"
	},
	ep_back: { category: "darkrooms", name: "Eastern Palace Back", tip: "Get to Armos Knights in the dark", def:"top"
	},
	oldMan: { category: "darkrooms", name: "Old Man Cave Front", tip: "Climb DM in the dark", def:"top"
	},
	oldMan_back: { category: "darkrooms", name: "Old Man Cave Back", tip: "Rescue old man in the dark, from Death Mountain", def:"top"
	},

	//Bomb jumps
	qirn_jump: { category: "bj", name: "Qirn Jump", tip: "Bomb jump into fake flipper from North West Dark World to North East Dark World"
	},
	
	//Minor glitches
	fakeflipper: { category: "minor", name: "Fake Flippers", tip: "Screen transition right after landing in water", def:"top"
	},
	waterwalk_boots: { category: "minor", name: "Boots Waterwalk", tip: "Arm water walk from hole", def:"top"
	},
	superbunny: { category: "minor", name: "Falling Superbunny", tip: "Superbunny cave: Fall into a hole", def:"top"
	},
	superbunny_mirror: { category: "minor", name: "Mirror Superbunny", tip: "Mirror while entering entrance", def:"top"
	},
	superbunny_hit: { category: "minor", name: "Enemy Superbunny", tip: "Get boosted into an entrance by an enemy", def:"top"
	},
	dungeonrevival: { category: "minor", name: "Dungeon Bunny Revival", tip: "Die or get Wallmastered in a dungeon", def:"top"
	},
	fairy_fakeflipper: { category: "minor", name: "Fairy Revive in Water", tip: "Fake flipper and/or Link state from fairy revive"
	},
	surfingbunny_mirror: { category: "minor", name: "Mirror Surfing Bunny", tip: "Land in mirror portal over deep water"
	},
	hover: { category: "minor", name: "Hovering"
	},
	hoverDM: { category: "minor", name: "DM Bridge Hover", tip: "Hover across DM bridge after fairy revive"
	},
	superqirn_jump: { category: "minor", name: "Qirn Jump via Slime", tip: "Freeze Hinox then quake it into a slime"
	},
	
	wriggle: { category: "minor", name: "Wriggling bunny"
	},
	fakeflipper_zora: { category: "minor", name: "Fake flipper through Zora's Domain"
	},
	unbunny: { category: "minor", name: "Unbunny beam"
	},
	fakepowder: { category: "minor", name: "Fake Powder"
	},
	enemyfairy_fakeflipper: { category: "minor", name: "Fake flipper from fairy revive using enemy RNG" //combined with fairy_fakeflipper
	},
	bigbombdupe_mirror: { category: "minor", name: "Dupe big bomb using mirror"
	},
	bigbombdupe_transition: { category: "minor", name: "Dupe big bomb via transition"
	},
	bigbombdupe_swim: { category: "minor", name: "Dupe big bomb via swim transition"
	},
	bigbombdupe_hinox: { category: "minor", name: "Dupe big bomb via Hinox blob"
	},

	herapot: { category: "minor", name: "Herapot"
	},
	
	//Misc strats
	advanced_items: { category: "misc", name: "Advanced Item Placement", tip: "Show advanced logic as sequence breaks in basic item placement setting", def:"top"
	},
	
	DM_lynels: { category: "misc", name: "Hookshot past DM Lynels in OHKO"
	},
	bigbomb: { category: "misc", name: "Use Big Bomb as a bomb"
	},
	spiralcave: { category: "misc", name: "Spiral cave with no weapons"
	},
	library: { category: "misc", name: "Beat Aga to get superbunny in Library"
	},
	
	//Boss strats
	armos_bombs: { category: "boss", name: "Armos: Bombs", tip: "Reduce magic requirements to only 1 bar by bombing first",
	},
	armos_bombs_only: { category: "boss", name: "Armos: Bombs Only", tip: "Minimum 12 sextuple bomb-hits", //12 sextuple-hits
	},
	armos_firerod: {category: "boss", name: "Armos: Fire Rod Doubles" , tip: "Reduce magic requirements by hitting 2 Armos Knights with each shot", //Requires double hits
	},
	armos_firerod_super: { category: "boss", name: "Armos: Fire Rod Triples", tip: "Reduce magic requirements by hitting 3 Armos Knights with each shot (Spooky Action recommended)", //Requires triples
	},
	//Armos with 1 bar requires 4 quintuples
	lanmo_bombs: { category: "boss", name: "Lanmolas: Bombs Only", tip: "Requires 12 bomb hits", //12 bomb hits
	},
	helma_fighter: { category: "boss", name: "Helmasaur King: Fighter Sword", tip: "12 fighter sword spins", def:"top"
	},
	helma_hammer_ext: { category: "boss", name: "Helmasaur King: Hammer Swordless", tip: "Bowless/swordless, hold out punch for extension, only in swordless mode"
	},
	helma_hammer: { category: "boss", name: "Helmasaur King: Hammer", tip: "Bowless/swordless, precisely hammer Helmasaur King"
	},
	arrghus_silver: { category: "boss", name:"Arrghus: Silver Arrows", tip: "Kill puffs with silvers", def:"top"
	},
	arrghus_bombs: { category: "boss", name: "Arrghus: Bombs", tip: "Kill puffs with 2 bomb hits, can hit multiple puffs simultaneously" //18-26 bomb hits, can do multiples
	},
	arrghus_rods: { category: "boss", name: "Arrghus: Rods", tip: "Kill puffs with fire rod/ice rod, 13 hits", def:"top"
	},
	arrghus_spooky: { category: "boss", name: "Arrghus: Fire Rod Doubles", tip: "Kill 2 puffs with one fire rod shot, requires Spooky Action" //Requires double hits
	},
	arrghus_spooky_triple: { category: "boss", name: "Arrghus: Fire Rod Triples", tip: "Kill 3 puffs with one fire rod shot, requires Spooky Action" //Requires 3 triples
	},
	mothula_adv: { category: "boss", name: "Mothula: Less Magic", tip: "Only 1 bar needed for fire rod/somaria, 1.25 for byrna" //1 bar for fire rod/somaria, 1.25 for byrna
	},
	khold_beams: { category: "boss", name: "Kholdstare: Sword Beams", tip: "Reduce magic usage by breaking shell with sword beams"
	},
	khold_single: { category: "boss", name: "Kholdstare: Less Magic", tip: "Accurate minimum magic usage for Hard/Expert mode" //For <normal magic refills
	},
	khold_double: { category: "boss", name: "Kholdstare: Fire Rod Doubles", tip: "Reduce magic usage by hitting 2 puffs with each shot"
	},
	khold_triple: { category: "boss", name: "Kholdstare: Fire Rod Triples", tip: "Reduce magic usage by hitting 3 puffs with each shot"
	},
	vitty_bombs: { category: "boss", name: "Vitreous: Bombs Only", tip: "Main eye needs 32 hits, leaving 18 for phase 1 (each eye takes 12 hits)" //32 bombs for main eye, 18 bombs for rest (each eye takes 12 hits)
	},
	trinexx_master: { category: "boss", name: "Trinexx: Master Sword", tip: "No magic extension -- exactly 4 shots + 10 slashes per neck needed (can do 3 slashes/shot)" //4 shots per neck, 3 per cycle (only need 10 slashes)
	},
	trinexx_fighter: { category: "boss", name: "Trinexx: Fighter Sword", tip: "Small magic extension -- exactly 5 shots + 10 spins per neck needed (can do 2 spins/shot)" //5 shots for fire head (2 spins per cycle) 4 shots for ice rod w/spooky (2 spins per cycle)
	},
	//trinexx_spooky: { category: "boss", name: "Trinexx: Spooky Fighter Sword fighter sword w/spooky", tip: "Tiny magic extension -- ice head now only needs 4 shots + 6 spins"
	//},
	
	//Major glitches
	fakeflute: { category: "major", name: "Fake Flute", tip: "Blue YBA"
	},
	fakefluteDM: { category: "major", name: "Fake Flute to Dark DM", tip: "Dodge boulders/deadrocks to get to dark West Death Mountain with superbunny status intact"
	},
	clip1f: { category: "major", name: "One Frame Overworld Clips", tip: "Clips without boots/pearl"
	},
	mapwrap: { category: "major", name: "Map Wraps", tip: "Skull Woods from Turtle Rock"
	},
	fakeworld: { category: "major", name: "Fake World", tip: "Avoid turning back into a bunny on screens with a dungeon"
	},
	bombclipOW: { category: "major", name: "Overworld bomb Clips", tip: "Dash into bomb explosion to clip into upper slope"
	},
	superjump_mire: { category: "major", name: "Mire Superjump", tip: "Find your way around mire area after doing Death Mountain superjump"
	},
	mirhambri: { category: "major", name: "Hammer Bridge Mirrorclip", tip: "Mirrorclip into the side of hammer peg bridge to go from south dark world to northeast dark world"
	},
	mireclip: { category: "major", name: "Mire mirrorclip", tip: "Clip into slope near Cave 45 area to enter mire"
	},
	mirewrap: { category: "major", name: "Mire mirrorwrap", tip: "Mirrorwrap near digging game to enter mire from above"
	},
	
	kingtomb: { category: "major", name: "King's Tomb jump"
	},
	blacksmith_wrap: { category: "major", name: "Blacksmith screenwrap portal"
	},
	mirrorjump: { category: "major", name: "Mirror jump"
	},
	OW_YBA: { category: "major", name: "Overworld YBA"
	},
	pyramid_wrap: { category: "major", name: "Screenwrap to pyramid w/out spinspeed"
	},
	mirrorwrap: { category: "major", name: "Mirror wrap"
	},
	adv_mirrowrap: { category: "major", name: "Complicated Mirror wraps"
	},
	
	//Underworld major glitches
	bombjuke: { category: "major_uw", name: "Bomb Juke"
	}
}