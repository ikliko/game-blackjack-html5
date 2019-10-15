var GameEngine = (function () {
    function GameEngine(game) {
        this.game = game;
    }

    GameEngine.prototype.run = function () {
        this.game.onInit();
        this.update()
    };

    GameEngine.prototype.update = function () {
        setTimeout(() => {
            this.game.onUpdate();
            this.checkForUpdate();
        }, GAME_UPDATE_TIME / GAME_FPS)
    };

    GameEngine.prototype.checkForUpdate = function () {
        if (this.game.isRuning) {
            this.update();
        }
    };

    return GameEngine;
}());