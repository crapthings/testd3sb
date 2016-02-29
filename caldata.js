var _ = require('lodash')
var moment = require('moment')
var jsonfile = require('jsonfile')
var file = './datas-years.json'

var data = {}

var startDate = new Date(2016, 1)

_.times(90, function (n) {
	var timestamp = moment(startDate).add(n, 'd').unix()
	data[timestamp] = _.sample([0, _.random(50)])
})

jsonfile.writeFile(file, data, {
	spaces: 4
}, function (err) {
  console.error(err)
})
