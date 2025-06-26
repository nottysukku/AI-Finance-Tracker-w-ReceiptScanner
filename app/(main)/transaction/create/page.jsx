import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";
import { redirect } from "next/navigation";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const editId = (await searchParams)?.edit;

  // If no accounts, redirect to dashboard (this handles build-time issues)
  if (!accounts || accounts.length === 0) {
    redirect('/dashboard');
  }

  let initialData = null;
  if (editId) {
    try {
      const transaction = await getTransaction(editId);
      initialData = transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      // Continue without initial data if there's an error
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">Add Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
