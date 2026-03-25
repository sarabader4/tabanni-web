import { AdminLayout } from "./index";
import { Home } from "lucide-react";

export default function AdminContentHome() {
  return (
    <AdminLayout title="Home Page Content">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
            <Home className="w-8 h-8 text-[#FF6B35]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Home Page Management</h2>
          <p className="text-gray-500 max-w-md">
            Manage the content that appears on the Tabanni home page — hero banner, featured pets section, statistics, and call-to-action blocks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-4">
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Hero Banner</div>
              <div className="text-xs text-gray-400">Update headline, subtitle, and background image</div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Featured Pets</div>
              <div className="text-xs text-gray-400">Choose which pets appear on the home page</div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Statistics</div>
              <div className="text-xs text-gray-400">Edit the impact numbers shown to visitors</div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Call to Action</div>
              <div className="text-xs text-gray-400">Customize the adoption and donation CTAs</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Content editing coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}
