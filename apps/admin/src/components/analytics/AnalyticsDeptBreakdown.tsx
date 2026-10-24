import type { AnalyticsDepartmentShare } from '@repo/types';
import { useLanguage } from '../../context/LanguageContext';

interface AnalyticsDeptBreakdownProps {
  departments: AnalyticsDepartmentShare[];
  isLoading: boolean;
}

export function AnalyticsDeptBreakdown({
  departments,
  isLoading,
}: AnalyticsDeptBreakdownProps) {
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className="bg-white border border-brand-border rounded-xs p-6 animate-pulse">
        <div className="h-4 bg-stone-100 w-48 mb-6 rounded-xs" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-stone-50 rounded-xs" />
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = departments.reduce((acc, d) => acc + d.revenue, 0);
  const totalUnits = departments.reduce((acc, d) => acc + d.unitsSold, 0);

  return (
    <div className="space-y-6">
      {/* Department Share Stacked Bar */}
      <div className="bg-white border border-brand-border rounded-xs p-5 shadow-2xs">
        <h3 className="tracking-wider text-[11px] font-black uppercase text-stone-700 mb-3">
          {t('analytics.departments.title')}
        </h3>

        {/* Stacked Percentage Bar */}
        <div className="h-4 w-full bg-stone-100 rounded-xs overflow-hidden flex mb-4">
          {departments.map((dept) => {
            if (dept.percentage <= 0) return null;
            return (
              <div
                key={dept.department}
                style={{
                  width: `${dept.percentage}%`,
                  backgroundColor: dept.color,
                }}
                className="h-full transition-all duration-300 relative group"
                title={`${dept.labelEn}: ${dept.percentage}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-stone-600">
          {departments.map((dept) => (
            <div key={dept.department} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: dept.color }}
              />
              <span className="font-medium">
                {language === 'th' ? dept.labelTh : dept.labelEn}
              </span>
              <span className="text-stone-400">({dept.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Department Table */}
      <div className="bg-white border border-brand-border rounded-xs shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-brand-border text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
              <th className="py-3 px-4 w-52">{t('analytics.departments.colDept')}</th>
              <th className="py-3 px-4 w-40 text-right">{t('analytics.departments.colRevenue')}</th>
              <th className="py-3 px-4 w-32 text-right">{t('analytics.departments.colUnits')}</th>
              <th className="py-3 px-4 w-48">{t('analytics.departments.colShare')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-stone-400">
                  {t('analytics.departments.empty')}
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.department} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="font-medium text-brand-brown">
                        {language === 'th' ? dept.labelTh : dept.labelEn}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-stone-800">
                    ฿{dept.revenue.toLocaleString('th-TH')}
                  </td>
                  <td className="py-3 px-4 text-right text-stone-600">
                    {dept.unitsSold.toLocaleString('th-TH')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${dept.percentage}%`,
                            backgroundColor: dept.color,
                          }}
                        />
                      </div>
                      <span className="w-12 text-right font-semibold text-stone-700 text-[11px]">
                        {dept.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {departments.length > 0 && (
            <tfoot>
              <tr className="bg-stone-50/80 font-bold border-t border-brand-border text-stone-800">
                <td className="py-3 px-4 uppercase tracking-wider text-[10px]">Total</td>
                <td className="py-3 px-4 text-right">
                  ฿{totalRevenue.toLocaleString('th-TH')}
                </td>
                <td className="py-3 px-4 text-right">
                  {totalUnits.toLocaleString('th-TH')}
                </td>
                <td className="py-3 px-4 text-right text-stone-500 font-normal">
                  100%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
