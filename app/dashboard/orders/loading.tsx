import { DashboardLayout } from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
