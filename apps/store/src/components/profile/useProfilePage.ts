'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { addressRequester } from '@/api';
import { orderRequester } from '@/api/requester/orderRequester';
import type { ApiAddress, CreateAddressDto, ApiOrder } from '@repo/types';
import type { ProfileTab, ProfileFormData } from './profileTypes';

export function useProfilePage() {
  const { user, token, logout, logoutAll, updateProfile } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    postalCode: user?.postalCode ?? '',
  });

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ApiAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<ApiAddress | null>(null);
  const [addressActionLoading, setAddressActionLoading] = useState(false);

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSignOutAllModalOpen, setIsSignOutAllModalOpen] = useState(false);

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsOrdersLoading(true);
    try {
      const data = await orderRequester.getMyOrders(token);
      setOrders(data);
    } catch {
      // Graceful fallback
    } finally {
      setIsOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'orders' && token) {
      void fetchOrders();
    }
  }, [activeTab, token, fetchOrders]);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setIsAddressesLoading(true);
    try {
      const data = await addressRequester.getAddresses(token);
      setAddresses(data);
    } catch {
      // Graceful fallback
    } finally {
      setIsAddressesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'addresses' && token) {
      void fetchAddresses();
    }
  }, [activeTab, token, fetchAddresses]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setFormData({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
        city: user.city ?? '',
        postalCode: user.postalCode ?? '',
      });
    }
  }, [user, router, language]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleLogoutAll = async () => {
    await logoutAll();
    router.push('/login');
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Ignore update error
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: ApiAddress) => {
    setEditingAddress(addr);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (data: CreateAddressDto) => {
    if (!token) return;
    if (editingAddress) {
      await addressRequester.updateAddress(editingAddress.id, data, token);
    } else {
      await addressRequester.createAddress(data, token);
    }
    await fetchAddresses();
  };

  const handleDeleteAddress = (addr: ApiAddress) => {
    setAddressToDelete(addr);
  };

  const handleConfirmDeleteAddress = async () => {
    if (!token || !addressToDelete) return;
    setAddressActionLoading(true);
    try {
      await addressRequester.deleteAddress(addressToDelete.id, token);
      setAddressToDelete(null);
      await fetchAddresses();
    } finally {
      setAddressActionLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addr: ApiAddress) => {
    if (!token) return;
    setAddressActionLoading(true);
    try {
      await addressRequester.setDefaultAddress(addr.id, token);
      await fetchAddresses();
    } finally {
      setAddressActionLoading(false);
    }
  };

  return {
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
  };
}
