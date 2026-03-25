import { AdminLayout } from "./index";
import { Info } from "lucide-react";

export default function AdminContentAbout() {
  return (
    <AdminLayout title="About Us Content">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
            <Info className="w-8 h-8 text-[#00B8A0]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">About Us Page Management</h2>
          <p className="text-gray-500 max-w-md">
            Edit the content on the Tabanni About Us page — mission statement, team members, organization history, and partner logos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-4">
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Mission Statement</div>
              <div className="text-xs text-gray-400">Update the organization's mission and values</div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Team Members</div>
              <div className="text-xs text-gray-400">Add, edit, or remove team profiles</div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Our Story</div>
              <div className="text-xs text-gray-400">Edit the founding story and milestones</div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 text-left">
              <div className="text-sm font-semibold text-gray-700 mb-1">Partners</div>
              <div className="text-xs text-gray-400">Manage partner organization logos and links</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Content editing coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}
