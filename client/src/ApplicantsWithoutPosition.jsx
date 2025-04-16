import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import Navbar from './Navbar';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaSearch, FaArrowLeft, FaArrowRight, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { RingLoader } from 'react-spinners'; // For loading spinner
import { motion } from 'framer-motion'; // For animation

const ApplicantsWithoutPosition = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ state: '', committee: '', position: '' });
  const [uniqueStates, setUniqueStates] = useState([]);
  const [uniqueCommittees, setUniqueCommittees] = useState([]);
  const [uniquePositions, setUniquePositions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 15;

  useEffect(() => {
    fetch('http://localhost:5000/api/applicants-without-position')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApplicants(data);
          setUniqueStates([...new Set(data.map(a => a.State).filter(Boolean))]);
          setUniqueCommittees([...new Set(data.map(a => a.Committee).filter(Boolean))]);
          setUniquePositions([...new Set(data.map(a => a.Position).filter(Boolean))]);
        } else {
          console.error('Data is not in expected format:', data);
          setApplicants([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(0); // Reset pagination on search or filter change
  }, [searchTerm, filters]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const matchesSearchTerm = Object.values(applicant).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesState = filters.state ? applicant.State === filters.state : true;
      const matchesCommittee = filters.committee ? applicant.Committee === filters.committee : true;
      const matchesPosition = filters.position ? applicant.Position === filters.position : true;

      return matchesSearchTerm && matchesState && matchesCommittee && matchesPosition;
    });
  }, [applicants, searchTerm, filters]);

  const columns = useMemo(
    () => [
      { Header: 'Individual', accessor: 'Individual' },
      { Header: 'Organization', accessor: 'Organization' },
      { Header: 'State', accessor: 'State' },
      { Header: 'Committee Name', accessor: 'Committee' },
      { Header: 'Committee Type', accessor: 'Committee Type' },
      { Header: 'Position', accessor: 'Position' },
      { Header: 'Date Joined', accessor: 'Date Joined' },
    ],
    []
  );

  const data = useMemo(() => filteredApplicants, [filteredApplicants]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data },
    useSortBy
  );

  const pageCount = Math.ceil(rows.length / rowsPerPage);
  const displayedRows = rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const headers = columns.map(col => col.Header);
    const fullData = [headers, ...filteredApplicants.map(row => columns.map(col => row[col.accessor]))];
    const ws = XLSX.utils.aoa_to_sheet(fullData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applicants');
    XLSX.writeFile(wb, 'applicants_without_position.xlsx');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const headers = columns.map(col => col.Header);
    const tableData = filteredApplicants.map(applicant =>
      columns.map(col => applicant[col.accessor] || '')
    );
    
    doc.setFontSize(14);
    doc.text('Applicants Without Position', 14, 10);
    doc.setFontSize(10);
  
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'ellipsize',
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 100 },
        4: { cellWidth: 50 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
      },
      margin: { top: 10, left: 5, right: 5 },
      tableWidth: 'auto',
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          pageWidth - 30,
          doc.internal.pageSize.height - 10
        );
      },
    });
  
    doc.save('ApplicantsWithoutPosition.pdf');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><RingLoader color="#003366" size={60} /></div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      <h1 style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '20px', color: '#003366', fontSize: '2.5rem' }}>Applicants Without Position</h1>

      {/* Search Input */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 40px 12px 15px',
              borderRadius: '25px',
              border: '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease-in-out',
            }}
          />
          <FaSearch style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#003366', fontSize: '20px' }} />
        </div>
      </div>

      {/* Filter Section */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        {/* Filters - State, Committee, Position */}
        <select
          value={filters.state}
          onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
          style={{
            marginRight: '15px',
            marginBottom: '15px',
            padding: '10px 20px',
            borderRadius: '50px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease-in-out',
            backgroundColor: filters.state ? '#e9f7fc' : '#fff',
            width: '200px',
          }}
        >
          <option value="">State</option>
          {uniqueStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <select
          value={filters.committee}
          onChange={(e) => setFilters(prev => ({ ...prev, committee: e.target.value }))}
          style={{
            marginRight: '15px',
            marginBottom: '15px',
            padding: '10px 20px',
            borderRadius: '50px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease-in-out',
            backgroundColor: filters.committee ? '#e9f7fc' : '#fff',
            width: '200px',
          }}
        >
          <option value="">Committee</option>
          {uniqueCommittees.map(committee => (
            <option key={committee} value={committee}>{committee}</option>
          ))}
        </select>
        <select
          value={filters.position}
          onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
          style={{
            marginBottom: '15px',
            padding: '10px 20px',
            borderRadius: '50px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease-in-out',
            backgroundColor: filters.position ? '#e9f7fc' : '#fff',
            width: '200px',
          }}
        >
          <option value="">Position</option>
          {uniquePositions.map(position => (
            <option key={position} value={position}>{position}</option>
          ))}
        </select>
      </div>

      {/* Scrollable Table with Sticky Headers */}
      <motion.div style={{ width: '100%', margin: '20px auto', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div style={{ maxHeight: '700px', overflowY: 'auto', overflowX: 'auto' }}>
          <table {...getTableProps()} style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#003366', color: 'white', zIndex: 1 }}>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} style={{ padding: '12px 15px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {displayedRows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
                    {row.cells.map(cell => {
                    const columnId = cell.column.id; 
                    const isPositionColumn = columnId === 'Position';

                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{
                          padding: '12px 15px',
                          textAlign: 'center',
                          border: '1px solid #ddd',
                          whiteSpace: isPositionColumn ? 'pre-line' : 'normal',
                        }}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0} style={pageButtonStyle}> <FaArrowLeft /> </button>
        <span style={{ padding: '10px', fontSize: '16px' }}>
          Page {currentPage + 1} of {pageCount}
        </span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage + 1 === pageCount} style={pageButtonStyle}> <FaArrowRight /> </button>
      </div>

      {/* Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={exportToExcel} style={exportButtonStyle}><FaFileExcel /> Export to Excel</button>
        <button onClick={exportToPDF} style={exportButtonStyle}><FaFilePdf /> Export to PDF</button>
      </div>

      <Footer />
    </div>
  );
};

const pageButtonStyle = {
  backgroundColor: '#003366',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  margin: '0 10px',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '5px',
  transition: 'background-color 0.3s',
};

const exportButtonStyle = {
  backgroundColor: '#003366',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  margin: '0 10px',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '5px',
  transition: 'background-color 0.3s',
};

export default ApplicantsWithoutPosition;
