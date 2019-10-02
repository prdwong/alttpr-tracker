//TODO: Getting good bee might use up a bottle that's needed for dungeon entrance...
//TODO: Regular bee damages Mothula
//TODO: Track bottles (AgaPossible_path) for barrier revive
//TODO: canExtendMagic for higher difficulties

//TODO: Some major glitches will sneak into nmg logic


/*rgn bunny functions rely on this reasoning
  How to get around as just a bunny (no linkstate/superbunny allowed)
  Entry locations
	portal: wDM -> dwDM
	portal: eDM + mitts/(hammer+bootsclip/1f) -> deDM
	aga: AgaPossible_path -> dNE
	mire: mitts + flute/fakeflute/bootsclip/1f -> mire
	screenwrap portal: mirror + bootsclip/spinspeed/1f -> dNW,dNE,dS
  Allowed tricks: 1f/mirrorclip/mirrorwrap/surfing bunny/fakeflute
  1f gets you to any destination from start
  dwDM: mirrorclip to dNW/deDM or mirrorwrap to deDM or bootsclip/(spinspeed+mirrorclip(reject)) to deDM as superbunny
  deDM jump to dwDM
  dNE: surf to potion shop & mirrorwrap to dNW
  dNW: jump to dS or mirrorwrap to potion shop & bootsclip+mirrorclip to surf to dNE
  dS: mirhambri to dNE or mireclip/mirewrap to mire
  mire: can't get out
  anywhere but mire: fake flute to mire (becomes a bunny right away), fake flute to dwDM (but instead just flute in light world)
	fake flute to dwDM and preserve superbunny to be bunny at deDM/potion/dNW
	  for dNW, just fake flute to dNW instead
	  for potion, mirrorwrap to dNW (but just fake flute to dNW instead) or surfing bunny to dNE (but just pyramid portal instead)
*/
function rgn_obr2link_ne(locs = [], bottles = bottleCount()) { //all paths to get linkstate via obr in Lake Hylia (1-2 bottles used)
	return andCombinator([canBunnyRevive_path(bottles),
		orCombinator([canOneFrameClipOW_path(), //1f DMA->portal->DMD
			andCombinator([canMirrorClip_path(), regions.westDeathMountain(undefined, locs, bottles - 1)]), //mirrorclip DMD
			orCombinator([canSuperSpeed_path(), canBootsClip_path()]), //DMA->fast DMD
			AgaPossible_path()])]); //Aga portal
}
function rgn_obr2link_mire(locs = [], bottles = bottleCount()) { //Paths to get linkstate via obr in Mire (1-3 bottles used)
	return andCombinator([canBunnyRevive_path(bottles), rgn_bunny2here("mire", locs, bottles - 1)]);
}
function rgn_bumper2link() { //all paths to get linkstate via bumper ledge. Ends up in dNW
	return andCombinator([canOneFrameClipOW_path(), !chests[51].isOpened]);
}
function rgn_fakeflute2link(locs = [], bottles = bottleCount()) { //all paths to get linkstate via fake fluting. Ends up in dNE, dNW, or dS (1-2 bottles used)
	return andCombinator([canOWYBA_path(bottles), //fake flute
		orCombinator([AgaPossible_path(), //from dNE, through Aga portal
			regions.westDeathMountain(undefined, locs, bottles - 1)])]); //from DM portal (same as 1f from mire; less req than screenwrapped portal)
}
function rgn_stumpy2link(locs = [], bottles = bottleCount()) { //all paths to get linkstate via stumpy. Ends up in dS (0-1 bottles)
	return andCombinator([rgn_bunny2here("SouthDarkWorld", locs, bottles), //dS as bunny
		canMirrorWrap_path(), !chests[55].isOpened]); //linkstate from stumpy
}
function rgn_bunny2here(region, locs = [], bottles = bottleCount()) { //all paths to get to this region as a bunny
	switch (region) {
		case "darkWestDeathMountain":
			return orCombinator([canOneFrameClipOW_path(), //1f
				regions.westDeathMountain(undefined, locs, bottles)]); //portal
		case "darkEastDeathMountain":
			return orCombinator([canOneFrameClipOW_path(), //1f
				andCombinator([orCombinator([canMirrorClip_path(), canMirrorWrap_path()]), //mirrorclip/wrap from dwDM
					rgn_bunny2here("darkWestDeathMountain", locs, bottles)]),
				andCombinator([orCombinator([canLiftDarkRocks(), //lower eDM portal
						andCombinator([items.hammer, canBootsClip_path()])]), //TR portal
					regions.eastDeathMountain(undefined, locs, bottles)]),
				andCombinator([canOWYBA_path(bottles), glitched("fakefluteDM"), canBootsClip_path(), //fake flute to DM and preserve superbunny
					orCombinator([rgn_bunny2here("darkWestDeathMountain", locs, bottles - 1), AgaPossible_path()])])]);
		case "northEastDarkWorld":
			return orCombinator([canOneFrameClipOW_path(), //1f
				andCombinator([items.mirror, orCombinator([canBootsClip_path(), canSuperSpeed_path()])]), //pyramid portal
				AgaPossible_path(), //Aga portal
				andCombinator([rgn_bunny2here("darkWestDeathMountain", locs, bottles), canMirrorClip_path(), glitched("mirhambri")])]); //mirror clip DMD then clip past hammer bridge
			//DM->mirror clip DMD->mirrorwrap to potion->surfing bunny->dNE requires 1f/bootsclip to surf, which is redundant path
		case "northWestDarkWorld":
		case "SouthDarkWorld": //jump from dNW, no other new paths for dS
			return orCombinator([canOneFrameClipOW_path(), //1f
				andCombinator([canMirrorClip_path(), rgn_bunny2here("darkWestDeathMountain", locs, bottles)]), //mirrorclip DMD
				andCombinator([orCombinator([canBootsClip_path(), canSuperSpeed_path()]), items.mirror]), //screenwrapped fast transition
				andCombinator([canBunnySurf_path(), canMirrorWrap_path(), //NE->surfing bunny->mirrorwrap
					rgn_bunny2here("northEastDarkWorld", locs, bottles)])]);
		case "mire":
			return orCombinator([canOneFrameClipOW_path(), //1f
				andCombinator([canLiftDarkRocks(), orCombinator([canBootsClip_path(), canFly_path(), canOWYBA_path(bottles)])]), //portal
				andCombinator([canOWYBA_path(bottles), orCombinator([rgn_bunny2here("darkWestDeathMountain", locs, bottles - 1), //fake flute
						rgn_bunny2here("northEastDarkWorld", locs, bottles - 1)])]), //screenwrap/fast portal is same as dDM
				andCombinator([orCombinator([andCombinator([canMirrorClip_path(), glitched("mireclip")]), //mireclip from dS
						orCombinator([andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])]), //mirewrap from dS
					rgn_bunny2here("SouthDarkWorld", locs, bottles)])]); 
	}
}

//Starting locations as Link in dark world: DM portals, NE portal, NW portal, S portal, mire portal, Aga portal,
//  Screenwrapped portal/quick transition, superjump, bumper ledge, stumpy, fake flute ne/nw/s, obr to ne/potion, obr to mire
//Any path off deDM also allows you to do dwDM->deDM (or go straight off dwDM) (deDM->dwDM->(deDM if needed)->off dDM)
//  And only way up to deDM is through dwDM (deDM isolated behind dwDM)
//  Therefore, treat dDM as one object 
//All starts require pearl except for the linkstates above (bumper ledge, stumpy, fake flute, obr)
//Here's where each initial location ends up:
//DM portals:
//  (pearl+wDM)->dDM
//NE portal, Aga portal, screenwrapped portal, fake flute, obr -- screenwrapped is only different from wDM+DMD with spinspeed:
//  (pearl+hammer+glove)/(pearl+AgaPossible)/(pearl+mirror+spinspeed)/(fakeflute2link)/(obr2lake)->dNE
//NW portal, screenwrap quick transition, bumper ledge, fake flute -- quick transition is same as wDM+DMD:
//  (pearl+(hammer+glove/mitts))/(bumper2link)/(fakeflute2link)->dNW
//S portal, bombclip from S portal, screenwrapped portal, superjump, stumpy, fake flute -- dNW->dS is free, so removing duplicates this becomes:
//  (stumpy2link)->dS
//Mire portal, superjump* (can't go willy nilly afterwards), obr->mire,
//  (mitts+pearl+flute/fakeflute/bootsclip/1f)/(pearl+bootsclip/spinspeed/1f***)/(obr2mire)->mire
//obr->potion shop
//  (obr2lake)->potion

//From dwDM:
//  bootsclip/1f->dNE (via potion shop)
//  mirrorclip+pearl+flipper/fakeflipper->dNE
//  spinspeed+flipper/fakeflipper->dNE
//  spinspeed+mirrorclip+pearl->glove/hammer/obr->dNE
//  fakeflute->dNE
//  fakeflute/mirrorclip/bootsclip/spinspeed/1f->dNW
//  fakeflute->mire
//  bootsclip/spinspeed/1f->potion
//dNE:
//  fakeflute->dDM
//  (mirrorwrap+pearl)/hookshot + glove/hammer/flipper/fakeflipper/obr->dNW
//  fakeflute->dNW
//  mitts+bootsclip/spinspeed/1f+flipper/fakeflipper->dNW
//  bootsclip/spinspeed/1f+flipper/fakeflipper->dS
//  hammer/fakeflute->dS
//  fakeflute->mire
//  glove/hammer/flipper/fakeflipper/obr->potion
//dNW:
//  fakeflute/bootsclip/1f->dDM
//  fakeflute/waterwalk/qirn->dNE
//  mirrorwrap+ mirror + glove/hammer/flipper/fakeflipper/obr/bootsclip/1f->dNE
//  mirrorwrap* + (glove+bombs)/(hammer+sword/link)/flipper/(obr+bombs)
//  ->dS
//  fakeflute->mire
//  mirrorwrap*->potion (*correctable without mirroring)
//dS:
//  fakeflute->dDM
//  fakeflute/hammer/flipper/obr/mirhambri*->dNE
//  bootsclip/1f/spinspeed + fakeflipper->dNE
//  mitts/bootsclip/1f/fakeflute->dNW
//  fakeflute/bootsclip/1f/mireclip/mirewrap->mire
//  flipper/obr->potion
//  bootsclip/1f/spinspeed + fakeflipper->potion
//Mire:
//  bootsclip/1f->dS
//potion shop:
//  glove/hammer/flipper/fakeflipper/obr/bootsclip/1f->dNE
//  mirrorwrap* / hookshot->dNW

function rgn_link2here(region, locs = [], bottles = bottleCount()) { //all paths to get to this region as link
	switch (region) {
		case "darkWestDeathMountain": //(0-4 bottles)
			return orCombinator([andCombinator([items.moonpearl, regions.westDeathMountain(undefined, locs, bottles)]), //pearl DM portal (0-1 bottles)
					//with pearl, just enter DM portal (any path going up dDM is the same as going up in light world first)
					//rest of options starts as bunny and needs to get linkstate
				rgn_bumper2link(), //1f link state from bumper ledge, then 1f DMA
				andCombinator([orCombinator([rgn_stumpy2link(locs, bottles - 1), //get link state somewhere, then fake flute to DM (1-4 bottles)
						rgn_fakeflute2link(locs, bottles - 1),
						rgn_obr2link_ne(locs, bottles - 1)]), //obr2mire needs bootsclip/1f to get out
					canOWYBA_path(bottles)]),
				andCombinator([orCombinator([rgn_stumpy2link(locs, bottles), //get link state somewhere, then DMA (0-3 bottles)
						rgn_fakeflute2link(locs, bottles),
						andCombinator([rgn_obr2link_ne(locs, bottles), //need to get from Lake Hylia to dNW
							orCombinator([items.hammer, //hammer pegs->dS->dNW
								canFakeFlipper_path(), items.flippers, //moat->dS->dNW
								hasHookshot()])]), //dark potion shop->hookshot across->dNW
						rgn_obr2link_mire(locs, bottles)]),
					orCombinator([canOneFrameClipOW_path(), canBootsClip_path])])]);
		case "darkEastDeathMountain": //(0-4 bottles)
			return orCombinator([andCombinator([rgn_link2here("darkWestDeathMountain", locs, bottles), //bombclip/bootsclip/1f
					orCombinator([canBombClipOW_path(), canBootsClip_path(), canOneFrameClipOW_path()])]),
				andCombinator([items.moonpearl, regions.westDeathMountain(undefined, locs, bottles), //mirrorclip/mirrorwrap
					orCombinator([canMirrorClip_path(), canMirrorWrap_path()])]),
				andCombinator([items.moonpearl && canLiftDarkRocks(), regions.eastDeathMountain(undefined, locs, bottles)])]); //eDM portal
					//For TR portal with pearl, do TR climb instead
		case "northEastDarkWorld":
			return orCombinator([
			//Direct
			//	(pearl+hammer+glove)
				items.moonpearl && items.hammer && canLiftRocks(),
			//	(pearl+Aga)
				andCombinator([items.moonpearl, AgaPossible_path()]),
			//	(pearl+mirror[clip]+spinspeed)
				andCombinator([items.moonpearl && items.mirror, canSuperSpeed_path()]),
			//	(fakeflute2link)
				rgn_fakeflute2link(locs, bottles),
			//	(obr2lake)
				rgn_obr2link_ne(locs, bottles),
			//From dDM
			//	(pearl+wDM)
			//	(pearl) + bootsclip/1f <-- dNEgo
				andCombinator([items.moonpearl, orCombinator([canBootsClip_path(), canOneFrameClipOW_path()])]),
			//	(pearl+wDM) + mirrorclip+ffflipper <-- dNEgo
				andCombinator([items.moonpearl, regions.westDeathMountain(undefined, locs, bottles),
					canMirrorClip_path(), orCombinator([items.flippers, canFakeFlipper_path()])]),
			//	(pearl) + spinspeed + ffflipper <-- dNEgo
				andCombinator([items.moonpearl, canSuperSpeed_path(),
					orCombinator([items.flippers, canFakeFlipper_path()])]),
			//	(pearl) + spinspeed + mirrorclip + glove/hammer/obr -- reject**
			//	(pearl+wDM) + fakeflute -- reject
			//	(pearl+wDM) + fakeflute/mirrorclip/bootsclip/spinspeed/1f to dNW
			//	= (pearl+wDM) + mirrorclip/spinspeed to dNW
			//From dNW
			//	(pearl+mitts) + fakeflute/bootsclip/1f to dDM -- reject
			//	(pearl+mitts) + fakeflute/waterwalk/qirn -- combine qirn, split fakeflute
			//	(pearl+mitts) + fakeflute <-- dNEgo
				andCombinator([items.moonpearl && canLiftDarkRocks(), orCombinator([canOWYBA_path(bottles),
			//	(pearl+mitts) + mirrorwrap <-- dNEgo
						canMirrorWrap_path()])]),
			//	(bumper2link) <-- dNEgo
				rgn_bumper2link(locs, bottles),
			//	(fakeflute2link) -- reject
			//	(pearl+spinspeed/(wDM+mirrorclip)) + fakeflute/bootsclip/1f to dDM -- reject
			//	(pearl+spinspeed/(wDM+mirrorclip)) + fakeflute/waterwalk/qirn -- reject fakeflute, combine qirn
			//	(pearl+spinspeed/(wDM+mirrorclip)) + mirrorwrap + glove/hammer/ffflipper/obr -- reject spinspeed**
			//	(pearl+wDM+mirrorclip) + mirrorwrap + glove/hammer/ffflipper/obr -- reject obr (obr2link), ffflipper <-- dNEgo
				andCombinator([items.moonpearl, regions.westDeathMountain(undefined, locs, bottles),
					canMirrorClip_path(), canMirrorWrap_path(), canLiftRocks() || items.hammer]),
			//	send inits to dS
			//	(stumpy2link+mitts) from dS + waterwalk/qirn -- combine qirn
			//	(pearl+mitts/spinspeed/(wDM+mirrorclip))/(stumpy2link+mitts) + waterwalk/qirn <-- dNEgo
				andCombinator([orCombinator([andCombinator([items.moonpearl,
							orCombinator([canLiftDarkRocks(), canSuperSpeed_path(),
								andCombinator([regions.westDeathMountain(undefined, locs, bottles), canMirrorClip_path()])])]),
						andCombinator([rgn_stumpy2link(locs, bottles), canLiftDarkRocks()])]),
					orCombinator([canWaterWalk_path(),
						andCombinator([canBombThings(), canFakeFlipper_path()]),
						andCombinator([(items.icerod || items.ether) && hasSword() && items.quake, glitched("superqirn_jump"), canFakeFlipper_path()])])]),
			//From Mire
			//	(mitts+pearl+flute/fakeflute/bootsclip/1f) + bootsclip/1f -- reject
			//	(pearl+bootsclip/spinspeed/1f***) -- reject
			//	(obr2mire) + bootsclip/1f to dS
			//From dS
			//	(stumpy2link) + hammer/flipper/obr <-- dNEgo
				andCombinator([rgn_stumpy2link(locs, bottles - 1), orCombinator([canBunnyRevive_path(bottles), canOWYBA_path(bottles)])]),
				andCombinator([rgn_stumpy2link(locs, bottles),
					orCombinator([items.hammer || items.flippers,
			//	(stumpy2link) + spinspeed + fakeflipper <-- dNEgo
						andCombinator([canSuperSpeed_path(), canFakeFlipper_path()]),
			//	(stumpy2link) + mitts -> to dNW
			//	(stumpy2link) + bootsclip/1f/fakeflute -- already to dNE <-- dNEgo
						canBootsClip_path(), canOneFrameClipOW_path()])]),
			//	(obr2mire+bootsclip/1f) -- already to dNE <-- dNEgo
				andCombinator([rgn_obr2link_mire(locs, bottles), orCombinator([canBootsClip_path(), canOneFrameClipOW_path()])]),
			//	(pearl+mitts) + fakeflute/hammer/flipper/obr/mirhambri -- reject fakeflute
			//	(pearl+mitts) + hammer/flipper/obr/mirhambri <-- dNEgo
			//	(pearl+mitts) + bootsclip/1f/spinspeed + fakeflipper -- reject
			//	(pearl+spinspeed/(wDM+mirrorclip)) + fakeflute/hammer/flipper/obr/mirhambri -- reject fakeflute
			//	(pearl+spinspeed/(wDM+mirrorclip)) + hammer/flipper/obr/mirhambri <-- dNEgo
				andCombinator([items.moonpearl, orCombinator([canLiftDarkRocks(), canSuperSpeed_path(),
						andCombinator([canMirrorClip_path(), regions.westDeathMountain(undefined, locs, bottles)])]),
					orCombinator([items.hammer || items.flippers, canBunnyRevive_path(bottles),
						andCombinator([canMirrorClip_path(), glitched("mirhambri")])])])]);
			//	(pearl+spinspeed/(wDM+mirrorclip)) + bootsclip/1f/spinspeed + fakeflipper -- reject
		case "northWestDarkWorld":
			return orCombinator([
			//Direct
			//	(pearl+hammer+glove/mitts)
				items.moonpearl && ((items.hammer && canLiftRocks()) || canLiftDarkRocks()),
			//	(bumper2link)
				rgn_bumper2link(),
			//	(fakeflute2link)
				rgn_fakeflute2link(locs, bottles),
			//From dDM
			//	(pearl+wDM) + fakeflute/mirrorclip/bootsclip/spinspeed/1f -- reject fakeflute
			//	pearl+bootsclip/spinspeed/1f/(wDM+mirrorclip) <-- dNWgo
				andCombinator([items.moonpearl,
					orCombinator([canBootsClip_path(), canSuperSpeed_path(), canOneFrameClipOW_path(),
						andCombinator([regions.westDeathMountain(undefined, locs, bottles), canMirrorClip_path()])])]),
			//	(pearl+wDM) + bootsclip/1f to dNE -- reject
			//	(pearl+wDM) + mirrorclip+ffflipper -- reject
			//	(pearl+wDM) + spinspeed + x -- reject
			//From Mire
			//	(mitts+pearl+flute/fakeflute/bootsclip/1f) + bootsclip/1f -- reject
			//	(pearl+bootsclip/spinspeed/1f**) -- reject
			//	(obr2mire) + bootsclip/1f <-- dNWgo
				andCombinator([rgn_obr2link_mire(locs, bottles), orCombinator([canBootsClip_path(), canOneFrameClipOW_path()])]),
			//From dS
			//	(stumpy2link) + hammer to dNE
			//	(stumpy2link) + flipper/obr to potion
			//	(stumpy2link) + bootsclip/1f -- reject
			//	(stumpy2link) + spinspeed+fakeflipper to potion
			//	(stumpy2link) + mitts/bootsclip/1f/fakeflute -- reject fakeflute <-- dNWgo
				andCombinator([rgn_stumpy2link(locs, bottles),
					orCombinator([canLiftDarkRocks(), canBootsClip_path(), canOneFrameClipOW_path()])]),
			//From dNE
			//	(pearl+Aga) + fakeflute -- reject
			//	(pearl+Aga) + mirrorwrap/hookshot + glove/hammer/ffflipper/obr -- reject obr
			//	(pearl+Aga) + mirrorwrap/hookshot + glove/hammer/ffflipper <-- dNWgo
				andCombinator([items.moonpearl, AgaPossible_path(),
					orCombinator([canMirrorWrap_path(), hasHookshot()]),
					orCombinator([canLiftRocks() || items.hammer || items.flippers, canFakeFlipper_path()])]),
			//	(pearl+Aga) + mitts+bootsclip/spinspeed/1f+ffflipper -- reject
			//	(pearl+Aga) + bootsclip/spinspeed/1f+ffflipper -- reject
			//	(pearl+Aga) + hammer -> dS + mitts/bootsclip/1f/fakeflute -- reject
			//	(pearl+mirror+spinspeed) -- reject
			//	(fakeflute2link) -- reject
			//	(obr2lake) + fakeflute -- reject
			//	(obr2lake) + hookshot <-- dNWgo
				andCombinator([rgn_obr2link_ne(locs, bottles),
					orCombinator([hasHookshot(),
			//	(obr2lake) + mitts+bootsclip/spinspeed/1f+ffflipper -- reject
			//	(obr2lake) + bootsclip/spinspeed/1f+ffflipper to dS
			//	(obr2lake+bootsclip/spinspeed/1f+ffflipper)+mitts/bootsclip/1f -- split mitts
			//	(obr2lake) + hammer to dS
			//	(obr2lake) + hammer + mitts/bootsclip/1f -- combine
			//	(obr2lake) + bootsclip/1f + ffflipper/hammer <-- dNWgo
						andCombinator([orCombinator([canBootsClip_path(), canOneFrameClipOW_path()]),
							orCombinator([items.flippers || items.hammer, canFakeFlipper_path()])]),
			//	(obr2lake) + mitts + (spinspeed+ffflipper)/hammer <-- dNWgo
						andCombinator([canLiftDarkRocks(),
							orCombinator([andCombinator([canSuperSpeed_path(), orCombinator([items.flippers, canFakeFlipper_path()])]),
								items.hammer])])])]),
			//	(stumpy2link+hammer) + hookshot
				andCombinator([rgn_stumpy2link(locs, bottles), hasHookshot(),
					orCombinator([items.hammer,
			//	(stumpy2link+hammer) + mitts + xxx -- reject
			//	(stumpy2link+(flipper/(spinspeed+fakeflipper))) + hookshot
						items.flippers, andCombinator([canSuperSpeed_path(), canFakeFlipper_path()])])])]);
		case "SouthDarkWorld":
			return orCombinator([
			//Direct
			//	(pearl+hammer+glove/mitts)
				items.moonpearl && ((items.hammer && canLiftRocks()) || canLiftDarkRocks()),
			//	(bumper2link)
				rgn_bumper2link(),
			//	(fakeflute2link)
				rgn_fakeflute2link(locs, bottles),
			//	(stumpy2link)
				rgn_stumpy2link(locs, bottles),
			//From DM
			//	(pearl+wDM) + fakeflute/mirrorclip/bootsclip/spinspeed/1f -- reject fakeflute
			//	=(pearl+bootsclip/spinspeed/1f/(wDM+mirrorclip) <-- dSgo
				andCombinator([items.moonpearl, orCombinator([canBootsClip_path(), canSuperSpeed_path(), canOneFrameClipOW_path(),
						andCombinator([regions.westDeathMountain(undefined, locs, bottles), canMirrorClip_path()])])]),
			//	(pearl+wDM) + bootsclip/1f -- reject
			//	(pearl+wDM) + mirrorclip+ffflipper -- reject
			//	(pearl+wDM) + spinspeed+mirrorclip+pearl + ~~ -- reject
			//From Mire
			//	(mitts+pearl+flute/fakeflute/bootsclip/1f) + bootsclip/1f -- reject
			//	(pearl+bootsclip/spinspeed/1f**) -- reject
			//	(obr2mire) + bootsclip/1f <-- dSgo
				andCombinator([rgn_obr2link_mire(), orCombinator([canBootsClip_path(), canOneFrameClipOW_path()])]),
			//From dNE
			//	(pearl+hammer+glove) -- reject
			//	(pearl+Aga) + fakeflute -- reject
			//	(pearl+Aga) + mirrorwrap/hookshot + glove/hammer/ffflipper/obr -- reject obr/hammer
			//	(pearl+Aga) + mirrorwrap/hookshot + glove/ffflipper <-- dSgo
				andCombinator([items.moonpearl, AgaPossible_path(),
					orCombinator([andCombinator([orCombinator([canMirrorWrap_path(), hasHookshot()]),
							orCombinator([canLiftRocks() || items.flippers, canFakeFlipper_path()])]),
			//	(pearl+Aga) + mitts+~~~ -- reject
			//	(pearl+Aga) + bootsclip/superspeed/1f + ffflipper -- reject
			//	(pearl+Aga) + hammer <-- dSgo
						items.hammer])]),
			//	(pearl+mirror+spinspeed) -- reject
			//	(fakeflute2link) -- reject
			//	(obr2lake) + fakeflute -- reject
			//	(obr2lake) + hookshot <-- dSgo
				andCombinator([rgn_obr2link_ne(locs, bottles),
					orCombinator([hasHookshot(),
			//	(obr2lake) + mitts + bootsclip/spinspeed/1f + ffflipper -- reject
			//	(obr2lake) + bootsclip/superspeed/1f + ffflipper <-- dSgo
						andCombinator([orCombinator([canBootsClip_path(), canSuperSpeed_path(), canOneFrameClipOW_path()]),
							orCombinator([items.flippers, canFakeFlipper_path()])]),
			//	(obr2lake) + hammer <-- dSgo
						items.hammer])])]);
		case "mire":
			return orCombinator([
			//Direct
			//	(pearl+mitts+flute/fakeflute/bootsclip/1f) -- reject bootsclip/1f
			//	(pearl+mitts+flute/fakeflute)
				andCombinator([items.moonpearl && canLiftDarkRocks(), orCombinator([canFly_path(), canOWYBA_path(bottles)])]),
			//	(pearl+bootsclip/superspeed/1f**) -- split out
			//	(pearl+bootsclip/1f)
				andCombinator([items.moonpearl, orCombinator([canBootsClip_path(), canOneFrameClipOW_path()])]),
			//	(pearl+superspeedjump)
				andCombinator([items.moonpearl, canSuperSpeed_path(), glitched("superjump_mire")]),
			//	(obr2mire)
				rgn_obr2link_mire(locs, bottles),
			//From dS
			//	(stumpy2link) + fakeflute/bootsclip/1f/mirewrap
				andCombinator([rgn_stumpy2link(locs, bottles - 1), canOWYBA_path(bottles)]),
				andCombinator([rgn_stumpy2link(locs, bottles),
					orCombinator([canBootsClip_path(), canOneFrameClipOW_path(), andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])]),
			//From dNW
			//	(pearl+ham+glo/mit) + fakeflute/bootsclip/1f/mireclip/mirewrap -- reject bootsclip/1f; split out/reject mitts+fakeflute
			//	(pearl+hammer+glove) + fakeflute/mireclip/mirewrap
				andCombinator([items.moonpearl && items.hammer && canLiftRocks(),
					orCombinator([canOWYBA_path(bottles), andCombinator([canMirrorClip_path(), glitched("mireclip")]),
						andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])]),
			//	(pearl+mitts) + mireclip/mirewrap
				andCombinator([items.moonpearl && canLiftDarkRocks(),
					orCombinator([andCombinator([canMirrorClip_path(), glitched("mireclip")]),
						andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])]),
			//	(bumper2link)
				rgn_bumper2link(),
			//	(fakeflute2link) + fakeflute/bootsclip/1f/mirewrap
				andCombinator([rgn_fakeflute2link(locs, bottles - 1), canOWYBA_path(bottles)]),
				andCombinator([rgn_fakeflute2link(locs, bottles), orCombinator([canBootsClip_path(), canOneFrameClipOW_path(),
						andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])]),
			//From dDM
			//	(pearl+wDM) + bootsclip/1f -- reject
			//	(pearl+wDM) + mirrorclip/spinspeed + ffflipper to dNE -- reject mirrorclip/spinspeed (goes to dNW instead)
			//	(pearl+wDM) + spinspeed+mirrorclip + glove/hammer/obr to dNE -- reject spinspeed
			//	(pearl+wDM) + mirrorclip/bootsclip/spinspeed/1f to dNW -- reject bootsclip/1f
			//	(pearl+wDM) + mirrorclip/spinspeed + mireclip/mirewrap
				andCombinator([items.moonpearl, regions.westDeathMountain(undefined, locs, bottles),
					orCombinator([canMirrorClip_path(), canSuperSpeed_path()]),
					orCombinator([andCombinator([canMirrorClip_path(), glitched("mireclip")]),
						andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])]),
			//	(pearl+wDM) + fakeflute
				andCombinator([items.moonpearl, regions.westDeathMountain(undefined, locs, bottles - 1), canOWYBA_path(bottles)]),
			//From dNE
			//	(pearl+hammer+glove) -- reject
			//	(pearl+Aga) + ??? + fakeflute/bootsclip/1f/mireclip/mirewrap -- reject bootsclip/1f
			//	(pearl+Aga) + fakeflute
				andCombinator([items.moonpearl, AgaPossible_path(), canOWYBA_path(bottles)]),
			//	(pearl+Aga) + ??? + mireclip/mirewrap
			//	(pearl+Aga) + mirrorwrap/hookshot + glove/hammer/flipper/fakeflipper/obr + mireclip/mirewrap -- reject hammer/obr
			//	(pearl+Aga) + mirrorwrap/hookshot + glove/ffflipper + mireclip/mirewrap
				andCombinator([items.moonpearl, AgaPossible_path(),
					orCombinator([canMirrorWrap_path(), hasHookshot()]),
					orCombinator([canLiftRocks() || items.flippers, canFakeFlipper_path()]),
					orCombinator([andCombinator([canMirrorClip_path(), glitched("mireclip")]),
						andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])]),
			//	(pearl+Aga) + mitts+~~~  -- reject
			//	(pearl+Aga) + bootsclip/superspeed/1f + ffflipper + mireclip/mirewrap -- reject
			//	(pearl+Aga) + hammer + mireclip/mirewrap
			//	(pearl+mirror+superspeed) -- reject
			//	(fakeflute2link) -- reject
			//	(obr2lake) + ??? + fakeflute/bootsclip/1f/mireclip/mirewrap -- reject mireclip
			//	(obr2lake) + fakeflute
				andCombinator([rgn_obr2link_ne(locs, bottles - 1), canOWYBA_path(bottles)]),
			//	(obr2lake) + hookshot + bootsclip/1f/mirewrap
				andCombinator([rgn_obr2link_ne(locs, bottles),
					orCombinator([hasHookshot(),
			//	(obr2lake) + mitts + bootsclip/spinspeed/1f + ffflipper -- reject
			//	(obr2lake) + bootsclip/spinspeed/1f + ffflipper + bootsclip/1f/mirewrap
						andCombinator([orCombinator([canBootsClip_path(), canSuperSpeed_path(), canOneFrameClipOW_path()]),
							orCombinator([items.flippers, canFakeFlipper_path()])]),
			//	(obr2lake) + hammer + bootsclip/1f/mirewrap
						items.hammer]),
					orCombinator([canBootsClip_path(), canOneFrameClipOW_path(), andCombinator([canMirrorWrap_path(), glitched("mirewrap")])])])]);
	}
}

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
	else //Use logic (path1) arg, correct path is marked with g
		return orCombinator([path1, andCombinator([glitched("true"), path2])]);
}
function AgaPossible_path() { //TODO: Will need to track bottles when we add fairy revive
	return orCombinator([dungeons[11].isBeaten(), dungeons[11].canGetPrize()]);
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
function canKillEscapeThings_path() { //Used during HyruleCastleEscape
	return orCombinator([hasSword()
		|| items.somaria
		|| canBombThings()
		|| items.byrna,
		canShootArrows_path(),
		items.hammer
		|| items.firerod]);
}
//TODO: canExtendMagic is not great for higher difficulty, but this is how logic is right now -- not actually sure how to handle it otherwise (approx 1.25 for CT, none for MM)
function canKillMostThings_path($enemies = 5) { //only used during HyruleCastleTower & MiseryMire
	return orCombinator([hasSword()
		|| items.somaria
		|| (canBombThings() && $enemies < 6)
		|| (items.byrna && ($enemies < 6 || canExtendMagic())),
		canShootArrows_path(),
		items.hammer
		|| items.firerod]);
}
function canGetGoodBee_path() {
	return orCombinator([items.net
			&& hasABottle()
			&& (items.boots
				|| (hasSword() && items.quake)),
		(qtyCounter.bottle0 === 5 && hasBottle(1))
		|| (qtyCounter.bottle1 === 5 && hasBottle(2))
		|| (qtyCounter.bottle2 === 5 && hasBottle(3))
		|| (qtyCounter.bottle3 === 5 && hasBottle(4)),
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
function canGetFairy_path(bottles = bottleCount(), check_pyramid = true, locs = []) {
	var count = 0;
	for (var i = 0; i < 4; i++)
		if (qtyCounter["bottle"+i] === 6)
			count++;
	if (bottles < 1)
		return {};
	return orCombinator([items.net && bottles >= 1,
		count >= 1,
		false]);
//		andCombinator([bottles >= 1, orCombinator([andCombinator([qtyCounter.fairy0 === 6, chests[5].isAvailable()]),
//			andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[5].isAvailable())]),
//			check_pyramid ? (andCombinator([qtyCounter.fairy1 === 6, chests[46].isAvailable(undefined, locs, bottles - 1, true)]),
//				andCombinator([qtyCounter.fairy0 === 0, convertPossible(chests[46].isAvailable(undefined, locs, bottles - 1, true))])) : false])])]);
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
	if (items.mirror && items.flippers)
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
function canBunnyRevive_path(bottles = bottleCount()) { //Used nowhere
	var logic = {};
	switch (optionLogic) {
		case "nmg":
		case "owg":
			logic = glitched("fairy_fakeflipper");
		case "major":
		case "nologic":
			logic = {ng:"a"};
	}
	return andCombinator([canGetFairy_path(bottles), logic]);
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
function canBombClipOW_path() {
	if (canBombThings() && items.boots)
		switch (optionLogic) {
			case "nmg":
				return {};
			case "owg":
			case "major":
				return glitched("bombclipOW");
			case "nologic":
				return {ng:"a"};
		}
	return {};
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
			andCombinator([glitched("trinexx_fighter"), canExtendMagic(1.25) && hasSword()])
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
			if (route.indexOf("a") === -1)
				result[route+"v"] = set[route];
			else
				result[route.slice(0, -1)+"va"] = set[route];
	});
	return result;
}

//Change all portions from x to xa (will overwrite existing aga)
function convertAga(set) {
	var result = {};
	var pathList = Object.keys(set);
	pathList.forEach(function(route) {
		if (route.indexOf("a") === -1)
			result[route+"a"] = set[route];
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
	if (path_in === true)
		return {ng:"a", g:"a", mg:"a", nga:"a", ga:"a", mga:"a"};
	if (path_in === false)
		return {};
	var path = {};
	for (var key in path_in)
		path[key] = path_in[key];
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
		for (var i = 0; i < path1.length; i++)
			if (path1[i] === true || path1[i].ng === "a")
				return {ng:"a"};
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

//Functions to calculate regions to avoid expensive recalculations
//Invalidates all cached results
function clear_region_cache() {
	regions_cache = [];
	for (var key in regions) {
		var state_arr = [];
		var bottle_arr = [];
		state_arr.push(bottle_arr);
		bottle_arr = [];
		state_arr.push(bottle_arr);
		bottle_arr = [];
		state_arr.push(bottle_arr);
		regions_cache.push(state_arr);
	}
}
//Returns region path from cache if it exists, otherwise calculate the result and store it in the cache for future lookup
function region_cache_lookup(region, linkstate = false, from_locs = [], bottles = bottleCount()) {
	var i, j, k;
	switch (region) {
		case "westDeathMountain" : i = 0; break;
		case "eastDeathMountain" : i = 1; break;
		case "darkWestDeathMountain" : i = 2; break;
		case "darkEastDeathMountain" : i = 3; break;
		case "northEastDarkWorld" : i = 4; break;
		case "northWestDarkWorld" : i = 5; break;
		case "SouthDarkWorld" : i = 6; break;
		case "mire" : i = 7; break;
		case "northEastLightWorld" : i = 8; break;
		case "northWestLightWorld" : i = 9; break;
		case "SouthLightWorld" : i = 10; break;
	}
	switch (linkstate) {
		case false : j = 0; break;
		case 2 : j = 1; break;
		case true : j = 2; break;
	}
	k = bottles;
	if (regions_cache[i][j][k] === undefined) {
		var reply = regions[region](linkstate, from_locs, bottles, true); //true = don't use the cache result, because it's invalid
		if (from_locs.length === 0) //only store in cache if it's a base calculation, don't want to store results where certain areas are invalidated
			regions_cache[i][j][k] = reply;
		return reply;
	}
	return regions_cache[i][j][k];
}