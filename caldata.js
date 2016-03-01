var _ = require('lodash')
var moment = require('moment')
var jsonfile = require('jsonfile')
var file = './datas-years.json'
var data = {}
moment.locale('zh-CN')
_.times(400, function(n) {
	var timestamp = moment(new Date(2015, 2)).add(n, 'd').unix()
	var dd = moment(new Date(timestamp * 1000)).format('dd')
	if (dd == '六' || dd == '日') {
		data[timestamp] = _.random(5)
		var wtf = _.sample([true, false])
		if (!wtf) delete data[timestamp]
	} else {
		data[timestamp] = _.random(10, 30)
	}
})
jsonfile.writeFile(file, data, {
	spaces: 4
}, function(err) {
	console.error(err)
})