import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import Navbar from './Navbar';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaSearch, FaFileExcel, FaFilePdf } from 'react-icons/fa'; // Added export icons

function CommitteesPage() {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [committeeTypeFilter, setCommitteeTypeFilter] = useState('Type');
  const rowsPerPage = 15;

  // Fetch data
  useEffect(() => {
    fetch('http://localhost:5000/api/committees')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommittees(data);
        } else {
          console.error('Data is not in expected format:', data);
          setCommittees([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const filteredCommittees = useMemo(() => {
    return committees.filter(committee => {
      const matchesSearch = Object.values(committee).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesCommitteeType = committeeTypeFilter === 'Type' || committee.CommitteeType === committeeTypeFilter;
      return matchesSearch && matchesCommitteeType;
    });
  }, [committees, searchTerm, committeeTypeFilter]);

  const committeeTypes = useMemo(() => {
    const types = committees.map(committee => committee.CommitteeType);
    return ['Type', ...new Set(types)];
  }, [committees]);

  const columns = useMemo(() => [
    { Header: 'Committee Name', accessor: 'name' },
    { Header: 'Committee Type', accessor: 'CommitteeType' },
  ], []);

  const data = useMemo(() => filteredCommittees, [filteredCommittees]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data },
    useSortBy
  );

  const pageCount = Math.ceil(rows.length / rowsPerPage);
  const displayedRows = rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const exportToExcel = () => {
    const headers = columns.map(col => col.Header);
    const fullData = [headers, ...filteredCommittees.map(row => columns.map(col => row[col.accessor]))];
    const ws = XLSX.utils.aoa_to_sheet(fullData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Committees');
    XLSX.writeFile(wb, 'committees.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const headers = columns.map(col => col.Header);
    const tableData = filteredCommittees.map(application =>
      columns.map(col => application[col.accessor] || '')
    );
    
    doc.setFontSize(14);
    doc.text('Committee', 14, 10);
    doc.setFontSize(10);
    const startY = 20;
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: startY,
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
        0: { cellWidth: 100 },
        1: { cellWidth: 100 },
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
  
    doc.save('committees.pdf');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <Navbar />
      <h1 style={styles.pageTitle}>Committees</h1>
      <div style={styles.filterContainer}>
        <div style={styles.searchFilter}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search committees..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={committeeTypeFilter}
          onChange={e => setCommitteeTypeFilter(e.target.value)}
          style={styles.filterSelect}
        >
          {committeeTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div style={styles.tableContainer}>
        <table {...getTableProps()} style={styles.committeeTable}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} style={styles.tableHeader} key={column.id}>
                    {column.render('Header')}
                    <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {displayedRows.length > 0 ? (
              displayedRows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id} style={styles.tableRow}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} style={styles.tableCell} key={cell.column.id}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} style={styles.noResults}>
                  No matching results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Buttons */}
      <div style={styles.paginationButtons}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          style={styles.paginationBtn}
        >
          &lt;
        </button>
        <span style={{ padding: '10px', fontSize: '16px' }}>
          Page {currentPage + 1} of {pageCount}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount - 1))}
          disabled={currentPage === pageCount - 1}
          style={styles.paginationBtn}
        >
          &gt;
        </button>
      </div>

      {/* Export Buttons */}
      <div style={styles.exportButtons}>
        <button
          onClick={exportToExcel}
          style={styles.exportBtn}
        >
          <FaFileExcel style={styles.exportIcon} />
          Export to Excel
        </button>
        <button
          onClick={exportToPDF}
          style={styles.exportBtn}
        >
          <FaFilePdf style={styles.exportIcon} />
          Export to PDF
        </button>
      </div>

      <Footer />
    </div>
  );
}
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    padding: '20px',
  },
  pageTitle: {
    textAlign: 'center',
    paddingTop: '40px',
    paddingBottom: '20px',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#003366',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  searchFilter: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '10px',
    position: 'relative',
  },
  searchInput: {
    padding: '10px',
    width: '250px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    marginRight: '10px',
    paddingLeft: '30px', // Space for the icon
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#003366',
  },
  filterSelect: {
    padding: '10px',
    width: '150px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  tableContainer: {
    width: '80%',
    margin: '20px auto',
    textAlign: 'center',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #ddd',
    maxHeight: '700px', // Add height constraint for scrollable table
    overflowY: 'auto', // Enable vertical scroll
  },
  committeeTable: {
    width: '100%',
    borderCollapse: 'collapse',
    position: 'relative',
  },
  tableHeader: {
    padding: '12px',
    backgroundColor: '#003366',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'sticky',
    top: 0, // Stick to the top of the table container
    zIndex: 1, // Ensure headers stay above the rows when scrolling
    boxShadow: '0px 4px 2px -2px gray', // Optional shadow to distinguish headers
  },
  tableRow: {
    backgroundColor: '#f9f9f9',
  },
  tableCell: {
    padding: '10px',
    textAlign: 'center',
    border: '1px solid #ddd',
  },
  noResults: {
    textAlign: 'center',
    padding: '10px',
    color: '#666',
  },
  paginationButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    marginRight: '20px'
  },
  paginationBtn: {
    padding: '10px 15px',
    background: '#003366',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    marginRight: '10px',
    cursor: 'pointer',
  },
  paginationText: {
    alignSelf: 'center',
  },
  exportButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  exportBtn: {
    padding: '10px 20px',
    backgroundColor: '#003366',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    marginRight: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  exportIcon: {
    marginRight: '10px',
  },
};


export default CommitteesPage;
