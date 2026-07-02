import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";
import CustomerSidebar from "@/features/customer/components/CustomerSidebar";

type CustomerLayoutProps = {
  children: React.ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <AuthRouteGuard allowedRoles={["customer"]}>
        <div dir="rtl" className="min-h-dvh bg-[#FFF9F4] lg:h-dvh lg:overflow-hidden">
          <CustomerSidebar />

          <main className="min-h-dvh px-4 pb-8 pt-20 lg:h-dvh lg:overflow-hidden lg:px-6 lg:py-6 lg:pr-[370px]">
            <div className="min-h-[calc(100dvh-7rem)] overflow-hidden rounded-[1.6rem] border border-orange-100 bg-white shadow-sm lg:h-full lg:min-h-0">
              {children}
            </div>
          </main>
        </div>
    </AuthRouteGuard>
  );
}