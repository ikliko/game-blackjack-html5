var Blackjack = (function () {
    const MAX_CANVAS_WIDTH = 984;
    const MAX_CANVAS_HEIGHT = 640;

    function Blackjack() {
        this.isRuning = false;
        this.deck = null;
        this.canvas = this.createCanvas();
        this.playground = this.canvas.getContext("2d");
        this.blackjackWrapper = document.querySelector('[data-gameId="blackjack"]');
        this.hitButton = {
            x: 40,
            y: 40,
            width: 100,
            height: 60,
            buttonText: {
                x: 0,
                y: 0,
                height: 0,
                text: 'Hit'
            }
        };
        this.dealerDeck = [];
        this.playerDeck = [];
        this.deckImages = [];
        this.cardDealerPlaceholders = {};
        this.cardPlayerPlaceholders = {};
        this.isDeckLoaded = false;
        this.mustHidePlayerCards = false;
        this.isDealerDeckReady = false;
        this.isPlayerDeckLoaded = false;
    }

    /**
     * Checks that hit button is active or not
     *
     * @returns {boolean|*}
     */
    Blackjack.prototype.isHitButtonActive = function () {
        return this.isDealerDeckReady && this.isPlayerDeckLoaded && !this.mustHidePlayerCards;
    };

    /**
     * Gets card dimensions width and height
     *
     * @returns {{width: number, height: number}}
     */
    Blackjack.prototype.getCardDimensions = function () {
        return {
            width: this.canvas.width / 4 - 20,
            height: this.canvas.height / 2 - 40
        };
    };

    /**
     * This function calculates deck placeholder dimensions and position.
     * Returns object of calculated data
     *
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    Blackjack.prototype.getDeckPlaceholderDimensions = function () {
        let width = this.canvas.width / 4 - 20,
            height = this.canvas.height / 2 - 40;

        return {
            x: this.canvas.width - width - 10,
            y: this.getCardDimensions().height / 2,
            width: width,
            height: height
        };
    };

    /**
     * On init function that game engine calls once
     */
    Blackjack.prototype.onInit = function () {
        this.isRuning = true;
        this.deck = new Deck();
        this.deck.shuffle();
        this.calcCanvasDimensions();
        this.renderCanvas();

        window.addEventListener('resize', () => {
            this.calcCanvasDimensions();
            this.clear();
            // window.location.reload()
        });
    };

    /**
     * This function is called by engine repeatedly
     */
    Blackjack.prototype.onUpdate = function () {
        this.clear();
        this.renderContent();
        this.hidePlayerCards();
    };

    /**
     * Clears playground /canvas content/
     */
    Blackjack.prototype.clear = function () {
        this.playground.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    /**
     * Canvas content
     */
    Blackjack.prototype.renderContent = function () {
        this.renderHitButton();
        this.renderDeckPlaceholder();
        this.renderCardPlaceholders();
        this.renderDeck();
        this.renderDealerCardsToPlaceholders();
        this.renderPlayerCards();
    };

    /**
     * Creates canvas
     *
     * @returns {HTMLCanvasElement}
     */
    Blackjack.prototype.createCanvas = function () {
        let canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'blackjack-canvas');
        canvas.innerText = 'Your browser does not support the canvas element.';
        canvas.style.border = '1px solid #c3c3c3';

        canvas.addEventListener('click', (event) => {
            let mouseCoords = this.getEventMouseCoords(event);

            this.checkHitButtonClicked(mouseCoords);
            this.checkPlayerCardClicked(mouseCoords);
        });

        return canvas;
    };

    /**
     * Hit button click checker function its called each time on canvas mouse click event
     *
     * @param mouseCoords
     */
    Blackjack.prototype.checkHitButtonClicked = function (mouseCoords) {
        if (!this.isHitButtonActive()) {
            return;
        }

        let buttonBounds = {
            topLeft: this.hitButton.x,
            topRight: this.hitButton.x + this.hitButton.width,
            bottomLeft: this.hitButton.y,
            bottomRight: this.hitButton.y + this.hitButton.height
        };
        let isXCoordInside = mouseCoords.x >= buttonBounds.topLeft && mouseCoords.x <= buttonBounds.topRight;
        let isYCoordInside = mouseCoords.y >= buttonBounds.bottomLeft && mouseCoords.y <= buttonBounds.bottomRight;

        if (isXCoordInside && isYCoordInside) {
            this.playerDeck = this.playerDeck.map(cardData => ({
                ...cardData,
                hide: true
            }));
            this.mustHidePlayerCards = true;
        }
    };

    /**
     * Players card click checker function its called each time on canvas mouse click event
     *
     * @param mouseCoords
     */
    Blackjack.prototype.checkPlayerCardClicked = function (mouseCoords) {
        if (!this.isHitButtonActive()) {
            return;
        }
        let cardDimensions = this.getCardDimensions();
        this.playerDeck.forEach((cardData, index) => {
            let buttonBounds = {
                topLeft: cardData.card.position.x,
                topRight: cardData.card.position.x + cardDimensions.width,
                bottomLeft: cardData.card.position.y,
                bottomRight: cardData.card.position.y + cardDimensions.height
            };
            let isXCoordInside = mouseCoords.x >= buttonBounds.topLeft && mouseCoords.x <= buttonBounds.topRight;
            let isYCoordInside = mouseCoords.y >= buttonBounds.bottomLeft && mouseCoords.y <= buttonBounds.bottomRight;

            if (isXCoordInside && isYCoordInside) {
                this.playerDeck[index] = {
                    ...cardData,
                    hide: true
                };
                this.mustHidePlayerCards = true;
            }
        });
    };

    /**
     * This function hides player cards
     */
    Blackjack.prototype.hidePlayerCards = function () {
        if (this.mustHidePlayerCards) {
            let removeAll = this.playerDeck.filter(cardData => cardData.hide).length === 2;

            this.playerDeck.forEach((cardData, index) => {
                if (cardData.hide) {
                    cardData.card.moveCard(cardData.card.position.x, cardData.card.position.y + MOVE_STEP);

                    if (cardData.card.position.y > this.canvas.height) {
                        this.mustHidePlayerCards = false;

                        if (!removeAll) {
                            this.playerDeck.splice(index, 1);
                        } else {
                            this.playerDeck = [];
                        }
                    }
                }
            });
        }
    };

    /**
     * When you pass mouse event this function calculates coords of mouse click
     *
     * @param event
     * @returns {{x: number, y: number}}
     */
    Blackjack.prototype.getEventMouseCoords = function (event) {
        let canvasBounds = this.canvas.getBoundingClientRect();

        return {
            x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top
        };
    };

    /**
     * Calculates canvas dimensions when resizing window
     */
    Blackjack.prototype.calcCanvasDimensions = function () {
        let windowWidth = this.blackjackWrapper.clientWidth,
            windowHeight = window.innerHeight;

        this.canvas.width = windowWidth <= MAX_CANVAS_WIDTH
            ? windowWidth - document.body.style.marginRight * 2
            : MAX_CANVAS_WIDTH;
        this.canvas.height = windowHeight <= MAX_CANVAS_HEIGHT ? windowHeight : MAX_CANVAS_HEIGHT;
    };

    /**
     * Renders hit button
     */
    Blackjack.prototype.renderHitButton = function () {
        let buttonText = {
            x: this.hitButton.x + (this.hitButton.width / 2),
            y: this.hitButton.y * 2,
            height: this.hitButton.height / 2.5,
            text: this.hitButton.buttonText.text
        };

        this.hitButton.x = this.canvas.width - this.hitButton.width - 10;
        this.hitButton.y = this.canvas.height - this.hitButton.height - 10;

        // button
        this.renderRect({
            x: this.hitButton.x,
            y: this.hitButton.y,
            width: this.hitButton.width,
            height: this.hitButton.height,
            fillStyle: 'rgba(225, 225, 225, 0.5)',
            stroke: {
                lineWidth: 1,
                strokeStyle: '#000000'
            }
        });

        // button text
        this.renderText({
            font: `${buttonText.height}pt Kremlin Pro Web`,
            textAlign: "center",
            textBaseline: "middle",
            fillStyle: "#000000",
            text: buttonText.text,
            // calculates perfect center of the button
            coords: {
                x: this.hitButton.x + (this.hitButton.width / 2),
                y: this.hitButton.y + (this.hitButton.height / 2)
            }
        });
    };

    /**
     * This is helper function for rendering rectangle with given configuration
     *
     * @param config ({
     *      x: number,
     *      y: number,
     *      width: number,
     *      height: number,
     *      fillStyle: string,
     *      stroke: {
     *          lineWidth: number,
     *          strokeStyle: string
     *      }
     *  })
     */
    Blackjack.prototype.renderRect = function (config) {
        this.playground.beginPath();
        this.playground.rect(config.x, config.y, config.width, config.height);
        this.playground.fillStyle = config.fillStyle;
        this.playground.fill();
        if (config.stroke) {
            this.playground.lineWidth = config.stroke.lineWidth;
            this.playground.strokeStyle = config.stroke.strokeStyle;
            this.playground.stroke();
        }
        this.playground.closePath();
    };

    /**
     * Helper function for rendering text with given configuration
     *
     * @param config
     */
    Blackjack.prototype.renderText = function (config) {
        this.playground.font = config.font;
        this.playground.textAlign = config.textAlign;
        this.playground.textBaseline = config.textBaseline;
        this.playground.fillStyle = config.fillStyle;
        this.playground.fillText(config.text, config.coords.x, config.coords.y);
    };

    /**
     * Renders canvas
     */
    Blackjack.prototype.renderCanvas = function () {
        this.blackjackWrapper.appendChild(this.canvas);
    };

    /**
     * Calculates and renders placeholders for player and dealer
     */
    Blackjack.prototype.renderCardPlaceholders = function () {
        let card = this.getCardDimensions(),
            cardWidth = card.width,
            cardHeight = card.height;

        /**
         * DealerCard
         */
        for (let i = 0; i < 3; i++) {
            let cardDealerConfig = {
                x: cardWidth * i + (10 * (i + 1)),
                y: 10,
                width: cardWidth,
                height: cardHeight,
                fillStyle: 'rgba(255,255,255, .5)',
                stroke: {
                    lineWidth: 1,
                    strokeStyle: '#000'
                }
            };
            this.cardDealerPlaceholders[`card${i + 1}`] = cardDealerConfig;

            this.renderRect(cardDealerConfig);
            this.renderText({
                font: `20pt Kremlin Pro Web`,
                textAlign: "center",
                textBaseline: "middle",
                fillStyle: "#000000",
                text: `Dealer Card ${i + 1}`,
                coords: {
                    x: cardDealerConfig.x + (cardDealerConfig.width / 2),
                    y: cardDealerConfig.y + (cardDealerConfig.height / 2)
                }
            });
        }

        /**
         * Player cards
         */
        for (let i = 0; i < 2; i++) {
            let cardPlayerConfig = {
                x: (i * cardWidth) + cardWidth / 2 + (i * 10),
                y: this.canvas.height - cardHeight - 10,
                width: cardWidth,
                height: cardHeight,
                fillStyle: 'rgba(255,255,255, .5)',
                stroke: {}
            };

            this.cardPlayerPlaceholders[`card${i + 1}`] = cardPlayerConfig;

            this.renderRect(cardPlayerConfig);
            this.renderText({
                font: `20pt Kremlin Pro Web`,
                textAlign: "center",
                textBaseline: "middle",
                fillStyle: "#000000",
                text: `Player Card ${i + 1}`,
                coords: {
                    x: cardPlayerConfig.x + (cardPlayerConfig.width / 2),
                    y: cardPlayerConfig.y + (cardPlayerConfig.height / 2)
                }
            })
        }
    };

    /**
     * Renders deck placeholder
     */
    Blackjack.prototype.renderDeckPlaceholder = function () {
        let deckPlaceholderDimensions = this.getDeckPlaceholderDimensions();

        let rectConfig = {
            x: deckPlaceholderDimensions.x,
            y: deckPlaceholderDimensions.y,
            width: deckPlaceholderDimensions.width,
            height: deckPlaceholderDimensions.height,
            fillStyle: 'rgba(255, 255, 255, 0.5)',
            stroke: {
                lineWidth: 1,
                strokeStyle: '#000'
            }
        };

        this.renderRect(rectConfig);

        this.renderText({
            font: `20pt Kremlin Pro Web`,
            textAlign: "center",
            textBaseline: "middle",
            fillStyle: "#000000",
            text: 'Empty Deck',
            coords: {
                x: rectConfig.x + (rectConfig.width / 2),
                y: rectConfig.y + (rectConfig.height / 2)
            }
        });
    };

    /**
     * Renders deck. Here have logic for loading images only once
     */
    Blackjack.prototype.renderDeck = function () {
        let deckPlaceholderDimensions = this.getDeckPlaceholderDimensions(),
            offsetY = deckPlaceholderDimensions.y,
            offsetX = deckPlaceholderDimensions.x;

        let promises = [];
        let images = [];

        if (this.isDeckLoaded) {
            let cardDimensions = this.getCardDimensions();
            this.deckImages.forEach((cardData) => {
                this.playground
                    .drawImage(
                        cardData.image,
                        cardData.card.position.x,
                        cardData.card.position.y,
                        cardDimensions.width,
                        cardDimensions.height
                    );
            });
        } else {
            this.deck.cards.forEach((card, index) => {
                let promise = new Promise(((resolve) => {
                    let image = new Image();
                    image.setAttribute('data-cardid', card.code);
                    image.onload = () => {
                        if (index % 4 === 0) {
                            offsetX--;
                            offsetY--;
                        }

                        card.moveCard(offsetX, offsetY);

                        resolve({
                            card: card,
                            image: image
                        });
                    };
                    image.src = card.getImageUrl();
                    images.push(image);
                }));

                promises.push(promise);
            });

            Promise.all(promises).then((response) => {
                this.isDeckLoaded = true;
                this.deckImages = response;
            });
        }

    };

    /**
     * Moves cards to dealer placeholders
     */
    Blackjack.prototype.renderDealerCardsToPlaceholders = function () {
        if (this.isDeckLoaded && this.dealerDeck.length < 3) {
            let card = this.deck.cards.pop();
            let cardData = this.deckImages.find((cardData) => cardData.card.code === card.code);
            this.dealerDeck.push(cardData);
        }

        let cardDimensions = this.getCardDimensions();

        this.dealerDeck.forEach((cardData, index) => {
            let moveTo = this.cardDealerPlaceholders[`card${index + 1}`];

            if (cardData.card.position.x < moveTo.x - MOVE_STEP
                || cardData.card.position.x > moveTo.x + MOVE_STEP
                || cardData.card.position.y > moveTo.y + MOVE_STEP
                || cardData.card.position.y < moveTo.y - MOVE_STEP) {
                if (cardData.card.position.x <= moveTo.x) {
                    cardData.card.moveCard(cardData.card.position.x + MOVE_STEP, cardData.card.position.y);
                } else if (cardData.card.position.x >= moveTo.x) {
                    cardData.card.moveCard(cardData.card.position.x - MOVE_STEP, cardData.card.position.y);
                }

                if (cardData.card.position.y >= moveTo.y) {
                    cardData.card.moveCard(cardData.card.position.x, cardData.card.position.y - MOVE_STEP);
                } else if (cardData.card.position.y <= moveTo.y) {
                    cardData.card.moveCard(cardData.card.position.x, cardData.card.position.y + MOVE_STEP);
                }
            } else if (!cardData.card.isRevealed) {
                cardData.card.revealCard();
                let img = cardData.image;
                img.onload = () => {
                    cardData.image = img;
                    cardData.isLoaded = true;
                };
                img.src = cardData.card.getImageUrl();

            }

            this.playground
                .drawImage(
                    cardData.image,
                    cardData.card.position.x,
                    cardData.card.position.y,
                    cardDimensions.width,
                    cardDimensions.height
                );
        });

        if (!this.isDealerDeckReady) {
            this.isDealerDeckReady = this.dealerDeck.filter(c => c.isLoaded).length === 3;
        }
    };

    /**
     * Moves player cards
     */
    Blackjack.prototype.renderPlayerCards = function () {
        if (this.isDeckLoaded && this.playerDeck.length < 2) {
            if (this.deck.cards.length) {
                let card = this.deck.cards.pop();
                let cardData = this.deckImages.find((cardData) => cardData.card.code === card.code);
                this.playerDeck.push(cardData);
            }
        }

        let cardDimensions = this.getCardDimensions();
        this.playerDeck.forEach((cardData, index) => {
            let moveTo = this.cardPlayerPlaceholders[`card${index + 1}`];

            if (!this.mustHidePlayerCards) {
                let dimensionExtra = MOVE_STEP;
                if (cardData.card.position.x < moveTo.x - dimensionExtra
                    || cardData.card.position.x > moveTo.x + dimensionExtra
                    || cardData.card.position.y > moveTo.y + dimensionExtra
                    || cardData.card.position.y < moveTo.y - dimensionExtra) {
                    if (cardData.card.position.x <= moveTo.x) {
                        cardData.card.moveCard(cardData.card.position.x + MOVE_STEP, cardData.card.position.y);
                    } else if (cardData.card.position.x >= moveTo.x) {
                        cardData.card.moveCard(cardData.card.position.x - MOVE_STEP, cardData.card.position.y);
                    }

                    if (cardData.card.position.y >= moveTo.y) {
                        cardData.card.moveCard(cardData.card.position.x, cardData.card.position.y - MOVE_STEP);
                    } else if (cardData.card.position.y <= moveTo.y) {
                        cardData.card.moveCard(cardData.card.position.x, cardData.card.position.y + MOVE_STEP);
                    }
                } else if (!cardData.card.isRevealed) {
                    cardData.card.revealCard();
                    let img = cardData.image;
                    img.onload = () => {
                        cardData.image = img;
                        cardData.isLoaded = true;
                    };
                    img.src = cardData.card.getImageUrl();
                }

                this.playground
                    .drawImage(
                        cardData.image,
                        cardData.card.position.x,
                        cardData.card.position.y,
                        cardDimensions.width,
                        cardDimensions.height
                    );
            }
        });

        this.isPlayerDeckLoaded = this.playerDeck.filter(c => c.isLoaded).length === 2 || !this.deck.cards.length;
    };

    return Blackjack;
}());