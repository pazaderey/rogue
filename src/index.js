const ROWS = 24;
const COLUMNS = 40;
const TILE_TYPES = {
    'f': '',
    'w': 'tileW',
    'sw': 'tileSW',
    'hp': 'tileHP',
};
const ENEMY_DAMAGE = -20;
const DEFAULT_PLAYER_DAMAGE = -20;
const INCREASED_PLAYER_DAMAGE = -40;
const HEAL = +40;

const field = document.querySelector(".field");
const damageDisplay = document.querySelector('.player-damage');
const healthDisplay = document.querySelector('.player-health');
const enemiesDisplay = document.querySelector('.enemies-left');

let playerHealth = 100;
let playerDamage = DEFAULT_PLAYER_DAMAGE;
let enemyCount = 10;

/**
 * Returns either 2 numbers are near in the given area.
 * For example: 1 and 2 are near in the area 2 but not near in the area 0.
 * @param {number} first First number
 * @param {number} second Second number
 * @param {number} area Area
 * @returns {boolean} Are number near
 */
function areNear(first, second, area) {
    return Math.abs(first - second) <= area;
}

/**
 * Returns either [x1, y1] is near the [x2, y2] in the given area.
 * For example: [5, 6] is near the [7, 7] in the area 3 but not near in the area 1.
 * @param {[number, number]} firstCoords First pair of coords
 * @param {[number, number]} secondCoords Second pair of coords
 * @param {number} area Area
 * @returns {boolean} Are coords near
 */
function coordsNear(firstCoords, secondCoords, area) {
    return areNear(firstCoords[0], secondCoords[0], area) && areNear(firstCoords[1], secondCoords[1], area);
}

/**
 * Gives pseudo random integer in range [start, end]
 * @param {number} start Bottom edge
 * @param {number} end Top edge
 * @returns {number} result
 */
function randInt(start, end) {
    return Math.round(Math.random() * (end - start) + start);
}

/**
 * Sets player damage to newDamage
 * @param {number} newDamage Damage to set 
 */
function setPlayerDamage(newDamage) {
    playerDamage = newDamage;
    damageDisplay.innerHTML = damageDisplay.innerHTML.split(' ')[0] + ` ${Math.abs(newDamage)}`;
}

/**
 * Returns coords of entity
 * @param {HTMLDivElement} entity Target entity
 * @returns {[number, number]} Pair of coords
 */
function getCoords(entity) {
    const x = parseInt(entity.style.left) / 25;
    const y = parseInt(entity.style.top) / 25;
    return [x, y];
}

/**
 * Returns health of the entity
 * @param {HTMLDivElement} entity Target entity
 * @returns {number} Entity's health 
 */
function getHealth(entity) {
    return parseInt(entity.children[0].style.width);
}

/**
 * Adds health to entity
 * @param {HTMLDivElement} entity Target Entity
 * @param {number} dh Health difference
 * @returns New health
 */
function addHealth(entity, dh) {
    const oldHealth = getHealth(entity);
    let newHealth = oldHealth + dh;
    if (newHealth > 100) {
        newHealth = 100;
    } else if (newHealth < 0) {
        newHealth = 0;
    }
    entity.children[0].style.width = `${newHealth}%`;
    return newHealth;
}

/**
 * Draws 5-10 rooms, 3-8 tiles sized in every direction
 * @param {string[][]} gameMap Game Map
 */
function drawRooms(gameMap) {
    for (let roomNumber = 0; roomNumber < randInt(5, 10); roomNumber++) {
        const [roomWidth, roomHeight] = [randInt(3, 8), randInt(3, 8)];
        const [roomX, roomY] = [randInt(0, COLUMNS - roomWidth), randInt(0, ROWS - roomHeight)];
        for (let y = roomY; y < roomY + roomHeight; y++) {
            for (let x = roomX; x < roomX + roomWidth; x++) {
                try {
                    gameMap[y][x] = 'f';
                } catch (e) {
                    continue;
                }
            }
        }
    }
}

/**
 * Draws 3-5 corridors in the give direction 
 * @param {string[][]} gameMap Game map
 * @param {"x" | "y"} direction Parallel direction of the corridors
 */
function drawCorridors(gameMap, direction) {
    for (let corridorNumber = 0; corridorNumber < randInt(3, 5); corridorNumber++) {
        if (direction === "x") {
            const corridorCoord = randInt(0, ROWS - 1);
            gameMap[corridorCoord] = new Array(COLUMNS).fill('f');
        } else {
            const corridorCoord = randInt(0, COLUMNS - 1);
            for (let i = 0; i < ROWS; i++) {
                gameMap[i][corridorCoord] = 'f';
            }
        }
    }
}
/**
 * Draws 2 swords in random places on the game map
 * @param {string[][]} gameMap Game map 
 * @returns {HTMLDivElement[]} Array of drawn swords
 */
const drawSwords = (gameMap) => drawUtilities(gameMap, 2, TILE_TYPES.sw);

/**
 * Draws 10 heals in random places on the game map
 * @param {string[][]} gameMap Game map
 * @returns {HTMLDivElement[]} Array of heals
 */
const drawHP = (gameMap) => drawUtilities(gameMap, 10, TILE_TYPES.hp);

/**
 * Draws utilCount utility items in random places on the game map
 * @param {string[][]} gameMap Game map
 * @param {number} entityCount Amount of entities
 * @param {'sw' | 'hp'} entityType Sword or heal to draw
 * @returns {HTMLDivElement[]} Array of draw utilities
 */
function drawUtilities(gameMap, utilCount, utilType) {
    const utils = [];
    for (let utilNumber = 0; utilNumber < utilCount; utilNumber++) {
        const [utilX, utilY] = [randInt(0, COLUMNS - 1), randInt(0, ROWS - 1)];
        if (gameMap[utilY][utilX] !== 'f') {
            utilNumber--;
            continue;
        }
        const utility = document.createElement("div");
        utility.className = `field tile ${utilType}`;
        utility.style.top = `${utilY * 25}px`;
        utility.style.left = `${utilX * 25}px`;
        field.appendChild(utility);
        utils.push(utility);
    }
    return utils;
}

/**
 * Draws health bar for the owner
 * @param {HTMLDivElement} owner Owner of the health bar
 */
function drawHealthBar(owner) {
    const healthBar = document.createElement("div");
    healthBar.className = 'health';
    healthBar.style.width = '100%';
    owner.appendChild(healthBar);
}

/**
 * Draws game map
 * @returns {string[][]} Game map
 */
function drawGameMap() {
    const gameMap = new Array(ROWS);
    for (let i = 0; i < gameMap.length; i++) {
        gameMap[i] = new Array(COLUMNS).fill("w");
    }    

    drawRooms(gameMap);
    drawCorridors(gameMap, "x");
    drawCorridors(gameMap, "y");

    for (let i = 0; i < gameMap.length; i++) {
        for (let j = 0; j < gameMap[i].length; j++) {
            const tile = document.createElement("div");
            tile.className = `field tile ${TILE_TYPES[gameMap[i][j]]}`;
            tile.style.top = `${i * 25}px`;
            tile.style.left = `${j * 25}px`;
            field.appendChild(tile);
        }
    }

    return gameMap;
}

/**
 * Moves entity to [x + dx, y + dy] coords
 * @param {HTMLDivElement} entity Entity to move
 * @param {number} dx X increase
 * @param {number} dy Y increase
 * @returns {[number, number]} New coords
 */
function moveEntity(entity, dx, dy) {
    const oldX = parseInt(entity.style.left) / 25;
    const oldY = parseInt(entity.style.top) / 25;
    let newX = ((oldX + dx) % COLUMNS);
    let newY = ((oldY + dy) % ROWS);
    newX = newX < 0 ? COLUMNS - 1 : newX;
    newY = newY < 0 ? ROWS - 1 : newY;
    if (gameMap[newY][newX] === 'w') {
        return [oldX, oldY];
    }
    entity.style.top = `${newY * 25}px`;
    entity.style.left = `${newX * 25}px`;
    return [newX, newY];
}

const gameMap = drawGameMap();
const swords = drawSwords(gameMap);
const hps = drawHP(gameMap);
const enemies = drawEnemies(gameMap);
const player = drawPlayer(gameMap);

/**
 * Increases player health by dh
 * @param {number} dh Health increase
 * @returns {number} New health
 */
const addPlayerHealth = (dh) => {
    const newHealth = addHealth(player, dh);
    healthDisplay.innerHTML = healthDisplay.innerHTML.split(' ')[0] + ` ${newHealth}`;
    return newHealth;
}

/**
 * Checks for enemies in area of 1 near the player/
 * Damages player for amount of enemies in the area.
 * @param {HTMLDivElement} player 
 */
function checkForEnemies(player) {
    const playerCoords = getCoords(player);

    const enemiesNearby = enemies.filter((enemy) => {
        const enemyCoords = getCoords(enemy);
        return coordsNear(playerCoords, enemyCoords, 1);
    });
    !addPlayerHealth(ENEMY_DAMAGE * enemiesNearby.length) && window.location.reload();
}

/**
 * Draws player on the game map
 * @param {string[][]} gameMap Game map
 * @returns {HTMLDivElement} Player element
 */
function drawPlayer(gameMap) {
    const player = document.createElement("div");
    player.className = "field tile tileP";
    let playerX = 0, playerY = 0;
    while (true) {
        [playerX, playerY] = [randInt(0, COLUMNS - 1), randInt(0, ROWS - 1)];
        if (gameMap[playerY][playerX] === 'f') {
            break;
        }
    }
    player.style.top = `${playerY * 25}px`;
    player.style.left = `${playerX * 25}px`;
    drawHealthBar(player);
    field.appendChild(player);
    setInterval(() => checkForEnemies(player), 1000);
    return player;
}

/**
 * Draws enemies on the game map. Enemies move to
 * random position in area of 1 every 500ms.
 * @param {string[][]} gameMap Game map
 * @returns {HTMLDivElement[]} Enemies array
 */
function drawEnemies(gameMap) {
    const enemies = [];
    for (let enemyNumber = 0; enemyNumber < enemyCount; enemyNumber++) {
        const [enemyX, enemyY] = [randInt(0, COLUMNS - 1), randInt(0, ROWS - 1)];
        if (gameMap[enemyY][enemyX] !== 'f') {
            enemyNumber--;
            continue;
        }
        const enemy = document.createElement("div");
        enemy.className = "field tile tileE";
        enemy.style.top = `${enemyY * 25}px`;
        enemy.style.left = `${enemyX* 25}px`;
        drawHealthBar(enemy);
        field.appendChild(enemy);
        enemies.push(enemy);

        const moveEnemy = moveEntity.bind(null, enemy);
        setInterval(() => {
            const newX = randInt(-1, 1);
            newX ? moveEnemy(newX, 0) : moveEnemy(0, randInt(-1, 1));
        }, 500);
    }
    return enemies;
}

/**
 * Moves player to [x + dx, y + dy] coords
 * @param {number} dx X increase
 * @param {number} dy Y increase
 * @returns {[number, number]} New coords
 */
function movePlayer(dx, dy) {
    const playerCoords = moveEntity(player, dx, dy);
    const pickedHp = hps.find((hp) => coordsNear(getCoords(hp), playerCoords, 0));
    if (pickedHp) {
        addPlayerHealth(HEAL)
        pickedHp.remove();
        hps.splice(hps.indexOf(pickedHp), 1);
        return;
    }
    const pickedSword = swords.find((sw) => coordsNear(getCoords(sw), playerCoords, 0));
    if (pickedSword) {
        setPlayerDamage(INCREASED_PLAYER_DAMAGE);
        pickedSword.remove();
        swords.splice(swords.indexOf(pickedSword, 1));

        setTimeout(() => setPlayerDamage(DEFAULT_PLAYER_DAMAGE), 10000);
    }
    return playerCoords;
};

/**
 * Attacks all enemies in the area of 1
 * @param {HTMLDivElement} player Player element
 * @param {HTMLDivElement[]} enemies Array of enemies
 */
function playerAttack(player, enemies) {
    const playerCoords = getCoords(player);

    const enemiesNearby = enemies.filter((enemy) => {
        const enemyCoords = getCoords(enemy);
        return coordsNear(playerCoords, enemyCoords, 1);
    });
    enemiesNearby.forEach((enemy) => {
        if (!addHealth(enemy, playerDamage)) {
            enemy.remove();
            enemies.splice(enemies.indexOf(enemy), 1);
            enemyCount--;
            enemiesDisplay.innerHTML = enemiesDisplay.innerHTML.split(' ')[0] + ` ${enemyCount}/10`;
            !enemyCount && window.location.reload();
        }
    });
}

const KEY_CODES = {
    'KeyW': () => movePlayer(0, -1),
    'KeyA': () => movePlayer(-1, 0),
    'KeyS': () => movePlayer(0, 1),
    'KeyD': () => movePlayer(1, 0),
    'Space': () => playerAttack(player, enemies),
}

document.addEventListener("keydown", (event) => {
    if (!['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(event.code)) {
        return;
    }
    const handler = KEY_CODES[event.code];
    handler();
});
