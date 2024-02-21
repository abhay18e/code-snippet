"use client";
import React, { useRef } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  minValue?: number;
  minChange?: number;
  maxChange?: number;
  fPrecision?: number;
}

export default function NumberInput({
  value,
  onChange,
  maxValue = Number.MAX_VALUE,
  minValue = Number.NEGATIVE_INFINITY,
  minChange = 1,
  maxChange = 20,
  fPrecision = 0,
}: NumberInputProps) {
  const FIRST_INTERVAL_TIME = 190; // ms
  const INTERVAL_TIME = 10; // ms
  const CHNAGE_RANGE_TIME = 8000; // time for changeValue to range from min to max change value

  const timerId = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const sign = useRef<number>(1);
  const valueRef = useRef(value);
  valueRef.current = value;

  function calculateChangeValue(elapsedTime: number): number {
    const x = elapsedTime / CHNAGE_RANGE_TIME;
    if (x > 1) {
      return maxChange;
    }
    const y = cubicBezierLerp(x);
    const diff = maxChange - minChange;
    const changeValue = minChange + diff * y;
    return changeValue;
  }

  function parseAndValidateNumber(num: number): number {
    // Parse the number according to fPrecision
    let parsedNum =
      fPrecision > 0 ? parseFloat(num.toFixed(fPrecision)) : Math.floor(num);

    // Check if the number is within the range
    if (parsedNum < minValue) {
      return minValue;
    } else if (parsedNum > maxValue) {
      return maxValue;
    } else {
      return parsedNum;
    }
  }

  function updateNumber() {
    if (startTime.current !== null) {
      let elapsedTime = performance.now() - startTime.current;
      const changeValue = calculateChangeValue(elapsedTime) * sign.current;
      let newValue = valueRef.current + changeValue;
      newValue = parseAndValidateNumber(newValue);
      onChange(newValue);

      timerId.current = setTimeout(updateNumber, INTERVAL_TIME);
    }
  }

  const startUpdate = (
    e: React.MouseEvent | React.TouchEvent,
    _sign: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    startTime.current = performance.now();
    sign.current = _sign;
    timerId.current = setTimeout(updateNumber, FIRST_INTERVAL_TIME);
  };

  const stopUpdate = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (startTime.current) {
      const elapsedTime = performance.now() - startTime.current;
      if (elapsedTime < FIRST_INTERVAL_TIME) {
        let newValue = valueRef.current + minChange * sign.current;
        newValue = parseAndValidateNumber(newValue);
        onChange(newValue);
      }
      startTime.current = 0;
    }

    if (timerId.current !== null) {
      clearTimeout(timerId.current);
    }
  };

  return (
    <div className="flex flex-row items-center space-x-1 w-full bg-gradient-to-b from-white to-blue-50 p-1  rounded-md  box-border m-0">
      <button
        className=" select-none bg-gradient-to-b py-1  from-blue-400  to-blue-700 text-white rounded flex-grow flex-shrink w-10 flex-auto"
        onMouseDown={(e) => startUpdate(e, -1)}
        onMouseUp={stopUpdate}
        onTouchStart={(e) => startUpdate(e, -1)}
        onTouchEnd={stopUpdate}
        onTouchCancel={stopUpdate}
      >
        -
      </button>
      <input
        className="border flex-grow bg-gradient-to-b from-white to-gray-300 rounded-md box-border py-1 flex-shrink flex-auto w-10 text-center"
        type="number"
        value={value}
        disabled
        onChange={(e) => onChange(Number(e.target.value))}
      />

      <button
        className=" select-none bg-gradient-to-b py-1   from-blue-400  to-blue-700 text-white rounded-md flex-grow flex-shrink w-10 flex-auto"
        onMouseDown={(e) => startUpdate(e, 1)}
        onMouseUp={stopUpdate}
        onTouchStart={(e) => startUpdate(e, 1)}
        onTouchEnd={stopUpdate}
        onTouchCancel={stopUpdate}
      >
        +
      </button>
    </div>
  );
}

//UTil function

function cubicBezierLerp(x: number): number {
  const easeInEaseOutPoints = [
    { x: 0, y: 0 },
    { x: 0.42, y: 0 },
    { x: 0.58, y: 1 },
    { x: 1, y: 1 },
  ];
  const [p0, p1, p2, p3] = easeInEaseOutPoints;
  const t = x; // Assuming x is the 't' value
  const y =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y;
  return y;
}
