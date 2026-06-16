'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface DownloadOptions {
    restaurantName: string;
    metrics: {
        totalRevenue: number;
        totalOrders: number;
        itemsSold: number;
        uniqueCustomers: number;
    };
    topItems: Array<{name: string; category: string; count: number; revenue: number}>;
    orders: Array<{id: string; date: string; customer: string; email: string; status: string; items: string; total: number}>;
}

export function ReportDownloader({ data, className }: { data: DownloadOptions, className?: string }) {
    const [format, setFormat] = useState('pdf');

    const downloadFullCSV = () => {
        let csv = `Sotobe Eats Premium Report for: ${data.restaurantName}\n`;
        csv += `Date Generated:, ${new Date().toLocaleDateString()}\n\n`;

        csv += `--- EXECUTIVE SUMMARY ---\n`;
        csv += `Total Lifetime Revenue:, R${data.metrics.totalRevenue.toFixed(2)}\n`;
        csv += `Total Orders Completed:, ${data.metrics.totalOrders}\n`;
        csv += `Total Items Sold:, ${data.metrics.itemsSold}\n`;
        csv += `Unique Customers:, ${data.metrics.uniqueCustomers}\n\n`;

        csv += `--- TOP PERFORMING MENU ITEMS ---\n`;
        csv += `Rank,Name,Category,Items Sold,Revenue Generated (ZAR)\n`;
        data.topItems.forEach((item, i) => {
            csv += `${i+1},"${item.name}","${item.category}",${item.count},${item.revenue.toFixed(2)}\n`;
        });
        csv += `\n`;

        csv += `--- FULL ORDER HISTORY ---\n`;
        csv += `Order ID,Date,Customer Name,Customer Email,Status,Items Ordered,Total Amount (ZAR)\n`;
        data.orders.forEach(order => {
            csv += `${order.id},${order.date},"${order.customer}","${order.email}",${order.status},"${order.items}",${order.total.toFixed(2)}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${data.restaurantName.replace(/\s+/g, '_')}_Full_Report.csv`);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(255, 107, 53); // Accent Primary
        doc.text(`${data.restaurantName} - Performance Report`, 14, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        // Summary View
        autoTable(doc, {
            startY: 35,
            head: [['Executive Summary', 'Value']],
            body: [
                ['Total Lifetime Revenue', `R${data.metrics.totalRevenue.toFixed(2)}`],
                ['Total Orders Completed', data.metrics.totalOrders.toString()],
                ['Total Items Sold', data.metrics.itemsSold.toString()],
                ['Unique Customers', data.metrics.uniqueCustomers.toString()],
            ],
            theme: 'grid',
            headStyles: { fillColor: [255, 107, 53] },
        });

        // Top Items
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Rank', 'Menu Item', 'Category', 'Units Sold', 'Revenue']],
            body: data.topItems.map((item, i) => [
                `#${i+1}`, item.name, item.category, item.count.toString(), `R${item.revenue.toFixed(2)}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [78, 205, 196] },
        });

        // Orders
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Order ID', 'Date', 'Customer', 'Status', 'Items', 'Total']],
            body: data.orders.map(o => [
                o.id, o.date, o.customer, o.status, o.items, `R${o.total.toFixed(2)}`
            ]),
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [50, 50, 50] },
        });

        doc.save(`${data.restaurantName.replace(/\s+/g, '_')}_Report.pdf`);
    };

    const downloadDOCX = async () => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: `${data.restaurantName} - Premium Financial Report`,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Generated on: ${new Date().toLocaleDateString()}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    
                    new Paragraph({ text: "1. Executive Summary", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [new TableCell({ children: [new Paragraph("Metric")] }), new TableCell({ children: [new Paragraph("Value")] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph("Total Revenue")] }), new TableCell({ children: [new Paragraph(`R${data.metrics.totalRevenue.toFixed(2)}`)] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph("Orders Completed")] }), new TableCell({ children: [new Paragraph(data.metrics.totalOrders.toString())] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph("Items Sold")] }), new TableCell({ children: [new Paragraph(data.metrics.itemsSold.toString())] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph("Unique Customers")] }), new TableCell({ children: [new Paragraph(data.metrics.uniqueCustomers.toString())] })] }),
                        ]
                    }),

                    new Paragraph({ text: "2. Top Performing Menu Items", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [new TableCell({ children: [new Paragraph("Name")] }), new TableCell({ children: [new Paragraph("Revenue")] })] }),
                            ...data.topItems.map(item => new TableRow({
                                children: [new TableCell({ children: [new Paragraph(`${item.name} (${item.count} items)`)] }), new TableCell({ children: [new Paragraph(`R${item.revenue.toFixed(2)}`)] })]
                            }))
                        ]
                    }),

                    new Paragraph({ text: "3. Complete Order History", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [new TableCell({ children: [new Paragraph("Date")] }), new TableCell({ children: [new Paragraph("Customer")] }), new TableCell({ children: [new Paragraph("Items")] }), new TableCell({ children: [new Paragraph("Total")] })] }),
                            ...data.orders.map(o => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(o.date)] }),
                                    new TableCell({ children: [new Paragraph(o.customer)] }),
                                    new TableCell({ children: [new Paragraph(o.items)] }),
                                    new TableCell({ children: [new Paragraph(`R${o.total.toFixed(2)}`)] })
                                ]
                            }))
                        ]
                    }),
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${data.restaurantName.replace(/\s+/g, '_')}_Report.docx`);
    };

    const handleDownload = () => {
        if (format === 'csv') downloadFullCSV();
        if (format === 'pdf') downloadPDF();
        if (format === 'docx') downloadDOCX();
    };

    return (
        <div className={className} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                style={{
                    padding: '0.6rem 1rem',
                    background: 'var(--surface-primary, rgba(255,255,255,0.05))',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                <option value="pdf">PDF Document</option>
                <option value="docx">Word (.docx)</option>
                <option value="csv">Excel (.csv)</option>
            </select>

            <button onClick={handleDownload} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'linear-gradient(135deg, var(--accent-primary, #FF6B35) 0%, #E85D2A 100%)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontWeight: '600', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
                transition: 'all 0.2s ease'
            }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
            </button>
        </div>
    );
}
