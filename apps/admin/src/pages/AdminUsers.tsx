import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  ShieldCheck,
  Check,
  Copy,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { authRequester } from '../api/requester/authRequester';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { AdminLayout } from '../components/layout';
import {
  ApiErrorModal,
  AlertModal,
  InlineError,
  DropdownSelect,
} from '../components/ui';
import type { ApiAdminUser, ApiAdminRole } from '@repo/types';

export const AdminUsers: React.FC = () => {
  const { admin: currentAdmin } = useAuth();
  const { t } = useLanguage();

  const [users, setUsers] = useState<ApiAdminUser[]>([]);
  const [roles, setRoles] = useState<ApiAdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Dev link copy dialog state
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(
    null,
  );
  const [hasCopied, setHasCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userList, roleList] = await Promise.all([
        authRequester.getUsers(),
        authRequester.getRoles(),
      ]);
      setUsers(userList);
      setRoles(roleList);
      if (roleList.length > 0 && !inviteRoleId) {
        setInviteRoleId(roleList[0]?.id ?? '');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('users.load_error');
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [t, inviteRoleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenInvite = () => {
    setInviteName('');
    setInviteEmail('');
    setInviteDept('');
    setFieldErrors({});
    if (roles.length > 0) {
      setInviteRoleId(roles[0]?.id ?? '');
    }
    setIsInviteOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!inviteName.trim()) {
      errors.name = t('common.error') ?? 'Required';
    }
    if (!inviteEmail.trim()) {
      errors.email = t('common.error') ?? 'Required';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmittingInvite(true);

    try {
      const res = await authRequester.inviteUser({
        fullName: inviteName.trim(),
        email: inviteEmail.trim(),
        roleId: inviteRoleId,
        department: inviteDept.trim() || undefined,
      });

      setIsInviteOpen(false);
      fetchData();
      toast.success(t('users.invite_success_title'));

      if (res.inviteLink) {
        setCreatedInviteLink(res.inviteLink);
        setHasCopied(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('users.invite_failed');
      setApiError(msg);
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdInviteLink) return;
    navigator.clipboard.writeText(createdInviteLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleToggleStatus = async (user: ApiAdminUser) => {
    if (user.id === currentAdmin?.id) return;
    try {
      await authRequester.toggleUserStatus(user.id);
      fetchData();
      toast.success(t('common.success') ?? 'Status updated');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  return (
    <AdminLayout
      title={t('users.title')}
      subtitle={t('users.breadcrumb')}
      actionButton={
        <button
          onClick={handleOpenInvite}
          className="inline-flex items-center justify-center space-x-2 bg-brand-brown hover:bg-brand-dark-brown active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2]" />
          <span>{t('users.invite_admin_button')}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Users Table Card */}
        <div className="bg-white border border-[#EAE3D9] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EAE3D9] text-[10px] font-black uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-6">{t('users.col_admin')}</th>
                  <th className="py-3.5 px-6">{t('users.col_role')}</th>
                  <th className="py-3.5 px-6">{t('users.col_department')}</th>
                  <th className="py-3.5 px-6">{t('users.col_status')}</th>
                  <th className="py-3.5 px-6">{t('users.col_last_login')}</th>
                  <th className="py-3.5 px-6 text-right">
                    {t('users.col_actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-stone-400"
                    >
                      <div className="w-6 h-6 border-2 border-stone-300 border-t-[#2B1810] rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {t('users.loading')}
                      </span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-stone-400 text-xs"
                    >
                      {t('users.empty_state')}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isCurrent = user.id === currentAdmin?.id;
                    const initials = user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-[#FAF7F2]/40 transition-colors"
                      >
                        {/* Name & Email */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-[#2B1810] text-[#FAF7F2] flex items-center justify-center font-bold text-xs tracking-wider shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-[#2B1810] flex items-center space-x-2">
                                <span>{user.fullName}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                                    {t('users.you_badge')}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500 font-mono">
                                {user.email} • @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#2B1810]/5 text-[#2B1810] border border-[#2B1810]/10">
                            <ShieldCheck className="w-3 h-3 text-[#2B1810]" />
                            <span>{user.role.roleName}</span>
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-4 px-6 text-stone-600 font-medium">
                          {user.department ?? '—'}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          {user.isActive ? (
                            <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{t('users.status_active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>
                                {t('users.status_pending_or_inactive')}
                              </span>
                            </span>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="py-4 px-6 text-stone-500 text-[11px]">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString(
                                'th-TH',
                                {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                },
                              )
                            : t('users.never_logged_in')}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          {!isCurrent && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              title={
                                user.isActive
                                  ? t('users.deactivate')
                                  : t('users.activate')
                              }
                              className="text-stone-400 hover:text-[#2B1810] transition-colors p-1 cursor-pointer"
                            >
                              {user.isActive ? (
                                <ToggleRight className="w-6 h-6 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-6 h-6 text-stone-400" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Admin Modal */}
        {isInviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white border border-brand-border rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Dismiss X button */}
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                disabled={isSubmittingInvite}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-40"
                aria-label={t('common.close')}
              >
                <X size={16} />
              </button>

              {/* Modal Header */}
              <div className="flex items-start space-x-3.5 mb-5 pr-6">
                <div className="w-10 h-10 rounded-full bg-brand-cream border border-brand-border text-brand-brown flex items-center justify-center shrink-0 shadow-2xs">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-brand-brown tracking-tight leading-snug">
                    {t('users.invite_modal_title')}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    {t('users.invite_modal_desc')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1.5">
                    {t('users.form_full_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Kanya Somchai"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs text-brand-brown placeholder:text-stone-400 focus:outline-none transition-colors ${
                      fieldErrors.name
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                        : 'border-brand-border focus:border-brand-brown focus:ring-1 focus:ring-brand-brown/20'
                    }`}
                  />
                  <InlineError message={fieldErrors.name} />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1.5">
                    {t('users.form_email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="kanya@nida-apparel.com"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs text-brand-brown placeholder:text-stone-400 focus:outline-none transition-colors ${
                      fieldErrors.email
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                        : 'border-brand-border focus:border-brand-brown focus:ring-1 focus:ring-brand-brown/20'
                    }`}
                  />
                  <InlineError message={fieldErrors.email} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1.5">
                      {t('users.form_role')} *
                    </label>
                    <DropdownSelect
                      value={inviteRoleId}
                      onChange={(val) => setInviteRoleId(val)}
                      options={roles.map((r) => ({
                        value: r.id,
                        label: r.roleName,
                      }))}
                      className="h-[38px] rounded-xl border-brand-border text-xs text-brand-brown shadow-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1.5">
                      {t('users.form_department')}
                    </label>
                    <input
                      type="text"
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      placeholder="Logistics"
                      className="w-full px-3.5 py-2.5 border border-brand-border rounded-xl text-xs text-brand-brown placeholder:text-stone-400 focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-brand-cream">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    disabled={isSubmittingInvite}
                    className="px-4 py-2.5 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {t('users.btn_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInvite || !inviteName || !inviteEmail}
                    className="px-5 py-2.5 bg-brand-dark-brown hover:bg-brand-brown text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                  >
                    {isSubmittingInvite ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t('users.btn_send_invite')}</span>
                      </>
                    ) : (
                      <span>{t('users.btn_send_invite')}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dev Mode Link Alert Modal */}
        <AlertModal
          isOpen={Boolean(createdInviteLink)}
          onClose={() => setCreatedInviteLink(null)}
          onConfirm={() => setCreatedInviteLink(null)}
          title={t('users.invite_success_title')}
          description={t('users.invite_success_desc')}
          variant="success"
          confirmText={t('users.btn_close')}
          showCancel={false}
          maxWidth="md"
        >
          {createdInviteLink && (
            <div className="space-y-3 pt-1">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-700 truncate pr-3 select-all">
                  {createdInviteLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 p-2 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-700 transition-all flex items-center space-x-1 text-xs cursor-pointer"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">
                        {t('users.copied')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t('users.copy_link')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center">
                <a
                  href={createdInviteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-brown font-bold hover:underline"
                >
                  <span>{t('users.open_in_new_tab')}</span>
                  <ExternalLink className="w-3 h-3 text-brand-amber" />
                </a>
              </div>
            </div>
          )}
        </AlertModal>
      </div>

      {/* API Error Modal */}
      <ApiErrorModal
        isOpen={Boolean(apiError)}
        onClose={() => setApiError(null)}
        errorMessage={apiError ?? ''}
        onRetry={fetchData}
      />
    </AdminLayout>
  );
};
