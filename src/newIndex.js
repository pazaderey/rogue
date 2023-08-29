const ROWS = 24;
const COLUMNS = 40;

const ENEMY_DAMAGE = -30;
const ENEMY_ATTACK_RATE = 800;
const DEFAULT_PLAYER_DAMAGE = -20;
const INCREASED_PLAYER_DAMAGE = -40;
const INCREASED_DAMAGE_DURATION = 5000;

const DEFAULT_HEALTH = 100;
const HEAL = +40;


class GameEntity {
    #damage;
    #div;

    /**
     * @param {string} type
     * @param {number} damage 
     * @param {[number, number]} coords
     */
    constructor(type, damage, coords) {
        this.#damage = damage;
        this.#div = GameEntity.createDiv(type, ...coords);
        this.#drawHealthBar();
    }

    get damage() {
        return this.#damage;
    }

    set damage(newDamage) {
        this.#damage = newDamage;
    }

    get health() {
        return parseInt(this.#div.children[0].style.width);
    }

    get coords() {
        const x = parseInt(this.#div.style.left) / 25;
        const y = parseInt(this.#div.style.top) / 25;
        return [x, y];
    }

    /**
     * CHange entity health
     * @param {number} dHealth Health difference
     * @returns New health
     */
    changeHealth(dHealth) {
        let newHealth = this.#health + dHealth;
        if (newHealth > 100) {
            newHealth = 100;
        } else if (newHealth < 0) {
            newHealth = 0;
        }
        this.#div.children[0].style.width = `${newHealth}%`;
        return newHealth;
    }

    /**
     * Moves entity to [x + dx, y + dy] coords
     * @param {number} dx X increase
     * @param {number} dy Y increase
     * @returns {[number, number]} New coords
     */
    move(dx, dy) {
        const [oldX, oldY] = this.coords;
        let newX = ((oldX + dx) % COLUMNS);
        let newY = ((oldY + dy) % ROWS);
        newX = newX < 0 ? COLUMNS - 1 : newX;
        newY = newY < 0 ? ROWS - 1 : newY;
        if (gameMap[newY][newX] === 'w') {
            return [oldX, oldY];
        }
        this.#div.style.top = `${newY * 25}px`;
        this.#div.style.left = `${newX * 25}px`;
        return [newX, newY];
    }

    /**
     * Creates <div> element
     * @param {string} elementType Class name for the element
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @returns {HTMLDivElement} Resulting element
     */
    static createDiv(elementType, x, y) {
        const element = document.createElement('div');
        element.className = `tile ${elementType}`;
        element.style.top = `${y * 25}px`;
        element.style.left = `${x * 25}px`;
        return element;
    }

    #drawHealthBar() {
        const healthBar = document.createElement('div');
        healthBar.className = 'health';
        healthBar.style.width = `${DEFAULT_HEALTH}%`;
        this.#div.appendChild(healthBar);
    }
    
}

class Enemy extends GameEntity {

}

class Player extends GameEntity {

}