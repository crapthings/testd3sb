var _ = require('lodash')
var moment = require('moment')
var jsonfile = require('jsonfile')
var file = './datas-years.json'

var data = {}

moment.locale('zh-CN')

_.times(90, function (n) {
	var timestamp = moment(new Date(2016, 1)).add(n, 'd').unix()
	var dd = moment( new Date(timestamp * 1000) ).format('dd')
	if (dd == '六' || dd == '日') {
		data[timestamp] = _.sample([0, 0, 0, _.random(0, 20)])
		console.log(dd, data[timestamp])
	} else {
		data[timestamp] = _.random(10, 30)
	}
})

jsonfile.writeFile(file, data, {
	spaces: 4
}, function (err) {
  console.error(err)
})
