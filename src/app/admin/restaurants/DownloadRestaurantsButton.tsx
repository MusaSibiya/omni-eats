'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import styles from '../admin.module.css';

interface DownloadRestaurantsButtonProps {
    restaurants: any[];
}

export default function DownloadRestaurantsButton({ restaurants }: DownloadRestaurantsButtonProps) {
    const [format, setFormat] = useState('csv');

    const downloadCSV = () => {
        if (!restaurants || restaurants.length === 0) return;

        const headers = ['ID', 'Name', 'Status', 'Cuisine', 'Rating', 'Delivery Time', 'Owner Name', 'Owner Email', 'Created At'];
        const rows = restaurants.map(r => [
            r.id,
            `"${r.name.replace(/"/g, '""')}"`,
            r.status,
            r.cuisineType || 'N/A',
            r.rating,
            r.deliveryTime || 'N/A',
            `"${(r.owner?.name || '').replace(/"/g, '""')}"`,
            r.owner?.email || 'N/A',
            r.createdAt
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `omni_eats_restaurants_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const downloadPDF = () => {
        if (!restaurants || restaurants.length === 0) return;

        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(255, 107, 53);
        doc.text(`Omni Eats - Restaurants Report`, 14, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        autoTable(doc, {
            startY: 35,
            head: [['Name', 'Owner', 'Status', 'Cuisine', 'Rating']],
            body: restaurants.map(r => [
                r.name,
                r.owner?.name || 'N/A',
                r.status,
                r.cuisineType || 'N/A',
                r.rating.toString()
            ]),
            theme: 'grid',
            headStyles: { fillColor: [255, 107, 53] },
            styles: { fontSize: 9 }
        });

        doc.save(`omni_eats_restaurants_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const downloadDOCX = async () => {
        if (!restaurants || restaurants.length === 0) return;

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: `Omni Eats - Restaurants Report`,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Generated on: ${new Date().toLocaleDateString()}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [
                                new TableCell({ children: [new Paragraph({ text: "Name", style: 'Strong' })] }), 
                                new TableCell({ children: [new Paragraph({ text: "Owner", style: 'Strong' })] }),
                                new TableCell({ children: [new Paragraph({ text: "Status", style: 'Strong' })] }),
                                new TableCell({ children: [new Paragraph({ text: "Cuisine", style: 'Strong' })] }),
                                new TableCell({ children: [new Paragraph({ text: "Rating", style: 'Strong' })] })
                            ] }),
                            ...restaurants.map(r => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(r.name)] }), 
                                    new TableCell({ children: [new Paragraph(r.owner?.name || 'N/A')] }),
                                    new TableCell({ children: [new Paragraph(r.status)] }),
                                    new TableCell({ children: [new Paragraph(r.cuisineType || 'N/A')] }),
                                    new TableCell({ children: [new Paragraph(r.rating.toString())] })
                                ]
                            }))
                        ]
                    }),
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `omni_eats_restaurants_${new Date().toISOString().split('T')[0]}.docx`);
    };

    const handleDownload = () => {
        if (format === 'csv') downloadCSV();
        if (format === 'pdf') downloadPDF();
        if (format === 'docx') downloadDOCX();
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                <option value="csv">Excel (.csv)</option>
                <option value="pdf">PDF Document</option>
                <option value="docx">Word (.docx)</option>
            </select>

            <button
                onClick={handleDownload}
                className={styles.primaryBtn}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    fontSize: '0.9rem',
                    boxShadow: 'none'
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
            </button>
        </div>
    );
}
