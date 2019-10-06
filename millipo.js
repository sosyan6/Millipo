'use strict'

const fs = require( 'fs' );

const unit = JSON.parse( fs.readFileSync( './unit.json', 'utf-8' ) );
const idol = JSON.parse( fs.readFileSync( './idol.json', 'utf-8' ) );

class Player
{
	constructor( name )
	{
		this.name = name;
		this.hand = [];
		this.point = 0;
	}

	add( card )
	{
		this.hand.push( card );
	}
}

class Card
{
	constructor( idol )
	{
		this.idol = idol;
	}
}

module.exports = class millipo
{
	constructor( client, priority = 0 )
	{
		this.client = client;
		this.priority = priority;
		this.maxPlayers = 4;
		this.player = [];
		this.gameStatus = 'idle';
		this.gameTurn = 0;
		this.maxTurn = 3;
		unit.sort( ( a, b ) => b.Member.length - a.Member.length );
	}

	input( stdin )
	{
		if( stdin.startsWith( 'millipo' ) ){
			switch( this.gameStatus ){
				case 'idle':
					if( stdin.args == 'j' || stdin.args == 'join' ){
						if( this.player.indexOf( stdin.author.username ) != -1 ){
							stdin.reply( 'すでに参加しています' );
						}else if( this.player.length >= this.maxPlayers ){
							stdin.reply( 'プレイヤーが満員です' );
						}else{
							this.player.push( new Player( stdin.author.username ) );
						}
						stdin.author.send( `現在のプレイヤー: ${ this.player.map( m => m.name ) }` );
					}
					if( stdin.args == 's' || stdin.args == 'start' ){
						this.startGame();
					}
				break;

				case 'game':
					if( stdin.args.startsWith( 'l ' ) ){
						var arg = stdin.args.slice( 2 );
						this.player.forEach( ( p ) => {
							if( p.name != stdin.author.username ) return;
							stdin.author.send(
								this.lookupUnit( p.hand[arg].idol['名前'] ).map( m => `${ m.Song }:\n\t${ m.Member.map( h => { 
									if( h == p.hand[arg].idol['名前'] ){
										return `__${ h }__`;
									}else if( p.hand.map( i => i.idol['名前'] ).indexOf( h ) != -1 ){
										return `**${ h }**`;
									}else{
										return h;
									}
								} ) }` )
							);
						} );
					}
					if( stdin.args.startsWith( 'x ' ) ){
						var arg = stdin.args.slice( 2 );
						this.player.forEach( ( p ) => {
							if( p.name != stdin.author.username ) return;
							if( p != this.player[this.gameTurn%this.player.length] ){
								stdin.author.send( 'あなたのターンではありません' );
								return;
							}
							for( var i of arg.split( /,\s*/ ) ){
								if( i < 5 ){
									this.deck.push( p.hand[i] );
									p.hand[i] = this.deck[0];
									this.deck.shift();
								}
							}
							this.forwardTurn();
						} );
					}else if( stdin.args == 'e' || stdin.args == 'end' ){
						this.player.forEach( ( p ) => {
							if( p.name != stdin.author.username ) return;
							if( p != this.player[this.gameTurn%this.player.length] ){
								stdin.author.send( 'あなたのターンではありません' );
								return;
							}
							this.forwardTurn();
						} );
					}else{
						this.player.forEach( ( p ) => {
							if( p.name != stdin.author.username ) return;
							stdin.author.send( `${ Math.floor( ( this.gameTurn / this.player.length ) + 1 ) }ターン目` );
							stdin.author.send( `あなたの手札:\n\t${ p.hand.map( m => `[${ p.hand.indexOf( m ) }]:${ m.idol['名前'] }` ).join( ', ' ) }` );
							stdin.author.send( ( this.player[this.gameTurn%this.player.length] == p ) ? 'あなたのターンです' : `${ this.player[this.gameTurn%this.player.length].name }のターンです` );
						} );
					}
				break;
			}
		}
	}

	initGame()
	{
		this.deck = [];
		for( var i of idol ) this.deck.push( new Card( i ) );
		for( var i = this.deck.length - 1; i >= 0; i-- ){
			var rnd = Math.floor( Math.random() * ( i + 1 ) );
			[this.deck[i], this.deck[rnd]] = [this.deck[rnd], this.deck[i]];
		}
		console.log( this.deck.map( m => m.idol['名前'] ) );

		for( var i = this.player.length - 1; i >= 0; i-- ){
			var rnd = Math.floor( Math.random() * ( i + 1 ) );
			[this.player[i], this.player[rnd]] = [this.player[rnd], this.player[i]];
		}
		for( var p of this.player ){
			for( var i = 0; i < 5; i++ ){
				p.add( this.deck[0] );
				this.deck.shift();
			}
		}
	}

	startGame()
	{
		this.gameStatus = 'game';
		this.initGame();
		this.player.forEach( ( p ) => {
			this.client.users.find( 'username', p.name ).send( 'ゲームを開始します' );
			this.client.users.find( 'username', p.name ).send( `${ ( this.gameTurn / this.player.length ) + 1 }ターン目` );
			this.client.users.find( 'username', p.name ).send( 
				`あなたの手札:\n\t${ p.hand.map( m => `[${ p.hand.indexOf( m ) }]:${ m.idol['名前'] }` ).join( ', ' ) }`
			);
			this.client.users.find( 'username', p.name ).send(
				( this.player[this.gameTurn%this.player.length] == p ) ? 'あなたのターンです' : `${ this.player[this.gameTurn%this.player.length].name }のターンです`
			);
		} );
	}

	endGame()
	{
		this.player.forEach( ( p ) => {
			this.client.users.find( 'username', p.name ).send( 'ゲーム終了です' );
			// this.client.users.find( 'username', p.name ).send(
			// 	this.player.map( ( pl ) => `${ pl.name }の手札:\n\t${ pl.hand.map( m => m.idol['名前'] ).join( ', ' ) } ` ).join( '\n' )
			// );
			this.client.users.find( 'username', p.name ).send(
				this.player.map( ( pl ) => { // pl <= { name: '', hand: '' } * n
					var hands = pl.hand.map( m => m.idol['名前'] );
					// for( var u of unit ){ // u <= { Song:'', Member:'' } * n
					if( this.validateUnit( hands ) ){
						console.log( '5cards' );
						return;
					}
					for( var a = 0; a < 4; a++ ){
						hands.slice().splice( a, 1 );
					}
					// }
				} ).join( '\n' )
			);
		} );
		this.gameStatus = 'idle';
	}

	forwardTurn()
	{
		if( Math.floor( ( ++this.gameTurn / this.player.length ) + 1 ) >= this.maxTurn ){
			this.endGame();
		}
		for( var i = this.deck.length - 1; i >= 0; i-- ){
			var rnd = Math.floor( Math.random() * ( i + 1 ) );
			[this.deck[i], this.deck[rnd]] = [this.deck[rnd], this.deck[i]];
		}
		this.player.forEach( ( p ) => {
			this.client.users.find( 'username', p.name ).send( `${ ( this.gameTurn / this.player.length ) + 1 }ターン目` );
			this.client.users.find( 'username', p.name ).send( 
				`あなたの手札:\n\t${ p.hand.map( m => `[${ p.hand.indexOf( m ) }]:${ m.idol['名前'] }` ).join( ', ' ) }`
			);
			this.client.users.find( 'username', p.name ).send(
				( this.player[this.gameTurn%this.player.length] == p ) ? 'あなたのターンです' : `${ this.player[this.gameTurn%this.player.length].name }のターンです`
			);
		} );
	}

	lookupUnit( i )
	{
		return unit.filter( v => v.Member.indexOf( i ) != -1 );
	}
	validateUnit( u )
	{
		return unit.filter( v => v.Member.sort().toString() == u.sort().toString() );
	}
}