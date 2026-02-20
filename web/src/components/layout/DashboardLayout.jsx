import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Vote, Users, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function DashboardLayout({ children, title }) {
    const { currentUser, userData, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/ingreso-votos', label: 'Ingreso de Votos', icon: Vote },
        ...(userData?.rol === 'admin' ? [
            { to: '/candidatos', label: 'Candidatos', icon: UserCircle },
            { to: '/usuarios', label: 'Usuarios', icon: Users }
        ] : [])
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            {/* Navbar */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Centinela</span>
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 border-l border-gray-300 pl-2 hidden xs:block">
                                    Conteo Electoral
                                </span>
                            </div>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.to
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {userData?.nombre || currentUser?.email}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                    {userData?.rol || 'Visitante'}
                                </span>
                            </div>

                            <Button variant="outline" onClick={logout} className="text-sm py-1.5 h-9 hidden md:flex">
                                Salir
                            </Button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMenu}
                                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-in slide-in-from-top duration-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${location.pathname === link.to
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center px-3 mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {(userData?.nombre || 'U')[0].toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800 dark:text-white">
                                            {userData?.nombre || currentUser?.email}
                                        </div>
                                        <div className="text-sm font-medium text-gray-500 capitalize">
                                            {userData?.rol || 'Visitante'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {title && (
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
