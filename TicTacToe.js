var game;

function Tile() {
	Tile.Blank = "";
	Tile.Nought = "O";
	Tile.Cross = "X";

	this.tile = Tile.Blank;

	this.equals = (_tile) => {
		return this.tile === _tile;
	}

	this.isMarked = () => {
		return this.tile !== Tile.Blank;
	}

	this.set = (_tile) => {
		this.tile = _tile;
	}

	this.mark = (id, _tile) => {
		this.tile = _tile;
		$('#' + id).html(_tile);
	}
}

function AIPlayer (data) {
	var data = data;
	var seed;
	var oppSeed;

	this.setSeed = (_seed) => {
		seed = _seed;
		oppSeed = seed === Tile.Nought ? Tile.Cross : Tile.Nought;
	}

	this.getSeed = () => {
		return seed;
	}

	this.move = () => {
		return minimax(2,seed)[1];
	}

	function minimax(depth, player) {
		var validMoves = getValidMoves();

		var best = (player === seed) ? -1e100 : 1e100;
		var current;
		var bestIdx = -1;

		if (validMoves.length === 0 || depth === 0) {
			best = evaluate();
		} else {
			for (var i = validMoves.length - 1; i >= 0; i--) {
				var m = validMoves[i];
				data[m].set(player);

				if (player === seed) {
    				current = minimax(depth-1, oppSeed)[0];
    				if (current > best) {
    					best = current;
    					bestIdx = m;
    				}
				} else {
					current = minimax(depth-1, seed)[0];
					if (current < best) {
						best = current;
						bestIdx = m;
					}
				}

				data[m].set(Tile.Blank);
			}

		}

		return [best, bestIdx];
	}

	function getValidMoves() {
		var nm = []
		if (hasWon(seed) || hasWon(oppSeed)) {
			return nm;
		}
		for (var i = data.length - 1; i >= 0; i--) {
 			if (!data[i].isMarked()) {
 				nm.push(i);
 			}
		}
		return nm;
	}

	function evaluate() {
		var s = 0;
		s += evaluateLine(0,1,2); 
		s += evaluateLine(3,4,5); 
		s += evaluateLine(6,7,8); 
		s += evaluateLine(0,3,6); 
		s += evaluateLine(1,4,7); 
		s += evaluateLine(2,5,8); 
		s += evaluateLine(0,4,8); 
		s += evaluateLine(2,4,6); 
		return s;
	}

	function evaluateLine(idx1,idx2,idx3) {
		var s = 0;

		if (data[idx1].equals(seed)) {
			s = 1;
		} else if (data[idx1].equals(oppSeed)) {
			s = -1;
		}

		if (data[idx2].equals(seed)) {
			if (s === 1) {
				s = 10;
			} else if (s === -1) {
				return 0;
			} else {
				s = 1;
			}
		} else if (data[idx2].equals(oppSeed)) {
			if (s === -1) {
				s = -10;
			} else if (s === 1) {
				return 0;
			} else {
				s = -1;
			}
		}

		if (data[idx3].equals(seed)) {
			if (s > 0) {
				s *= 10;
			} else if (s < 0) {
				return 0;
			} else {
				s = 1;
			}
		} else if (data[idx3].equals(oppSeed)) {
			if (s < 0) {
				s *= 10;
			} else if (s > 0) {
				return 0;
			} else {
				s = -1
			}
		}
		return s;
	}

	var hasWon = this.hasWon = (player) => {
		var wp = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
		for (var i = wp.length - 1; i >= 0; i--) {
			var win = wp[i].every(function(e){
				return data[e].tile === player;
			});
			if (win) return wp[i];
		}

		return false;
	}

	this.hasWinner = () => {
		var wp = hasWon(seed);
		return wp ? wp : false;
	}
}

function Game () {

	var data = new Array(9);
	var player;
	var ai;
	var winner;
	var terminalState = false;

	this.init = (_player) => {


		for (var i = 0; i < data.length; i++) {
			data[i] = new Tile();
			$('#' + i).html('');
			$('#' + i).css({"background-color": "#fff", "color": "#000"});

		}

		player = _player === 'select_O' ? Tile.Nought : Tile.Cross;
		ai = new AIPlayer(data);
		ai.setSeed(player === Tile.Nought ? Tile.Cross : Tile.Nought);
	}

	this.onClick = (senderID) => {
		
		if(data[senderID].isMarked() || this.terminalState) return;
		data[senderID].mark(senderID, player);

		var aiMove = ai.move();

		if (aiMove === -1) {
			this.terminalState = true;
			for (var i = data.length - 1; i >= 0; i--) {
				$('#' + i).css({"background-color": "#555", "color": "#fff"});
			}
			$('#message').html("It's a Draw!");
		}else{
			data[aiMove].mark(aiMove, ai.getSeed());
		} 
		
		this.checkForWinner();
	}

	this.checkForWinner = () => {
		var winner = ai.hasWinner();
		if(winner){
			this.terminalState = true;
			$('#message').html("You Lose!");
			for (var i = winner.length - 1; i >= 0; i--) {
				$('#' + winner[i]).css({"background-color": "#555", "color": "#fff"});
			}
		}
	}

	this.begin = () => {
		$('#modal_select').modal({
			backdrop: 'static',
			keyboard: false,
		}); 
		
		$('#modal_select').modal('show');

		$('.select_symbol').click(function(sender) {
			game.init(sender.currentTarget.id);
			$('#modal_select').modal('hide');
		});
	}
}

$('document').ready(function(){
	game = new Game();
	game.begin();

	$('.tile').click(function(sender){
		game.onClick(sender.currentTarget.id);
	});

	$('#button_reset').click(function(){
			game = new Game();
			game.begin();
	});
});
