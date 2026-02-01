import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, MapPin, Phone, Mail, Leaf, Image, FileText, RefreshCw, Eye, X, ExternalLink } from 'lucide-react';
import { AdminService } from '../../../services/api';
import { PendingFarmer } from '../../../types';

const API_BASE_URL = 'https://localhost:7216';

interface RejectModalProps {
  isOpen: boolean;
  farmer: PendingFarmer | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, farmer, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !farmer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reject Farmer Registration
        </h3>
        <p className="text-gray-600 mb-4">
          You are about to reject the registration for <strong>{farmer.username}</strong>.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={4}
            placeholder="Please provide a reason for rejection (min 10 characters)..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={reason.length < 10 || isLoading}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, imageUrl, title, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2">
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-100">
            <img
              src={fullUrl}
              alt={title}
              className="max-w-full max-h-[70vh] object-contain mx-auto rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="16">Image not available</text></svg>';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FarmerDetailModalProps {
  isOpen: boolean;
  farmer: PendingFarmer | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
  onViewImage: (url: string, title: string) => void;
}

const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ 
  isOpen, farmer, onClose, onApprove, onReject, isLoading, onViewImage 
}) => {
  if (!isOpen || !farmer) return null;

  const parseCropTypes = (cropTypes?: string): string[] => {
    if (!cropTypes) return [];
    try {
      return JSON.parse(cropTypes);
    } catch {
      return [cropTypes];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{farmer.username}</h2>
                <p className="text-primary-100 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {farmer.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Pending Approval
            </span>
            <span className="text-primary-200 text-sm">
              Applied on {formatDate(farmer.createdAt)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Farm Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary-600" />
              Farm Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              {farmer.farmName && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Farm Name</p>
                  <p className="text-gray-900 font-medium">{farmer.farmName}</p>
                </div>
              )}
              {farmer.district && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">District</p>
                  <p className="text-gray-900 font-medium">{farmer.district}</p>
                </div>
              )}
              {farmer.phoneNumber && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                  <p className="text-gray-900 font-medium">{farmer.phoneNumber}</p>
                </div>
              )}
              {farmer.farmAddress && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Farm Address</p>
                  <p className="text-gray-900 font-medium">{farmer.farmAddress}</p>
                </div>
              )}
              {farmer.cropTypes && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Crop Types</p>
                  <div className="flex flex-wrap gap-2">
                    {parseCropTypes(farmer.cropTypes).map((crop, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Farm Photo */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Farm Photo
                  </p>
                </div>
                <div className="p-4">
                  {farmer.farmPhotoUrl ? (
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img
                          src={getImageUrl(farmer.farmPhotoUrl) || ''}
                          alt="Farm"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => onViewImage(farmer.farmPhotoUrl!, 'Farm Photo')}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <button
                        onClick={() => onViewImage(farmer.farmPhotoUrl!, 'Farm Photo')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Image
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <p className="text-sm">No photo uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Identity Proof */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Identity Proof
                  </p>
                </div>
                <div className="p-4">
                  {farmer.identityProofUrl ? (
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img
                          src={getImageUrl(farmer.identityProofUrl) || ''}
                          alt="Identity Proof"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => onViewImage(farmer.identityProofUrl!, 'Identity Proof')}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <button
                        onClick={() => onViewImage(farmer.identityProofUrl!, 'Identity Proof')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Image
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <p className="text-sm">No document uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 font-medium"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve Farmer
          </button>
        </div>
      </div>
    </div>
  );
};

const FarmerApproval: React.FC = () => {
  const [pendingFarmers, setPendingFarmers] = useState<PendingFarmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; farmer: PendingFarmer | null }>({
    isOpen: false,
    farmer: null,
  });
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; farmer: PendingFarmer | null }>({
    isOpen: false,
    farmer: null,
  });
  const [imageViewer, setImageViewer] = useState<{ isOpen: boolean; url: string | null; title: string }>({
    isOpen: false,
    url: null,
    title: '',
  });

  const fetchPendingFarmers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AdminService.getPendingFarmers();
      if (response.success && response.data) {
        setPendingFarmers(response.data);
      } else {
        setError(response.message || 'Failed to fetch pending farmers');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending farmers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFarmers();
  }, []);

  const handleApprove = async (farmer: PendingFarmer) => {
    try {
      setActionLoading(farmer.id);
      setError(null);
      const response = await AdminService.approveFarmer(farmer.id);
      if (response.success) {
        setSuccessMessage(`Successfully approved ${farmer.username}'s registration`);
        setPendingFarmers((prev) => prev.filter((f) => f.id !== farmer.id));
        setDetailModal({ isOpen: false, farmer: null });
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.message || 'Failed to approve farmer');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve farmer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectModal.farmer) return;

    try {
      setActionLoading(rejectModal.farmer.id);
      setError(null);
      const response = await AdminService.rejectFarmer(rejectModal.farmer.id, reason);
      if (response.success) {
        setSuccessMessage(`Rejected ${rejectModal.farmer.username}'s registration`);
        setPendingFarmers((prev) => prev.filter((f) => f.id !== rejectModal.farmer?.id));
        setRejectModal({ isOpen: false, farmer: null });
        setDetailModal({ isOpen: false, farmer: null });
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.message || 'Failed to reject farmer');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject farmer');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const openViewMore = (farmer: PendingFarmer) => {
    setDetailModal({ isOpen: true, farmer });
  };

  const handleViewImage = (url: string, title: string) => {
    setImageViewer({ isOpen: true, url, title });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Loading pending registrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Farmer Approvals</h2>
          <p className="text-gray-600 mt-1">Review and approve farmer registrations</p>
        </div>
        <button
          onClick={fetchPendingFarmers}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {pendingFarmers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">There are no pending farmer registrations to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingFarmers.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{farmer.username}</h3>
                    <p className="text-gray-500 text-sm truncate">{farmer.email}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {farmer.farmName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Leaf className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{farmer.farmName}</span>
                    </div>
                  )}
                  {farmer.district && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{farmer.district}</span>
                    </div>
                  )}
                  {farmer.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{farmer.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(farmer.createdAt)}
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openViewMore(farmer)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View More
                  </button>
                  <button
                    onClick={() => handleApprove(farmer)}
                    disabled={actionLoading === farmer.id}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
                    title="Approve"
                  >
                    {actionLoading === farmer.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setRejectModal({ isOpen: true, farmer })}
                    disabled={actionLoading === farmer.id}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModal.isOpen}
        farmer={rejectModal.farmer}
        onClose={() => setRejectModal({ isOpen: false, farmer: null })}
        onConfirm={handleReject}
        isLoading={actionLoading === rejectModal.farmer?.id}
      />

      {/* Farmer Detail Modal */}
      <FarmerDetailModal
        isOpen={detailModal.isOpen}
        farmer={detailModal.farmer}
        onClose={() => setDetailModal({ isOpen: false, farmer: null })}
        onApprove={() => detailModal.farmer && handleApprove(detailModal.farmer)}
        onReject={() => {
          if (detailModal.farmer) {
            setRejectModal({ isOpen: true, farmer: detailModal.farmer });
          }
        }}
        isLoading={actionLoading === detailModal.farmer?.id}
        onViewImage={handleViewImage}
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={imageViewer.isOpen}
        imageUrl={imageViewer.url}
        title={imageViewer.title}
        onClose={() => setImageViewer({ isOpen: false, url: null, title: '' })}
      />
    </div>
  );
};

export default FarmerApproval;
