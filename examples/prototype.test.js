function Test(name) {
	this._name = name;
	this.age();
};

Test.prototype.age = function() {
	console.log(`${this._name} age is ${Math.round(Math.random() * 10)}`);
};

var peroson1 = new Test('Bowen');
// peroson1.age();