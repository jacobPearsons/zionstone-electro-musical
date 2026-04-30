'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const isEnding = timeLeft.days === 0 && timeLeft.hours < 1;

  if (isExpired) {
    return (
      <div className="text-center py-4">
        <span className="text-lg font-bold text-red-600">Deal Expired</span>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <div className={`flex items-center gap-2 ${isEnding ? 'text-red-600 animate-pulse' : ''}`}>
      <span className="text-sm font-medium">Ends in:</span>
      <div className="flex gap-1">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            <div className={`flex flex-col items-center ${index > 0 ? 'border-l pl-2' : ''}`}>
              <span className={`text-2xl font-bold ${isEnding ? 'text-red-600' : ''}`}>
                {unit.value.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground uppercase">{unit.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FlashDealProps {
  productName: string;
  originalPrice: number;
  salePrice: number;
  endDate: Date;
  stockPercentage?: number;
}

export function FlashDealCard({ productName, originalPrice, salePrice, endDate, stockPercentage = 0 }: FlashDealProps) {
  const discount = Math.round((1 - salePrice / originalPrice) * 100);
  const savings = originalPrice - salePrice;

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
          {discount}% OFF
        </div>
        <CountdownTimer endDate={endDate} />
      </div>
      
      <h3 className="font-semibold text-lg mb-2">{productName}</h3>
      
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-red-600">${salePrice}</span>
        <span className="text-muted-foreground line-through">${originalPrice}</span>
      </div>
      
      <p className="text-sm text-green-600 font-medium mb-4">
        You save ${savings.toFixed(2)}
      </p>
      
      {stockPercentage > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{stockPercentage}% Sold</span>
            <span className="text-red-600 font-medium">Hurry!</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}