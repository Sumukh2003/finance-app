import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>Total Balance</CardHeader>
        <CardContent className="text-2xl font-bold">₹45,000</CardContent>
      </Card>

      <Card>
        <CardHeader>Monthly Income</CardHeader>
        <CardContent className="text-2xl text-green-600">₹60,000</CardContent>
      </Card>

      <Card>
        <CardHeader>Monthly Expense</CardHeader>
        <CardContent className="text-2xl text-red-600">₹15,000</CardContent>
      </Card>
    </div>
  );
}
