import { useState, useEffect } from "react";
import { BankAccount, bankAccounts as defaultBankAccounts } from "@/data/suppliers";

const STORAGE_KEY = "autokopers_bank_accounts";

export const useBankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBankAccounts(JSON.parse(stored));
    } else {
      setBankAccounts(defaultBankAccounts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBankAccounts));
    }
  }, []);

  const addBankAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount: BankAccount = {
      ...account,
      id: `custom_${Date.now()}`,
    };
    const updated = [...bankAccounts, newAccount];
    setBankAccounts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newAccount;
  };

  const deleteBankAccount = (id: string) => {
    const updated = bankAccounts.filter((a) => a.id !== id);
    setBankAccounts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    bankAccounts,
    addBankAccount,
    deleteBankAccount,
  };
};
