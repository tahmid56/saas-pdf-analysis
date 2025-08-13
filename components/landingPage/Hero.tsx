"use client";
import React from 'react'

const rings = [
    {width: 400, opacity: 0.7},
    {width: 500, opacity: 0.5},
    {width: 700, opacity: 0.4},
    {width: 900, opacity: 0.3},
    {width: 1200, opacity: 0.2},
]

const Hero = () => {
  return (
    <div className='relative overflow-hidden flex flex-col items-center justify-center'>
      <div>
        <div>
            {rings.map((ring, index) => (
                <div key={index} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-300/20 shadow-[0_0_150px_inset] shadow-purple-200/10`}
                    style={{
                        width: `${ring.width}px`,
                        height: `${ring.width}px`,
                        opacity: ring.opacity
                    }}
                >
                </div>    
            ))}
        </div>
      </div>
    </div>
  )
}

export default Hero