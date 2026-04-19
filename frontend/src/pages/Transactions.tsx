import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: number;
  amount: number;
  transactionType: string;
  status: string;
  description: string;
  referenceNumber: string;
  createdAt: string;
}

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async (uid: number) => {
      try {
        setLoading(true);
        // Find user's primary account
        const accountRes = await api.get(`/accounts/primary/${uid}`);
        if (accountRes.data?.id) {
          const txRes = await api.get(`/transactions/account/${accountRes.data.id}`);
          setTransactions(txRes.data);
        } else {
          setTransactions([]);
        }
      } catch (err: any) {
        console.error('Transactions fetch error:', err);
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    const uid = user?.id || (user as any)?.userId;
    if (uid) fetchTransactions(uid);
  }, [user]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || tx.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) return toast.error('No transactions to export');
    
    const doc = new jsPDF();
    
    // Add Brand Header
    doc.setFillColor(79, 70, 229); // primary-600
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FinanceHub', 14, 25);
    doc.setFontSize(10);
    doc.text('Transaction History Report', 14, 32);
    
    // Reset for content
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`User: ${user?.fullName || 'Authenticated User'}`, 14, 56);
    
    const headers = [['Date', 'Reference', 'Description', 'Type', 'Amount', 'Status']];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.referenceNumber,
      tx.description,
      tx.transactionType,
      `$${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      tx.status
    ]);

    autoTable(doc, {
      startY: 65,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { 
        fillColor: [79, 70, 229], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4 
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      }
    });

    doc.save(`FinanceHub_Transactions_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Transactions exported as PDF!');
  };

  const downloadSingleReport = (tx: Transaction) => {
    const doc = new jsPDF();
    
    // Receipt Design
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FinanceHub', 14, 25);
    doc.setFontSize(10);
    doc.text('Official Transaction Receipt', 14, 32);
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text('Transaction Details', 14, 60);
    
    const details = [
      ['Date', new Date(tx.createdAt).toLocaleString()],
      ['Reference No', tx.referenceNumber],
      ['Description', tx.description],
      ['Transaction Type', tx.transactionType],
      ['Amount', `$${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
      ['Status', tx.status]
    ];

    autoTable(doc, {
      startY: 65,
      body: details,
      theme: 'plain',
      styles: { 
        fontSize: 10,
        cellPadding: 6 
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.cursor.y + 20;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated document and does not require a signature.', 14, finalY);
    doc.text('FinanceHub Security | 2026', 14, finalY + 5);

    doc.save(`Transaction_${tx.referenceNumber}.pdf`);
    toast.success('PDF Receipt downloaded!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={12} />;
      case 'PENDING': return <Clock size={12} />;
      case 'FAILED': return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <DashboardLayout title="Transactions">
      <div className="space-y-6">
        {/* Advanced Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by description or ref..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <button 
              onClick={exportToPDF}
              className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all shadow-sm flex items-center gap-2 px-3"
              title="Download PDF"
            >
              <Download size={18} />
              <span className="text-xs font-bold hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-premium border-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading transactions...</td></tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No transactions found</td></tr>
                ) : filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.transactionType === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tx.transactionType === 'DEPOSIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight capitalize">{tx.description.toLowerCase()}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tight">Ref: {tx.referenceNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`font-display font-bold text-base ${
                        tx.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900'
                      }`}>
                        {tx.transactionType === 'DEPOSIT' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => downloadSingleReport(tx)}
                          className="p-2 text-slate-400 hover:bg-slate-50 hover:text-primary-600 rounded-lg transition-all"
                          title="Download Report"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedTx(tx)}
                          className="p-2 text-slate-400 hover:bg-slate-50 hover:text-primary-600 rounded-lg transition-all"
                          title="View Details"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedTx(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn p-10">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                selectedTx.transactionType === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {selectedTx.transactionType === 'DEPOSIT' ? <ArrowDownLeft size={32} /> : <ArrowUpRight size={32} />}
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 capitalize">{selectedTx.description.toLowerCase()}</h2>
              <p className="text-slate-500 font-medium">Transaction Details</p>
            </div>

            <div className="space-y-4 bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                <span className={`text-xl font-display font-bold ${selectedTx.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900'}`}>
                  {selectedTx.transactionType === 'DEPOSIT' ? '+' : '-'}${selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Date</span>
                <span className="font-bold text-slate-700">{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reference</span>
                <span className="font-mono font-bold text-slate-700">{selectedTx.referenceNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(selectedTx.status)}`}>
                  {getStatusIcon(selectedTx.status)}
                  {selectedTx.status}
                </span>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Close
              </button>
               <button 
                onClick={() => {
                  downloadSingleReport(selectedTx);
                  setSelectedTx(null);
                }}
                className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Transactions;
