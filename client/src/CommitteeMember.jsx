import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import Navbar from './Navbar';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaSearch, FaArrowLeft, FaArrowRight, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { RingLoader } from 'react-spinners';
import { motion } from 'framer-motion';

function CommitteeMembers() {
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    JobTitle: '',
    State: '',
    Organization: '',
    Committee: '',
    Position: '',
    Term: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 15;

  useEffect(() => {
    fetch('http://localhost:5000/api/committee-member')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched Data:', data);
        if (Array.isArray(data)) {
          setCommitteeMembers(data);
        } else {
          console.error('Data is not in expected format:', data);
          setCommitteeMembers([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const columns = useMemo(() => [
    { Header: 'Individual', accessor: 'Individual' },
    { Header: 'Job Title', accessor: 'JobTitle' },
    { Header: 'Organization', accessor: 'Organization' },
    { Header: 'State', accessor: 'State' },
    { Header: 'Committee', accessor: 'CommitteeName' },
    { Header: 'Position', accessor: 'Position' },
    { Header: 'Term', accessor: 'Term' },
  ], []);

  const getUniqueValues = (column) => {
    return [...new Set(committeeMembers.map(member => member[column]))];
  };

  const handleFilterChange = (e, column) => {
    setFilters({
      ...filters,
      [column]: e.target.value,
    });
    setCurrentPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(0);
  };

  const filteredCommitteeMembers = useMemo(() => {
    return committeeMembers.filter(member => {
      const searchMatch = Object.values(member).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm)
      );
      const filterMatch = Object.keys(filters).every(column => {
        if (!filters[column] || filters[column] === 'All') return true;
        return member[column]?.toString().toLowerCase() === filters[column].toLowerCase();
      });
      return searchMatch && filterMatch;
    });
  }, [committeeMembers, filters, searchTerm]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: filteredCommitteeMembers },
    useSortBy
  );

  const pageCount = Math.ceil(rows.length / rowsPerPage);
  const displayedRows = rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const exportToExcel = () => {
    const headers = columns.map(col => col.Header);
    const fullData = [headers, ...filteredCommitteeMembers.map(row => columns.map(col => row[col.accessor]))];
    const ws = XLSX.utils.aoa_to_sheet(fullData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Committee Members');
    XLSX.writeFile(wb, 'committee_members.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const headers = columns.map(col => col.Header);
    const tableData = filteredCommitteeMembers.map(row => columns.map(col => row[col.accessor] || ''));
    doc.setFontSize(14);
    doc.text('Committee Members', 14, 10);
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
      margin: { top: 10, left: 5, right: 5 },
      tableWidth: 'auto',
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(8);
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10);
      },
    });
    doc.save('CommitteeMembers.pdf');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><RingLoader color="#003366" size={60} /></div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      <h1 style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '20px', color: '#003366', fontSize: '2.5rem' }}>Committee Members</h1>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search committee members..."
            value={searchTerm}
            onChange={handleSearchChange}
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

      <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        {['JobTitle', 'State', 'Organization', 'CommitteeName', 'Position', 'Term'].map(key => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => handleFilterChange(e, key)}
            style={selectStyles}
          >
            <option value=''>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</option>
            {getUniqueValues(key).map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        ))}
      </div>

      <motion.div style={tableWrapperStyles} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div style={tableContainerStyles}>
          <table {...getTableProps()} style={tableStyles}>
            <thead style={theadStyles}>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} style={thStyles}>{column.render('Header')}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {displayedRows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} style={trStyles}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} style={tdStyles}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div style={paginationWrapperStyles}>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0} style={pageButtonStyles}><FaArrowLeft /></button>
        <span style={pageCountStyles}>Page {currentPage + 1} of {pageCount}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage + 1 === pageCount} style={pageButtonStyles}><FaArrowRight /></button>
      </div>

      <div style={exportButtonWrapperStyles}>
        <button onClick={exportToExcel} style={exportButtonStyles}><FaFileExcel /> Export to Excel</button>
        <button onClick={exportToPDF} style={exportButtonStyles}><FaFilePdf /> Export to PDF</button>
      </div>

      <Footer />
    </div>
  );
}

const selectStyles = {
  marginRight: '15px',
  marginBottom: '15px',
  padding: '10px 20px',
  borderRadius: '50px',
  border: '1px solid #ddd',
  fontSize: '14px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  transition: 'background-color 0.3s ease-in-out',
  backgroundColor: '#fff',
  width: '200px',
};

const tableWrapperStyles = {
  width: '100%',
  margin: '20px auto',
  borderRadius: '15px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

const tableContainerStyles = {
  maxHeight: '800px',
  overflowY: 'auto',
  overflowX: 'auto',
};

const tableStyles = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#fff',
  textAlign: 'center',
};

const theadStyles = {
  position: 'sticky',
  top: 0,
  backgroundColor: '#003366',
  color: 'white',
  zIndex: 1,
  textAlign: 'center',
};

const thStyles = {
  padding: '12px 15px',
  border: '1px solid #ddd',
  textAlign: 'center',
};

const trStyles = {
  backgroundColor: '#f9f9f9',
  borderBottom: '1px solid #ddd',
};

const tdStyles = {
  padding: '12px 15px',
  textAlign: 'center',
  border: '1px solid #ddd',
};

const paginationWrapperStyles = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '20px',
};

const pageButtonStyles = {
  backgroundColor: '#003366',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '50px',
  margin: '0 10px',
  cursor: 'pointer',
};

const pageCountStyles = {
  fontSize: '16px',
  fontWeight: 'bold',
  alignSelf: 'center',
};

const exportButtonWrapperStyles = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginTop: '20px',
};

const exportButtonStyles = {
  backgroundColor: '#003366',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '50px',
  cursor: 'pointer',
};

export default CommitteeMembers;
