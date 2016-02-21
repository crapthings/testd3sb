var _ = require('lodash')

var jsonfile = require('jsonfile')
 
var file = './data.json'

var __names = [
	'大有元亨数码专营店',
	'蚂蚁数码专营店',
	'文娟数码',
	'实在山东人数码',
	'金品数码',
	'武汉鲲鹏数码专营店',
	'华庭数码相机行',
	'深圳美心数码',
	'上海港海数码总店',
	'龙丰3C数码',
]

var count = 1
var max = 3

var data = {
	name: _.sample(__names),
	description: _.sample(__names),
	size: _.random(20, 30),
	children: getItems()
}

function getItem () {

	var data = {
		name: _.sample(__names),
		description: _.sample(__names),
		size: _.random(20, 30),
		children: []
	}

	var cond = _.random(0, 1)

	if (cond)
		data.children.push(getItems())

	return data

}

function getItems (min, max) {

	var min = min || 20
	var max = max || 30

	var data = []

	_.times(, function () {
		data.push(getItem())
	})

	count++

	console.log(data)

	return data
}
 
jsonfile.writeFile(file, data, {
	spaces: 4
}, function (err) {
  console.error(err)
})
