var outsideHeightObj = {
	height: 183
};

var g;

function Test(name) {
	this._name = name;
	this.height = 183;
	this.heightObj = {
		height: 183
	};
	g = this;
	this.age();
	// this.height = 183;
	// this.heightObj = {
	// 	height: 183
	// };
};

Test.prototype.age = function() {
	// the following consoles will print undefined, if I put this.height, this.heightObj after 
	// this.age() method.
	// If I put this.height, this.heightObj before this.age(), these following consoles will print
	// as normal. However this.outsideHeightObj will still undefined, since 'this' not points to 
	// global object
	console.log(this.height); // undefined
	console.log(this.heightObj); // undefined
	console.log(this.outsideHeightObj); // undefined

	console.log(`${this._name} age is ${Math.round(Math.random() * 10)}`);

	console.log(g === this); // true
	this.school();
};

Test.prototype.school = function() {
	console.log(`${this._name} graduated from ....`);
};

var peroson1 = new Test('Bowen');
// peroson1.age();
console.log(peroson1 === g); // true


