"use client";

import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export const navigation = [
  {
    id: 1,
    title: 'Home',
    link: '/dashboard',
    icon: '/icons/home_ic.png',
  },
  {
    id: 2,
    title: 'Marketplace',
    link: '/marketplace',
    icon: '/icons/marketplace_ic.png',
  },
  {
    id: 3,
    title: 'Favorites',
    link: '/favorites',
    icon: '/icons/favorites_ic.png',
  },
  {
    id: 4,
    title: 'Chatbot',
    link: '/chatbot',
    icon: '/icons/chat_ic.png',
  },
  {
    id: 5,
    title: 'Profile',
    link: '/profil',
    icon: '/icons/user_ic.png',
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<number | null>(null);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const currentItem = navigation.find((item) => item.link === pathname);
    if (currentItem && prevPathRef.current !== pathname) {
      setActiveId(currentItem.id);
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const NavLink = ({
    href,
    icon,
    label,
    id,
  }: {
    href: string;
    icon: string;
    label: string;
    id: number;
  }) => {
    const active = isActive(href);
    
    return (
      <Link href={href} className="block w-full">
        <div className="relative">
          {/* Background container */}
          {active && (
            <div
              key={`bg-${id}-${pathname}`}
              className="absolute inset-x-0 -top-2 -bottom-2 -mx-6 bg-teal-800/10 rounded-xl"
            />
          )}
          {/* Content container */}
          <div
            className={`flex items-center relative gap-6 py-2 px-4 transition-colors ${
              active ? 'text-teal-800' : 'text-gray-800 hover:text-teal-600'
            }`}
          >
            <img src={icon} alt={label} className="w-6 h-6" />
            <span className="text-xl">{label}</span>
            {active && (
              <div
                key={`indicator-${id}-${pathname}`}
                className="absolute right-[-24px] top-1/2 -translate-y-1/2 h-6.5 w-1.5 bg-[#1FA98D] rounded-l"
              />
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-70 bg-teal-100 p-6 flex flex-col gap-8 overflow-y-auto">
      <div className="flex justify-center items-center mb-12">
        <div className="text-teal-500">
          <img src="/icons/CalorEase.png" alt="Logo" className="h-15 w-45" />
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        {navigation.map((item) => (
          <NavLink
            key={item.id}
            href={item.link}
            icon={item.icon}
            label={item.title}
            id={item.id}
          />
        ))}
      </nav>

      <div className="mt-auto">
        <Link href="/logout">
          <div className="flex items-center gap-8 text-gray-800 hover:text-teal-600 transition-colors py-2 px-4">
            <img src="/icons/logout_ic.png" alt="Logout" className="w-6 h-6" />
            <span className="text-xl">Logout</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;