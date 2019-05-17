// how much damage an ability does without any resistances
function getAbilityDamage(ability, ad, ap, abilityLevel){
    //console.log(ability,ap,ad,abilityLevel)
    let baseDamage = ability.base[abilityLevel-1]
    let apMod = ability.modifier.ap[abilityLevel-1] * ap
    let adMod = ability.modifier.ad[abilityLevel-1] * ad
    let abilityDamage = baseDamage + apMod + adMod
    return abilityDamage
}

// returning how much resistance is removed by pen
function getResistanceSubtracted(percentPen, flatPen, resistance){
    let resistanceSubtracted = resistance * (1 - percentPen) - flatPen 
    return resistance - resistanceSubtracted
}

// how much resistance is left after the reduction 
function getDamageReducer(resistance, resistanceSubtracted){
    return resistance - resistanceSubtracted
}

// how much damage is done after resistances
function getReducedDamage(damage, damageReducer){
    return reducedDamage = (100/(100 + damageReducer)) * damage
}

getDamage = (source, data) => {
    const playerad = data.player.attackdamage
    const playerap = data.player.spelldamage

    const playeradFlatPen = data.player.flatarmorpenetration
    const playeradPercentPen = data.player.percentarmorpenetration
    const playerapFlatPen = data.player.flatspellpenetration
    const playerapPercentPen = data.player.percentspellpenetration


    const enemyArmor = data.enemy.armor
    const enemySpellBlock = data.enemy.spellblock
    
    let aaSubtracted =  getResistanceSubtracted(playeradPercentPen, playeradFlatPen, enemyArmor)
    let aaDamageReducer = getDamageReducer(enemyArmor, aaSubtracted)
    let aaDamage = getReducedDamage(playerad, aaDamageReducer)
    //console.log(playerad,playerap,playeradFlatPen,playeradPercentPen,playerapFlatPen,playerapPercentPen,enemyArmor,enemySpellBlock,aaDamage,aaDamageReducer,aaSubtracted)
    var damages = {
        "aa" : [{"damage" : aaDamage, "type" : 'Physical'}],
        "q" : [],
        "w" : [],
        "e" : [],
        "r" : []
    
    }    
    
    Object.entries(source).forEach((ability) => {
        ability[1].forEach((cast) => {
            let abilityType = cast.type
            if (abilityType == "Physical"){
                const damage = getAbilityDamage(cast, playerad, playerap, data.player[`${ability[0]}level`])
                const resistanceSubtracted = getResistanceSubtracted(playeradPercentPen, playeradFlatPen, enemyArmor)
                const damagereducer = getDamageReducer(enemyArmor, resistanceSubtracted)
                let totalDamage = getReducedDamage(damage, damagereducer);
                //console.log(totalDamage)
                damages[`${ability[0]}`].push({"damage" : totalDamage, "type" : 'Physical'})
    
            }else if (abilityType == "Magic"){
                const damage = getAbilityDamage(cast, playerad, playerap, data.player[`${ability[0]}level`])
                const resistanceSubtracted = getResistanceSubtracted(playerapPercentPen, playerapFlatPen, enemySpellBlock)
                const damagereducer = getDamageReducer(enemySpellBlock, resistanceSubtracted)
                let totalDamage = getReducedDamage(damage, damagereducer);
                //console.log(totalDamage)

                damages[`${ability[0]}`].push({"damage" : totalDamage, "type" : 'Magic'})
            }else if (abilityType == "True"){
                const totalDamage = getAbilityDamage(cast, playerad, playerap, data.player[`${ability[0]}level`])
                damages[`${ability[0]}`].push({"damage" : totalDamage, "type" : 'True'})
            }else{
                damages[`${ability[0]}`].push({"damage" : '0', "type" : 'No Damage'})
            }
    
        });
    })
    //console.log(damages)
    return damages

}

module.exports={
    getAbilityDamage,
    getDamageReducer,
    getReducedDamage,
    getResistanceSubtracted,
    getDamage
}