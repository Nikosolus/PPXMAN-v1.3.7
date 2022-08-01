import Board        from "../board/Board.js";
import Blob         from "../Blob.js";



/**
 * Pacman Score Blob
 * @extends {Blob}
 */
export default class ScoreBlob extends Blob {

    /**
     * Pacman Score Blob constructor
     * @param {Board}  board
     * @param {Number} number
     */
    constructor(board, number) {
        super(board);
        this.init(board.boardCanvas);

        this.tile = { x: 19.5, y: 31.8 };
        this.x    = board.getTileCenter(this.tile.x + number * 1.8);
        this.y    = board.getTileCenter(this.tile.y);
        this.dir  = board.startingDir;
    }

    /**
     * Clears the Blob
     * @returns {Void}
     */
    clear() {
        // We don't know what we are doing here.
        // But it works with 14.
        let boh = 14;

        this.ctx.clearRect(this.x, this.y, boh, boh);
        this.ctx.clearRect(this.x, this.y, -boh, boh);
        this.ctx.clearRect(this.x, this.y, boh, -boh);
        this.ctx.clearRect(this.x, this.y, -boh, -boh);
    }
}
