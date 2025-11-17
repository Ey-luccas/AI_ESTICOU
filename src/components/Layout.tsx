import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  LayoutDashboard,
  FileImage,
  Sparkles,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  Palette,
  Building2,
  UserCog,
  FolderKanban,
  History,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, toggleNotificationRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case 'designer':
        return [
          { path: '/designer', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/designer/my-arts', icon: FileImage, label: 'Minhas Artes' },
          { path: '/designer/send-art', icon: Palette, label: 'Enviar Arte' },
          {
            path: '/designer/settings',
            icon: Settings,
            label: 'Configurações',
          },
        ];
      case 'client':
        return [
          { path: '/client', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/client/catalog', icon: FolderKanban, label: 'Catálogo' },
          {
            path: '/client/variations',
            icon: History,
            label: 'Minhas Variações',
          },
          { path: '/client/ai', icon: Sparkles, label: 'IA' },
        ];
      case 'manager':
        return [
          { path: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/manager/clients', icon: Building2, label: 'Clientes' },
          { path: '/manager/designers', icon: UserCog, label: 'Designers' },
          { path: '/manager/settings', icon: Settings, label: 'Configurações' },
        ];
      default:
        return [];
    }
  };

  const getRoleName = () => {
    switch (user.role) {
      case 'designer':
        return 'Designer';
      case 'client':
        return 'Cliente';
      case 'manager':
        return 'Gestor';
      default:
        return '';
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">Lua Crescente</h1>
              <p className="text-xs text-gray-500">Painel {getRoleName()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] px-1 text-[10px] font-semibold h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div>
                    <p className="text-sm font-medium">Notificações</p>
                    <p className="text-xs text-gray-500">Alertas do sistema</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-2 text-xs">
                    Marcar todas
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => toggleNotificationRead(notification.id)}
                      className={`w-full text-left px-4 py-3 transition hover:bg-gray-50 ${
                        notification.read ? 'bg-white' : 'bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-gray-600 truncate">{notification.description}</p>
                        </div>
                        <span className="text-[11px] text-gray-500 whitespace-nowrap">{notification.timeLabel}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">Nenhuma notificação no momento.</div>
                )}
              </PopoverContent>
            </Popover>

            {/* Help */}
            <Button variant="ghost" size="icon">
              <HelpCircle className="w-5 h-5" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto py-2"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Preferências</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
