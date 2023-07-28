const ROWS = 24;
const COLUMNS = 40;
const TILE_TYPES = {
    'f': '',
    'w': 'tileW',
    'sw': 'tileSW',
    'hp': 'tileHP',
};
const ENEMY_DAMAGE = -20;

const field = document.querySelector(".field");
let playerHealth = 100;
let playerDamage = -20;

/**
 * @param {number} first 
 * @param {number} second 
 * @returns {boolean}
 */
function areNear(first, second) {
    return Math.abs(first - second) < 2;
}

/**
 * @param {[number, number]} firstCoords 
 * @param {[number, number]} secondCoords 
 * @returns {boolean}
 */
function coordsNear(firstCoords, secondCoords) {
    return areNear(firstCoords[0], secondCoords[0]) && areNear(firstCoords[1], secondCoords[1]);
}

/**
 * @param {number} start 
 * @param {number} end 
 * @returns {number}
 */
function randInt(start, end) {
    return Math.round(Math.random() * (end - start) + start);
}

/**
 * @param {HTMLDivElement} entity 
 * @returns {[number, number]}
 */
function getCoords(entity) {
    const x = parseInt(entity.style.left) / 25;
    const y = parseInt(entity.style.top) / 25;
    return [x, y];
}

/**
 * @param {HTMLDivElement} entity 
 * @returns {number}
 */
function getHealth(entity) {
    return parseInt(entity.children[0].style.width);
}

/**
 * @param {HTMLDivElement} entity 
 */
function setHealth(entity, dh) {
    const oldHealth = getHealth(entity);
    entity.children[0].style.width = `${oldHealth + dh}%`;
}

/**
 * @param {string[][]} gameMap 
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
 * @param {string[][]} gameMap 
 * @param {"x" | "y"} direction 
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

const drawSwords = (gameMap) => drawEntities(gameMap, 2, 'sw');
const drawHP = (gameMap) => drawEntities(gameMap, 10, 'hp');

/**
 * @param {string[][]} gameMap 
 * @param {number} entityCount 
 * @param {'sw' | 'hp'} entityType 
 */
function drawEntities(gameMap, entityCount, entityType) {
    for (let entityNumber = 0; entityNumber < entityCount; entityNumber++) {
        const [entityX, entityY] = [randInt(0, COLUMNS - 1), randInt(0, ROWS - 1)];
        if (gameMap[entityY][entityX] !== 'f') {
            entityNumber--;
            continue;
        }
        gameMap[entityY][entityX] = entityType;
    }
}

function drawHealthBar(owner) {
    const healthBar = document.createElement("div");
    healthBar.className = 'health';
    healthBar.style.width = '100%';
    owner.appendChild(healthBar);
}

/**
 * @param {string[][]} gameMap
 * @returns {HTMLDivElement}
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
    
    return player;
}

/**
 * @returns {string[][]}
 */
function drawGameMap() {

    const gameMap = new Array(ROWS);
    for (let i = 0; i < gameMap.length; i++) {
        gameMap[i] = new Array(COLUMNS).fill("w");
    }    

    drawRooms(gameMap);

    drawCorridors(gameMap, "x");
    drawCorridors(gameMap, "y");

    drawSwords(gameMap);
    drawHP(gameMap);

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
 * @param {HTMLDivElement} entity 
 * @param {number} dx 
 * @param {number} dy
 */
function moveEntity(entity, dx, dy) {
    const oldX = parseInt(entity.style.left) / 25;
    const oldY = parseInt(entity.style.top) / 25;
    let newX = ((oldX + dx) % COLUMNS);
    let newY = ((oldY + dy) % ROWS);
    newX = newX < 0 ? COLUMNS - 1 : newX;
    newY = newY < 0 ? ROWS - 1 : newY;
    if (gameMap[newY][newX] === 'w') {
        return;
    }
    entity.style.top = `${newY * 25}px`;
    entity.style.left = `${newX * 25}px`;
}

/**
 * @param {string[][]} gameMap 
 * @returns {HTMLDivElement[]}
 */
function drawEnemies(gameMap) {
    const enemies = [];
    for (let enemyNumber = 0; enemyNumber < 10; enemyNumber++) {
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


        const moveEnemy = moveEntity.bind(null, enemy);
        enemies.push(enemy);

        setInterval(() => {
            const newX = randInt(-1, 1);
            newX ? moveEnemy(newX, 0) : moveEnemy(0, randInt(-1, 1));
        }, 500);
    }
    return enemies;
}

const gameMap = drawGameMap();
const enemies = drawEnemies(gameMap);
const player = drawPlayer(gameMap);
const movePlayer = moveEntity.bind(null, player);

/**
 * @param {HTMLDivElement} player
 * @param {HTMLDivElement[]} enemies 
 */
function playerAttack(player, enemies) {
    const playerCoords = getCoords(player);

    const enemiesNearby = enemies.filter((enemy) => {
        const enemyCoords = getCoords(enemy);
        return coordsNear(playerCoords, enemyCoords);
    });
    enemiesNearby.forEach((enemy) => {
        setHealth(enemy, playerDamage);
        if (getHealth(enemy) === 0) {
            enemy.remove();
        }
    });
}

function enemyAttack()

const KEY_CODES = {
    'KeyW': () => movePlayer(0, -1),
    'KeyA': () => movePlayer(-1, 0),
    'KeyS': () => movePlayer(0, 1),
    'KeyD': () => movePlayer(1, 0),
}

document.addEventListener("keydown", (event) => {
    if (event.code === 'Space') {
        playerAttack(player, enemies);
        return;
    }
    if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        return;
    }
    const handler = KEY_CODES[event.code];
    handler();
});
