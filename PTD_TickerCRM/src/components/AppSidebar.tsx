import { NavLink, useLocation } from 'react-router-dom';
import { Home, Bot, Radio, BarChart3, Ticket, HelpCircle, Settings } from 'lucide-react';

const navItems = [
  { label: 'Trang chủ', path: '/', icon: Home },
  { label: 'Chatbot & Voicebot', path: '/chatbot', icon: Bot },
  { label: 'Omnichannel', path: '/omnichannel', icon: Radio },
  { label: 'Dashboard KPI', path: '/dashboard', icon: BarChart3 },
  { label: 'Ticket CRM', path: '/tickets', icon: Ticket },
  { label: 'FAQ Management', path: '/faq', icon: HelpCircle },
  { label: 'Cài đặt', path: '/settings', icon: Settings },
];

const AppSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/tickets') return location.pathname.startsWith('/tickets');
    return location.pathname === path;
  };

  return (
    <aside className="w-[280px] min-h-screen bg-sidebar flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">N</span>
        </div>
        <div>
          <h1 className="text-sidebar-primary-foreground font-bold text-lg leading-tight">NovaTech</h1>
          <p className="text-primary text-sm">Electronics Support</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-border'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
