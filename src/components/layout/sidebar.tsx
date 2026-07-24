"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  FileText, 
  HelpCircle, 
  Settings, 
  Moon,
  Sun,
  Search,
  AlertTriangle,
  Shield,
  User,
  LogOut,
  ChevronUp,
  MessageCircle,
  ScanLine,
  BarChart3,
  Building2,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/lib/permissions";

const menuItems = [
  {
    title: "MENU",
    items: [
      { label: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Produits", icon: Package, href: "/products" },
      { label: "Catégories", icon: Tags, href: "/categories" },
    ]
  },
  {
    title: "GESTION DES STOCKS",
    items: [
      { label: "Entrées", icon: ArrowDownToLine, href: "/stock/entries" },
      { label: "Sorties", icon: ArrowUpFromLine, href: "/stock/exits" },
      { label: "Historique", icon: History, href: "/stock/movements" },
      { label: "Scanner QR", icon: ScanLine, href: "/scanner" },
    ]
  },
  {
    title: "ANALYSES",
    items: [
      { label: "Alertes", icon: AlertTriangle, href: "/alerts" },
      { label: "Rapports", icon: FileText, href: "/reports" },
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Utilisateurs", icon: Shield, href: "/users" },
      { label: "Tickets Support", icon: MessageCircle, href: "/admin/tickets" },
    ]
  },
  {
    title: "SUPER ADMIN",
    items: [
      { label: "SaaS Dashboard", icon: BarChart3, href: "/admin/dashboard" },
      { label: "Entreprises", icon: Building2, href: "/admin/companies" },
      { label: "Catalogue Global", icon: Globe, href: "/admin/catalog" },
    ]
  }
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async (sessionUser?: any) => {
      const u = sessionUser || (await supabase.auth.getUser()).data.user;
      if (u) {
        const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', u.id).single();
        setUser({ ...u, is_super_admin: profile?.is_super_admin || u.email?.toLowerCase() === 'bntowo88@gmail.com' });
      } else {
        setUser(null);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie !");
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Sync dark mode state with document class
    const checkDark = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    checkDark();

    // Watch for class changes on html tag to keep mobile/desktop sidebars in sync
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const filteredMenu = (() => {
    let baseMenu = menuItems;
    
    // Si c'est un super admin, on réorganise le menu pour mettre les sections admin en haut
    if (user?.is_super_admin) {
      const superAdminSection = menuItems.find(s => s.title === "SUPER ADMIN");
      const adminSection = menuItems.find(s => s.title === "ADMINISTRATION");
      const otherSections = menuItems.filter(s => s.title !== "SUPER ADMIN" && s.title !== "ADMINISTRATION");
      
      baseMenu = [
        ...(superAdminSection ? [superAdminSection] : []),
        ...(adminSection ? [adminSection] : []),
        ...otherSections
      ];
    }

    return baseMenu.map(section => {
      // Déterminer si la section doit être grisée pour le super admin
      const isClientSection = section.title !== "SUPER ADMIN" && section.title !== "ADMINISTRATION";
      const isSectionDisabled = !!user?.is_super_admin && isClientSection;

      // Filter items based on super admin status and RBAC role
      const sectionItems = section.items.filter(item => {
        // Logic for super admin routes
        if (item.href === "/admin/tickets" || item.href.startsWith("/admin/")) {
          return !!user?.is_super_admin;
        }
        
        // Standard RBAC check
        const role = user?.user_metadata?.role;
        if (role && !hasPermission(role, item.href)) return false;
        
        return true;
      });

      return {
        ...section,
        isDisabled: isSectionDisabled,
        items: sectionItems.map(item => ({
          ...item,
          active: pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
        })).filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
      };
    }).filter(section => section.items.length > 0);
  })();

  return (
    <>
    <aside className={cn(
      "w-64 bg-surface dark:bg-dark-surface border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0",
      className
    )}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-8 shrink-0">
          <Logo size="sm" />
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">StockFlow AF</span>
        </div>

        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-9 pr-4 py-2 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded px-1.5 py-0.5 text-[10px] text-gray-500 font-medium">
            ⌘F
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-6">
          {filteredMenu.length > 0 ? filteredMenu.map((section, i) => (
            <div key={i}>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 tracking-wider">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item, j) => (
                  <li key={j}>
                    <Link 
                      href={section.isDisabled ? "#" : item.href}
                      onClick={(e) => {
                        if (section.isDisabled) {
                          e.preventDefault();
                          return;
                        }
                        onClose && onClose()
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        section.isDisabled
                          ? "text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed pointer-events-none"
                          : item.active 
                            ? "bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white" 
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                      )}
                      tabIndex={section.isDisabled ? -1 : 0}
                      aria-disabled={section.isDisabled}
                    >
                      <item.icon className={cn("w-5 h-5", (item.active && !section.isDisabled) ? "text-primary" : "")} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )) : (
            <div className="text-sm text-gray-500 text-center mt-8">Aucun menu trouvé</div>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1 border-t border-gray-100 dark:border-gray-800">
        {!user?.is_super_admin && (
          <Link 
            href="/help"
            onClick={() => onClose && onClose()}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/help"
                ? "bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            )}
          >
            <HelpCircle className={cn("w-5 h-5", pathname === "/help" ? "text-primary" : "")} />
            Aide et Support
          </Link>
        )}
        {(!user?.user_metadata?.role || hasPermission(user.user_metadata.role, "/settings")) && (
          <Link 
            href="/settings" 
            onClick={() => onClose && onClose()}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            )}
          >
            <Settings className={cn("w-5 h-5", pathname === "/settings" ? "text-primary" : "")} />
            Paramètres
          </Link>
        )}
        <div 
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 w-full"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? "Mode clair" : "Mode sombre"}
          </div>
          <button 
            onClick={toggleDarkMode}
            className={cn("w-8 h-4 rounded-full relative transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary/20", isDarkMode ? "bg-primary" : "bg-gray-200 dark:bg-gray-700")}
            aria-label="Changer de thème"
          >
            <div className={cn(
              "w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-all pointer-events-none",
              isDarkMode ? "left-[18px]" : "left-0.5"
            )}></div>
          </button>
        </div>

        <div className="relative mt-4" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center gap-3 transition-colors outline-none focus:ring-2 focus:ring-primary/20 text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden shrink-0 text-primary font-bold text-lg">
              {user?.user_metadata?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                (user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Chargement..."}
              </span>
              <span className="text-xs text-gray-500 truncate">{user?.email || ""}</span>
            </div>
            <ChevronUp className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileOpen ? "rotate-180" : "group-hover:-translate-y-0.5")} />
          </button>

          {isProfileOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-1 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
              <Link 
                href="/profile"
                onClick={() => { setIsProfileOpen(false); onClose?.(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full"
              >
                <User className="w-4 h-4" />
                Mon Profil
              </Link>
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
    {isLoggingOut && (
      <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-[spin_2s_linear_infinite]">
            <Logo size="lg" color="red" />
          </div>
          <p className="mt-6 text-lg font-bold text-red-600 dark:text-red-500 animate-pulse">
            Déconnexion en cours...
          </p>
        </div>
      </div>
    )}
    </>
  );
}
