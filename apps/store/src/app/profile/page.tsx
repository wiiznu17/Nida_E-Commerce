'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AddressModal } from '@/components/address';
import { Alert } from '@/components/ui';
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
    handleLogout,
    handleLogoutAll,
    orders,
    isOrdersLoading,
    addresses,
    isAddressesLoading,
    addressActionLoading,
    addressModalOpen,
    setAddressModalOpen,
    editingAddress,
    handleOpenAddAddress,
    handleOpenEditAddress,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
  } = useProfilePage();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 font-sans">
      <ProfileHeader user={user} onLogout={handleLogout} />

      {saveSuccess && (
        <Alert variant="success" className="mb-6">
          {t('auth.profileUpdated')}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <ProfileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="col-span-1 md:col-span-9 bg-white border border-gray-200 p-6 sm:p-8">
          {activeTab === 'profile' && (
            <ProfileInfoTab
              user={user}
              formData={formData}
              isEditing={isEditing}
              onSetIsEditing={setIsEditing}
              onChange={handleFormChange}
              onSubmit={handleSubmitProfile}
              onLogoutAll={handleLogoutAll}
            />
          )}


          {activeTab === 'orders' && (
            <ProfileOrdersTab
              orders={orders}
              isLoading={isOrdersLoading}
            />
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
    </div>
  );
}
