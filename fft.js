/*
complex fast fourier transform and inverse from
http://rosettacode.org/wiki/Fast_Fourier_transform#C.2B.2B
*/
function icfft(amplitudes)
{
	var N = amplitudes.length;
	var iN = 1 / N;
 
	//conjugate if imaginary part is not 0
	for(var i = 0 ; i < N; ++i)
		if(amplitudes[i] instanceof Complex)
			amplitudes[i].im = -amplitudes[i].im;
 
	//apply fourier transform
	amplitudes = cfft(amplitudes)
 
	for(var i = 0 ; i < N; ++i)
	{
		//conjugate again
		amplitudes[i].im = -amplitudes[i].im;
		//scale
		amplitudes[i].re *= iN;
		amplitudes[i].im *= iN;
	}
	return amplitudes;
}
 
function cfft(amplitudes)
{
	var N = amplitudes.length;
	if( N <= 1 )
		return amplitudes;
 
	var hN = N / 2;
	var even = [];
	var odd = [];
	even.length = hN;
	odd.length = hN;
	for(var i = 0; i < hN; ++i)
	{
		even[i] = amplitudes[i*2];
		odd[i] = amplitudes[i*2+1];
	}
	even = cfft(even);
	odd = cfft(odd);
 
	var a = -2*Math.PI;
	for(var k = 0; k < hN; ++k)
	{
		if(!(even[k] instanceof Complex))
			even[k] = new Complex(even[k], 0);
		if(!(odd[k] instanceof Complex))
			odd[k] = new Complex(odd[k], 0);
		var p = k/N;
		var t = new Complex(0, a * p);
		t.cexp(t).mul(odd[k], t);
		amplitudes[k] = even[k].add(t, odd[k]);
		amplitudes[k + hN] = even[k].sub(t, even[k]);
	}
	return amplitudes;
}
 
//test code
//console.log( cfft([1,1,1,1,0,0,0,0]) );
//console.log( icfft(cfft([1,1,1,1,0,0,0,0])) );






/*
basic complex number arithmetic from 
http://rosettacode.org/wiki/Fast_Fourier_transform#Scala
*/
function Complex(re, im) 
{
	this.re = re;
	this.im = im || 0.0;
}
Complex.prototype.add = function(other, dst)
{
	dst.re = this.re + other.re;
	dst.im = this.im + other.im;
	return dst;
}
Complex.prototype.sub = function(other, dst)
{
	dst.re = this.re - other.re;
	dst.im = this.im - other.im;
	return dst;
}
Complex.prototype.mul = function(other, dst)
{
	//cache re in case dst === this
	var r = this.re * other.re - this.im * other.im;
	dst.im = this.re * other.im + this.im * other.re;
	dst.re = r;
	return dst;
}
Complex.prototype.cexp = function(dst)
{
	var er = Math.exp(this.re);
	dst.re = er * Math.cos(this.im);
	dst.im = er * Math.sin(this.im);
	return dst;
}
Complex.prototype.log = function()
{
	/*
	although 'It's just a matter of separating out the real and imaginary parts of jw.' is not a helpful quote
	the actual formula I found here and the rest was just fiddling / testing and comparing with correct results.
	http://cboard.cprogramming.com/c-programming/89116-how-implement-complex-exponential-functions-c.html#post637921
	*/
	if( !this.re )
		console.log(this.im.toString()+'j');
	else if( this.im < 0 )
		console.log(this.re.toString()+this.im.toString()+'j');
	else
		console.log(this.re.toString()+'+'+this.im.toString()+'j');
}




function conjugate(a){
	return new Complex(a['re'], -a['im'])
}



function dot(ao,bo){
	// dot product with complex number vectors
	var a = { ...ao };
	var b = { ...bo };

	
	if(!(a['x'] instanceof Complex))  a['x'] = new Complex(a['x'], 0);
	if(!(a['y'] instanceof Complex))  a['y'] = new Complex(a['y'], 0);
	if(!(a['z'] instanceof Complex))  a['z'] = new Complex(a['z'], 0);
	if(!(b['x'] instanceof Complex))  b['x'] = new Complex(b['x'], 0);
	if(!(b['y'] instanceof Complex))  b['y'] = new Complex(b['y'], 0);
	if(!(b['z'] instanceof Complex))  b['z'] = new Complex(b['z'], 0);

	var re = a['x'].re*b['x'].re + a['y'].re*b['y'].re + a['z'].re*b['z'].re  -  a['x'].im*b['x'].im - a['y'].im*b['y'].im - a['z'].im*b['z'].im;
	var im = a['x'].re*b['x'].im + a['y'].re*b['y'].im + a['z'].re*b['z'].im  +  a['x'].im*b['x'].re + a['y'].im*b['y'].re + a['z'].im*b['z'].re;		
	return new Complex(re, im);
}


//function cross(a,b){
	// cross product with complex number vectors
//	if(!(a['x'] instanceof Complex))  a['x'] = new Complex(a['x'], 0);
//	if(!(a['y'] instanceof Complex))  a['y'] = new Complex(a['y'], 0);
//	if(!(a['z'] instanceof Complex))  a['z'] = new Complex(a['z'], 0);
//	if(!(b['x'] instanceof Complex))  b['x'] = new Complex(b['x'], 0);
//	if(!(b['y'] instanceof Complex))  b['y'] = new Complex(b['y'], 0);
//	if(!(b['z'] instanceof Complex))  b['z'] = new Complex(b['z'], 0);

	
//	var x = a['y'].mul(b['z']).sub( a['z'].mul(b['y']) ) ;
//	var y = a['z'].mul(b['x']).sub( a['x'].mul(b['z']) );
//	var z = a['x'].mul(b['y']).sub( a['y'].mul(b['x']) );
			
//	return new THREE.Vector3(x, y, z);		
//}



function abs(a){
	// absolute value with complex number vectors
	if(!(a instanceof Complex))  a = new Complex(a, 0);	
	return Math.sqrt(a.re**2 + a.im**2)
}





