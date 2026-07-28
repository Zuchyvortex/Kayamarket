"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Package, ShoppingBag, UserCheck, Star, AlertTriangle, FileText, Truck } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notificationActions";
import Link from "next/link";

interface NotificationDropdownProps {
  role: "ADMIN" | "RIDER" | "CUSTOMER";
  targetId?: string;
}

export default function NotificationDropdown({ role, targetId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchData();

    // Auto-polling notifications every 4 seconds
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [role, targetId]);

  const fetchData = async () => {
    const res = await getNotifications(role, targetId);
    if (res.success) {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
    await fetchData();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(role, targetId);
    await fetchData();
  };

  const getIcon = (type?: string, title?: string) => {
    if (title?.includes("STOCK") || type === "INVENTORY") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    if (type === "REVIEW") return <Star className="h-4 w-4 text-amber-400" />;
    if (type === "REGISTRATION") return <UserCheck className="h-4 w-4 text-blue-500" />;
    if (type === "DELIVERY" || title?.includes("Rider")) return <Truck className="h-4 w-4 text-kaya-orange" />;
    if (type === "INVOICE") return <FileText className="h-4 w-4 text-emerald-500" />;
    return <ShoppingBag className="h-4 w-4 text-kaya-orange" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-kaya-orange text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-4 space-y-3 text-xs animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-orange-50 dark:bg-orange-950/40 text-kaya-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-kaya-orange hover:underline font-bold flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification items list */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-bold text-xs">
                  No notifications recorded
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markNotificationAsRead(n.id);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      !n.isRead
                        ? "bg-orange-50/40 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40"
                        : "bg-slate-50 dark:bg-slate-955 border-slate-100 dark:border-slate-800 opacity-80"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0 mt-0.5">
                      {getIcon(n.type, n.title)}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{n.title}</p>
                        {!n.isRead && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="text-slate-400 hover:text-emerald-500 p-0.5"
                            title="Mark read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight">
                        {n.message}
                      </p>

                      <div className="flex justify-between items-center pt-1 text-[9px] text-slate-400">
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {n.link && (
                          <Link href={n.link} className="text-kaya-orange font-bold hover:underline">
                            View details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
