//draw table
function drawTable(data,object){

	if(data.length == 0){
		return false;
	}

	var table = d3.select("#" + object).append("table");
	var titles = d3.keys(data[0]);
	var headers = table.append('thead').append('tr')
		.selectAll('th')
		.data(titles).enter()
		.append('th')
		.text(function (d){
			return d;
		})

	var rows = table.append("tbody").selectAll('tr')
		.data(data).enter()
		.append('tr')

	var cells = rows.selectAll('td')
		.data(function(d){
			return titles.map(function(k){
				return {'value':d[k],'name':k};
			});
		}).enter()
		.append('td')
		.text(function(d){
			return d.value;
		})

	return true;
}