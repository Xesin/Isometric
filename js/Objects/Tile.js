/*globals XEngine*/

var Tile = function (game, x, y, type, sprite) {
    if(type != 'building'){
        XEngine.Sprite.call(this, game, x, y, Tile.getSpriteDefault(type));
    }else{
        XEngine.Sprite.call(this, game, x, y, sprite);
    }
    this.type = type;
    this.isometric = true;
    this.anchor.setTo(0.5, 1);
    this.isPreview = false;
};

Tile.prototype = Object.create(XEngine.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototypeExtends = {
    
    updateTileType: function (type, sprite) {
        if(type == 'building'){
            this.sprite = sprite;
            this.anchor.setTo(0.5, 0.92);
        }else{
            this.sprite = Tile.getSpriteDefault(type);
            this.scale.setTo(1);
            this.anchor.setTo(0.5, 1);
        }
        this.type = type;
        this.recalculateWidht();
    }
};

Object.assign(Tile.prototype, Tile.prototypeExtends);

Tile.getSpriteDefault = function (type) {
    switch (type) {
        case 'beach':
            return 'beach';
        case 'road':
            return 'road';
        case 'water':
            return 'water';
        case 'grass':
            return 'grass';
    }
};