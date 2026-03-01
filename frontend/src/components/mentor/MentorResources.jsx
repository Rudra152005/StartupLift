import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload, File, Video, Link, Trash2, ExternalLink,
  Plus, X, Globe, Lock, Users, Download, AlertCircle
} from "lucide-react";
import axios from "../../api/axiosInstance";

const MentorResources = () => {
  const [activeType, setActiveType] = useState("all");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    type: "document",
    description: "",
    tags: "",
    externalUrl: "",
    isPublic: "true"
  });

  useEffect(() => {
    fetchMentorResources();
  }, [activeType]);

  const fetchMentorResources = async () => {
    try {
      setLoading(true);
      setError("");
      console.log(`Fetching resources for type: ${activeType}`);

      const config = {
        params: { type: activeType !== "all" ? activeType : undefined }
      };

      const response = await axios.get("/mentors/resources", config);

      console.log("Response data:", response.data);

      if (response.data.success) {
        setResources(response.data.resources);
        console.log(`Loaded ${response.data.resources.length} resources`);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      console.error("Error details:", error.response?.data);
      if (error.response?.status === 401) {
        setError("Please log in to view resources");
      } else {
        setError("Failed to load resources. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
      const fileType = file.type.includes("video") ? "video" : "document";
      setFormData(prev => ({
        ...prev,
        type: fileType,
        title: file.name.split('.')[0]
      }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      setError("Please select a file and enter a title");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("type", formData.type);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("tags", formData.tags);
      uploadFormData.append("isPublic", formData.isPublic);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };

      const response = await axios.post("/mentors/resources/upload", uploadFormData, config);

      if (response.data.success) {
        fetchMentorResources();
        setShowUploadModal(false);
        resetForm();
        alert("Resource uploaded successfully!");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.status === 403) {
        setError("Only mentors can upload resources");
      } else if (error.response?.status === 404) {
        setError("API endpoint not found. Please check backend server.");
      } else {
        setError(error.response?.data?.message || "Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = async () => {
    if (!formData.title.trim() || !formData.externalUrl.trim()) {
      setError("Please enter both title and URL");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const response = await axios.post("/mentors/resources/link", {
        title: formData.title,
        externalUrl: formData.externalUrl,
        description: formData.description,
        tags: formData.tags,
        isPublic: formData.isPublic
      });

      if (response.data.success) {
        fetchMentorResources();
        setShowLinkModal(false);
        resetForm();
        alert("Link added successfully!");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error adding link:", error);
      if (error.response?.status === 403) {
        setError("Only mentors can upload resources");
      } else if (error.response?.status === 404) {
        setError("API endpoint not found. Please check backend server.");
      } else {
        setError(error.response?.data?.message || "Failed to add link. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;

    try {
      const response = await axios.delete(`/mentors/resources/${id}`);

      if (response.data.success) {
        fetchMentorResources();
        alert("Resource deleted successfully!");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleDownload = async (resource) => {
    try {
      const response = await axios.post(`/mentors/resources/${resource._id}/download`, {});

      if (response.data.success) {
        if (response.data.type === 'link') {
          window.open(response.data.url, '_blank');
        } else {
          // For files, create download link
          const link = document.createElement('a');
          link.href = response.data.url;
          link.download = response.data.fileName || resource.title;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Update download count in UI
        setResources(resources.map(res =>
          res._id === resource._id
            ? { ...res, downloads: (res.downloads || 0) + 1 }
            : res
        ));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Download failed");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "video": return <Video size={20} />;
      case "link": return <ExternalLink size={20} />;
      default: return <File size={20} />;
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "document",
      description: "",
      tags: "",
      externalUrl: "",
      isPublic: "true"
    });
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Resources</h1>
            <p className="text-[var(--text-secondary)] mt-1">Share your knowledge with the community</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm">
            <Users size={16} />
            <span>Mentor Mode</span>
          </div>
        </div>
      </motion.div>

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-[var(--text-primary)]/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all bg-[var(--bg-primary)]/50 backdrop-blur-sm"
          onClick={() => setShowUploadModal(true)}
        >
          <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--color-primary)]">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Upload File</h3>
          <p className="text-[var(--text-secondary)] mt-2">PDF, MP4, DOC files (Max 50MB)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-2 border-dashed border-[var(--text-primary)]/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all bg-[var(--bg-primary)]/50 backdrop-blur-sm"
          onClick={() => setShowLinkModal(true)}
        >
          <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--color-primary)]">
            <Link size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Add External Link</h3>
          <p className="text-[var(--text-secondary)] mt-2">YouTube, Google Drive, etc.</p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 border-b border-[var(--text-primary)]/10 pb-4">
        {["all", "document", "video", "link"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${activeType === type
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10"
              }`}
            onClick={() => setActiveType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Resource List */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Library</h2>
          <div className="text-sm text-[var(--text-secondary)]">
            {loading ? "Loading..." : `${resources.length} resources`}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[var(--text-primary)]/20 rounded-2xl">
            <File size={48} className="mx-auto text-[var(--text-primary)]/40 mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)]">No resources yet</h3>
            <p className="text-[var(--text-secondary)] mt-1">Upload your first resource to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, i) => (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-5 group hover:border-[var(--color-primary)]/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl bg-[var(--text-primary)]/5 text-[var(--text-secondary)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                      onClick={() => handleDownload(resource)}
                      title={resource.type === 'link' ? 'Open link' : 'Download file'}
                    >
                      {getFileIcon(resource.type)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {resource.isPublic ? (
                        <>
                          <Globe size={14} className="text-green-500" />
                          <span className="text-[var(--text-secondary)]">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} className="text-amber-500" />
                          <span className="text-[var(--text-secondary)]">Followers Only</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    className="text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                    onClick={() => handleDelete(resource._id)}
                    title="Delete resource"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3
                  className="font-bold text-[var(--text-primary)] mb-1 cursor-pointer hover:text-[var(--color-primary)] break-words line-clamp-2"
                  onClick={() => handleDownload(resource)}
                  title={resource.title}
                >
                  {resource.title}
                </h3>

                {resource.description && (
                  <p className="text-sm text-[var(--text-secondary)] mt-2 mb-4 line-clamp-2 break-words">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] mb-4">
                  <span className="px-2 py-1 bg-[var(--text-primary)]/5 rounded text-xs uppercase">
                    {resource.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <Download size={14} />
                    <span>{resource.downloads || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] pt-4 border-t border-[var(--text-primary)]/5">
                  <span>{formatDate(resource.uploadDate)}</span>
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex gap-1">
                      {resource.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-[var(--text-primary)]/5 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* File Upload Modal */}
      {showUploadModal && (
        <Modal
          title="Upload Resource"
          onClose={() => {
            setShowUploadModal(false);
            resetForm();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Select File
              </label>
              <div className="border-2 border-dashed border-[var(--text-primary)]/20 rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                onClick={() => document.getElementById('fileInput').click()}>
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.mp4,.doc,.docx,.ppt,.pptx"
                />
                {selectedFile ? (
                  <div>
                    <File size={24} className="mx-auto mb-2 text-[var(--color-primary)]" />
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-[var(--color-primary)] mt-1">
                      {selectedFile.type.includes('video') ? 'Video' :
                        selectedFile.type.includes('pdf') ? 'PDF' : 'Document'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} className="mx-auto mb-2 text-[var(--text-secondary)]" />
                    <p className="text-sm">Click to browse files</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Supports PDF, MP4, DOC, PPT
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="Enter resource title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                rows="3"
                placeholder="Brief description of the resource"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="product, strategy, ux (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.isPublic === "true"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--text-primary)]/20 hover:border-[var(--color-primary)]/30"
                  }`}>
                  <input
                    type="radio"
                    name="visibility"
                    value="true"
                    checked={formData.isPublic === "true"}
                    onChange={() => setFormData({ ...formData, isPublic: "true" })}
                    className="sr-only"
                  />
                  <Globe size={24} className={`mb-2 ${formData.isPublic === "true" ? "text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`} />
                  <span className="font-medium">Public</span>
                  <span className="text-xs text-[var(--text-secondary)] mt-1 text-center">Visible to everyone</span>
                </label>

                <label className={`relative flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.isPublic === "false"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--text-primary)]/20 hover:border-[var(--color-primary)]/30"
                  }`}>
                  <input
                    type="radio"
                    name="visibility"
                    value="false"
                    checked={formData.isPublic === "false"}
                    onChange={() => setFormData({ ...formData, isPublic: "false" })}
                    className="sr-only"
                  />
                  <Lock size={24} className={`mb-2 ${formData.isPublic === "false" ? "text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`} />
                  <span className="font-medium">Followers Only</span>
                  <span className="text-xs text-[var(--text-secondary)] mt-1 text-center">Only your followers</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !formData.title.trim()}
                className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </span>
                ) : "Upload Resource"}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetForm();
                }}
                className="px-6 py-3 border border-[var(--text-primary)]/20 rounded-lg font-medium hover:bg-[var(--text-primary)]/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Link Upload Modal */}
      {showLinkModal && (
        <Modal
          title="Add External Link"
          onClose={() => {
            setShowLinkModal(false);
            resetForm();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="Enter resource title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="https://example.com/resource"
                required
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Supports YouTube, Google Drive, Notion, and other public links
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                rows="3"
                placeholder="Brief description of the resource"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="product, strategy, ux (comma separated)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddLink}
                disabled={uploading || !formData.title.trim() || !formData.externalUrl.trim()}
                className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </span>
                ) : "Add Link Resource"}
              </button>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  resetForm();
                }}
                className="px-6 py-3 border border-[var(--text-primary)]/20 rounded-lg font-medium hover:bg-[var(--text-primary)]/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose}>
    <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-primary)] rounded-2xl p-6 max-w-md w-full max-h-[calc(100vh-8rem)] overflow-y-auto mt-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
        <button
          onClick={onClose}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 hover:bg-[var(--text-primary)]/10 rounded-full"
        >
          <X size={24} />
        </button>
      </div>
      {children}
      </motion.div>
    </div>
  </div>
);

export default MentorResources;
