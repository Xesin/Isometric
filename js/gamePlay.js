/* global XEngine Tile localStorage*/
var currentLevel = 1;
var GamePlay = function (game) {
	this.player = null;
	this.ball = null;
	this.bricks = null;
	this.textStyle = {
		font: 'PressStart',
		font_size: 20,
		font_color: 'white',
		stroke_width: 8,
		stroke_color: 'black'
	};
	this.pointerWorldPos = new XEngine.Vector(0,0);
	this.roadTiles = {};
	this.tileSeparation = 50;
	this.buildingIndex = 1;
	this.tween = undefined;
};

GamePlay.prototype = {
	
	start: function () {
		this.initArrays();
		this.game.worldWidth = 3600;
		this.game.worldHeight = 3600;
		this.roadGroup = this.game.add.group();
		this.game.input.onKeyDown.add(this.onKeyDown, this);
		for(var i = 0; i<= 64; i++){
			for(var j = 0; j<= 64; j++){
				var beach = new Tile(this.game, this.tileSeparation*i, this.tileSeparation*j, 'grass');
				this.roadGroup.add(beach);
				this.roadTiles[i][j] = beach;
			}
		}
		
		this.createPreview();
		this.game.camera.position.x = -600;
		this.game.camera.position.y = 300;
		
		this.rectInput = this.game.add.rect(0,0,this.game.width, this.game.height);
		this.fixedToCamera = true;
		this.rectInput.inputEnabled = true;
		this.rectInput.alpha = 0;
		
		this.setUI();
		this.changePreviewTile('road');
	},
	
	initArrays: function () {
		this.roadTiles = new Array();
		for(var i = 0; i<= 64; i++){
			this.roadTiles[i] = new Array();
			for(var j = 0; j<= 64; j++){
				this.roadTiles[i][j] = null;
			}
		}
	},
	
	setUI: function () {
		var backUI = this.game.add.rect(0, this.game.height - 150, this.game.width, 150, 'black');
		backUI.fixedToCamera = true;
		backUI.alpha = 0.2;
		var startX = this.game.width / 2 - 300;
		this.grassTileUI = this.game.add.sprite(startX, this.game.height - 70, 'grass');	
		this.grassTileUI.fixedToCamera = true;
		this.grassTileUI.inputEnabled = true;
		this.grassTileUI.anchor.setTo(0.5);
		this.grassTileUI.onClick.add(function(){this.changePreviewTile('grass')}, this);
		
		this.roadTileUI = this.game.add.sprite(startX + 150, this.game.height - 70, 'road');	
		this.roadTileUI.fixedToCamera = true;
		this.roadTileUI.inputEnabled = true;
		this.roadTileUI.anchor.setTo(0.5);
		this.roadTileUI.onClick.add(function(){this.changePreviewTile('road')}, this);
		
		this.beachTileUI = this.game.add.sprite(startX + 300, this.game.height - 70, 'beach');	
		this.beachTileUI.fixedToCamera = true;
		this.beachTileUI.inputEnabled = true;
		this.beachTileUI.anchor.setTo(0.5);
		this.beachTileUI.onClick.add(function(){this.changePreviewTile('beach')}, this);
		
		this.waterTileUI = this.game.add.sprite(startX + 450, this.game.height - 70, 'water');	
		this.waterTileUI.fixedToCamera = true;
		this.waterTileUI.inputEnabled = true;
		this.waterTileUI.anchor.setTo(0.5);
		this.waterTileUI.onClick.add(function(){this.changePreviewTile('water')}, this);
		
		this.buildingTileUI = this.game.add.sprite(startX + 600, this.game.height - 70, 'building' + this.buildingIndex);	
		this.buildingTileUI.fixedToCamera = true;
		this.buildingTileUI.inputEnabled = true;
		this.buildingTileUI.anchor.setTo(0.5);
		this.buildingTileUI.onClick.add(function(){this.changePreviewTile('building')}, this);
	},
	
	createPreview: function () {
		this.preview = new Tile(this.game, 150,100, 'road');
		this.preview.isPreview = true;
		this.preview.position.zOffset = -100;
		this.roadGroup.add(this.preview);
	},
	
	update : function (deltaTime) {
		this.pointerWorldPos.x = this.game.input.pointer.x + this.game.camera.position.x;
		this.pointerWorldPos.y = this.game.input.pointer.y + this.game.camera.position.y + 80;
		var pos = XEngine.Vector.isoToCarCoord(this.pointerWorldPos);
		var coordinates = this.getCoordinatesFromPos(pos);
		pos.x = this.tileSeparation * coordinates.x;
		pos.y = this.tileSeparation * coordinates.y;
		pos.zOffset = 10;
		this.preview.position = pos;
		if(this.game.input.isPressed(XEngine.KeyCode.LEFT)){
			this.game.camera.position.x -= 200 * deltaTime;
		}else if(this.game.input.isPressed(XEngine.KeyCode.RIGHT)){
			this.game.camera.position.x += 200 * deltaTime;
		}
		if(this.game.input.isPressed(XEngine.KeyCode.UP)){
			this.game.camera.position.y -= 200 * deltaTime;
		}else if(this.game.input.isPressed(XEngine.KeyCode.DOWN)){
			this.game.camera.position.y += 200 * deltaTime;
		}
		
		if(this.rectInput.isInputDown){
			this.swapTile();
		}
		this.roadGroup.children.sort(function (a,b) {
			a = XEngine.Vector.cartToIsoCoord(a.position);
			b = XEngine.Vector.cartToIsoCoord(b.position);
			return (a.x + a.y + a.z) - (b.x + b.y + b.z);
		});
	},
	
	onKeyDown: function (event) {
		if(event.keyCode == XEngine.KeyCode.ONE){
			this.changePreviewTile('grass');
		}else if(event.keyCode == XEngine.KeyCode.TWO){
			this.changePreviewTile('road');
		}else if(event.keyCode == XEngine.KeyCode.THREE){
			this.changePreviewTile('beach');
		}else if(event.keyCode == XEngine.KeyCode.FOUR){
			this.changePreviewTile('water');
		}else if(event.keyCode == XEngine.KeyCode.FIVE){
			this.changePreviewTile('building');
		}else if(event.keyCode == XEngine.KeyCode.S){
			this.save();
		}else if(event.keyCode == XEngine.KeyCode.L){
			this.loadFromFile();
		}
	},
	
	changePreviewTile: function (newTile) {
		switch(newTile){
			case 'grass':
				this.preview.updateTileType('grass');
				this.setTweening(this.grassTileUI);
				break;
			case 'road':
				this.preview.updateTileType('road');
				this.setTweening(this.roadTileUI);
				break;
			case 'beach':
				this.preview.updateTileType('beach');
				this.setTweening(this.beachTileUI);
				break;
			case 'water':
				this.preview.updateTileType('water');
				this.setTweening(this.waterTileUI);
				break;
			case 'building':
				if(this.preview.type == 'building'){
					this.buildingIndex++;
					if(this.buildingIndex > 4){
						this.buildingIndex = 1;
					}
				}
				this.preview.updateTileType('building', 'building' + this.buildingIndex);
				this.buildingTileUI.sprite = this.preview.sprite;
				this.setTweening(this.buildingTileUI);
				break;
		}	
	},
	
	setTweening:function (object) {
		if(this.tween != undefined){
			this.tween.complete();
			this.tween.destroy();
		}	
		this.tween = this.game.tween.add(object.scale).to({x:0.8, y: 1.1}, 500, XEngine.Easing.Linear, true, 0, -1, true);
	},
	
	swapTile: function () {
		
		var coordinates = this.getCoordinatesFromPos(this.preview.position);
		if(this.preview.type == 'building'){
			//this.spawnBuilding(this.preview.sprite, coordinates);
			this.getRoadTileAtCoordinates(coordinates).updateTileType(this.preview.type, this.preview.sprite);
		}else{
			this.getRoadTileAtCoordinates(coordinates).updateTileType(this.preview.type);
		}
	},
	
	spawnBuilding: function (sprite, coordinates) {
		this.removeBuilding(coordinates);
		var building = new Tile(this.game, coordinates.x * this.tileSeparation, coordinates.y * this.tileSeparation, 'building', sprite)
		this.buildingGroup.add(building);
		this.buildingTiles[coordinates.x][coordinates.y] = building;
	},
	
	removeBuilding: function (coordinates) {
		var building = this.buildingTiles[coordinates.x][coordinates.y];
		if(building != null && building != undefined){
			building.destroy();
		}
	},
	
	getCoordinatesFromPos: function(pos){
		var coordinates = {x: 0, y:0};
		coordinates.x = XEngine.Mathf.clamp(Math.floor(pos.x / this.tileSeparation), 0, 64);
		coordinates.y = XEngine.Mathf.clamp(Math.floor(pos.y / this.tileSeparation), 0, 64);
		return coordinates;
	},
	
	getRoadTileAtCoordinates: function (coordinates) {
		return this.roadTiles[coordinates.x][coordinates.y];
	},
	
	save: function (text, name, type) {
		var object = new SaveObject(this.roadTiles, this.buildingTiles);
		localStorage.setItem('mapData', JSON.stringify(object));
	},
	
	loadFromFile: function () {
		var jsonLoaded = localStorage.getItem('mapData');
		var loadedData = JSON.parse(jsonLoaded);
		for(var i = 0; i< this.roadTiles.length; i++){
			for(var j = 0; j < this.roadTiles[i].length; j++){
				this.roadTiles[i][j].updateTileType(loadedData.mapTiles[i][j].type, loadedData.mapTiles[i][j].sprite);
			}
		}
	}
};

var SaveObject = function (floorTile, buildingTiles) {
	this.mapTiles = new Array();
	this.buildingTiles = new Array();
	for(var i = 0; i< floorTile.length; i++){
		this.mapTiles[i] = new Array();
		for(var j = 0; j < floorTile[i].length; j++){
			this.mapTiles[i][j] = {};
			this.mapTiles[i][j].type = floorTile[i][j].type;
			this.mapTiles[i][j].sprite = floorTile[i][j].sprite;
		}
	}
	
};