const Board = function (width, height) {

    this.width = width;
    this.height = height;

    this.lscore = 0;
    this.rscore = 0;

}

Board.prototype = {

    update: function(width, height) {
        this.width = width;
        this.height = height;
    },

    score_left: function() { 
        this.lscore++;
    },

    score_right: function() { 
        this.rscore++;
    },
}