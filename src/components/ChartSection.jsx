import React, { Fragment } from 'react'
import GrowthChart from './GrowthChart';

const ChartSection = ({ isPrivate, sessionsData, days }
) => {
  
  return (
    <div className="w-full rounded-lg">
      {isPrivate ? <h4 style={{ textAlign: 'center' }}><i className="fas fa-lock" /> This account is private</h4> :
        (
          <Fragment>
              {/* <div className="mt-12"> */}
              {/* <div className=""> */}
            <GrowthChart isPrivate={isPrivate} currFollowers={2213} sessionsData={sessionsData} days={days} />
              {/* </div> */}
          </Fragment>
        )
      }
    </div>
  )
}


export default ChartSection
