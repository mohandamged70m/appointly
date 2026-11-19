"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CalendarArrowRight,
  Clock3,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: CalendarArrowRight,
    available: true,
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    available: true,
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: UsersRound,
    available: true,
  },
  {
    label: "Availability",
    href: "/dashboard/availability",
    icon: Clock3,
    available: true,
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: BriefcaseBusiness,
    available: true,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    available: true,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const [isSessionPending, setIsSessionPending] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const metadataName = user?.user_metadata.name;
  const displayName =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : user?.email || "Not signed in";
  const initials = (displayName || user?.email || "A")
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setIsSessionPending(false);
        setSessionError("");
      }
    });

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) return;
        if (error && error.name !== "AuthSessionMissingError") {
          setSessionError(error.message);
        } else {
          setUser(data.user);
        }
        setIsSessionPending(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSessionError(
          error instanceof Error ? error.message : "Unable to load your profile.",
        );
        setIsSessionPending(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  function closeMobileSidebar() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      const { error } = await getSupabaseBrowserClient().auth.signOut();

      if (error) {
        setSignOutError(error.message ?? "Unable to sign out. Please try again.");
        return;
      }

      setUser(null);
      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      setSignOutError(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-16 justify-center px-4">
        <Link
          aria-label="Appointly dashboard"
          className="flex items-center gap-3"
          href="/dashboard"
          onClick={closeMobileSidebar}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm shadow-green-600/25">
            <CalendarArrowRight aria-hidden="true" className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Appointly
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="px-2 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      disabled={!item.available}
                      isActive={item.available && pathname === item.href}
                      render={
                        item.available ? (
                          <Link
                            href={item.href}
                            onClick={closeMobileSidebar}
                          />
                        ) : undefined
                      }
                      tooltip={
                        item.available ? item.label : `${item.label} coming soon`
                      }
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {!item.available && (
                      <SidebarMenuBadge className="text-[10px] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
                        Soon
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2">Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled tooltip="Settings coming soon">
                  <Settings aria-hidden="true" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3">
        {sessionError && (
          <p
            className="text-xs text-destructive group-data-[collapsible=icon]:hidden"
            role="alert"
          >
            {sessionError}
          </p>
        )}
        {isSessionPending ? (
          <div
            aria-label="Loading profile"
            className="flex items-center gap-3 rounded-xl border border-sidebar-border p-2.5"
          >
            <span className="size-8 shrink-0 animate-pulse rounded-lg bg-sidebar-accent" />
            <span className="h-4 w-28 animate-pulse rounded bg-sidebar-accent group-data-[collapsible=icon]:hidden" />
          </div>
        ) : user ? (
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-600 text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <Link
            className="flex h-9 items-center gap-2 rounded-lg border border-sidebar-border px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
            href="/sign-in"
            onClick={closeMobileSidebar}
          >
            <LogIn aria-hidden="true" className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              Sign in
            </span>
          </Link>
        )}

        {user && (
          <>
            <button
              type="button"
              aria-label={isSigningOut ? "Signing out" : "Log out"}
              className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background/50 px-3 text-sm font-medium text-foreground shadow-sm shadow-border/10 transition-colors hover:bg-background/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
              disabled={isSigningOut}
              onClick={handleSignOut}
              title="Log out"
            >
              <LogOut aria-hidden="true" className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                {isSigningOut ? "Signing out..." : "Log out"}
              </span>
            </button>
            {signOutError && (
              <p
                className="text-xs text-destructive group-data-[collapsible=icon]:hidden"
                role="alert"
              >
                {signOutError}
              </p>
            )}
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
