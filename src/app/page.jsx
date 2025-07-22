"use client";
import React from "react";

function MainComponent() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [clients, setClients] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [estimates, setEstimates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Load initial data
  React.useEffect(() => {
    loadClients();
    loadServices();
    loadEstimates();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch("/api/clients/list", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setClients(data || []);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch("/api/services/list", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setServices(data || []);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadEstimates = async () => {
    try {
      const response = await fetch("/api/estimates/list", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setEstimates(data || []);
      }
    } catch (error) {
      console.error("Error loading estimates:", error);
    }
  };

  const renderDashboard = () => (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        Lawn Pest Pro Dashboard
      </h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700">Total Clients</h3>
          <p className="text-3xl font-bold text-green-600">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700">
            Active Estimates
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {estimates.filter((e) => e.status === "draft").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-700">
            Services Available
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {services.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700">
            Revenue (Est.)
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            $
            {estimates
              .reduce((sum, est) => sum + parseFloat(est.total_amount || 0), 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Estimates</h2>
        {estimates.length === 0 ? (
          <p className="text-gray-500">
            No estimates yet. Create your first estimate using the Pricing
            Calculator.
          </p>
        ) : (
          <div className="space-y-3">
            {estimates.slice(0, 5).map((estimate) => (
              <div
                key={estimate.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">
                    {clients.find((c) => c.id === estimate.client_id)?.name ||
                      "Unknown Client"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {estimate.property_size} sq ft
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    ${estimate.total_amount}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      estimate.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : estimate.status === "sent"
                        ? "bg-blue-100 text-blue-800"
                        : estimate.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {estimate.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPricingCalculator = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">
        Pricing Calculator
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Pricing calculator feature coming soon...
        </p>
      </div>
    </div>
  );

  const renderAIIdentification = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">
        AI Pest Identification
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          AI pest identification feature coming soon...
        </p>
      </div>
    </div>
  );

  const renderCRM = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">
        Client Management
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Client management feature coming soon...
        </p>
      </div>
    </div>
  );

  const renderScheduling = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">
        Service Scheduling
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Service scheduling feature coming soon...
        </p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <SettingsManager services={services} onServicesUpdated={loadServices} />
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <i className="fas fa-leaf text-2xl text-white"></i>
              <h1 className="text-xl font-bold text-white">Lawn Pest Pro</h1>
            </div>
            <div className="flex space-x-1">
              {[
                {
                  id: "dashboard",
                  label: "Dashboard",
                  icon: "fas fa-tachometer-alt",
                },
                { id: "pricing", label: "Pricing", icon: "fas fa-calculator" },
                { id: "ai", label: "AI ID", icon: "fas fa-camera" },
                { id: "crm", label: "CRM", icon: "fas fa-users" },
                { id: "schedule", label: "Schedule", icon: "fas fa-calendar" },
                { id: "settings", label: "Settings", icon: "fas fa-cog" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-600 text-white"
                      : "text-white hover:bg-green-600"
                  }`}
                >
                  <i className={`${tab.icon} text-white`}></i>
                  <span className="hidden md:inline text-white">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "pricing" && renderPricingCalculator()}
        {activeTab === "ai" && renderAIIdentification()}
        {activeTab === "crm" && renderCRM()}
        {activeTab === "schedule" && renderScheduling()}
        {activeTab === "settings" && renderSettings()}
      </main>
    </div>
  );
}

// Settings Manager Component
function SettingsManager({ services, onServicesUpdated }) {
  const [showAddService, setShowAddService] = React.useState(false);
  const [editingService, setEditingService] = React.useState(null);
  const [newService, setNewService] = React.useState({
    name: "",
    base_price: "",
    per_1000_sqft_price: "",
    description: "",
    is_active: true,
  });

  const handleAddService = async () => {
    if (
      !newService.name ||
      !newService.base_price ||
      !newService.per_1000_sqft_price
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/services/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newService,
          base_price: parseFloat(newService.base_price),
          per_1000_sqft_price: parseFloat(newService.per_1000_sqft_price),
        }),
      });

      if (response.ok) {
        setNewService({
          name: "",
          base_price: "",
          per_1000_sqft_price: "",
          description: "",
          is_active: true,
        });
        setShowAddService(false);
        onServicesUpdated();
        alert("Service added successfully!");
      } else {
        throw new Error("Failed to create service");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      alert("Error creating service");
    }
  };

  const handleEditService = async () => {
    if (
      !editingService.name ||
      !editingService.base_price ||
      !editingService.per_1000_sqft_price
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/services/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingService,
          base_price: parseFloat(editingService.base_price),
          per_1000_sqft_price: parseFloat(editingService.per_1000_sqft_price),
        }),
      });

      if (response.ok) {
        setEditingService(null);
        onServicesUpdated();
        alert("Service updated successfully!");
      } else {
        throw new Error("Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Error updating service");
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      const response = await fetch("/api/services/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          is_active: !service.is_active,
        }),
      });

      if (response.ok) {
        onServicesUpdated();
      } else {
        throw new Error("Failed to update service status");
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      alert("Error updating service status");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Settings</h2>

      {/* Services Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Service Management</h3>
          <button
            onClick={() => setShowAddService(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <i className="fas fa-plus mr-2"></i>Add Service
          </button>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              {editingService && editingService.id === service.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={editingService.name}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          name: e.target.value,
                        })
                      }
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Base Price (first 3000 sq ft)"
                      value={editingService.base_price}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          base_price: e.target.value,
                        })
                      }
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price per 1000 sq ft (additional)"
                      value={editingService.per_1000_sqft_price}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          per_1000_sqft_price: e.target.value,
                        })
                      }
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={editingService.is_active}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600"
                      />
                      <span>Active Service</span>
                    </div>
                  </div>
                  <textarea
                    placeholder="Service Description"
                    value={editingService.description}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditService}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingService(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{service.name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          service.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {service.description}
                    </p>
                    <div className="text-sm text-gray-700">
                      <p>
                        <strong>Base Price:</strong> ${service.base_price}{" "}
                        (first 3,000 sq ft)
                      </p>
                      <p>
                        <strong>Additional:</strong> $
                        {service.per_1000_sqft_price} per 1,000 sq ft
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingService(service)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => toggleServiceStatus(service)}
                      className={`${
                        service.is_active
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      <i
                        className={`fas ${
                          service.is_active ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Service Name *"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Base Price (first 3000 sq ft) *"
                value={newService.base_price}
                onChange={(e) =>
                  setNewService({ ...newService, base_price: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price per 1000 sq ft (additional) *"
                value={newService.per_1000_sqft_price}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    per_1000_sqft_price: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <textarea
                placeholder="Service Description"
                value={newService.description}
                onChange={(e) =>
                  setNewService({ ...newService, description: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
              />
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newService.is_active}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-green-600"
                />
                <span>Active Service</span>
              </label>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAddService}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Add Service
              </button>
              <button
                onClick={() => setShowAddService(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">App Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span>July 21, 2025</span>
          </div>
          <div className="flex justify-between">
            <span>Total Clients:</span>
            <span>{services.length > 0 ? "Connected" : "Loading..."}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">Features</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <i className="fas fa-check text-green-600 mr-2"></i>Pricing
              Calculator
            </div>
            <div>
              <i className="fas fa-check text-green-600 mr-2"></i>AI Pest ID
            </div>
            <div>
              <i className="fas fa-check text-green-600 mr-2"></i>Client CRM
            </div>
            <div>
              <i className="fas fa-check text-green-600 mr-2"></i>Service
              Scheduling
            </div>
            <div>
              <i className="fas fa-check text-green-600 mr-2"></i>Mobile Camera
            </div>
            <div>
              <i className="fas fa-check text-green-600 mr-2"></i>Estimate
              Builder
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;