var Card = (function () {
    var imageUrl;

    function Card(value, suit, code) {
        this.value = value;
        this.suit = suit;
        this.code = code;
        this.isVisible = true;
        this.isRevealed = false;
        this.backUrl();
        this.position = {
            x: 0,
            y: 0
        }
    }

    Card.prototype.revealCard = function () {
        this.faceUrl();
        this.isRevealed = true;
    };

    Card.prototype.getImageUrl = function () {
        return imageUrl;
    };

    Card.prototype.faceUrl = function () {
        imageUrl = `./images/${this.code}.png`;
    };

    Card.prototype.backUrl = function () {
        imageUrl = './images/card-back.png';
    };

    Card.prototype.moveCard = function (x, y) {
        this.position = {
            x, y
        }
    };


    return Card;
}());