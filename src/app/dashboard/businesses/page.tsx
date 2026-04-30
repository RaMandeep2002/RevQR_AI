"use client";

import { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Business } from "@/types";

export default function DashboardBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editingBusinessId, setEditingBusinessId] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", category: "", googleBusinessUrl: "", location: "" });
  const [error, setError] = useState("");

  const fetchBusinesses = async () => {
    const response = await fetch("/api/businesses");
    const json = await response.json();
    setBusinesses(json.data || []);
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
      location: business.location
    });
  };

  const saveBusinessUpdate = async () => {
    setError("");
    const response = await fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingBusinessId, ...editForm })
    });
    const json = await response.json();
    if (!response.ok) return setError(json.error || "Failed to update business");
    setEditingBusinessId("");
    await fetchBusinesses();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">All Businesses</h1>
        <p className="mt-1 font-medium text-slate-500">Manage and update all registered businesses.</p>
      </div>
      <div className="grid gap-4">
        {businesses.map((business) => (
          <Card key={business.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">{business.name}</h3>
                <p className="text-sm text-slate-500">{business.email}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{business.category} • {business.location}</p>
              </div>
              <Button className="border border-slate-200 text-slate-900" onClick={() => startEdit(business)}>
                <Edit3 className="mr-1 h-4 w-4" /> Update
              </Button>
            </div>
            {editingBusinessId === business.id ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Business Name" />
                <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Business Email" type="email" />
                <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Category" />
                <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Location" />
                <Input className="md:col-span-2" value={editForm.googleBusinessUrl} onChange={(e) => setEditForm({ ...editForm, googleBusinessUrl: e.target.value })} placeholder="Google Business URL" type="url" />
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={saveBusinessUpdate}>Save Update</Button>
                  <Button className="bg-slate-100 text-slate-900 hover:bg-slate-200" onClick={() => setEditingBusinessId("")}>
                    Cancel
                  </Button>
                </div>
                {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
