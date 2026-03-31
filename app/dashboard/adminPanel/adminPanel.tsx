import { getSupabase } from '@/utils/supabase'
import RevenueTrend from './salesRevenue'
import TopMedicines from './bestSellingMedicine'
import InventoryHealth from "./inventoryHealth";
import SalesPerformance from './salesPerformance';
import PaymentMethods from './paymentMethods';
import RevenuePerformance from './revenuePerformance';
import AdminShell from './adminShell'; // Removed .tsx extension to comply with TypeScript config

export type Medicine = {
  medicine_id: number;
  unit_code: string | null;
  name: string;
  generic_name: string;
  dosage: string;
  form: string;
  manufacturer: string;
  price: number;
  stock_quantity: number;
  expiry_date: string | null;
  image_url: string | null;
};

type Sale = {
  revenue: number;
};

export default async function AdminPanel() {
  const supabase = await getSupabase();

  const { data: medicines } = await supabase
    .from("medicines")
    .select() as { data: Medicine[] | null };

  const { data: sales } = await supabase
    .from("sales")
    .select("revenue") as { data: Sale[] | null };

  const totalOrders = sales?.length ?? 0;
  const totalSales = sales?.reduce((sum, sale) => sum + (sale.revenue ?? 0), 0) ?? 0;
  const lowStockCount = medicines?.filter(m => m.stock_quantity < 10).length ?? 0;

  return (
    <AdminShell
      medicines={medicines ?? []}
      totalSales={totalSales}
      totalOrders={totalOrders}
      lowStockCount={lowStockCount}
    />
  );
}
