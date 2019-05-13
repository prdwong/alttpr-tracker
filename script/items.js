//Value of 0 or false will gray the icon out, globally
//booleans will use itemName.png, grayed out or not
//	Otherwise they will go itemName0.png, itemName1.png, itemName2,png, etc...

var lastItem = ""; //holder to populate sphere tracker
var spheres = {};

var items = {
	//Initial state of tracker when first loaded
	//Tracker grid will be populated in this order
	//hookshot set to 1 because the stunprize quadrant might need to be ungrayed (boomerang stun)
	//alldefense/hearts/fairycrab/pulls set to 1 because they are never grayed out
	//bosses set to 1 because their quadrant overlays are never grayed out
	//	Instead bosses are grayed out in their actual png icons (boss01.png, boss11.png, etc...)
	allbow: "00",	allboom: "00",	hookshot: 1,	bombs: true,		allpowder: "00",	boots: false,		sword: 0,
	firerod: false,	icerod: false,	bombos: false,	ether: false,		quake: false,		glove: 0,			alldefense: "01",
	lantern: false,	hammer: false,	allflute: "00",	net: false,			book: false,		flippers: false,	hearts: 1,
	bottle: 0,		somaria: false,	byrna: false,	cape: false,		mirror: false,		moonpearl: false,	fairycrab: 1,
	boss0: 1,		boss1: 1,		boss2: 1,		boss11: 1,			boss10: 1,			boss12: 1,			pulls: 1,
	chest0: 3,		chest1: 2,		chest2: 2,		chest11: 0,			chest10: 20,		go: false,			hcitems: false,
	ditems0: false,	ditems1: false,	ditems2: false,	ditems11: false,	ditems10: false,	blank1: false,		blank2: false,
	boss3: 1,		boss4: 1,		boss5: 1,		boss6: 1,			boss7: 1,			boss8: 1,			boss9: 1,
	chest3: 5,		chest4: 6,		chest5: 2,		chest6: 4,			chest7: 3,			chest8: 2,			chest9: 5,
	ditems3: false,	ditems4: false,	ditems5: false,	ditems6: false,		ditems7: false,		ditems8: false,		ditems9: false
};

var itemsMin = {
	//Lowest value for non-boolean entries
	//hearts/fairycrab/pulls full square is not clickable, only its quadrants are
									hookshot: 1,																sword: 0,
																							glove: 0,
	bottle: 0,
	boss0: 1,		boss1: 1,		boss2: 1,		boss11: 1,			boss10: 1,			boss12: 1,
	chest0: 0,		chest1: 0,		chest2: 0,		chest11: 0,			chest10: 0,
	boss3: 1,		boss4: 1,		boss5: 1,		boss6: 1,			boss7: 1,			boss8: 1,			boss9: 1,
	chest3: 0,		chest4: 0,		chest5: 0,		chest6: 0,			chest7: 0,			chest8: 0,			chest9: 0
};

var itemsMax = {
	//Highest value for non-boolean entries
									hookshot: 2,																sword: 4,
																							glove: 2,
	bottle: 4,
	boss0: 2,		boss1: 2,		boss2: 2,		boss11: 2,			boss10: 2,			boss12: 2,
	chest0: 3,		chest1: 2,		chest2: 2,		chest11: 0,			chest10: 20,
	boss3: 2,		boss4: 2,		boss5: 2,		boss6: 2,			boss7: 2,			boss8: 2,			boss9: 2,
	chest3: 5,		chest4: 6,		chest5: 2,		chest6: 4,			chest7: 3,			chest8: 2,			chest9: 5
};

var qtyCounter = { //counters/status for non-items (mainly quadrants)
	stunprize: 0,
	magic: 1, heart_piece: 0, death: 0, heart_full: 3,
	bottle0: 0, bottle1: 0, bottle2: 0, bottle3: 0,
	fairy0: 0, fairy1: 0, pullcrab0: 0, pullcrab1: 0,
	pull1: 0, pull2: 0, pull3: 0, pullfish: 0,
	triforce: 0,
	hc_sk: 0, hc_bk: false, hc_map: false, zelda: 1,
	dungeonPrize0: 1, dungeonPrize1: 1, dungeonPrize2: 1, dungeonPrize3: 1, dungeonPrize4: 1, dungeonPrize5: 1, dungeonPrize6: 1, dungeonPrize7: 1, dungeonPrize8: 1, dungeonPrize9: 1,
	gotPrize0: false, gotPrize1: false, gotPrize2: false, gotPrize3: false, gotPrize4: false, gotPrize5: false, gotPrize6: false, gotPrize7: false, gotPrize8: false, gotPrize9: false,
	ditems_sk1: 0, ditems_sk2: 0, ditems_sk3: 0, ditems_sk4: 0, ditems_sk5: 0, ditems_sk6: 0, ditems_sk7: 0, ditems_sk8: 0, ditems_sk9: 0, ditems_sk10: 0, ditems_sk11: 0,
	ditems_bk0: false, ditems_bk1: false, ditems_bk2: false, ditems_bk3: false, ditems_bk4: false, ditems_bk5: false, ditems_bk6: false, ditems_bk7: false, ditems_bk8: false, ditems_bk9: false, ditems_bk10: false,
	ditems_map0: false, ditems_map1: false, ditems_map2: false, ditems_map3: false, ditems_map4: false, ditems_map5: false, ditems_map6: false, ditems_map7: false, ditems_map8: false, ditems_map9: false, ditems_map10: false,
	ditems_comp0: false, ditems_comp1: false, ditems_comp2: false, ditems_comp3: false, ditems_comp4: false, ditems_comp5: false, ditems_comp6: false, ditems_comp7: false, ditems_comp8: false, ditems_comp9: false, ditems_comp10: false,
	medallion8: 0, medallion9: 0,
	bow: 0, arrow: 0, blueboom: 0, redboom: 0, mushroom: 0, powder: 0, shield: 0, tunic: 1, shovel: 0, flute: 0,
	boss0: 0, boss1: 0, boss2: 0, boss3: 0, boss4: 0, boss5: 0, boss6: 0, boss7: 0, boss8: 0, boss9: 0, boss13: 0, boss14: 0, boss15: 0,
	gtboss13: 1, gtboss14: 1, gtboss15: 1
};

var qtyCounterMin = {
	//Lowest value for non-boolean counters
	stunprize: 0,
	magic: 1, heart_piece: 0, death: 0, heart_full: 1,
	bottle0: 0, bottle1: 0, bottle2: 0, bottle3: 0,
	fairy0: 0, fairy1: 0, pullcrab0: 0, pullcrab1: 0,
	pull1: 0, pull2: 0, pull3: 0, pullfish: 0,
	triforce: 0,
	hc_sk: 0, zelda: 1,
	dungeonPrize0: 0, dungeonPrize1: 0, dungeonPrize2: 0, dungeonPrize3: 0, dungeonPrize4: 0, dungeonPrize5: 0, dungeonPrize6: 0, dungeonPrize7: 0, dungeonPrize8: 0, dungeonPrize9: 0,
	ditems_sk1: 0, ditems_sk2: 0, ditems_sk3: 0, ditems_sk4: 0, ditems_sk5: 0, ditems_sk6: 0, ditems_sk7: 0, ditems_sk8: 0, ditems_sk9: 0, ditems_sk10: 0, ditems_sk11: 0,
	medallion8: 0, medallion9: 0,
	bow: 0, arrow: 0, blueboom: 0, redboom: 0, mushroom: 0, powder: 0, shield: 0, tunic: 1, shovel: 0, flute: 0,
	boss0: 0, boss1: 0, boss2: 0, boss3: 0, boss4: 0, boss5: 0, boss6: 0, boss7: 0, boss8: 0, boss9: 0, boss13: 0, boss14: 0, boss15: 0,
	gtboss13: 1, gtboss14: 1, gtboss15: 1
};

var qtyCounterMax = {
	//Highest value for non-boolean counters
	stunprize: 14,
	magic: 2, heart_piece: 24, death: 999, heart_full: 14,
	bottle0: 6, bottle1: 6, bottle2: 6, bottle3: 6,
	fairy0: 7, fairy1: 7, pullcrab0: 14, pullcrab1: 14,
	pull1: 14, pull2: 14, pull3: 14, pullfish: 14,
	triforce: 0,
	hc_sk: 1, zelda: 1,
	dungeonPrize0: 4, dungeonPrize1: 4, dungeonPrize2: 4, dungeonPrize3: 4, dungeonPrize4: 4, dungeonPrize5: 4, dungeonPrize6: 4, dungeonPrize7: 4, dungeonPrize8: 4, dungeonPrize9: 4,
	ditems_sk1: 1, ditems_sk2: 1, ditems_sk3: 6, ditems_sk4: 1, ditems_sk5: 3, ditems_sk6: 1, ditems_sk7: 2, ditems_sk8: 3, ditems_sk9: 4, ditems_sk10: 4, ditems_sk11: 2,
	medallion8: 3, medallion9: 3,
	bow: 1, arrow: 1, blueboom: 1, redboom: 1, mushroom: 2, powder: 2, shield: 3, tunic: 3, shovel: 2, flute: 2,
	boss0: 0, boss1: 0, boss2: 0, boss3: 0, boss4: 0, boss5: 0, boss6: 0, boss7: 0, boss8: 0, boss9: 0, boss13: 0, boss14: 0, boss15: 0,
	gtboss13: 2, gtboss14: 2, gtboss15: 2
};

function resetItems() {
	qtyCounter.bow = 0;
	qtyCounter.arrow = 0;
	qtyCounter.blueboom = 0;
	qtyCounter.redboom = 0;
	qtyCounter.mushroom = 0;
	qtyCounter.powder = 0;
	qtyCounter.shield = 0;
	qtyCounter.tunic = 1;
	qtyCounter.shovel = 0;
	qtyCounter.flute = 0;
	qtyCounter.triforce = 0;
	items.allbow = "00";
	items.allboom = "00";
	items.hookshot = 1;
	items.bombs = true;
	items.allpowder = "00";
	if (optionLogic === "nmg") items.boots = false; else itemsboots = true;
	items.sword = 0;
	items.firerod = false;
	items.icerod = false;
	items.bombos = false;
	items.ether = false;
	items.quake = false;
	items.glove = 0;
	items.alldefense = "01";
	items.lantern = false;
	items.hammer = false;
	items.allflute = "00";
	items.net = false;
	items.book = false;
	items.flippers = false;
	items.bottle = 0;
	items.somaria = false;
	items.byrna = false;
	items.cape = false;
	items.mirror = false;
	items.moonpearl = false;
	items.go = false;
	for (var i = 0; i < 13; i++)
		items["boss"+i] = itemsMin["boss"+i];
	for (var i = 0; i < 12; i++)
		items["chest"+i] = itemsMax["chest"+i];

	Object.keys(items).forEach(function(itemName) {
		if (itemName === "hearts" || itemName === "bottle" || itemName === "fairycrab" || itemName === "pulls" || itemName === "hcitems" || itemName.substring(0, 6) === "ditems" || itemName.substring(0, 5) === "blank") 
			;
		else
			updateTrackerItem(itemName);
	});

	qtyCounter.stunprize = 0; updateQuadrant("stunprize");
	qtyCounter.magic = 1; updateQuadrant("magic");
	qtyCounter.heart_piece = 0; updateQuadrant("heart_piece");
	qtyCounter.death = 0; updateQuadrant("death");
	qtyCounter.heart_full = 3; updateQuadrant("heart_full");
	qtyCounter.bottle0 = 0; updateQuadrant("bottle0");
	qtyCounter.bottle1 = 0; updateQuadrant("bottle1");
	qtyCounter.bottle2 = 0; updateQuadrant("bottle2");
	qtyCounter.bottle3 = 0; updateQuadrant("bottle3");
	qtyCounter.fairy0 = 0; updateQuadrant("fairy0");
	qtyCounter.fairy1 = 0; updateQuadrant("fairy1");
	qtyCounter.pullcrab0 = 0; updateQuadrant("pullcrab0");
	qtyCounter.pullcrab1 = 0; updateQuadrant("pullcrab1");
	qtyCounter.pull1 = 0; updateQuadrant("pull1");
	qtyCounter.pull2 = 0; updateQuadrant("pull2");
	qtyCounter.pull3 = 0; updateQuadrant("pull3");
	qtyCounter.pullfish = 0; updateQuadrant("pullfish");
	qtyCounter.hc_sk = 0; updateQuadrant("hc_sk");
	qtyCounter.hc_bk = false; updateQuadrant("hc_bk");
	qtyCounter.hc_map = false; updateQuadrant("hc_map");
	if (optionState === "standard") qtyCounter.zelda = 1; else qtyCounter.zelda = 1; updateQuadrant("zelda"); //Always start Zelda rescued as default
	for (var i = 0; i < 10; i++) {
		if (optionVariation === "keysanity") qtyCounter["dungeonPrize"+i] = 0; else qtyCounter["dungeonPrize"+i] = 1;
		qtyCounter["gotPrize"+i] = false;
		updateQuadrant("dungeonPrize"+i);
		if (optionBossShuffle === "on") qtyCounter["boss"+i] = -1; else qtyCounter["boss"+i] = 0;
		updateTrackerItem("boss"+i);
	}
	for (var i = 13; i <= 15; i++) {
		if (optionBossShuffle === "on") qtyCounter["boss"+i] = -1; else qtyCounter["boss"+i] = 0;
		qtyCounter["gtboss"+i] = 1;
		updateQuadrant("gtboss"+i);
	}
	for (var i = 0; i < 12; i++) {
		qtyCounter["ditems_sk"+i] = 0;
		updateQuadrant("ditems_sk"+i);
	}
	for (var i = 0; i < 11; i++) {
		qtyCounter["ditems_bk"+i] = false;
		qtyCounter["ditems_map"+i] = false;
		qtyCounter["ditems_comp"+i] = false;
		updateQuadrant("ditems_bk"+i);
		updateQuadrant("ditems_map"+i);
		updateQuadrant("ditems_comp"+i);
	}
	qtyCounter.medallion8 = 0; updateQuadrant("medallion8");
	qtyCounter.medallion9 = 0; updateQuadrant("medallion9");

	for (var i = 0; i < 7; i++) {
		for (var j = 0; j < 4; j++) {
			for (var k = 0; k < 4; k++) {
				if (spheres["sphere"+i+j+k] !== undefined)
					spheres["sphere"+i+j+k] = "";
			}
		}
	}

	initSphereTracker();
	refreshMap();
}