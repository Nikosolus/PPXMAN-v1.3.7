import Board        from "./board/Board.js";
import Canvas       from "./board/Canvas.js";



/**
 * Pacman Blob
 */
export default class Blob {

    /**
     * Pacman Blob constructor
     * @param {Board} board
     */
    constructor(board) {
        this.board = board;
        this.level = board.level;
        this.init(board.gameCanvas);
    }

    /**
     * Initializes the Blob
     * @param {Canvas} canvas
     * @returns {Void}
     */
    init(canvas) {
        this.canvas     = canvas;
        this.ctx        = canvas.ctx;

        this.tile       = this.board.startingPos;
        this.tileCenter = this.board.getTileXYCenter(this.tile);
        this.x          = this.tileCenter.x;
        this.y          = this.tileCenter.y;
        this.dir        = this.board.startingDir;
        this.speed      = this.level.getNumber("pmSpeed");
        this.center     = true;
        this.turn       = null;
        this.delta      = null;
        this.mouth      = 5;
        this.radius     = this.board.blobRadius;
        this.sound      = 1;

    }



    /**
     * Animates the Blob
     * @param {Number} speed
     * @returns {Boolean}
     */
    animate(speed) {
        let newTile = false;
        if (this.center && this.crashed()) {
            this.mouth = 5;
        } else if (this.delta) {
            newTile = this.cornering(speed);
        } else {
            newTile = this.move(speed);
        }
        this.draw();
        return newTile;
    }

    /**
     * Moves the Blob
     * @param {Number} speed
     * @returns {Boolean}
     */
    move(speed) {
        this.x += this.dir.x * this.speed * speed;
        this.y += this.dir.y * this.speed * speed;

        this.moveMouth();
        this.newTile();
        const newTile = this.atCenter();

        this.x = this.board.tunnelEnds(this.x);
        return newTile;
    }

    /**
     * Changes the state of the Blob's mouth
     * @returns {Void}
     */
    moveMouth() {
        this.mouth = (this.mouth + 1) % 20;
    }

    /**
     * The Blob might have entered a new Tile, and several things might need to be done
     * @returns {Void}
     */
    newTile() {
        const tile = this.board.getTilePos(this.x, this.y);
        if (!this.board.equalTiles(this.tile, tile)) {
            this.tile       = tile;
            this.tileCenter = this.board.getTileXYCenter(tile);
            this.center     = false;

            if (this.turn && this.inBoard(this.turn) && !this.isWall(this.turn)) {
                this.delta = {
                    x : this.dir.x || this.turn.x,
                    y : this.dir.y || this.turn.y,
                };
            }
        }
    }

    /**
     * Does the turning or wall crash when the Blob is at, or just passed, the center of a tile
     * @returns {Boolean}
     */
    atCenter() {
        if (!this.center && this.passedCenter()) {
            let turn = false;
            if (this.turn && this.inBoard(this.turn) && !this.isWall(this.turn)) {
                this.dir  = this.turn;
                this.turn = null;
                turn      = true;
            }
            if (turn || this.crashed()) {
                this.x = this.tileCenter.x;
                this.y = this.tileCenter.y;
            }
            this.center = true;

            return true;
        }
        return false;
    }



    /**
     * Does a faster turn by turnning a bit before the corner.
     * Only when a turn is asked before reaching an intersection
     * @param {Number} speed
     * @returns {Boolean}
     */
    cornering(speed) {
        this.x += this.delta.x * this.speed * speed;
        this.y += this.delta.y * this.speed * speed;

        if (this.passedCenter()) {
            if (this.dir.x) {
                this.x = this.tileCenter.x;
            }
            if (this.dir.y) {
                this.y = this.tileCenter.y;
            }
            this.dir   = this.turn;
            this.turn  = null;
            this.delta = null;

            return true;
        }
        return false;
    }

    /**
     * Eats food (dots, energizers, fruits)
     * @param {Boolean} atPill
     * @param {Boolean} frightenGhosts
     * @returns {Void}
     */
    onEat(atPill, frightenGhosts) {
        if (!atPill) {
            this.sound = 1;
        }
        let key;
        if (frightenGhosts) {
            key = atPill ? "eatingFrightSpeed" : "pmFrightSpeed";
        } else {
            key = atPill ? "eatingSpeed" : "pmSpeed";
        }
        this.speed = this.level.getNumber(key);
    }

    /**
     * Returns the apropiate sound effect
     * @returns {String}
     */
    getSound() {
        this.sound = (this.sound + 1) % 2;
        return this.sound ? "eat2" : "eat1";
    }

    /**
     * New direction (given by the user)
     * @param {{x: Number, y: Number}} turn
     * @returns {Void}
     */
    makeTurn(turn) {
        if (this.delta) {
            return;
        }
        if (this.turnNow(turn)) {
            this.dir    = turn;
            this.turn   = null;
            this.center = false;
        } else {
            this.turn = turn;
        }
    }



    /**
     * Draws a Blob with the given data
     * @returns {Void};
     */
    draw() {
        const center = this.board.ghostSize / 2;

        this.savePos();
        this.ctx.save();
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(Math.round(this.x) - center, Math.round(this.y) - center, 25, 26);
        this.ctx.fillStyle = "rgb(255, 213, 0)";
        this.ctx.translate(Math.round(this.x) - center, Math.round(this.y) - center);
        this.ctx.scale(0.5, 0.5);
        this.ctx.beginPath();
        this.ctx.moveTo(16, 30);
        this.ctx.bezierCurveTo(16, 31.31046, 15.2106, 32.49188, 13.9999, 32.99337);
        this.ctx.bezierCurveTo(12.78919, 33.49486, 11.39561, 33.21766, 10.46898, 32.29103);
        this.ctx.bezierCurveTo(9.54234, 31.3644, 9.26514, 29.97081, 9.76663, 28.76011);
        this.ctx.bezierCurveTo(10.26812, 27.5494, 11.44954, 26.76, 12.76, 26.76);
        this.ctx.bezierCurveTo(14.54712, 26.76549, 15.99451, 28.21288, 16, 30);
        this.ctx.closePath();
        this.ctx.moveTo(17.75, 30);
        this.ctx.bezierCurveTo(17.75, 27.97769, 16.53179, 26.15451, 14.66342, 25.3806);
        this.ctx.bezierCurveTo(12.79504, 24.6067, 10.64446, 25.03448, 9.21447, 26.46447);
        this.ctx.bezierCurveTo(7.78448, 27.89446, 7.3567, 30.04505, 8.1306, 31.91342);
        this.ctx.bezierCurveTo(8.90451, 33.78179, 10.72769, 35, 12.75, 35);
        this.ctx.bezierCurveTo(15.51142, 35, 17.75, 32.76143, 17.75, 30);
        this.ctx.closePath();
        this.ctx.moveTo(40.5, 30);
        this.ctx.bezierCurveTo(40.50405, 31.31541, 39.71478, 32.50354, 38.50066, 33.00973);
        this.ctx.bezierCurveTo(37.28655, 33.51592, 35.88703, 33.24034, 34.95546, 32.31164);
        this.ctx.bezierCurveTo(34.0239, 31.38293, 33.744, 29.98427, 34.24645, 28.7686);
        this.ctx.bezierCurveTo(34.74889, 27.55293, 35.93459, 26.76001, 37.25, 26.76);
        this.ctx.bezierCurveTo(39.03876, 26.76545, 40.48904, 28.21126, 40.5, 30);
        this.ctx.closePath();
        this.ctx.moveTo(42.25, 30);
        this.ctx.bezierCurveTo(42.25, 27.97769, 41.03179, 26.15451, 39.16342, 25.3806);
        this.ctx.bezierCurveTo(37.29504, 24.6067, 35.14445, 25.03448, 33.71447, 26.46447);
        this.ctx.bezierCurveTo(32.28448, 27.89446, 31.8567, 30.04505, 32.6306, 31.91342);
        this.ctx.bezierCurveTo(33.40451, 33.78179, 35.22769, 35, 37.25, 35);
        this.ctx.bezierCurveTo(40.01143, 35, 42.25, 32.76143, 42.25, 30);
        this.ctx.closePath();
        this.ctx.moveTo(45.15, 49.7);
        this.ctx.lineTo(44.92, 49.78);
        this.ctx.bezierCurveTo(43.65436, 50.25605, 42.24369, 50.15372, 41.06, 49.5);
        this.ctx.lineTo(41.06, 49.5);
        this.ctx.lineTo(40, 49);
        this.ctx.bezierCurveTo(39.24142, 48.5644, 38.30858, 48.5644, 37.55, 49);
        this.ctx.lineTo(37.55, 49);
        this.ctx.lineTo(36.11, 49.89);
        this.ctx.bezierCurveTo(34.98676, 50.58985, 33.56324, 50.58985, 32.44, 49.89);
        this.ctx.lineTo(32.44, 49.89);
        this.ctx.lineTo(31, 49);
        this.ctx.bezierCurveTo(30.14372, 48.48296, 29.05912, 48.53837, 28.26, 49.14);
        this.ctx.lineTo(28.26, 49.14);
        this.ctx.lineTo(27.32, 49.86);
        this.ctx.bezierCurveTo(26.70762, 50.33324, 25.9539, 50.58682, 25.18, 50.58);
        this.ctx.bezierCurveTo(24.40744, 50.57856, 23.65631, 50.32585, 23.04, 49.86);
        this.ctx.lineTo(23.04, 49.86);
        this.ctx.lineTo(22.11, 49.14);
        this.ctx.bezierCurveTo(21.31736, 48.55165, 20.24905, 48.49646, 19.4, 49);
        this.ctx.lineTo(19.4, 49);
        this.ctx.lineTo(18, 49.88);
        this.ctx.bezierCurveTo(16.87299, 50.57927, 15.44701, 50.57927, 14.32, 49.88);
        this.ctx.lineTo(14.32, 49.88);
        this.ctx.lineTo(12.84, 49);
        this.ctx.bezierCurveTo(12.11059, 48.5503, 11.19774, 48.51988, 10.44, 48.92);
        this.ctx.lineTo(10.44, 48.92);
        this.ctx.lineTo(9.44, 49.48);
        this.ctx.bezierCurveTo(8.10896, 50.18354, 6.54088, 50.28541, 5.13, 49.76);
        this.ctx.lineTo(5.13, 49.76);
        this.ctx.lineTo(4.9, 49.67);
        this.ctx.lineTo(4.9, 4.85);
        this.ctx.lineTo(45.2, 4.85);
        this.ctx.lineTo(45.2, 49.71);
        this.ctx.closePath();
        this.ctx.moveTo(50, 51.07);
        this.ctx.lineTo(50, 2.42);
        this.ctx.bezierCurveTo(49.99452, 1.08575, 48.91425, 0.00548, 47.58, 0);
        this.ctx.lineTo(47.58, 0);
        this.ctx.lineTo(2.42, 0);
        this.ctx.bezierCurveTo(1.08575, 0.00548, 0.00548, 1.08575, 0, 2.42);
        this.ctx.lineTo(0, 2.42);
        this.ctx.lineTo(0, 51.06);
        this.ctx.bezierCurveTo(-0.01141, 51.84954, 0.36152, 52.59541, 1, 53.06);
        this.ctx.bezierCurveTo(4.00598, 55.23106, 7.95993, 55.58039, 11.3, 53.97);
        this.ctx.lineTo(11.3, 53.97);
        this.ctx.lineTo(11.47, 53.88);
        this.ctx.lineTo(11.73, 54.05);
        this.ctx.bezierCurveTo(14.36333, 55.66711, 17.67344, 55.70171, 20.34, 54.14);
        this.ctx.lineTo(20.34, 54.14);
        this.ctx.lineTo(20.52, 54.03);
        this.ctx.lineTo(20.7, 54.14);
        this.ctx.bezierCurveTo(23.45321, 55.86092, 26.9468, 55.86092, 29.7, 54.14);
        this.ctx.lineTo(29.7, 54.14);
        this.ctx.lineTo(29.88, 54.03);
        this.ctx.lineTo(30.06, 54.14);
        this.ctx.bezierCurveTo(32.72287, 55.70216, 36.0304, 55.66755, 38.66, 54.05);
        this.ctx.lineTo(38.66, 54.05);
        this.ctx.lineTo(38.90001, 53.9);
        this.ctx.lineTo(39.07, 53.99);
        this.ctx.bezierCurveTo(42.30532, 55.58505, 46.16679, 55.19697, 49.02, 52.99);
        this.ctx.bezierCurveTo(49.63454, 52.54099, 50.00436, 51.83093, 50.02, 51.07);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }


    /**
     * Saves the Blob's position to delete clear it before the next animation
     * @returns {Void}
     */
    savePos() {
        this.canvas.savePos(this.x, this.y);
    }

    /**
     * Draws the next step in the Blob's death animation
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number}                   count
     * @returns {Void}
     */
    drawDeath(ctx, count) {
        const delta = count / 50;

        ctx.fillStyle = "rgb(255, 255, 51)";
        ctx.clearRect(this.x, this.y, 14, 14);
    }

    /**
     * Draws a circle as the next step in the Blob Death animation
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number}                   count
     * @returns {Void}
     */
    drawCircle(ctx, count) {
        const radius = Math.round(count / 2);

        ctx.strokeStyle = "rgb(159, 159, 31)";
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI, true);
        ctx.stroke();
    }



    /**
     * Returns true if the Blob crashed with a wall
     * @returns {Boolean}
     */
    crashed() {
        return this.inBoard(this.dir) && this.isWall(this.dir);
    }

    /**
     * Returns true if the Blob has passed the center of the currrent tile
     * @returns {Boolean}
     */
    passedCenter() {
        return (
            (this.dir.x ===  1 && this.x >= this.tileCenter.x) ||
            (this.dir.x === -1 && this.x <= this.tileCenter.x) ||
            (this.dir.y ===  1 && this.y >= this.tileCenter.y) ||
            (this.dir.y === -1 && this.y <= this.tileCenter.y)
        );
    }

    /**
     * Returns true if the Blob has to turn now
     * @param {{x: Number, y: Number}} turn
     * @returns {Boolean}
     */
    turnNow(turn) {
        return (
            (!this.dir.x && !turn.x) || (!this.dir.y && !turn.y) ||  // Half Turn
            (this.center && this.crashed() && this.inBoard(turn) && !this.isWall(turn))    // Crash Turn
        );
    }

    /**
     * Returns true if the next tile is a wall
     * @param {{x: Number, y: Number}} turn
     * @returns {Boolean}
     */
    isWall(turn) {
        const tile = this.board.sumTiles(this.tile, turn);
        return this.board.isWall(tile.x, tile.y);
    }

    /**
     * Returns true if the next tile is a wall
     * @param {{x: Number, y: Number}} turn
     * @returns {Boolean}
     */
    inBoard(turn) {
        const tile = this.board.sumTiles(this.tile, turn);
        return this.board.inBoard(tile.x, tile.y);
    }

    /**
     * Returns the angle of the Blob using its direction
     * @returns {Number}
     */
    getAngle() {
        let angle;
        if (this.dir.x === -1) {
            angle = 0;
        } else if (this.dir.x ===  1) {
            angle = Math.PI;
        } else if (this.dir.y === -1) {
            angle = 0.5 * Math.PI;
        } else if (this.dir.y ===  1) {
            angle = 1.5 * Math.PI;
        }
        return angle;
    }
}
