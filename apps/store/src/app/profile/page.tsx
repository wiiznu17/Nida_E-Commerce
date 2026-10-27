'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AddressModal } from '@/components/address';
import { Alert, AlertModal } from '@/components/ui';
import { SignOutConfirmModal } from '@/components/common';
import {
  ProfileHeader,
  ProfileNavigation,
  ProfileInfoTab,
  ProfileOrdersTab,
  ProfileAddressesTab,
  useProfilePage,
} from '@/components/profile';

export default function ProfilePage() {
  const { t } = useLanguage();
  const {
    user,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    saveSuccess,
    formData,
    handleFormChange,
    handleSubmitProfile,
    isSignOutModalOpen,
    setIsSignOutModalOpen,
    isSignOutAllModalOpen,
    setIsSignOutAllModalOpen,
    orders,
    isOrdersLoading,
    addresses,
    isAddressesLoading,
    addressActionLoading,
    addressModalOpen,
    setAddressModalOpen,
    editingAddress,
    addressToDelete,
    setAddressToDelete,
    handleOpenAddAddress,
    handleOpenEditAddress,
    handleSaveAddress,
    handleDeleteAddress,
    handleConfirmDeleteAddress,
    handleSetDefaultAddress,
  } = useProfilePage();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 font-sans">
      <ProfileHeader
        user={user}
        onLogout={() => setIsSignOutModalOpen(true)}
      />

      {saveSuccess && (
        <Alert variant="success" className="mb-6">
          {t('auth.profileUpdated')}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="col-span-1 md:col-span-9 bg-white border border-gray-200 p-6 sm:p-8">
          {activeTab === 'profile' && (
            <ProfileInfoTab
              user={user}
              formData={formData}
              isEditing={isEditing}
              onSetIsEditing={setIsEditing}
              onChange={handleFormChange}
              onSubmit={handleSubmitProfile}
              onLogoutAll={() => setIsSignOutAllModalOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <ProfileOrdersTab orders={orders} isLoading={isOrdersLoading} />
          )}

          {activeTab === 'addresses' && (
            <ProfileAddressesTab
              addresses={addresses}
              isLoading={isAddressesLoading}
              isActionLoading={addressActionLoading}
              onOpenAddAddress={handleOpenAddAddress}
              onOpenEditAddress={handleOpenEditAddress}
              onDeleteAddress={handleDeleteAddress}
              onSetDefaultAddress={handleSetDefaultAddress}
            />
          )}
        </div>
      </div>

      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        address={editingAddress}
        onSave={handleSaveAddress}
      />

      {/* SweetAlert Sign Out Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      />

      {/* SweetAlert Sign Out All Devices Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutAllModalOpen}
        onClose={() => setIsSignOutAllModalOpen(false)}
        allDevices
      />

      {/* SweetAlert Delete Address Confirmation Modal */}
      <AlertModal
        isOpen={Boolean(addressToDelete)}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleConfirmDeleteAddress}
        title={t('addressBook.deleteTitle')}
        description={t('addressBook.deleteDesc')}
        confirmText={t('addressBook.deleteButton')}
        cancelText={t('common.cancel')}
        variant="danger"
        icon={Trash2}
        isLoading={addressActionLoading}
      />
    </div>
  );
}
