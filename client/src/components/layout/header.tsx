import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { USER_ROLES } from "@/lib/constants";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="bg-primary text-white w-8 h-8 rounded flex items-center justify-center mr-3">
              <span className="material-icons text-lg">precision_manufacturing</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-800">Controle de Qualidade</h1>
              <p className="text-xs text-neutral-500">WAP Industrial</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-neutral-600 hover:text-neutral-800 rounded-lg hover:bg-neutral-100">
              <span className="material-icons">notifications</span>
              <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-800">{user?.name}</p>
                <p className="text-xs text-neutral-500">{USER_ROLES[user?.role as keyof typeof USER_ROLES]}</p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors duration-200"
              >
                <span className="material-icons text-lg">person</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-neutral-600 hover:text-neutral-800"
              >
                <span className="material-icons text-sm">logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
