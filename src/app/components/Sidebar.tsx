'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Chatbot from './Chatbot';
import { useAuth } from '../context/AuthContext';
import { useChatbot } from '../context/ChatbotContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

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
    link: '#',
    icon: '/icons/chat_ic.png',
    action: 'chatbot',
  },
  {
    id: 5,
    title: 'Profile',
    link: '/profile',
    icon: '/icons/user_ic.png',
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { isOpen: isChatbotOpen, toggleChatbot } = useChatbot();
  const [activeId, setActiveId] = useState<number>(1);
  const [isChatbotSelected, setIsChatbotSelected] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const prevPathRef = useRef<string | null>(null);
  const prevActiveIdRef = useRef<number>(1); // Store the previous activeId before opening chatbot

  // Determine which navigation item is active
  const getActiveItemId = (currentPath: string): number => {
    console.log('Current path:', currentPath);

    // Handle recipe detail page
    if (currentPath.startsWith('/recipe/')) {
      console.log('Recipe detail page - setting Home as active');
      return 1; // Home (dashboard) remains active
    }

    // Exact matches
    const exactMatch = navigation.find((item) => item.link === currentPath);
    if (exactMatch) {
      console.log('Exact match found:', exactMatch.title);
      return exactMatch.id;
    }

    // Other route patterns
    if (currentPath.startsWith('/menu/food/')) {
      return 2; // Marketplace
    }
    if (currentPath.startsWith('/favorites/')) {
      return 3; // Favorites
    }
    if (currentPath.startsWith('/profile/')) {
      return 5; // Profile
    }

    console.log('No match found - defaulting to Home');
    return 1;
  };

  useEffect(() => {
    console.log('useEffect triggered, pathname:', pathname);
    if (!isChatbotOpen) {
      // Only update activeId based on pathname if chatbot is not open
      const activeItemId = getActiveItemId(pathname);
      console.log('Setting activeId to:', activeItemId);
      setActiveId(activeItemId);
      prevActiveIdRef.current = activeItemId; // Update prevActiveIdRef when navigating
      setIsChatbotSelected(false); // Ensure chatbot is not selected when navigating
    }
    prevPathRef.current = pathname;
  }, [pathname, isChatbotOpen]);

  const handleNavClick = (item: typeof navigation[0], e: React.MouseEvent) => {
    if (item.action === 'chatbot') {
      e.preventDefault();
      toggleChatbot(); // Toggle global chatbot
      setIsChatbotSelected(true); // Select chatbot
      setHasNotification(false); // Clear notification
      prevActiveIdRef.current = activeId; // Store the current activeId before switching
      setActiveId(item.id); // Set activeId to Chatbot's ID (4)
    }
  };

  const handleChatToggle = () => {
    toggleChatbot(); // Toggle global chatbot
    if (!isChatbotOpen) {
      // Opening the chatbot
      setHasNotification(false);
      setIsChatbotSelected(true);
      prevActiveIdRef.current = activeId; // Store the current activeId
      setActiveId(4); // Set activeId to Chatbot's ID (4)
    } else {
      // Closing the chatbot
      setIsChatbotSelected(false);
      const activeItemId = getActiveItemId(pathname); // Recalculate based on current path
      setActiveId(activeItemId); // Restore to the active page
      prevActiveIdRef.current = activeItemId; // Update prevActiveIdRef
    }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogoutDialogOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error.message);
    } finally {
      setIsLogoutDialogOpen(false);
    }
  };

  const handleCancelLogout = () => {
    setIsLogoutDialogOpen(false);
  };

  const NavLink = ({
    href,
    icon,
    label,
    id,
    action,
  }: {
    href: string;
    icon: string;
    label: string;
    id: number;
    action?: string;
  }) => {
    const active = (action === 'chatbot' && isChatbotSelected) || (!action && activeId === id);

    const content = (
      <div className="relative">
        {active && (
          <div
            key={`bg-${id}-${pathname}`}
            className="absolute inset-x-0 -top-2 -bottom-2 -mx-6 bg-teal-800/10 rounded-xl cursor-pointer"
          />
        )}
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
    );

    if (action === 'chatbot') {
      return (
        <button
          onClick={(e) => handleNavClick({ id, title: label, link: href, icon, action }, e)}
          className="block w-full text-left cursor-pointer"
        >
          {content}
        </button>
      );
    }

    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    );
  };

  return (
    <>
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
              action={item.action}
            />
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogoutClick}
            className="block w-full text-left"
          >
            <div className="flex items-center gap-8 text-gray-800 hover:text-teal-600 transition-colors py-2 px-4 cursor-pointer">
              <img src="/icons/logout_ic.png" alt="Logout" className="w-6 h-6" />
              <span className="text-xl">Logout</span>
            </div>
          </button>
        </div>
      </div>

      {isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Konfirmasi Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari akun Anda?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelLogout}
                className="px-6 py-2 border border-teal-500 text-teal-500 rounded-md hover:bg-teal-50 transition-colors font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 active:bg-teal-700 transition-colors font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot
        isOpen={isChatbotOpen}
        onToggle={handleChatToggle}
        hasNotification={hasNotification}
      />
    </>
  );
};

export default Sidebar;