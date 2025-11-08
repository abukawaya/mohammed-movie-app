import { useState, useEffect } from 'react';
import { Home, Heart, Film, Menu, X } from 'lucide-react';
import { useMovieContext } from '../contexts/MovieContext';

function NavBar() { 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState(window.location.pathname);
    const { favorites } = useMovieContext();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // تحديث الرابط النشط بناءً على URL الحالي
    useEffect(() => {
        setActiveLink(window.location.pathname);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = (path, e) => {
        e.preventDefault();
        setActiveLink(path);
        setIsMenuOpen(false);
        
        // التنقل للصفحة
        window.history.pushState({}, '', path);
        
        // إطلاق حدث للتنقل (إذا كنت تستخدم Router)
        const navEvent = new PopStateEvent('popstate');
        window.dispatchEvent(navEvent);
    };

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMenuOpen && !e.target.closest('.navbar')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    // منع التمرير عندما تكون القائمة مفتوحة على الموبايل
    useEffect(() => {
        if (isMenuOpen && window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    return(
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <a href="/" onClick={(e) => handleLinkClick('/', e)}>
                        <Film className="logo-icon" size={32} />
                        <span className="logo-text">
                            Movie<span className="logo-highlight">App</span>
                        </span>
                    </a>
                </div>

                <button 
                    className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <a 
                        href="/" 
                        className={activeLink === '/' ? 'active' : ''}
                        onClick={(e) => handleLinkClick('/', e)}
                    >
                        <Home size={20} />
                        <span>Home</span>
                    </a>
                    <a 
                        href="/favourite" 
                        className={`favourite-link ${activeLink === '/favourite' ? 'active' : ''}`}
                        onClick={(e) => handleLinkClick('/favourite', e)}
                    >
                        <Heart size={20} />
                        <span>Favourites</span>
                        {favorites && favorites.length > 0 && (
                            <span className="favorites-badge">{favorites.length}</span>
                        )}
                    </a>
                </div>
            </div>

            {/* Overlay للموبايل */}
            {isMenuOpen && <div className="navbar-overlay" onClick={() => setIsMenuOpen(false)}></div>}

            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .navbar {
                    background: rgba(26, 26, 46, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    padding: 0;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
                    animation: slideDown 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .navbar::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, 
                        transparent, 
                        rgba(59, 130, 246, 0.5) 30%, 
                        rgba(139, 92, 246, 0.5) 70%, 
                        transparent
                    );
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .navbar:hover::before {
                    opacity: 1;
                }

                .navbar.scrolled {
                    background: rgba(26, 26, 46, 0.95);
                    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
                }

                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .navbar-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    z-index: 1001;
                }

                /* Logo Styles */
                .navbar-logo a {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    text-decoration: none;
                    color: #ffffff;
                    font-size: 1.8rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .navbar-logo a::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .navbar-logo a:hover {
                    color: #93c5fd;
                    transform: translateY(-2px);
                }

                .navbar-logo a:hover::after {
                    width: 100%;
                }

                .logo-icon {
                    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    flex-shrink: 0;
                }

                .navbar-logo a:hover .logo-icon {
                    transform: rotate(10deg) scale(1.1);
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
                }

                .logo-text {
                    display: inline-block;
                }

                .logo-highlight {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Toggle Button */
                .navbar-toggle {
                    display: none;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 0.6rem 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #ffffff;
                    position: relative;
                    z-index: 1002;
                }

                .navbar-toggle:hover {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: rgba(59, 130, 246, 0.4);
                    transform: scale(1.05);
                }

                .navbar-toggle:active {
                    transform: scale(0.95);
                }

                .navbar-toggle.active {
                    background: rgba(59, 130, 246, 0.3);
                    border-color: rgba(59, 130, 246, 0.5);
                }

                /* Links Styles */
                .navbar-links {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .navbar-links a {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.7rem 1.2rem;
                    color: rgba(255, 255, 255, 0.8);
                    text-decoration: none;
                    font-size: 1rem;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                    border-radius: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }

                .navbar-links a::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    border-radius: 10px;
                    z-index: -1;
                }

                .navbar-links a::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
                    transition: left 0.5s ease;
                }

                .navbar-links a:hover {
                    color: #ffffff;
                    transform: translateY(-2px);
                }

                .navbar-links a:hover::before {
                    opacity: 1;
                }

                .navbar-links a:hover::after {
                    left: 100%;
                }

                .navbar-links a:active {
                    transform: translateY(0);
                }

                .navbar-links a svg {
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .navbar-links a:hover svg {
                    transform: scale(1.15);
                }

                /* Heart animation للمفضلة */
                .favourite-link:hover svg {
                    animation: heartBeat 0.6s ease;
                    color: #ef4444;
                }

                @keyframes heartBeat {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(1.3); }
                    50% { transform: scale(1.1); }
                    75% { transform: scale(1.25); }
                }

                /* Active link style */
                .navbar-links a.active {
                    color: #ffffff;
                    background: rgba(59, 130, 246, 0.25);
                    border: 1px solid rgba(59, 130, 246, 0.4);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .navbar-links a.active svg {
                    color: #60a5fa;
                }

                /* Favorites Badge */
                .favorites-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.2rem 0.45rem;
                    border-radius: 10px;
                    min-width: 20px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                    animation: badgePulse 2s ease-in-out infinite;
                    border: 2px solid rgba(26, 26, 46, 0.9);
                }

                @keyframes badgePulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                    }
                    50% {
                        transform: scale(1.1);
                        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
                    }
                }

                .favourite-link {
                    position: relative;
                }

                /* Overlay للموبايل */
                .navbar-overlay {
                    display: none;
                }

                /* Responsive Styles */
                @media (max-width: 768px) {
                    .navbar-container {
                        padding: 1rem 1.5rem;
                    }

                    .navbar-logo a {
                        font-size: 1.5rem;
                    }

                    .logo-icon {
                        width: 28px;
                        height: 28px;
                    }

                    .navbar-toggle {
                        display: block;
                    }

                    .navbar-overlay {
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.6);
                        backdrop-filter: blur(4px);
                        z-index: 999;
                        animation: fadeIn 0.3s ease;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .navbar-links {
                        position: fixed;
                        top: 70px;
                        left: 0;
                        right: 0;
                        flex-direction: column;
                        background: rgba(26, 26, 46, 0.98);
                        backdrop-filter: blur(12px);
                        padding: 1.5rem;
                        gap: 0.5rem;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        transform: translateY(-100%);
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        max-height: calc(100vh - 70px);
                        overflow-y: auto;
                    }

                    .navbar-links.active {
                        transform: translateY(0);
                        opacity: 1;
                        visibility: visible;
                    }

                    .navbar-links a {
                        width: 100%;
                        justify-content: center;
                        padding: 1.1rem;
                        font-size: 1.1rem;
                        animation: slideInLeft 0.4s ease forwards;
                        opacity: 0;
                        margin: 0.25rem 0;
                    }

                    .navbar-links.active a:nth-child(1) {
                        animation-delay: 0.1s;
                    }

                    .navbar-links.active a:nth-child(2) {
                        animation-delay: 0.2s;
                    }

                    @keyframes slideInLeft {
                        from {
                            transform: translateX(-30px);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }

                    .favorites-badge {
                        top: 8px;
                        right: 20%;
                    }
                }

                @media (max-width: 480px) {
                    .navbar-container {
                        padding: 0.8rem 1rem;
                    }

                    .navbar-logo a {
                        font-size: 1.3rem;
                    }

                    .logo-icon {
                        width: 24px;
                        height: 24px;
                    }

                    .navbar-links a {
                        font-size: 1rem;
                        padding: 1rem;
                    }

                    .navbar-links a svg {
                        width: 18px;
                        height: 18px;
                    }
                }

                /* Smooth scrolling */
                html {
                    scroll-behavior: smooth;
                }

                /* إصلاح مشكلة الـ z-index */
                .navbar * {
                    -webkit-tap-highlight-color: transparent;
                }
            `}</style>
        </nav>
    );
}

export default NavBar;