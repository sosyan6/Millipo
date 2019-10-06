const unit = JSON.parse( require( 'fs' ).readFileSync( './unit.json', 'utf-8' ) );
const idol = JSON.parse( require( 'fs' ).readFileSync( './idol.json', 'utf-8' ) );
const hand = ['矢吹可奈', '春日未来', '高坂海美', '北上麗花', '伊吹翼'];

unit.sort( ( a, b ) => b.Member.length - a.Member.length );

(function() {
  var generatePermutation = function(perm, pre, post, n) {
    var elem, i, rest, len;
    if (n > 0)
      for (i = 0, len = post.length; i < len; ++i) {
        rest = post.slice(0);
        elem = rest.splice(i, 1);
        generatePermutation(perm, pre.concat(elem), rest, n - 1);
      }
    else
      perm.push(pre);
  };
  Array.prototype.permutation = function(n) {
    if (n == null) n = this.length;
    var perm = [];
    generatePermutation(perm, [], this, n);
    return perm;
  };
})();

var res = [];
for( var a = hand.length; a > 1; a-- ){
	for( var b of hand.permutation( a ) ){
		for( var c of unit ){
			if( c.Member.toString() == b.toString() ){
				res.push( c );
			}
		}
		// console.log( unit.filter( v => v.Member.toString() == b.toString() ) );
	}
}

var score = 0;
var final = [];
for( var i of res ){
	var ho = 0;
	// console.log( i );
	if( i.Member.length == 5 ){
		ho += 1000;
	}
	if( i.Member.length == 4 ){
		ho += 500;
	}
	if( i.Member.length == 3 ){
		ho += 300
	}
	if( i.Member.length == 2 ){
		ho += 100
	}
	var reaming = hand.filter( v => i.Member.indexOf( v ) == -1 );
	var flg = false;
	var tmp = [];
	for( var e = reaming.length; e > 1; e-- ){
		for( var f of reaming.permutation( e ) ){
			for( var g of unit ){
				if( g.Member.toString() == f.toString() ){
					if( g.Member.length == 2 ){
						// console.log( g );
						ho += 100
						flg =true;
						tmp = g;
					}
				}
			}
			if( flg ) break;
		}
	}
	if( score < ho ){
		score = ho;
		final = [i, tmp];
	}
}
console.log( score );
console.log( final );