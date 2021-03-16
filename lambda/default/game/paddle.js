const Paddle = function (x, y, width, height,) {

    this.color = "#444444";

    this.direction = 0;
    this.speed = 4;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

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

    updatePosition: function (width, height) {

        this.y += this.speed  * this.direction;
        if (this.y > (height - this.height)) {
            this.y = (height - this.height)
        } else if (this.y < 0) {
            this.y = 0;
        }
    },
}