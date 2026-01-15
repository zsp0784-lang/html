import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Banknote, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id: string;
  amount: number;
  payer: string;
  expenseType: string;
  paymentType: string;
  splitWith: string[];
  date: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const MEMBERS = ['瑋', '博', '帆'];
const EXPENSE_TYPES = ['餐飲', '購物', '借款', '交通', '住宿', '門票', '其他'];
const API_URL = '/api/money';

export default function Money() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [paymentType, setPaymentType] = useState('三人分攤');
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'success' | 'failed' | 'syncing'>('syncing');

  // 從後端加載數據
  useEffect(() => {
    fetchExpenses();
    // 每 3 秒自動刷新一次（實現同步）
    const interval = setInterval(fetchExpenses, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchExpenses = async () => {
    try {
      setSyncStatus('syncing');
      const response = await fetch(`${API_URL}/expenses`);
      if (response.ok) {
        const data = await response.json();
        // 過濾掉 null 或無效的記錄，防止 amount 為 null 導致的錯誤
        const validExpenses = (data.expenses || []).filter(
          (e: any) => e && e.amount !== null && e.amount !== undefined
        );
        setExpenses(validExpenses);
        setSyncStatus('success');
        setLoading(false);
      } else {
        setSyncStatus('failed');
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setSyncStatus('failed');
      setLoading(false);
    }
  };

  // 計算結算 - 完整修正版本
  useEffect(() => {
    const balances: { [key: string]: number } = {};

    // 初始化所有成員的餘額
    MEMBERS.forEach(member => {
      balances[member] = 0;
    });

    // 遍歷所有記帳，計算每個人的淨餘額
    expenses.forEach(expense => {
      if (expense.paymentType === '三人分攤') {
        // 三人分攤：每個人平均分擔
        const amountPerPerson = expense.amount / MEMBERS.length;
        MEMBERS.forEach(member => {
          if (member === expense.payer) {
            balances[member] += expense.amount - amountPerPerson;
          } else {
            balances[member] -= amountPerPerson;
          }
        });
      } else if (expense.paymentType === '跟誰分攤') {
        // 跟誰分攤：只有支付者和選中的人分擔
        const participants = [expense.payer, ...expense.splitWith];
        const amountPerPerson = expense.amount / participants.length;
        participants.forEach(member => {
          if (member === expense.payer) {
            balances[member] += expense.amount - amountPerPerson;
          } else {
            balances[member] -= amountPerPerson;
          }
        });
      } else if (expense.paymentType === '借錢給誰') {
        // 借錢給誰：支付者借給選中的人，每個人都欠整筆金額（不分配）
        expense.splitWith.forEach(member => {
          balances[expense.payer] += expense.amount;
          balances[member] -= expense.amount;
        });
      } else if (expense.paymentType === '還款給誰') {  
       // 還款給誰：支付者還錢給選中的人，抵消債務  
        const amountPerPerson = expense.amount / expense.splitWith.length;  
          expense.splitWith.forEach(member => {    
          balances[expense.payer] += amountPerPerson;  // ✅ 支付人的欠款減少    
          balances[member] -= amountPerPerson;         // ✅ 接收人的被欠減少    
        });    
      }  

    // 使用貪心算法計算最優結算方案
    const newSettlements: Settlement[] = [];
    const tempBalances = { ...balances };

    while (true) {
      // 找欠錢最多的人（balance 最負）
      let debtor = '';
      let maxDebt = 0;
      Object.entries(tempBalances).forEach(([member, balance]) => {
        if (balance < -0.01 && Math.abs(balance) > maxDebt) {
          debtor = member;
          maxDebt = Math.abs(balance);
        }
      });

      // 找被欠最多的人（balance 最正）
      let creditor = '';
      let maxCredit = 0;
      Object.entries(tempBalances).forEach(([member, balance]) => {
        if (balance > 0.01 && balance > maxCredit) {
          creditor = member;
          maxCredit = balance;
        }
      });

      // 如果沒有欠錢或被欠的人，結束
      if (!debtor || !creditor) break;

      // 計算結算金額（取較小值）
      const amount = Math.min(Math.abs(tempBalances[debtor]), tempBalances[creditor]);

      newSettlements.push({ from: debtor, to: creditor, amount });
      tempBalances[debtor] += amount;
      tempBalances[creditor] -= amount;
    }

    setSettlements(newSettlements);
  }, [expenses]);

  const handleAddExpense = async () => {
    // 驗證必填欄位
    if (!amount || !payer) {
      toast.error('請填寫金額和支付人');
      return;
    }

    // 驗證帳務類型 - 只在非借錢/還款時需要
    if (paymentType !== '借錢給誰' && paymentType !== '還款給誰' && !expenseType) {
      toast.error('請選擇帳務類型');
      return;
    }

    // 驗證分帳人員
    if ((paymentType === '跟誰分攤' || paymentType === '借錢給誰' || paymentType === '還款給誰') && splitWith.length === 0) {
      toast.error('請選擇分帳人員');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      payer,
      expenseType,
      paymentType,
      splitWith,
      date: new Date().toLocaleString('zh-TW')
    };

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });

      if (response.ok) {
        toast.success('記帳成功！');
        setAmount('');
        setPayer('');
        setExpenseType('');
        setPaymentType('三人分攤');
        setSplitWith([]);
        await fetchExpenses(); // 立即刷新
      } else {
        toast.error('記帳失敗');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('記帳失敗');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('已刪除');
        await fetchExpenses();
      } else {
        toast.error('刪除失敗');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('刪除失敗');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('確定要清空所有記錄嗎？此操作無法撤銷。')) {
      try {
        const response = await fetch(`${API_URL}/expenses`, {
          method: 'DELETE'
        });

        if (response.ok) {
          toast.success('已清空所有記錄');
          await fetchExpenses();
        } else {
          toast.error('清空失敗');
        }
      } catch (error) {
        console.error('Error clearing expenses:', error);
        toast.error('清空失敗');
      }
    }
  };

  const handleSplitWithChange = (member: string, checked: boolean) => {
    if (paymentType === '還款給誰' || paymentType === '借錢給誰') {
      if (checked) {
        setSplitWith([...splitWith, member]);
      } else {
        setSplitWith(splitWith.filter(m => m !== member));
      }
    } else {
      setSplitWith(checked ? [member] : []);
    }
  };

  const isMultiSelect = paymentType === '還款給誰' || paymentType === '借錢給誰';

  const getNameBgColor = (name: string) => {
    if (name === '瑋') return 'bg-[#C41E3A]';
    if (name === '博') return 'bg-[#1a1a1a]';
    if (name === '帆') return 'bg-[#003DA5]';
    return 'bg-[#8B6F47]';
  };

  const totalExpense = expenses.reduce((sum, e) => sum + (e?.amount || 0), 0);

  // 計算待結算（所有欠款的總和）
  const totalSettlement = settlements.reduce((sum, s) => sum + s.amount, 0);

  if (loading) {
    return <div className="p-6 text-center">加載中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] pb-8">
      <div className="w-full px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* PC 版：左邊記帳表單，右邊即時結算+總支出+待結算 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：記帳表單 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8DDD8] space-y-4">
              {/* 金額輸入 - 大字標題 */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Banknote className="w-8 h-8 text-[#8B6F47]" />
                  <label className="text-2xl font-black text-[#3D3D3D]" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>
                    金額 (JPY)
                  </label>
                </div>
                <Input
                  type="number"
                  placeholder="輸入金額"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-[#F5E6E8] border-[#E8DDD8] text-[#3D3D3D] placeholder-[#7A7A7A] text-lg"
                />
              </div>

              {/* 支付人選擇 */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
                  支付人
                </label>
                <select 
                  value={payer} 
                  onChange={(e) => setPayer(e.target.value)}
                  className="w-full bg-[#F5E6E8] border border-[#E8DDD8] text-[#3D3D3D] rounded-md p-2"
                >
                  <option value="">選擇</option>
                  {MEMBERS.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              {/* 支付類型 */}
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
                  支付類型
                </label>
                <select 
                  value={paymentType} 
                  onChange={(e) => {
                    setPaymentType(e.target.value);
                    setSplitWith([]);
                  }}
                  className="w-full bg-[#F5E6E8] border border-[#E8DDD8] text-[#3D3D3D] rounded-md p-2"
                >
                  <option value="三人分攤">三人分攤</option>
                  <option value="跟誰分攤">跟誰分攤</option>
                  <option value="借錢給誰">借錢給誰</option>
                  <option value="還款給誰">還款給誰</option>
                </select>
              </div>

              {/* 帳務類型 - 只在非借錢/還款時顯示 */}
              {paymentType !== '借錢給誰' && paymentType !== '還款給誰' && (
                <div>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-2">
                    帳務類型
                  </label>
                  <select 
                    value={expenseType} 
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="w-full bg-[#F5E6E8] border border-[#E8DDD8] text-[#3D3D3D] rounded-md p-2"
                  >
                    <option value="">選擇類型</option>
                    {EXPENSE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 分帳人員選擇 */}
              {paymentType !== '三人分攤' && (
                <div>
                  <label className="block text-sm font-medium text-[#3D3D3D] mb-3">
                    {paymentType === '還款給誰' ? '還款給' : paymentType === '借錢給誰' ? '借給' : '分帳人員'} {isMultiSelect ? '(複選)' : '(單選)'}
                  </label>
                  <div className="space-y-2">
                    {MEMBERS.filter(m => m !== payer).map(member => (
                      <label key={member} className="flex items-center gap-3 p-3 bg-[#F5E6E8] rounded-lg cursor-pointer hover:bg-[#E8DDD8]">
                        <input
                          type={isMultiSelect ? 'checkbox' : 'radio'}
                          name={isMultiSelect ? undefined : 'splitWith'}
                          checked={splitWith.includes(member)}
                          onChange={(e) => handleSplitWithChange(member, e.target.checked)}
                          className="w-4 h-4 cursor-pointer accent-[#8B6F47]"
                        />
                        <span className="text-[#3D3D3D]">{member}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 新增按鈕 - 淡咖啡色 */}
              <Button
                onClick={handleAddExpense}
                className="w-full bg-[#d4a373] hover:bg-[#c9956a] text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-auto"
                style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}
              >
                新增記帳
              </Button>
            </div>

            {/* 右側：即時結算（上）+ 總支出+待結算（下） */}
            <div className="flex flex-col gap-6 h-full">
              {/* 即時結算 - 高度為下方的3倍 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8DDD8] flex-[3] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#3D3D3D]" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>即時結算</h2>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                      syncStatus === 'success' ? 'bg-green-500 animate-pulse' : 
                      syncStatus === 'failed' ? 'bg-red-500' : 
                      'bg-yellow-500 animate-pulse'
                    }`}></span>
                    <span className="text-xs font-medium text-[#7A7A7A]">
                      {syncStatus === 'success' ? '同步成功' : 
                       syncStatus === 'failed' ? '同步失敗' : 
                       '同步中...'}
                    </span>
                  </div>
                </div>
                
                {settlements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">🤝</div>
                    <p className="text-[#7A7A7A] text-lg font-semibold" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>互不相欠</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {settlements.map((settlement, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#F5E6E8] rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`${getNameBgColor(settlement.from)} rounded-full w-16 h-16 flex items-center justify-center text-white font-black text-2xl shadow-md`}>{settlement.from}</div>
                          <span className="text-[#7A7A7A] font-bold text-lg" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>欠</span>
                          <div className={`${getNameBgColor(settlement.to)} rounded-full w-16 h-16 flex items-center justify-center text-white font-black text-2xl shadow-md`}>{settlement.to}</div>
                        </div>
                        <span className="text-[#D97E6F] font-black text-lg" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>¥{settlement.amount.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 總支出和待結算 - 高度為上方的1/3 */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* 總支出 */}
                <div className="bg-[#F5E6E8] rounded-2xl shadow-sm p-4 border border-[#E8DDD8] flex flex-col justify-center">
                  <div className="text-left">
                    <div className="text-xs font-medium text-[#7A7A7A] mb-2">總支出</div>
                    <div className="text-3xl font-black text-[#3D3D3D]">¥{totalExpense.toFixed(0)}</div>
                  </div>
                </div>

                {/* 待結算 */}
                <div className="bg-[#F5E6E8] rounded-2xl shadow-sm p-4 border border-[#E8DDD8] flex flex-col justify-center">
                  <div className="text-left">
                    <div className="text-xs font-medium text-[#7A7A7A] mb-2">待結算</div>
                    <div className="text-3xl font-black text-[#3D3D3D]">¥{totalSettlement.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 記錄 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E8DDD8]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#3D3D3D]" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>記錄</h2>
              {expenses.length > 0 && (
                <Button
                  onClick={handleClearAll}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  清除全部
                </Button>
              )}
            </div>
            {expenses.length === 0 ? (
              <p className="text-[#7A7A7A] text-center py-6">暫無記錄</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...expenses].reverse().map(expense => (
                  <div key={expense.id} className="flex items-start justify-between p-4 bg-[#F5E6E8] rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#8B6F47]">{expense.expenseType}</span>
                        <span className="text-xs text-[#7A7A7A]">{expense.date}</span>
                      </div>
                      <div className="text-sm text-[#3D3D3D] font-black" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>
                        {expense.payer} 支付 ¥{expense.amount.toFixed(0)}
                      </div>
                      <div className="text-xs text-[#7A7A7A] mt-1" style={{ fontFamily: "'Zen Kaku Gothic Antique', sans-serif" }}>
                        {expense.paymentType === '三人分攤' 
                          ? '三人分攤' 
                          : expense.paymentType === '借錢給誰'
                          ? `借給 ${expense.splitWith.join(', ')}`
                          : `${expense.paymentType}: ${expense.splitWith.join(', ')}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="ml-3 p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <X className="w-5 h-5 text-[#D97E6F]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
