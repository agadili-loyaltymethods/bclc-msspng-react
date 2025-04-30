import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserCircle, ChevronDown } from 'lucide-react';
import { useMemberService } from '../../hooks/useMemberService';
import { useAuthService } from '../../hooks/useAuthService';
import { addMember, clearMember } from '../../redux/slices/memberSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import useAlertService from '@/hooks/useAlertService';
import { MdPersonSearch } from "react-icons/md";

export const Profile: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [loyaltyId, setLoyaltyId] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const memberInfo = useSelector((state: any) => state.member);
  const dispatch = useDispatch();
  const memberService = useMemberService();
  const alertService = useAlertService();
  const authService = useAuthService();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (memberInfo?.purses) {
      setLoyaltyId(memberInfo.loyaltyId);
      setTotalPoints(
        memberInfo.purses.find((x: any) => x.name === 'Anywhere Points')?.availBalance ?? 0
      );
    }
  }, [memberInfo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchMember = async () => {
    const oldVal = localStorage.getItem('loyaltyId');
    if (loyaltyId) {
      setIsFetching(true);
      try {
        const member = await memberService.getMember(loyaltyId);
        dispatch(addMember({ member }));
        localStorage.setItem('loyaltyId', loyaltyId);
        setDropdownOpen(false);
      } catch (error: any) {
        localStorage.setItem('loyaltyId', oldVal || '');
        setLoyaltyId(oldVal || '');
        alertService.errorAlert(error?.error?.error || error?.message);
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleLogout = () => {
    dispatch(clearMember());
    dispatch(clearCart());
    authService.logout();
  };

  return (
    <div className="relative flex items-center gap-2 w-[200px]" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded"
      >
        <UserCircle className="w-[32px] h-[32px] text-black" />
        <div className="flex flex-col items-start leading-none">
          <span className="text-[14px] text-[#000000] text-left mb-2">
            {memberInfo?.firstName} {memberInfo?.lastName}
          </span>
          <span className="text-[11px] text-[#000000] font-semibold flex flex-row items-center">
            {memberInfo?.tiers?.[0]?.level?.name} | {totalPoints.toLocaleString()}
            <ChevronDown className="w-[1.2rem] h-[1.2rem] ml-2 text-orange-500 stroke-[3]" />
          </span>
        </div>
      </button>

      {dropdownOpen && (
        <div className="absolute left-10 top-[3.8rem] z-20 w-[250px] bg-white border border-gray-200 rounded-md shadow-md p-3">
          <div className="relative">
            <label
              className={`absolute left-3 px-1 z-10 bg-white text-xs hover:text-[#000000] focus:text-[red] transition-all duration-200 -top-2 text-gray-500
          ${isFocused ? 'text-orange-500' : 'text-gray-500'}
        `}
            >
              Switch Member
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              value={loyaltyId}
              disabled={isFetching}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setLoyaltyId(e.target.value)}
              className="w-full rounded-sm border-1 border-gray-500 hover:border-[#000000] px-3 py-3 text-sm text-gray-800 focus:ring-orange-500 focus:border-orange-500 pr-10"
            />
            <MdPersonSearch
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-orange-500 cursor-pointer"
              onClick={handleSwitchMember}
            />
          </div>
        </div>
      )}
    </div>
  );
};
