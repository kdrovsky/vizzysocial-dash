import React, { useEffect, useState, Fragment } from "react";
import Chart from "react-apexcharts";
import { monthNames } from "../helpers";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function GrowthChart({ isPrivate, sessionsData, days }) {
  const [followersData, setFollowersData] = useState([])
  const [categories, setCategories] = useState([])

  // useEffect(() => {
  //   let followersData = []
  //   let categories = []
  //   sessionsData?.slice(-days).forEach(items => {
  //     // console.log(items.start_time);
  //     const day = new Date((items?.start_time)?.replace(/-/g, "/")).getDate()
  //     const month = new Date((items?.start_time)?.replace(/-/g, "/")).getMonth()
  //     const monthName = monthNames[month]
  //     categories.push(`${monthName} ${day}`);
  //     followersData.push(items.profile.followers);
  //   })
  //   setCategories(categories);
  //   setFollowersData(followersData)

  // }, [sessionsData, days])
  
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
      followersData.push(items.profile.followers);
    });

    setCategories(categories);
    setFollowersData(followersData);
  }, [sessionsData, days]);

  

  const options = {
    dataLabels: {
      enabled: false,
    },
    // colors: ["#0087fe"],
    colors: ["#7ea5ff"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100]
      },
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
  }

  return (
    <div className="w-full rounded-lg">
      {isPrivate ? <h4 style={{ textAlign: 'center' }}><i className="fas fa-lock" /> This account is private</h4> :
        (
          <Fragment>
              <div>
                <div className="rounded-md text-gray20 w-full">
                  <div className="md:px-3">
                    <Chart
                      options={options}
          
                      series={[{
                        name: "Followers",
                        data: followersData
                      }]}
          
                      type="area"
                      height="400"
                    />
                  </div>
                </div>
              </div>
          </Fragment>
        )
      }
    </div>
  );
}
