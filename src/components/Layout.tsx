import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

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
              <h1 className="text-xl">LuaLabs</h1>
              <p className="text-xs text-gray-500">Painel {getRoleName()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

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
