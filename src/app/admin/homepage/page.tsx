"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getHomepageConfig, updateHomepageConfig } from "@/app/actions/homepageActions";
import ImageUploader from "@/components/ImageUploader";
import { Save, Loader2, CheckCircle } from "lucide-react";

export default function HomepageManagerPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    startTransition(() => {
      getHomepageConfig().then((data) => {
        setConfig(data);
        setLoading(false);
      });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    await updateHomepageConfig({
      heroBannerImage: config.heroBannerImage,
      heroBannerTitle: config.heroBannerTitle,
      heroBannerSubtitle: config.heroBannerSubtitle,
      announcementText: config.announcementText,
      announcementActive: config.announcementActive,
      videoUrl: config.videoUrl,
    });
    
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading || !config) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-kaya-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Homepage CMS</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Homepage Manager</h1>
        <p className="text-slate-500 text-xs mt-1">Manage hero banners, announcements, and homepage settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold">Homepage configuration saved successfully!</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm">
          <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-4">Hero Section</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Hero Banner Background Image</label>
            <ImageUploader 
              defaultImage={config.heroBannerImage} 
              onUpload={(url) => setConfig({ ...config, heroBannerImage: url })} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Hero Title</label>
              <input 
                type="text" 
                value={config.heroBannerTitle || ""} 
                onChange={(e) => setConfig({ ...config, heroBannerTitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-kaya-orange text-sm font-medium"
                placeholder="e.g. Farm Fresh Groceries"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Hero Subtitle</label>
              <input 
                type="text" 
                value={config.heroBannerSubtitle || ""} 
                onChange={(e) => setConfig({ ...config, heroBannerSubtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-kaya-orange text-sm font-medium"
                placeholder="Delivered to your doorstep"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm">
          <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-4">Top Announcement Bar</h3>
          
          <div className="flex items-center gap-3 mb-4">
            <input 
              type="checkbox" 
              id="announcementActive"
              checked={config.announcementActive}
              onChange={(e) => setConfig({ ...config, announcementActive: e.target.checked })}
              className="w-4 h-4 text-kaya-orange rounded border-slate-300 focus:ring-kaya-orange"
            />
            <label htmlFor="announcementActive" className="text-sm font-bold text-slate-800">Enable Announcement Bar</label>
          </div>

          {config.announcementActive && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Announcement Text</label>
              <input 
                type="text" 
                value={config.announcementText || ""} 
                onChange={(e) => setConfig({ ...config, announcementText: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-kaya-orange text-sm font-medium"
                placeholder="e.g. Free delivery on orders over ₦10,000!"
              />
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-sm">
          <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-4">Promotional Video</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">YouTube / Vimeo Embed URL (Optional)</label>
            <input 
              type="url" 
              value={config.videoUrl || ""} 
              onChange={(e) => setConfig({ ...config, videoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-kaya-orange text-sm font-medium"
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Save Homepage Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
