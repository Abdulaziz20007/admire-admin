import React from "react";

const ProfileSettingsPage = () => {
  return (
    <div>
      <div className="bg-surface p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <p className="text-text-secondary">
          This is a nested page to test multi-level breadcrumbs functionality.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-[#273355] rounded-lg bg-background/50"
                defaultValue="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-[#273355] rounded-lg bg-background/50"
                defaultValue="john.doe@example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Role
              </label>
              <select className="w-full px-3 py-2 border border-[#273355] rounded-lg bg-background/50">
                <option>Administrator</option>
                <option>Manager</option>
                <option>User</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Status
              </label>
              <select className="w-full px-3 py-2 border border-[#273355] rounded-lg bg-background/50">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
