"use client";

import { useEffect, useState } from "react";
import { 
  Edit3, 
  Building2, 
  Mail, 
  MapPin, 
  Globe, 
  Tag,
  X,
  Check,
  Plus,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Business } from "@/types";
import { Card } from "@/components/ui/card";

export default function DashboardBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editingBusinessId, setEditingBusinessId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    category: "",
    googleBusinessUrl: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    const response = await fetch("/api/businesses");
    const json = await response.json();
    setBusinesses(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const startEdit = (business: Business) => {
    setEditingBusinessId(business.id);
    setEditForm({
      name: business.name,
      email: business.email,
      category: business.category,
      googleBusinessUrl: business.google_business_url,
      location: business.location,
    });
    setError("");
  };

  const saveBusinessUpdate = async () => {
    setError("");
    setLoading(true);
    const response = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingBusinessId, ...editForm }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok)
      return setError(json.error || "Failed to update business");
    setEditingBusinessId("");
    await fetchBusinesses();
  };

  const cancelEdit = () => {
    setEditingBusinessId("");
    setError("");
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get color based on business name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Businesses
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage and update all registered businesses in your portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total: <span className="font-bold text-slate-900 dark:text-white">{businesses.length}</span>
          </span>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Add Business
          </Button>
        </div>
      </div>

      {/* Business Grid */}
      {loading && businesses.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No businesses registered yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get started by adding your first business
            </p>
            <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Business
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((business) => {
            const isEditing = editingBusinessId === business.id;
            const avatarColor = getAvatarColor(business.name);
            const initials = getInitials(business.name);

            return (
              <Card 
                key={business.id} 
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-transparent hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 ${
                  isEditing ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
              >
                {/* Decorative gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${avatarColor}`} />

                <div className="p-6">
                  {!isEditing ? (
                    // View Mode
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white ${avatarColor} shadow-lg shadow-${avatarColor}/20`}>
                            {initials}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                              {business.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {business.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(business)}
                          className="border-slate-200 hover:bg-blue-50 hover:border-blue-300 dark:border-slate-700 dark:hover:bg-slate-700 rounded-lg"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span className="ml-1.5 text-xs font-medium">Edit</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Tag className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="font-medium">{business.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="font-medium">{business.location}</span>
                        </div>
                      </div>

                      {business.google_business_url && (
                        <a
                          href={business.google_business_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          View on Google Business
                        </a>
                      )}
                    </div>
                  ) : (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${avatarColor}`}>
                            {initials}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              Editing {business.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Update business details below
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={cancelEdit}
                          className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Business Name
                            </label>
                            <Input
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({ ...editForm, name: e.target.value })
                              }
                              placeholder="Enter business name"
                              className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Email
                            </label>
                            <Input
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({ ...editForm, email: e.target.value })
                              }
                              placeholder="business@example.com"
                              type="email"
                              className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Category
                            </label>
                            <Input
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({ ...editForm, category: e.target.value })
                              }
                              placeholder="e.g., Restaurant"
                              className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Location
                            </label>
                            <Input
                              value={editForm.location}
                              onChange={(e) =>
                                setEditForm({ ...editForm, location: e.target.value })
                              }
                              placeholder="City, State"
                              className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Google Business URL
                          </label>
                          <Input
                            value={editForm.googleBusinessUrl}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                googleBusinessUrl: e.target.value,
                              })
                            }
                            placeholder="https://g.page/your-business"
                            type="url"
                            className="mt-1 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={saveBusinessUpdate}
                          disabled={loading}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {loading ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}