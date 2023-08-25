import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { monthNames } from "../helpers";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ColumnChart({ type, sessionsData, days }) {
  const [followersData, setFollowersData] = useState([])
  const [categories, setCategories] = useState([])

  // useEffect(() => {
  //   let followersData = []
  //   let categories = []
  //   sessionsData?.slice(-days).forEach(items => {
  //     const day = new Date((items?.start_time)?.replace(/-/g, "/")).getDate()
  //     const month = new Date((items?.start_time)?.replace(/-/g, "/")).getMonth()
  //     const monthName = monthNames[month]
  //     categories.push(`${monthName} ${day}`);
  //     if(type === "total_interactions"){
  //       followersData.push(items.total_interactions);
  //       return;
  //     }
  //     followersData.push(items.profile[type]);
  //   })
  //   setCategories(categories);
  //   setFollowersData(followersData)

  // }, [sessionsData, days, type])
  
  useEffect(() => {
    let followersData = [];
    let categories = [];
    sessionsData?.slice(-days).forEach(items => {
      const dateParts = (items?.start_time)?.split(/[- :]/); // Split date string into parts
      // const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Adjust month (zero-based index)
      const day = parseInt(dateParts[2]);

      // const sessionDate = new Date(year, month, day); // Create Date object

      const monthName = monthNames[month];
      categories.push(`${monthName} ${day}`);

      let followerValue;
      if (type === "total_interactions") {
        followerValue = items.total_interactions;
      } else {
        followerValue = items.profile[type];
      }
      followersData.push(followerValue);
    });

    setCategories(categories);
    setFollowersData(followersData);
  }, [sessionsData, days, type]);


  var colors = ["#7ea5ff"]

  var options = {
    // series: [{
    //   data: [21, 22, 10, 28, 16, 21, 13, 30]
    // }],
    // chart: {
    //   height: 400,
    //   type: 'bar',
    //   events: {
    //     click: function (chart, w, e) {
    //       // console.log(chart, w, e)
    //     }
    //   }
    // },
    colors: colors,
    plotOptions: {
      bar: {
        columnWidth: '45%',
        distributed: true,
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      show: true,
      padding: {
        left: 0,
        right: 0,
      },
    },
    tooltip: {
      enabled: true,
    },
    chart: {
      id: "line",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories,
    },
    yaxis: {
      axisTicks: {
        show: true
      },
      labels: {
        offsetX: -15,
        offsetY: 0,
        formatter: function (val, index) {
          return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
        },
      },
    },
    // xaxis: {
    //   categories: [
    //     ['John', 'Doe'],
    //     ['Joe', 'Smith'],
    //     ['Jake', 'Williams'],
    //     'Amber',
    //     ['Peter', 'Brown'],
    //     ['Mary', 'Evans'],
    //     ['David', 'Wilson'],
    //     ['Lily', 'Roberts'],
    //   ],
    //   labels: {
    //     style: {
    //       colors: colors,
    //       fontSize: '12px'
    //     }
    //   }
    // }
  };

  return (
    <div className="w-full rounded-lg">
      <div className="rounded-md text-gray20 w-full">
        <div className="md:px-3">
          <Chart
            options={options}

            series={[{
              name: type === "total_interactions" ? "Interactions" : "Following",
              data: followersData
            }]}

            type="bar"
            height="400"
          />
        </div>
      </div>
    </div>
  );
}
