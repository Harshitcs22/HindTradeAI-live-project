import { useState } from 'react'

/**
 * MobileNav - Premium Bottom Navigation for Mobile
 * Visible only on mobile screens (md:hidden)
 * Features: Black glassmorphism, gold/amber active states, icon-based navigation
 */
export default function MobileNav({ activeTab, setActiveTab, onLogout }) {
    const navItems = [
        {
            id: 'overview',
            label: 'Home',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: 'inventory',
            label: 'Inventory',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            id: 'network',
            label: 'Network',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 'docs',
            label: 'Vault',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        }
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden">
            {/* Glassmorphism Container */}
            <div className="w-full bg-black/90 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 ${isActive
                                    ? 'text-amber-400'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {/* Icon with glow effect when active */}
                                <div className={`relative ${isActive ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}`}>
                                    {item.icon}
                                </div>

                                {/* Label */}
                                <span className={`text-[9px] mt-1 uppercase tracking-wider font-medium ${isActive ? 'text-amber-400' : 'text-slate-600'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Active indicator dot */}
                                {isActive && (
                                    <div className="absolute -top-0.5 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                                )}
                            </button>
                        )
                    })}

                    {/* Logout Button */}
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 text-slate-500 hover:text-red-400"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-[9px] mt-1 uppercase tracking-wider font-medium text-slate-600">
                                Logout
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
