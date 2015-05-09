var Point = require('./models/point.js');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stock');

function store(lastPrice, daysLow, daysHigh, k, timestamp) {
	var point = new Point();

	point.lastPrice = lastPrice;
    point.daysLow = daysLow;
    point.daysHigh = daysHigh;
    point.timestamp = timestamp;
    point.k = k;
    point.d = 0;

    point.save(function(err) {
        if(err)
        	console.log(err);
        else {
	        /*getHighest(PERIOD, daysHigh, function(highest) {
		       	getLowest(PERIOD, daysLow, function(lowest) {
		        	var k = (lastPrice - lowest) / (highest - lowest) * 100;
		        	console.log(k);

		        	sma(5, function() {
		        	
		        	});

		        });
	        });*/
        	console.log('--- saved item ---');
        }
    });
}

setInterval(function() {
	store(126, 120, 130, 80, Math.floor(new Date().getTime() / 1000));
}, 1000);

