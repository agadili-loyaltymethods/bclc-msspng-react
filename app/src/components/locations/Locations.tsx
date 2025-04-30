import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { useLocationService } from '../../hooks/useLocationService';
import { setLocation } from '../../redux/slices/locationSlice';
import useAlertService from '@/hooks/useAlertService';
import { FaCaretDown } from "react-icons/fa";

export const Locations: React.FC = () => {
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [displayLocation, setDisplayLocation] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const locationService = useLocationService();
  const alertService = useAlertService();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      getLocations();
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocations = async () => {
    try {
      const locations = await locationService.getLocations();
      const filteredLocations = locations.filter(
        (location: any) => !location?.ext?.hideInMSSP
      ).map((location: any) => ({ ...location, displayLocation: (location.ext.operator && location.ext.operator !== 'PlayNow' ? location.ext.operator + ' - ' : '') + location.name }));
      setAllLocations(filteredLocations);
      setSelectedLocation(filteredLocations[0].name);
      dispatch(setLocation({ location: filteredLocations[0].number }));
      setDisplayLocation(filteredLocations[0].displayLocation);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    }
  };

  const handleLocationChange = (locationName: string) => {
    const location = allLocations.find(loc => loc.name === locationName);
    if (location) {
      dispatch(setLocation({ location: location.number }));
      setSelectedLocation(locationName);
      setDisplayLocation(location.displayLocation);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % allLocations.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => (prev - 1 + allLocations.length) % allLocations.length);
        break;
      case 'Enter':
        e.preventDefault();
        const selected = allLocations[highlightIndex];
        if (selected) {
          handleLocationChange(selected.name);
          setOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  if (!allLocations.length) return null;

  return (
    <div ref={containerRef} className="w-[230px] relative">
      {/* Floating Label */}
      <label
        className={`absolute left-3 px-1 z-10 bg-white text-xs transition-all duration-200
          ${isFocused ? '-top-2 text-orange-500' : '-top-2 text-gray-400'}
        `}
      >
        Property Name
      </label>

      {/* Trigger Button */}
      <div
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className={`flex items-center border rounded-md px-3 py-[0.5rem] bg-white cursor-pointer
           focus:border-orange-500  focus:outline-none focus:ring-1 focus:ring-orange-500
          ${(isFocused || open) ? 'border-orange-500' : 'border-[#000000]'}
        `}
      >
        {/* <MapPin className="w-4 h-4 text-orange-500 mr-2 shrink-0" /> */}


        <svg version="1.0"
          width="18.000000pt" height="18.000000pt" viewBox="0 0 18.000000 18.000000">
          <g transform="translate(0.000000,18.000000) scale(0.0200000,-0.0200000)"
            fill="#000000" stroke="none">
            <path d="M221 837 c-49 -19 -108 -72 -133 -120 -15 -31 -21 -59 -20 -109 0
                      -79 19 -125 90 -221 25 -34 64 -96 87 -137 52 -98 66 -98 114 -5 20 39 54 95
                      77 125 86 117 99 147 99 236 0 72 -3 86 -30 129 -43 69 -105 106 -187 111 -36
                      2 -77 -2 -97 -9z m167 -94 c42 -31 64 -68 69 -116 7 -63 -8 -101 -86 -211
                      l-69 -97 -65 93 c-85 123 -89 131 -89 193 -1 100 69 169 165 162 27 -3 60 -13
                      75 -24z"/>
            <path d="M252 675 c-48 -40 -44 -103 9 -130 42 -22 67 -18 101 15 25 26 29 36
                      24 63 -8 40 -32 65 -72 73 -24 4 -37 0 -62 -21z"/>
            <path d="M118 248 c-80 -46 -72 -120 16 -165 40 -20 70 -27 142 -31 158 -8
                      264 41 264 122 0 31 -6 40 -42 66 -22 16 -46 30 -53 30 -6 0 -17 -16 -23 -36
                      -10 -33 -9 -36 14 -46 13 -6 24 -15 24 -19 0 -31 -215 -47 -277 -20 -37 15
                      -42 30 -13 38 22 6 25 19 10 57 -11 31 -15 31 -62 4z"/>
          </g>
        </svg>
        <span className="truncate text-sm text-gray-900 flex-1">{displayLocation}</span>
        {/* <ChevronDown className="w-4 h-4 text-orange-500" /> */}
        <FaCaretDown className={`w-4 h-4 ${(isFocused || open) ? 'text-orange-500' : 'text-gray-500'}`}></FaCaretDown>
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-md max-h-[20rem] overflow-y-auto"
        >
          {allLocations.map((location, idx) => (
            <li
              key={idx}
              role="option"
              aria-selected={location.name === selectedLocation}
              onClick={() => {
                handleLocationChange(location.name);
                setOpen(false);
              }}
              className={`flex items-start px-3 py-2 cursor-pointer
                ${idx === highlightIndex ? 'bg-[#0000000A]' : ''}
                ${location.name === selectedLocation
                  ? 'text-[#ff8201] font-semibold'
                  : 'text-[#000000DE]'}
                hover:bg-[#0000000A]
              `}
            >
              <div className="flex flex-row">
                <div className="w-90">
                  <span className="text-sm leading-[1] text-left">{location.displayLocation}</span>
                </div>
                {location.name === selectedLocation && (
                  // <Check className="w-5 h-5 mt-1 mr-1 text-orange-500" />
                  <div className="w-10 flex flex-row justify-end">
                    <Check className="w-5 h-5 mt-1 text-orange-500 stroke-[3]" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};