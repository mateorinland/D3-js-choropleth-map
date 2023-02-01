const body = d3.select("body");
const svg = d3.select("svg");
const tooltip = body
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

const path = d3.geoPath();

//x axis
const xScale = d3
  .scaleLinear()
  .domain([2.6, 75.1])
  .rangeRound([600, 860]);

const color = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeBlues[9]);

const legend = svg
  .append("g")
  .attr("class", "key")
  .attr("id", "legend")
  .attr("transform", "translate(0,40)");

legend
  .selectAll("rect")
  .data(
    color.range().map((d) => {
      d = color.invertExtent(d);
      if (d[0] === null) {
        d[0] = xScale.domain()[0];
      }
      if (d[1] === null) {
        d[1] = xScale.domain()[1];
      }
      return d;
    })
  )
  .enter()
  .append("rect")
  .attr("height", 10)
  .attr("x", (d) => xScale(d[0]))
  .attr("width", (d) => {
    return d[0] && d[1] ? xScale(d[1]) - xScale(d[0]) : xScale(null);
  })
  .attr("fill", (d) => color(d[0]));

  legend
    .append("text")
    .attr("class", "caption")
    .attr("x", xScale.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold");

  legend.call(
    d3
      .axisBottom(xScale)
      .tickSize(13)
      .tickFormat((num) => Math.round(num) + "%")
      .tickValues(color.domain())
    )
    .select(".domain")
    .remove();

const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(educationURL), d3.json(countyURL)])
  .then(data => CreateMap(data[0], data[1]))
  .catch(err => console.log(err));

const CreateMap = (education, counties) => {
  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(counties, counties.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => {
      const filtered = education.filter((obj) => obj.fips === d.id);
      if (filtered[0]) {
        return filtered[0].bachelorsOrHigher;
      }
      return 0;
    })
    .attr("fill", (d) => {
      const filtered = education.filter((obj) => obj.fips === d.id);
      if (filtered[0]) {
        return color(filtered[0].bachelorsOrHigher);
      }
      return color(0);
    })
    .attr("d", path)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 0.9)
        .html(() => {
          const filtered = education.filter((obj) => obj.fips === d.id);
          if (filtered[0]) {
            return (
              filtered[0]["area_name"] +
              ", " +
              filtered[0]["state"] +
              ": " +
              filtered[0].bachelorsOrHigher +
              "%"
            );
          }
          return 0;
        })
        .attr("data-education", () => {
          const filtered = education.filter((obj) => obj.fips === d.id);
          if (filtered[0]) {
            return filtered[0].bachelorsOrHigher;
          }
          return 0;
        })
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
     })
     .on("mouseout", () => {
       tooltip.style("opacity", 0);
     })
  
  svg
    .append("path")
    .datum(
      topojson.mesh(counties, counties.objects.states, (a, b) => a !== b)
    )
    .attr("class", "states")
    .attr("d", path);
}
