const unit = JSON.parse( require( 'fs' ).readFileSync( './unit.json', 'utf-8' ) );
const idol = JSON.parse( require( 'fs' ).readFileSync( './idol.json', 'utf-8' ) );
const hand = ['春日未来', '最上静香', '伊吹翼', 'ジュリア', '真壁瑞希'];

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

for( var a = hand.length; a > 1; a-- ){
	for( var b of hand.permutation( a ) ){
		console.log( unit.filter( v => v.Member.toString() == b.toString() ) );
	}
}