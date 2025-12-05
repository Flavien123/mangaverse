import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Search, User, LogOut, BookOpen, Home as HomeIcon } from 'lucide-react';
import { clsx } from 'clsx';

export default function Header() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, icon: Icon, children }) => (
        <Link
            to={to}
            className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                isActive(to) ? "text-primary bg-primary/10" : "text-muted hover:text-white hover:bg-surface-hover"
            )}
            onClick={() => setIsOpen(false)}
        >
            <Icon size={18} />
            <span>{children}</span>
        </Link>
    );

    return (
        <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
            <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                    <BookOpen className="w-8 h-8" />
                    <span>MangaReader</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink to="/" icon={HomeIcon}>Главная</NavLink>
                    <NavLink to="/catalog" icon={Search}>Каталог</NavLink>
                </nav>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <User size={16} />
                                </div>
                                {user.username}
                            </Link>
                            <button onClick={logout} className="p-2 text-muted hover:text-red-500 transition-colors" title="Выйти">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login" className="btn btn-ghost text-sm">Войти</Link>
                            <Link to="/register" className="btn btn-primary text-sm">Регистрация</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 text-muted hover:text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border p-4 flex flex-col gap-2 animate-fade-in shadow-2xl">
                    <NavLink to="/" icon={HomeIcon}>Главная</NavLink>
                    <NavLink to="/catalog" icon={Search}>Каталог</NavLink>
                    <div className="h-px bg-border my-2" />
                    {user ? (
                        <>
                            <NavLink to="/profile" icon={User}>Профиль ({user.username})</NavLink>
                            <button
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted hover:text-red-500 hover:bg-surface-hover w-full text-left"
                            >
                                <LogOut size={18} />
                                <span>Выйти</span>
                            </button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <Link to="/login" className="btn btn-outline justify-center" onClick={() => setIsOpen(false)}>Войти</Link>
                            <Link to="/register" className="btn btn-primary justify-center" onClick={() => setIsOpen(false)}>Регистрация</Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
