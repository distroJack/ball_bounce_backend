const Board = function (Player1, Player2) {

    this.width = 1920;
    this.height = 1080;

    this.lscore = Player1.score;
    this.rscore = Player2.score;

}

Board.prototype = {

    score_left: function() { 
        this.lscore++;
    },

    score_right: function() { 
        this.rscore++;
    },
}

module.exports = Board;