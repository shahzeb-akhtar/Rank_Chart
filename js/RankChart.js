/*
Creates an interactive Rank Chart
	inputs:
		divElement - d3 selection of div in which to creat chart
		dataArr - data to be charted
			'Year', 'Rank', and 'Data' are required columns. 'Value' column can also be present
		title - Title for the chart
*/
function RankChart(divElement, dataArr, title = 'Rank Chart'){
	let resizeTimer,
		wSvg,
		hSvg,
		latestTopNamesArr = [],
		otherNamesArr = [],
		years = [],
		nameRankObj = {},
		topRank = 1,
		bottomRank = 0,
		scaleX = d3.scaleLinear(),
		scaleY = d3.scaleLinear(),
		parentResizeFunction,
		marginPercent = {top:0.1, right:0.2, bottom:0.1, left:0.1};
	
	const line = d3.line()
					.defined(d => !isNaN(d[0]))
					.x(d => scaleX(d[0]))
					.y(d => scaleY(d[1]));
	
	divElement.style('font-family', 'Helvetica');
	
	// check if there is already a resize function
	if(d3.select(window).on('resize')){
		parentResizeFunction = d3.select(window).on('resize');
	}
	
	d3.select(window).on('resize', function(){
		if(resizeTimer){
			clearTimeout(resizeTimer);
		}
		resizeTimer = setTimeout(resize, 100);
		if(parentResizeFunction){
			parentResizeFunction();
		}
	});
	
	function resize(){
		// remove previous chart, if any
		divElement.selectAll("*").remove();
		
		// append title
		let titleElement = divElement.append("h2").text(title);
		
		// calculate width and height of svg
		wSvg = divElement.node().clientWidth;
		hSvg = divElement.node().clientHeight - titleElement.node().clientHeight;
		if(hSvg < 100){
			hSvg = 100;
		}
		if(wSvg < 100){
			wSvg = 100;
		}
		scaleX.range([marginPercent.left*wSvg, wSvg - (marginPercent.right*wSvg)]);
		scaleY.range([marginPercent.top*hSvg, hSvg - (marginPercent.bottom*hSvg)]);
		createChart();
	}
	
	function understandData(){
		let allDataNames = [], 
			yearWiseNames = {},
			latestYear,
			obj;
			
		data.forEach(function(dd, di){
			if(years.indexOf(dd.Year) < 0){
				years.push(dd.Year);
			}
			if(allDataNames.indexOf(dd.Data) < 0){
				allDataNames.push(dd.Data);
			}
			if(!yearWiseNames[dd.Year]){
				yearWiseNames[dd.Year] = [dd.Data];
			}else{
				yearWiseNames[dd.Year].push(dd.Data);
			}
			obj = {'Rank':dd.Rank}
			if(dd.Value){
				obj['Value'] = dd.Value;
			}
			if(!nameRankObj[dd.Data]){
				nameRankObj[dd.Data] = {};
				nameRankObj[dd.Data][dd.Year] = obj
			}else{
				nameRankObj[dd.Data][dd.Year] = obj
			}
			if(dd.Rank > bottomRank){
				bottomRank = dd.Rank;
			}
		});
		latestYear = d3.max(years);
		latestTopNamesArr = yearWiseNames[latestYear];
		allDataNames.forEach(function(dd, di){
			if(latestTopNamesArr.indexOf(dd) < 0){
				otherNamesArr.push(dd);
			}
		});
		scaleX.domain(d3.extent(years));
		scaleY.domain([topRank - 0.5, bottomRank + 0.5]);
	}
	
	function createChart(){
		// create circles for all latest year name
		let svgElem = divElement.append("svg").attr("width", wSvg).attr("height", hSvg);
		latestTopNamesArr.forEach(function(tn, ti){
			years.forEach(function(ye, yi){
				if(nameRankObj[tn][ye]){
					svgElem.append("circle")
							.attr("cx", scaleX(ye))
							.attr("cy", scaleY(nameRankObj[tn][ye]['Rank']))
							.attr("r", 5)
				}
			});
		});
		
	}
	understandData();
	resize();
}