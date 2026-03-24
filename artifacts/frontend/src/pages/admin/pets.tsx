import { useState } from "react";
import { useListPets, useApprovePet, useTogglePetFeatured, useDeletePet } from "@workspace/api-client-react";
import { PawPrint, Star, CheckCircle, Trash2, Eye, Filter, Search } from "lucide-react";
import { AdminLayout } from "./index";
import { Link } from "wouter";

export default function AdminPets() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data, refetch } = useListPets({
    search: search || undefined,
    status: filterStatus || undefined,
    limit: 50,
  });

  const approveMutation = useApprovePet();
  const featureMutation = useTogglePetFeatured();
  const deleteMutation = useDeletePet();

  const pets = data?.pets ?? [];

  return (
    <AdminLayout title="Pet Management">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search pets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="adopted">Adopted</option>
              <option value="fostered">Fostered</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pet</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Purpose</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Approved</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {pet.imageUrls?.[0] ? (
                        <img src={pet.imageUrls[0]} alt={pet.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-orange-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{pet.name}</p>
                        <p className="text-xs text-gray-500">{pet.breed || "Mixed"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-gray-700">{pet.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{pet.city}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pet.purpose === "adopt" ? "bg-orange-100 text-orange-700" :
                      pet.purpose === "foster" ? "bg-teal-100 text-teal-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {pet.purpose === "both" ? "Adopt/Foster" : pet.purpose}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pet.status === "available" ? "bg-green-100 text-green-700" :
                      pet.status === "adopted" ? "bg-blue-100 text-blue-700" :
                      pet.status === "fostered" ? "bg-teal-100 text-teal-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {pet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        if (!pet.approved) {
                          approveMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() });
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        pet.approved
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {pet.approved ? "Approved" : "Approve"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => featureMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        pet.featured
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } cursor-pointer`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      {pet.featured ? "Featured" : "Feature"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/pets/${pet.id}`}>
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("Delete this pet?")) {
                            deleteMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() });
                          }
                        }}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No pets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {pets.length} of {data.total} pets</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
