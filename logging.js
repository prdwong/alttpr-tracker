//contents of log
var currentLog = [];
//time keeping and any other misc needed info.
var logData = {};

function logAction(label, status, click) {
	if (!logData.startTime)
		logData.startTime = Date.now();

	//here, we could look for previous lines and combine with this new one if we wanted (like cycling through pulls or bottles, etc...
	//could put a time limit on things to combine too

	currentLog.push({
		timestamp: Date.now(),
		label: label,
		status: status,
		click: click
	});

	document.querySelector('#log-text-area').value = processLog();
}

function processLog() {
	var result = ' ';
	currentLog.forEach(function(line, index) {
		if (translateLabel(line.label, line.status, line.click) === undefined)
			;
		else if (index > 0)
			result += getSeparatorSymbol(currentLog[index-1].timestamp, currentLog[index].timestamp);
		else
			result += convertTime(line.timestamp) + translateLabel(line.label, line.status, line.click) + '\r\n';
	});
	return result;
}

function getSeparatorSymbol(timestamp1, timestamp2) {
	var delta = timestamp2 - timestamp1;
	if (delta < 1000) {
		return ' ';
	} else if (delta < 2000) {
		return '.';
	} else if (delta < 4000) {
		return ':';
	} else if (delta < 8000) {
		return '!';
	} else if (delta < 16000) {
		return '|';
	} else if (delta < 32000) {
		return '\r\n ';
	} else if (delta < 64000) {
		return '.\r\n ';
	} else if (delta < 2 * 64000) {
		return ':\r\n ';
	} else if (delta < 4 * 64000) {
		return '!\r\n ';
	} else if (delta < 8 * 64000) {
		return '|\r\n ';
	} else if (delta < 16 * 64000) {
		return '|\r\n.';
	} else if (delta < 32 * 64000) {
		return '|\r\n:';
	} else if (delta < 64 * 64000) {
		return '|\r\n!';
	} else {
		return '|\r\n|';
	}
}

function convertTime(timestamp) {
	var delta = timestamp - logData.startTime;
	delta = delta / 1000;
	var hours = Math.floor(delta / 3600);
	var mins = Math.floor((delta - hours * 3600) / 60);
	var secs = Math.floor(delta % 60);
	if (mins < 10) mins = '0' + mins;
	if (secs < 10) secs = '0' + secs;
	return '[' + hours + ':' + mins + ':' + secs + '] ';
}

var itemNames = {
	bombs: "Bombs",
	boots: "Pegasus Boots",
	firerod: "Fire Rod",
	icerod: "Ice Rod",
	bombos: "Bombos",
	ether: "Ether",
	quake: "Quake",
	lantern: "Lantern",
	hammer: "Hammer",
	net: "Bug Net",
	book: "Book of Mudora",
	flippers: "Flippers",
	somaria: "Cane of Somaria",
	byrna: "Cane of Byrna",
	cape: "Magic Cape",
	mirror: "Magic Mirror",
	moonpearl: "Moon Pearl",
	bow: {
		0: "Bow",
		1: "Bow"
	},
	blueboom: {
		0: "Blue Boomerang",
		1: "Blue Boomerang"
	},
	redboom: {
		0: "Magic Boomerang",
		1: "Magic Boomerang"
	},
	mushroom: {
		0: "Mushroom",
		1: "Mushroom",
		2: "Mushroom to Witch"
	},
	powder: {
		0: "Magic Powder",
		1: "Magic Powder",
		2: "Magic Powder to Magic Bat"
	},
	shield: {
		0: "Shield",
		1: "Fighter's Shield",
		2: "Magic Shield",
		3: "Mirror Shield"
	},
	tunic: {
		1: "Mail Upgrade",
		2: "Blue Mail",
		3: "Red Mail"
	},
	shovel: {
		0: "Shovel",
		1: "Shovel",
		2: "Shovel to Dig Spot"
	},
	flute: {
		0: "Flute",
		1: "Flute",
		2: "Flute activated"
	},
	hookshot: {
		1: "Hookshot",
		2: "Hookshot"
	},
	sword: {
		0: "Sword",
		1: "Fighter Sword",
		2: "Master Sword",
		3: "Tempered Sword",
		4: "Gold Sword"
	},
	glove: {
		0: "Glove",
		1: "Power Glove",
		2: "Titan's Mitts"
	},
	stunprize: {
		0: "unknown",
		1: "heart",
		2: "one rupee",
		3: "five rupees",
		4: "twenty rupees",
		5: "one bomb",
		6: "four bombs",
		7: "eight bombs",
		8: "small magic",
		9: "full magic",
		10: "five arrows",
		11: "ten arrows",
		12: "fairy",
		13: "good bee",
		14: "bee swarm"
	},
	boss: {
		0: "Armos Knights",
		1: "Lanmolas",
		2: "Moldorm",
		3: "Helmasaur King",
		4: "Arrghus",
		5: "Mothula",
		6: "Blind",
		7: "Kholdstare",
		8: "Vitreous",
		9: "Trinexx"
	},
	bottle: {
		0: "Bottles",
		1: "First bottle",
		2: "Second bottle",
		3: "Third bottle",
		4: "Fourth bottle"
	},
	hc_bk: "HC big key",
	hc_map: "HC map",
	ditems_bk0: "EP big key",
	ditems_bk1: "DP big key",
	ditems_bk2: "Hera big key",
	ditems_bk3: "PoD big key",
	ditems_bk4: "SP big key",
	ditems_bk5: "SW big key",
	ditems_bk6: "TT big key",
	ditems_bk7: "IP big key",
	ditems_bk8: "MM big key",
	ditems_bk9: "TR big key",
	ditems_bk10: "GT big key",
	ditems_map0: "EP map",
	ditems_map1: "DP map",
	ditems_map2: "Hera map",
	ditems_map3: "PoD map",
	ditems_map4: "SP map",
	ditems_map5: "SW map",
	ditems_map6: "TT map",
	ditems_map7: "IP map",
	ditems_map8: "MM map",
	ditems_map9: "TR map",
	ditems_map10: "GT map",
	ditems_comp0: "EP compass",
	ditems_comp1: "DP compass",
	ditems_comp2: "Hera compass",
	ditems_comp3: "PoD compass",
	ditems_comp4: "SP compass",
	ditems_comp5: "SW compass",
	ditems_comp6: "TT compass",
	ditems_comp7: "IP compass",
	ditems_comp8: "MM compass",
	ditems_comp9: "TR compass",
	ditems_comp10: "GT compass",
	magic: {
		1: "Magic Upgrade",
		2: "Half Magic",
		3: "Quarter Magic"
	},
	zelda: {
		0: "Zelda back in cell",
		1: "Zelda rescued"
	},
	medallion: {
		0: "unknown",
		1: "Bombos",
		2: "Ether",
		3: "Quake"
	},
	dungeonPrize: {
		0: "unknown",
		1: "crystal",
		2: "red 5/6 crystal",
		3: "Pendant of Courage",
		4: "red/blue pendant"
	},
	gtboss: {
		13: "Lower GT",
		14: "Middle GT",
		15: "Upper GT"
	},
	arrow: {
		0: "Silver Arrows",
		1: "Silver Arrows"
	},
	retroarrow: {
		0: "Arrows",
		1: "Wooden Arrows",
		2: "Silver Arrows",
		3: "Wooden & Silver Arrows"
	}
}
//heart_piece, death, heart_full, hc_sk, ditems_skx: add 1, max out at end

function translateLabel(label, value, click) {
	if (label.substring(0, 3) === "poi") { //map poi
		var Num = label.substring(3);
		return (value ? 'DID  ' : 'undo ') + chests[Num].name;
	} else if (label.substring(0, 8) === "entrance") { //map entrance
		var Num = label.substring(8);
		return (value ? 'DID  ' : 'undo ') + 'Entrance: ' + entrances[Num].name;
	} else if (label.substring(0, 4) === "shop") { //map shop
		var Num = label.substring(4);
		return (value ? 'DID  ' : 'undo ') + 'Shop: ' + shops[Num].name;
	} else if (label.substring(0, 5) === "chest") {
		var Num = label.substring(5);
		var length = dungeons[Num].abbrev.length;
		var spacer = '  ';
		if (length === 3)
			spacer = ' ';
		else if (length === 4)
			spacer = '';
		return (click ? 'undo ' : '') + dungeons[Num].abbrev + (click ? ' now' : spacer) + ' has ' + value + ' chest' + (value === 1 ? '' : 's') + ' left';
	} else if (label.substring(0, 4) === "boss") {
		var Num = label.substring(4);
		if (click === 0)
			return (value === 2 ? 'GOT  ' : 'drop ') + dungeons[Num].abbrev + ' boss';
		else
			return 'set  ' + dungeons[Num].abbrev + ' boss to ' + (value === -1 ? 'unknown' : itemNames["boss"][(Num + value) % 10]);
	} else if (label.substring(0, 6) === "gtboss") {
		var Num = label.substring(6);
		if (click === 0)
			return (value === 2 ? 'GOT  ' : 'drop ') + itemNames["gtboss"][Num] + ' boss';
		else
			return 'set  ' + itemNames["gtboss"][Num] + ' boss to ' + (value === -1 ? 'unknown' : itemNames["boss"][(Num - 13 + value) % 10]);
	} else if (label === "go") {
		return (!click ? 'GOT  ' : 'undo ') + 'Triforce Piece #' + (value + (click ? 1 : 0));
	} else if (label.substring(0, 9) === "medallion") {
		return 'set  ' + dungeons[label.substring(9)].abbrev + ' medallion to ' + itemNames["medallion"][value];
	} else if (label.substring(0, 12) === "dungeonPrize") {
		if (click === 0)
			return 'set  ' + dungeons[label.substring(12)].abbrev + ' prize to ' + itemNames["dungeonPrize"][value];
		else
			return (value ? 'GOT  ' : 'drop ') + dungeons[label.substring(12)].abbrev + ' pendant/crystal';
	} else if (label.substring(0, 9) === "ditems_sk") {
		var Num = label.substring(9);
		return (!click ? 'GOT  ' : 'undo to ' + value + ' ') + dungeons[Num].abbrev + ' small key'
			+ (!click ? ' #' + value : (value === 1) ? '' : 's');
	} else if (label === "hc_sk") {
		if (optionVariation === "retro")
			return (!click ? 'GOT  ' : 'USED ') + 'generic small key ' + (!click ? '#' + value : '(down to ' + value + ')');
		else
			return (!click ? 'GOT  HC small key #1' : 'undo to 0 HC small keys');
	} else if (typeof(value) === 'boolean') {
		return (value ? 'GOT  ' : 'drop ') + itemNames[label];
	} else if (label === "hookshot" || label === "tunic" || label === "magic") {
		return (value !== 1 ? 'GOT  ' : 'drop ') + itemNames[label][value];
	} else if (label === "heart_piece" || label === "death" || label === "heart_full") {
		;
	} else if (label === "arrow") {
		if (optionVariation === "retro")
			return (value ? 'GOT  ' : 'drop ') + itemNames["retroarrow"][value];
		return (value ? 'GOT  ' : 'drop ') + itemNames[label][value];
	} else
		return (value ? 'GOT  ' : 'drop ') + itemNames[label][value];
}

function resetLog() {
	currentLog = [];
	logData = {};
	document.querySelector('#log-text-area').value = "Item log will be shown here";
}