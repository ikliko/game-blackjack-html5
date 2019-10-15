var Deck = (function () {
    const SUITS = {'S': 'SPADES', 'D': 'DIAMONDS', 'H': 'HEARTS', 'C': 'CLUBS'};
    const VALUES = {'A': 'ACE', 'J': 'JACK', 'Q': 'QUEEN', 'K': 'KING', '0': '10'};
    const CARDS = [
        'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '0S', 'JS', 'QS', 'KS',
        'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '0D', 'JD', 'QD', 'KD',
        'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '0C', 'JC', 'QC', 'KC',
        'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '0H', 'JH', 'QH', 'KH'
    ];

    function Deck() {
        this.cards = null;
        this.generateDeck();
    }

    Deck.prototype.generateDeck = function () {
        this.cards = CARDS.map((card) => {
            let value = this.parseCardValue(card),
                suit = this.parseCardSuit(card);

            return new Card(value, suit, card);
        });
    };

    Deck.prototype.parseCardValue = function (card) {
        let value = card[0],
            parsedValue = VALUES[value];

        return parsedValue ? parsedValue : value;
    };

    Deck.prototype.parseCardSuit = function (card) {
        let suit = card[1],
            parsedSuit = SUITS[suit];

        return parsedSuit ? parsedSuit : suit;
    };

    /**
     * I'm using Fisher-Yates Algorithm for shuffling the deck
     */
    Deck.prototype.shuffle = function () {
        // -- To shuffle an array a of n elements (indices 0..n-1):
        // for i from n−1 downto 1 do
        for (let i = this.cards.length - 1; i > 1; i--) {
            //     j ← random integer such that 0 ≤ j ≤ i
            let j = Helper.randomIntegerInRange(0, i);
            // exchange a[j] and a[i]
            let temp = this.cards[j];
            this.cards[j] = this.cards[i];
            this.cards[i] = temp;
        }
    };

    return Deck;
}());