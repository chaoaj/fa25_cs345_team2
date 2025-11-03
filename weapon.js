

class Weapon {
    constructor(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }


    swordAttack(x, y, direction) {
        push();
        noFill();
        stroke("blue");
        strokeWeight(8);
        let r = windowHeight / 10;


        switch (direction) {
            case "right":
            
            arc(x, y, r, r, -PI / 4, PI / 4);
            break;

            case "left":
            arc(x, y, r, r, (3 * PI) / 4, (5 * PI) / 4);
            break;

            case "up":
            arc(x, y, r, r, (5 * PI) / 4, (7 * PI) / 4);
            break;

            case "down":
            arc(x, y, r, r, PI / 4, (3 * PI) / 4);
            break;

            case "upright":
            arc(x, y, r, r, (6 * PI) / 4, -PI / 4);
            break;

            case "upleft":
            arc(x, y, r, r, PI, (5 * PI) / 4); 
            break;

            case "downright":
            arc(x, y, r, r, 0, PI / 4);
            break;

            case "downleft":
            arc(x, y, r, r, (3 * PI) / 4, PI);
            break;
        }
        pop();
    }
}
