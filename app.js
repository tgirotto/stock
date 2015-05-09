var request = require('request');
var Point = require('./models/point.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stock');

var PERIOD = 13 * 24 * 60 * 60;

var price = {};
var obj = {};

/*setInterval(function() {
	request.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22AAPL%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=', function(err, res, body) {
		if(err)
			console.log(err);
		else {
			var obj = JSON.parse(body);
			store(obj.query.results.quote.LastTradePriceOnly,
				  obj.query.results.quote.DaysLow,
				  obj.query.results.quote.DaysHigh,
				  Math.floor(new Date().getTime() / 1000));
		}
	});
}, 2000);*/

function store(lastPrice, daysLow, daysHigh, timestamp) {
	var point = new Point();

	point.lastPrice = lastPrice;
    point.daysLow = daysLow;
    point.daysHigh = daysHigh;
    point.timestamp = timestamp;
    point.k = 0;
    point.d = 0;

    console.log(lastPrice);
    console.log(daysLow);
    console.log(daysHigh);

    point.save(function(err, point) {
        if(err)
        	console.log(err);
        else {
	        getHighest(PERIOD, daysHigh, function(highest) {
		       	getLowest(PERIOD, daysLow, function(lowest) {
		        	var k = (lastPrice - lowest) / (highest - lowest) * 100;

		        	sma(5, function(result) {
		        		var d = (result + k) / 2;

		        		point.k = k;
		        		point.d = d;

		        		point.save(function(err, updated_point) {
		        			getLast(point._id, function(previous_d) {
		        				buy(d, previous_d);
		        				sell(d, previous_d);
		        			});
		        		})

		        	});
		        });
	        });
        	console.log('--- saved item ---');
        }
    });
}

//first value is highest
function getHighest(period, current, callback) {
	Point.find({})
		.sort({timestamp : 1})
		.limit(PERIOD)
		.sort({daysHigh : -1})
		.exec(function(err, points) {

		if(err)
        	console.log(err);
        else {
        	if(points[0].daysHigh > current)
        		callback(points[0].daysHigh);
        	else
        		callback(current);
        }
	});
};

//first value is lowest
function getLowest(period, current, callback) {
	Point.find({})
		.sort({timestamp : 1})
		.limit(PERIOD)
		.sort({daysLow : 1})
		.exec(function(err, points) {
		
		if(err)
        	console.log(err);
        else {
        	if(points[0].daysLow < current)
        		callback(points[0].daysLow);
        	else
        		callback(current);
        }
	});
};

//Gets last n points
function getLastN(period, callback) {
	Point.find({})
		.sort({timestamp : -1})
		.limit(period)
		.exec(function(err, points) {
			if(err)
				console.log(err);
			else
				callback(points); 
		});
};

//Gets last single point
function getLast(_id, callback) {
	Point.findOne({_id : _id})
		.exec(function(err, point) {
			if(err)
				console.log(err);
			else {
				callback(point.d); 
			}
		});
};

function sma(period, callback) {
	getLastN(period, function(points) {
		var d = 0;
		var sum = 0;
		var now = Math.floor(new Date().getTime() / 1000);

		for(var i = 0; i < period; i++)
			sum += points[i].k;

		d = sum / (period - 1);

		callback(d);
	});
};

function buy(now, previous) {
	if(now - previous < 20 && now > 20)
		console.log('buy');
};

function sell(now, previous) {
	if(now - previous > 80 && now < 80)
		console.log('sell');
};

store(126, 120, 130, Math.floor(new Date().getTime() / 1000));