import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, UserCheck } from 'lucide-react';
import { AdminLayout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui';

export interface AdminAccessDeniedProps {
  requiredPermission?: string;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ requiredPermission }) => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { t } = useLanguage();

  return (
    <AdminLayout>
      <div className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FAF7F2] border border-[#EAE3D9] p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-700">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="inline-block px-3 py-1 bg-[#2B1810]/5 text-[#2B1810] text-[10px] font-black uppercase tracking-widest border border-[#2B1810]/15 mb-3">
            {t('accessDenied.badge')}
          </div>

          <h1 className="text-xl font-serif text-[#2B1810] font-bold tracking-tight mb-2">
            {t('accessDenied.title')}
          </h1>

          <p className="text-xs text-[#2B1810]/70 leading-relaxed mb-6 font-medium">
            {t('accessDenied.description')}
          </p>

          <div className="bg-white border border-[#EAE3D9] p-4 text-left mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2B1810]/50">
                {t('accessDenied.currentAccount')}
              </span>
              <span className="font-semibold text-[#2B1810]">{admin?.email ?? '-'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2B1810]/50">
                {t('accessDenied.currentRole')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FAF7F2] border border-[#EAE3D9] text-[11px] font-bold text-[#2B1810]">
                <UserCheck className="w-3 h-3 text-[#2B1810]/60" />
                {admin?.role?.roleName ?? admin?.role?.roleCode ?? '-'}
              </span>
            </div>

            {requiredPermission && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE3D9]/60">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                  {t('accessDenied.requiredScope')}
                </span>
                <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200">
                  {requiredPermission}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto text-xs uppercase tracking-wider font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              {t('accessDenied.goBack')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto text-xs uppercase tracking-wider font-bold bg-[#2B1810] text-[#FAF7F2] hover:bg-[#3D2217]"
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
              {t('accessDenied.returnDashboard')}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAccessDenied;
