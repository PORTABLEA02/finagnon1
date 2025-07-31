import React, { useState } from 'react';
import { InvoiceList } from './InvoiceList';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceDetail } from './InvoiceDetail';
import { PaymentForm } from './PaymentForm';
import { BillingStats } from './BillingStats';
import { InvoiceService } from '../../services/invoices';
import { Database } from '../../lib/database.types';

type Invoice = Database['public']['Tables']['invoices']['Row'];

export function BillingManager() {
  const [activeView, setActiveView] = useState<'list' | 'stats'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setSelectedInvoice(null);
    setShowInvoiceForm(true);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  const handleSaveInvoice = (invoiceData: Partial<Invoice>) => {
    const saveInvoice = async () => {
      try {
        const { invoice_items, ...invoiceInfo } = invoiceData as any;
        
        if (editingInvoice) {
          await InvoiceService.update(editingInvoice.id, invoiceInfo);
        } else {
          await InvoiceService.create(invoiceInfo, invoice_items || []);
        }
        
        setShowInvoiceForm(false);
        setEditingInvoice(null);
      } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Erreur lors de la sauvegarde de la facture');
      }
    };
    saveInvoice();
  };

  const handleSavePayment = (paymentData: any) => {
    const savePayment = async () => {
      try {
        await InvoiceService.addPayment({
          invoice_id: paymentData.invoiceId,
          amount: paymentData.amount,
          payment_method: paymentData.paymentMethod,
          payment_date: paymentData.paymentDate,
          reference: paymentData.reference,
          notes: paymentData.notes
        });
        
        setShowPaymentForm(false);
        setSelectedInvoice(null);
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Erreur lors du traitement du paiement');
      }
    };
    savePayment();
  };

  const handleCloseForm = () => {
    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedInvoice(null);
  };

  const handleCloseDetail = () => {
    setSelectedInvoice(null);
  };

  const handleEditFromDetail = () => {
    if (selectedInvoice) {
      setEditingInvoice(selectedInvoice);
      setSelectedInvoice(null);
      setShowInvoiceForm(true);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'list':
        return (
          <InvoiceList
            onSelectInvoice={handleSelectInvoice}
            onNewInvoice={handleNewInvoice}
            onEditInvoice={handleEditInvoice}
            onPayInvoice={handlePayInvoice}
          />
        );
      case 'stats':
        return <BillingStats />;
      default:
        return (
          <InvoiceList
            onSelectInvoice={handleSelectInvoice}
            onNewInvoice={handleNewInvoice}
            onEditInvoice={handleEditInvoice}
            onPayInvoice={handlePayInvoice}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveView('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Factures
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistiques
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      {selectedInvoice && !showPaymentForm && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onClose={handleCloseDetail}
          onEdit={handleEditFromDetail}
          onPay={() => handlePayInvoice(selectedInvoice)}
        />
      )}

      {showInvoiceForm && (
        <InvoiceForm
          invoice={editingInvoice || undefined}
          onClose={handleCloseForm}
          onSave={handleSaveInvoice}
        />
      )}

      {showPaymentForm && selectedInvoice && (
        <PaymentForm
          invoice={selectedInvoice}
          onClose={handleClosePaymentForm}
          onSave={handleSavePayment}
        />
      )}
    </div>
  );
}