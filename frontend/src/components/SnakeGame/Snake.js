class Snake {
    constructor(p5, sql) {
        this.x = 0;
        this.y = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.tail = [];
        this.total = 0;
        this.p5 = p5;
        this.sql = sql;
    }

    update = () => {
        if (this.total === this.tail.length) {
            for (let i = 0; i < this.tail.length-1; i++) {
                this.tail[i] = this.tail[i+1]
            }
        }
        this.tail[this.total-1] = this.p5.createVector(this.x, this.y)

        

        this.x += this.xSpeed*this.sql;
        this.y += this.ySpeed*this.sql; 

        this.x = this.p5.constrain(this.x, 0, this.p5.width-this.sql);
        this.y = this.p5.constrain(this.y, 0, this.p5.height-this.sql);
    }

    show = () => {
        this.p5.fill('blue');
        for (let i = 0; i < this.tail.length; i++) {
            this.p5.rect(this.tail[i].x, this.tail[i].y, this.sql, this.sql)
        }
        this.p5.fill('green')
        this.p5.rect(this.x, this.y, this.sql, this.sql)
    }

    eat = (pos) => {
        const d = this.p5.dist(this.x, this.y, pos.x, pos.y);
        if (d < 1) {
            this.total++;
            return true;
        }
        else return false;
    }

    death = () => {
        for (let i = 0; i < this.tail.length; i++) {
            const pos = this.tail[i];
            if (this.p5.dist(this.x, this.y, pos.x, pos.y) < 1) {
                this.total = 0;
                this.tail = [];
                this.x = 0;
                this.y = 0;
                this.xSpeed = 0;
                this.ySpeed = 0;
                return true;
            }
        }
        return false;
    }

    getDir = () => {
        return {x: this.xSpeed, y: this.ySpeed}
    }

    dir = (x, y) => {
        this.xSpeed = x;
        this.ySpeed = y;
    }
}

export default Snake;