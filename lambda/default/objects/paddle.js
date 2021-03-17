const Paddle = function (dbPaddle) {

    this.color = "#444444";

    this.direction = 0;
    this.speed = 4;
    this.x = dbPaddle.x;
    this.y = dbPaddle.y;
    this.width = 20;
    this.height = 150;

    if ((this.width - this.x) <= 0) {
        this.x -= this.width;
    }
}

Paddle.prototype = {

    getLeftPos: function () { 
        return {
            "x" : this.x + this.width,
            "y_top": this.y,
            "y_bot": this.y + this.height
        }
    },

    getRightPos: function () { 
        return {
            "x" : this.x,
            "y_top": this.y,
            "y_bot": this.y + this.height
        }
    },

    updateDirection: function (move) {
        switch (move) {
            case "Up":
                this.direction = -1;
            case "Down":
                this.direction = 1;
            case "None":
                this.direction = 0;
            default:
                break;
        }
    },

    updatePosition: function (move) {
        this.y += this.speed  * this.direction;
        if (this.y > (1080 - this.height)) {
            this.y = (1080 - this.height)
        } else if (this.y < 0) {
            this.y = 0;
        }
    },
}


module.exports = Paddle;