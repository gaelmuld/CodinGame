/***********************\
|*VARIABLES PRINCIPALES*|-------------------------------------
\***********************/

//NONE = -1
const NONE = -1;
//FREE = -1
const FREE = -1;
//NEUTRAL = -1
const NEUTRAL = -1;
//MINE = 0  
const MINE = 0;
//TOWER = 1  
const TOWER = 1;
//BARRACKS = 2  
const BARRACKS = 2;
//ALLIER = 0  
const ALLIER = 0;
//ENNEMI = 1  
const ENNEMI = 1;
//QUEEN = - 1 
const QUEEN = -1;
//KNIGH = 0  
const KNIGHT = 0;
//ARCHER = 1  
const ARCHER = 1;
//GIANT = 2  
const GIANT = 2;
//['NONE', 'MINE', 'TOWER', 'BARRACKS']
const structureType = ['FREE', 'MINE', 'TOWER', 'BARRACKS'];
//['NONE', 'ALLIER', 'ENNEMI']
const owner = ['NEUTRAL', 'ALLIER', 'ENNEMI'];
//["NONE", "KNIGHT", "ARCHER", "GIANT"]
const hireUnit = ["NONE", "KNIGHT", "ARCHER", "GIANT"];
//["QUEEN", "KNIGHT", "ARCHER", "GIANT"]
const uniType = ["QUEEN", "KNIGHT", "ARCHER", "GIANT"];

var ElemByTeam = [[[], []], [[], []], [[], []]]; //matrice 3 x 2 x taille de l'objet

/*************\
|*LES CLASSES*|-----------------------------------------------
\*************/

function Sites() {

    this.siteID;
    this.px;
    this.py;
    this.parcelX;
    this.parcelY;
    this.radius; // portée de contact
    this.gold; // used in future leagues
    this.maxMineSize; // used in future leagues
    this.structureType; // -1=NONE, 0=MINE, 1=TOWER, 2=BARRACKS
    this.owner; // -1=NEUTRAL, 0=ALLIER, 1=ENNEMI
    this.param1; // nb de tour avant arriver des renfort
    this.param2; // portée de la tour ou type de barrack 0=KNIGHT,1=ARCHER,2=GIANT
    this.uniteValue = 0;

    this.pErr = function (message = '') {
        let always = message + "\nId : " + this.siteID + " \nPOS= " + this.px + "x " + this.py + "y" + " \nRadius= " + this.radius + "\ngold adn Size : " + this.gold + " - " + this.maxMineSize + " \nStructure= " + structureType[this.structureType + 1] + " " + owner[this.owner + 1];

        let build = "";
        let barrack = "\nNew soldier in = " + this.param1 + " \nType soldier =" + hireUnit[this.param2 + 1];
        let tower = "\nNew HealthTower = " + this.param1 + " \nType rangeAttak =" + this.param2;
        let mine = this.owner != ENNEMI ? "\nRate Mining = " + this.param1 : "";
        if (this.structureType == BARRACKS)
            build = barrack;
        if (this.structureType == TOWER)
            build = tower;
        if (this.structureType == MINE)
            build = mine;


        printErr(always + build + '\n--------------')
    }
    this.distance = (target => distance(this, target));

}



function Unites() {
    this.px;
    this.py;
    this.parcelX;
    this.parcelY;
    this.owner; // -1=NONE, 0=ALLIER, 1=ENNEMI
    this.unitType; // -1=QUEEN, 0=KNIGHT, 1=ARCHER, 2=GIANT
    this.health;
    this.uniteValue = 0;

    this.pErr = function (message = '') {
        let always = message + " \nPOS= " + this.px + "x " + this.py + "y" + " \nUnitType= " + uniType[this.unitType + 1] + ' ' + owner[this.owner + 1] + " \nHealth=" + this.health + "\nUnite VALUE : " + this.uniteValue;
        printErr(always + '\n--------------');
    }

    this.distance = (target => distance(this, target));

}

function Compte() {
    this.gold;
    this.touchedSite; // -1 if none
    this.uniteValue = 0;
    this.reserve = 0;
    this.actBuild = 0;
    this.actHire = 0;

    this.pErr = function (message = '') {
        let always = message + " \nGold= " + this.gold + " \ntouchedSite =" + this.touchedSite
        printErr(always + '\n--------------');
    }
}


/************************ *\
|*RÉCUPÉRATION DES DONNÉES*|-------------------------------------
\************************ */

var sites = [],
    units = [],
    compte = [new Compte];

var numSites = parseInt(readline());
for (var i = 0; i < numSites; i++) {
    sites[i] = new Sites;
    var inputs = readline().split(' ');
    sites[i].siteID = parseInt(inputs[0]);
    sites[i].px = parseInt(inputs[1]);
    sites[i].py = parseInt(inputs[2]);
    sites[i].radius = parseInt(inputs[3]);
}
/***************\
|*LES FONCTIONS*|-------------------------------------------
\***************/



function printTab(table, message = '') {

    for (let t of table) {
        t.pErr(message);
    }
}

/**
 * calcule la distance de norme 2 sur un plan
 * @param   {object}  target1 cible 1 
 * @param   {object}  target2 cible 2
 * @returns {Integer} retourne la distance entre target1 et target2 arrondie à l'unité inférieur
 */
function distance(target1, target2) {
    var dx = target2.px - target1.px,
        dy = target2.py - target1.py;
    return parseInt(Math.sqrt(dx * dx + dy * dy));
}

function vectorAngle(origine, target, angle, length) {
    angle = angle / 180 * Math.PI;
    printErr('angle => ' + angle);
    var v = [(target.px - origine.px) / origine.distance(target), (target.py - origine.py) / origine.distance(target)];
    var w = [v[0] * Math.cos(angle) - v[1] * Math.sin(angle), v[0] * Math.sin(angle) + v[1] * Math.cos(angle)]
    return [Math.round(w[0] * length), Math.round(w[1] * length)];
}
/**
 * récupère les éléments les plus proches d'une cible selon la norme 2 sur un plan
 * @param   {object}        origine     l'objet origine ayant comme propriétés px (pos X) et py (pos Y)
 * @param   {Array[object]} tableTarget tableau d'objets de cible ayant comme propriétés px (pos X) et py (pos Y)
 * @param   {number}        nb          taille du tableau de retour 
 * @returns {Array[object]} renvoi un tableau contenant les nb cibles les plus proches
 */
function getNearest(origine, tableTarget, nb = 1) {
    nb > tableTarget.length ? nb = tableTarget.length : '';
    return tableTarget.length ? tableTarget.sort((a, b) => origine.distance(a) - origine.distance(b)).slice(0, nb) : [];
}
/**
 * récupère les éléments les plus éloignées d'une cible selon la norme 2 sur un plan
 * @param   {object}        origine     l'objet origine ayant comme propriétés px (pos X) et py (pos Y)
 * @param   {Array[object]} tableTarget tableau d'objets de cible ayant comme propriétés px (pos X) et py (pos Y)
 * @param   {number}        nb          taille du tableau de retour 
 * @returns {Array[object]} renvoi un tableau contenant les nb cibles les plus éloignées
 */
function getFarest(origine, tableTarget, nb = 1) {
    nb > tableTarget.length ? nb = tableTarget.length : '';
    return tableTarget.length ? tableTarget.sort((a, b) => origine.distance(b) - origine.distance(a)).slice(0, nb) : [];
}
/**
 * Nétoie les tableaux des unités
 */
function clears() {
    for (t of ElemByTeam) {
        t[1] = [];
    }
}
/**
 * Déplace un élément d'un tableau à l'autre        
 * @param {Site}    element l'élément à déplacer
 * @param {integer} newTeam team d'arrivée
 */
function switchTeamSites(element, newTeam) {
    if (element.owner == undefined) {
        ElemByTeam[newTeam + 1][0].push(element);
        return;
    }
    let teamFrom = element.owner;
    if (teamFrom != newTeam) {
        ElemByTeam[newTeam + 1][0].push(element);
        ElemByTeam[teamFrom + 1][0].splice((ElemByTeam[teamFrom + 1][0].indexOf(element)), 1);
    }
}
/**
 * Récupère la 'Queen' d'une équipe
 * @param   {[[Object]]} team équipe de la reine
 * @returns {object}     la reine en tant qu'objet
 */
function getQueen(team) {
    var result = team[1].filter(function (x) {
        return x.unitType === QUEEN;
    });
    return result[0];
}


function countBarack(team, type) {

    return team[0].filter(x => x.param2 === type).length;

}

function countBuild(team, type) {

    return team[0].filter(x => x.structureType === type).length;

}

function moveElem(elem, fromArray, toArray) {
    if (fromArray.indexOf(elem) === -1 && fromArray !== toArray) {
        fromArray.splice(fromArray.indexOf(elem), 1);
    }
    toArray.push(elem);
}


/**************************\
|*Modifier infos parcelles*|----------------------------
\**************************/


/*************\
|*LES ACTIONS*|---------------------------------------------
\*************/

//CLOSE = 250
const CLOSE = 250;
//CLOSE = 500
const NEAR = 500;
//MIDDLE = 750
const MIDDLE = 750;
//FAR = 1000
const FAR = 1000;
var turn = 1,
    phase = 0,
    // sites déjà minés
    MinedSite,
    repeat = false,
    //liste des objectifs en cours
    objectifs,
    origineCamp;

var fear = function (dist, barem) {
    parcs = parcelInfos.filter(p => myQueen.distance(p) < dist);
    if (parcs.length > 0) {
        let count = 0;
        parcs.map(val => count += parseInt(val.uniteValue * 100) / 100);
        return count < barem;
    }
    return false
}
var attract = function (dist, barem) {
    parcs = parcelInfos.filter(p => myQueen.distance(p) > dist);
    if (parcs.length > 0) {
        let count = 0;
        parcs.map(val => count += parseInt(val.uniteValue * 100) / 100);
        return count < barem;
    }
    return false
}
/*************************\
|*Les actions de la reine*|-----------------------------
\*************************/

function ActionQueen() {
    var action = 'WAIT';
    var nbKnightBuild = countBarack(myTeam, KNIGHT);
    var nbMine = countBuild(myTeam, MINE);
    var nbTower = countBuild(myTeam, TOWER);
    /*********\
    |*NORMALE*|
    \*********/
    var objectif = '';
    var construct = '';
    var continueAct = 0;
    !origineCamp ? origineCamp = getNearest(myQueen, sitesToCap)[0] : '';

    //TODO faire les mouvement cyclique de la reine
    printErr("\nnbKnightBuild : " + nbKnightBuild + "\nnbMine : " + nbMine + "\nnbTower : " + nbTower);
    printTab(getNearest(myQueen, sitesToCap));


    switch (phase) {
        case 0:
            objectif = getNearest(myQueen, sitesToCap)[0];
            origineCamp = objectif;
            construct = nbKnightBuild > 1 ? 'BARRACKS-ARCHER' : 'BARRACKS-KNIGHT';
            myBuilds.filter(x => x.structureType === BARRACKS).length >= 1 * turn ? phase = 1 : '';
            break;
        case 1:
            if (nbMine >= 2 * turn) {
                phase = 2;
            };
            objectif = getNearest(origineCamp, sitesToCap.concat(myBuilds.filter(x => x.param1 < x.maxMineSize && x.structureType == MINE)))[0];
            construct = 'MINE';
            break;
        case 2:
            if (nbTower >= 3 + turn) {
                phase = 3;
            };
            objectif = getNearest(myQueen, sitesToCap.concat(myBuilds.filter(x => x.param1 < 400 && x.structureType == TOWER)))[0];
            construct = 'TOWER';
            break;
        case 3:
            if (nbTower < 5) {
                turn++;
                phase = 0;
            }
            objectif = getNearest(origineCamp, sitesToCap.filter(x => x.owner != ENNEMI))[0];
            construct = 'BARRACKS-GIANT';

    }

    var statue = getNearest(myQueen, ennemiesUnites.filter(x => x.unitType === KNIGHT && myQueen.distance(x) <= NEAR), 3);
    printErr('count=> ' + statue.length);
    var sPoints = getNearest(myQueen, myBuilds.filter(x => x.structureType == TOWER && x.param1 <= 100), 3);
    if (statue.length >= 3 || myQueen.distance(ennemieQueen) <= CLOSE) {
        if (myQueen.distance(getNearest(myQueen, sitesToCap)[0]) <= getNearest(myQueen, sitesToCap)[0].radius) {
            objectif = getNearest(myQueen, sitesToCap)[0];
            construct = 'TOWER';
            printErr("m,'enfin");
        } else if (sPoints.length > 0) {
            var goTo = getNearest(origineCamp, sPoints)[0]
            action = 'BUILD ' + goTo.siteID + " TOWER";
            printErr("m,'enf1");
            return action;
        } else if (getNearest(myQueen, sitesToCap.filter(x => myQueen.distance(x) <= getNearest(myQueen, sitesToCap)[0].radius + 31 && x.owner === NEUTRAL)).length) {
            var goTo = getNearest(myQueen, sitesToCap.filter(x => myQueen.distance(x) <= getNearest(myQueen, sitesToCap)[0].radius + 31 && x.owner === NEUTRAL))[0];
            action = 'BUILD ' + goTo.siteID + " TOWER";
            printErr("m,'enf2");
            return action;
        } else {
            let go = vectorAngle(myQueen, statue[0], (90 + (180 * (Math.random()))), 80);
            return 'MOVE ' + parseInt(((go[0] + myQueen.px) + origineCamp.px) / 2) + ' ' + parseInt(((go[1] + myQueen.py) + origineCamp.py) / 2);
        }

    }
    /*********\
    |*réponse*|
    \*********/
    action = 'BUILD ' + objectif.siteID + ' ' + construct;

    return action;
}

/********************************\
|*les actions pour les batiments*|----------------------------
\********************************/


function actionBuild() {
    var nbKnightBuild = countBarack(myTeam, KNIGHT);
    var nbMine = countBuild(myTeam, MINE);
    var nbTower = countBuild(myTeam, TOWER);
    var action = 'TRAIN';
    /*********\
    |*NORMALE*|
    \*********/
    if (compte[0].gold > 80 + compte[0].reserve && nbKnightBuild > 0) {
        let target = getNearest(ennemieQueen, myBuilds.filter(x => x.structureType === BARRACKS && x.param2 == KNIGHT))[0].siteID
        action += ' ' + target;
        compte[0].reserve += 20;
        return action;
    }

    if (compte[0].gold > 100 && myBuilds.filter(x => x.param2 === ARCHER) > 0) {
        let target = getNearest(ennemieQueen, myBuilds.filter(x => x.structureType === BARRACKS && x.param2 == ARCHER))[0].siteID
        action += ' ' + target;
        return action;
    }
    if (compte[0].gold > 80 * nbKnightBuild && nbKnightBuild > 1) {
        compte[0].reserve = 0;
        let targets = getNearest(ennemieQueen, myBuilds.filter(x => x.structureType === BARRACKS), nbKnightBuild);
        for (tar of targets) {

            action += ' ' + tar.siteID;
        }
        return action;
    }
    if (compte[0].gold >= 140 && myBuilds.filter(x => x.param2 === GIANT)) {
        compte[0].reserve = 10;
        let targets = getNearest(ennemieQueen, myBuilds.filter(x => x.structureType === BARRACKS && x.param2 === GIANT));
        for (tar of targets) {

            action += ' ' + tar.siteID;
        }
        return action;
    }


    return action;
}

// game loop
while (true) {

    elemEffect = [];
    parcelInfos = [];
    var inputs = readline().split(' ');
    compte[0].gold = parseInt(inputs[0]);
    compte[0].touchedSite = parseInt(inputs[1]);
    for (var i = 0; i < numSites; i++) {
        var inputs = readline().split(' ');
        sites[i].siteID = parseInt(inputs[0]);
        sites[i].gold = parseInt(inputs[1]);
        sites[i].maxMineSize = parseInt(inputs[2]);
        sites[i].structureType = parseInt(inputs[3]);
        sites[i].param1 = parseInt(inputs[5]);
        sites[i].param2 = parseInt(inputs[6]);
        switchTeamSites(sites[i], parseInt(inputs[4]));
        sites[i].owner = parseInt(inputs[4]);
    }
    clears();
    var numUnits = parseInt(readline());
    for (var i = 0; i < numUnits; i++) {
        units[i] = new Unites;
        var inputs = readline().split(' ');
        units[i].px = parseInt(inputs[0]);
        units[i].py = parseInt(inputs[1]);
        units[i].owner = parseInt(inputs[2]);
        units[i].unitType = parseInt(inputs[3]);
        units[i].health = parseInt(inputs[4]);
        ElemByTeam[units[i].owner + 1][1].push(units[i]);
    }


    /***********\
    |*affichage*|
    \***********/

    var myQueen = getQueen(ElemByTeam[1]),
        ennemieQueen = getQueen(ElemByTeam[2]),
        ennemiesBuilds = ElemByTeam[2][0],
        ennemiesUnites = ElemByTeam[2][1],
        ennemiesTeam = ElemByTeam[2][1],
        sitesToCap = ElemByTeam[0][0].concat(ElemByTeam[2][0].filter(x => x.structureType !== TOWER)),
        myBuilds = ElemByTeam[1][0],
        myUnits = ElemByTeam[1][1],
        myTeam = ElemByTeam[1];

    print(ActionQueen());
    print(actionBuild());
}
