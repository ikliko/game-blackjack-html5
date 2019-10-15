var Helper = (function () {
    function Helper() {
    }

    Helper.prototype.randomInteger = function () {
        return Math.floor(Math.random() * 10);
    };

    Helper.prototype.randomIntegerInRange = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min)) + min;
    };

    return new Helper();
}());