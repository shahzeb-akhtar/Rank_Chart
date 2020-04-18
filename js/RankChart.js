/*
Creates an interactive Rank Chart
	inputs:
		divElement - d3 selection of div in which to creat chart
		dataArr - data to be charted
			'Year', 'Rank', and 'Name' are required columns. 'Value' column can also be present
		title - Title for the chart
*/
function RankChart(divElement, dataArr, title = 'Rank Chart'){
	let resizeTimer,
		mouseTimer,
		wSvg,
		isMobile = false,
		hSvg,
		svgElem,
		otherGElem,
		latestTopNamesArr = [],
		otherNamesArr = [],
		years = [],
		nameRankObj = {},
		topRank = 1,
		bottomRank = 0,
		scaleX = d3.scaleLinear(),
		scaleY = d3.scaleLinear(),
		parentResizeFunction,
		marginPercent = {top:0.005, right:0.25, bottom:0.1, left:0.025};
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		isMobile = true;
	}	
	const colors10 = d3.schemeCategory10;
	const line = d3.line()
					.defined(d => !isNaN(d[0]))
					.x(d => d[0])
					.y(d => d[1]);
	
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
		let w = divElement.node().clientWidth,
			h = divElement.node().clientHeight;
		
		// append title
		let titleElement = divElement.append("h2").style("font-size", (h/25)).text(title);
		
		// calculate width and height of svg
		wSvg = w;
		hSvg = h - titleElement.node().scrollHeight;

		if(wSvg < 100){
			wSvg = 100;
		}
		if(hSvg < 100){
			hSvg = 100;
		}
		if(hSvg > wSvg){
			hSvg = wSvg;
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
			if(allDataNames.indexOf(dd.Name) < 0){
				allDataNames.push(dd.Name);
			}
			if(!yearWiseNames[dd.Year]){
				yearWiseNames[dd.Year] = [dd.Name];
			}else{
				yearWiseNames[dd.Year].push(dd.Name);
			}
			obj = {'Rank':dd.Rank}
			if(dd.Value){
				obj['Value'] = dd.Value;
			}
			if(!nameRankObj[dd.Name]){
				nameRankObj[dd.Name] = {};
				nameRankObj[dd.Name][dd.Year] = obj
			}else{
				nameRankObj[dd.Name][dd.Year] = obj
			}
			if(dd.Rank > bottomRank){
				bottomRank = dd.Rank;
			}
		});
		years.sort();
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
	
	function namesMouseOver(d){
		if(isMobile && mouseTimer){
			clearTimeout(mouseTimer);
		}
		svgElem.selectAll("g.viz_g").each(function(dIn, di){
			if(dIn.name === d.name){
				d3.select(this).raise()
					.style("opacity", 1);
				d3.select(this).selectAll(".hidden_text").style("display", null);
			}else{
				d3.select(this).style("opacity", 0.1);
			}
		});
		if(otherNamesArr.indexOf(d.name) >= 0){
			// show name
			otherGElem.select("text").text(d.name);
			otherGElem.style("opacity", 1).style("display", null);
		}
		if(isMobile){
			mouseTimer = setTimeout(namesMouseOut, 2000);
		}		
	}
	
	function namesMouseOut(d){
		svgElem.selectAll("g.viz_g").each(function(dIn, di){
			d3.select(this).style("opacity", 0.8);
			d3.select(this).selectAll(".hidden_text").style("display", "none");
		});
		otherGElem.style("display", "none");
	}
	
	function createChart(){
		let strokeWidth = (hSvg*0.15)/latestTopNamesArr.length;
		let circleStrokeWidth = strokeWidth/5;
		let rectHeight = hSvg/(latestTopNamesArr.length * 2.5);
		let fontSize = hSvg/40;
		svgElem = divElement.append("svg").attr("width", wSvg).attr("height", hSvg);
		latestTopNamesArr.forEach(function(tn, ti){
			let g = svgElem.append("g")
							.attr("class", "viz_g")
							.datum({"name":tn})
							.style("opacity", 0.8)
							.on("mouseover", namesMouseOver)
							.on("mouseout", namesMouseOut);
			
			// create lines data
			let linePoints = []
			years.forEach(function(ye, yi, thisArr){
				if(nameRankObj[tn][ye]){
					linePoints.push([scaleX(ye), scaleY(nameRankObj[tn][ye]['Rank'])]);
					// for last year it will always exist for latest top name
					if(yi === thisArr.length - 1){
						// append rect for name
						g.append("rect")
							.attr("x", scaleX(ye))
							.attr("y", scaleY(nameRankObj[tn][ye]['Rank']) - (rectHeight/2))
							.attr("width", wSvg*0.95 - scaleX(ye))
							.attr("height", rectHeight)
							.attr("rx", rectHeight*0.1)
							.style("fill", colors10[ti%10]);
						
						// append name
						g.append("text")
							.attr("x", scaleX(ye) + (rectHeight/2) + 5)
							.attr("y", scaleY(nameRankObj[tn][ye]['Rank']))
							.attr("text-anchor", "start")
							.attr("dominant-baseline", "central")
							.style("font-size", fontSize)
							.text(tn);
						
						//append circle and rank
						g.append("circle")
							.attr("cx", scaleX(ye))
							.attr("cy", scaleY(nameRankObj[tn][ye]['Rank']))
							.attr("r", (rectHeight/2))
							.attr("stroke", colors10[ti%10])
							.attr("stroke-width", circleStrokeWidth)
							.style("fill", "white");
							
						g.append("text")
							.attr("x", scaleX(ye))
							.attr("y", scaleY(nameRankObj[tn][ye]['Rank']))
							.attr("text-anchor", "middle")
							.attr("dominant-baseline", "central")
							.style("font-size", fontSize)
							.text(nameRankObj[tn][ye]['Rank']);
					}else{
						// append other circles
						g.append("circle")
							.attr("cx", scaleX(ye))
							.attr("cy", scaleY(nameRankObj[tn][ye]['Rank']))
							.attr("r", (rectHeight/3))
							.attr("stroke", colors10[ti%10])
							.attr("stroke-width", circleStrokeWidth)
							.style("fill", "white");
						
						// other ranks which would normally be hidden					
						g.append("text")
							.attr("x", scaleX(ye))
							.attr("y", scaleY(nameRankObj[tn][ye]['Rank']))
							.attr("text-anchor", "middle")
							.attr("dominant-baseline", "central")
							.attr("class", "hidden_text")
							.style("display", "none")
							.style("font-size", fontSize)
							.text(nameRankObj[tn][ye]['Rank']);	
					}
				}else{
					linePoints.push(['no_data']);
				}
			});
			
			// append the line
			g.append("path")
			  .datum(linePoints)
			  .attr("stroke", colors10[ti%10])
			  .attr("stroke-width", strokeWidth)
			  .attr("stroke-linecap","round")
			  .attr("stroke-linejoin", "round")
			  .attr("fill", "none")
			  .attr("d", line);
			  
			// raise the circles and text
			g.selectAll("circle").raise();
			g.selectAll("text").raise();
		});
		
		otherNamesArr.forEach(function(on, oi){
			let g = svgElem.append("g")
							.datum({"name":on})
							.style("opacity", 0.8)
							.attr("class", "viz_g")
							.on("mouseover", namesMouseOver)
							.on("mouseout", namesMouseOver);
							
			years.forEach(function(ye, yi, thisArr){
				if(nameRankObj[on][ye]){
					// append other circles
					g.append("circle")
						.attr("cx", scaleX(ye))
						.attr("cy", scaleY(nameRankObj[on][ye]['Rank']))
						.attr("r", (rectHeight/3))
						.attr("stroke", "black")
						.attr("stroke-width", circleStrokeWidth)
						.style("fill", "white");
					
					// other ranks which would normally be hidden					
					g.append("text")
						.attr("x", scaleX(ye))
						.attr("y", scaleY(nameRankObj[on][ye]['Rank']))
						.attr("text-anchor", "middle")
						.attr("dominant-baseline", "central")
						.attr("class", "hidden_text")
						.style("display", "none")
						.style("font-size", fontSize)
						.text(nameRankObj[on][ye]['Rank']);	
				}
			});			
		});
		if(otherNamesArr.length > 0){
			otherGElem = svgElem.append("g")
								.style("display", "none");
			
			// append a hidden rectangle for other names
			otherGElem.append("rect")
							.attr("x", scaleX(d3.max(years)))
							.attr("y", scaleY(bottomRank + 0.5) - (rectHeight/2))
							.attr("width", wSvg*0.95 - scaleX(d3.max(years)))
							.attr("height", rectHeight)
							.attr("rx", rectHeight*0.1)
							.style("fill", "black");
						
			// append name
			otherGElem.append("text")
					.attr("x", scaleX(d3.max(years)) + (rectHeight/2) + 5)
					.attr("y", scaleY(bottomRank + 0.5))
					.attr("text-anchor", "start")
					.attr("dominant-baseline", "central")
					.style("font-size", fontSize)
					.style("fill", "white");
		}
		// create axis
		axisX = d3.axisBottom().scale(scaleX).tickFormat(d3.format("d"));
		svgElem.append("g")
				.style("font-size", fontSize)
				.attr("transform","translate(0,"+ (hSvg*(1 - marginPercent.bottom)) +")")
				.call(axisX);
	}
	understandData();
	resize();
}