import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import Navbar from './Navbar';
import Footer from './Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function CommitteeApplications() {
  const [committeeApplications, setCommitteeApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    JobTitle: 'All',
    State: 'All',
    Organization: 'All',
    Committee: 'All',
    Term: 'All',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    fetch('http://localhost:5000/api/committee-applications') // Fetch from updated backend
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommitteeApplications(data);
        } else {
          console.error('Data is not in expected format:', data);
          setCommitteeApplications([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(0); // Reset to first page when search term or filters change
  }, [searchTerm, filters]);

  const getUniqueValues = (column) => {
    const uniqueValues = [...new Set(committeeApplications.map(applicant => applicant[column]))];
    return uniqueValues;
  };

  const filteredCommitteeApplications = useMemo(() => {
    const searchWords = searchTerm.toLowerCase().split(/\s+/); // Split input by spaces

    return committeeApplications.filter(application => {
      const searchMatch = searchWords.every(word =>
        Object.values(application).some(value =>
          value?.toString().toLowerCase().includes(word)
        )
      );

      const filterMatch = Object.keys(filters).every(column => {
        if (filters[column] === 'All') return true;
        return application[column]?.toString().toLowerCase() === filters[column].toLowerCase();
      });

      return searchMatch && filterMatch;
    });
  }, [committeeApplications, searchTerm, filters]);

  const columns = useMemo(
    () => [
      { Header: 'Individual', accessor: 'Individual' },
      { Header: 'Job Title', accessor: 'JobTitle' },
      { Header: 'Organization', accessor: 'Organization' },
      { Header: 'State', accessor: 'State' },
      { Header: 'Committee', accessor: 'Committee' },
      { Header: 'Term', accessor: 'Term' },
    ],
    []
  );

  const data = useMemo(() => filteredCommitteeApplications, [filteredCommitteeApplications]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data },
    useSortBy
  );

  const pageCount = Math.ceil(rows.length / rowsPerPage);
  const displayedRows = rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const headers = columns.map(col => col.Header);
    const fullData = [
      headers,
      ...filteredCommitteeApplications.map(row =>
        columns.map(col => row[col.accessor] || '')
      ),
    ];
    const ws = XLSX.utils.aoa_to_sheet(fullData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Committee Applications');
    XLSX.writeFile(wb, 'committee_applications.xlsx');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }); // Landscape mode for wider tables

    const headers = columns.map(col => col.Header);
    const tableData = filteredCommitteeApplications.map(application =>
      columns.map(col => application[col.accessor] || '')
    );

    doc.setFontSize(14);
    doc.text('Committee Applications', 14, 10);
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
        fontSize: 8, // Reduce font size for better fit
        cellPadding: 2,
        overflow: 'ellipsize',
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 13 },
        4: { cellWidth: 100 },
        5: { cellWidth: 30 },
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

    doc.save('CommitteeApplications.pdf');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />

      <h1 style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '20px' }}>
        Committee Applications
      </h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search committee applications..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: '30%',
          padding: '8px',
          marginBottom: '10px',
          display: 'block',
          margin: '0 auto',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center',marginTop: '20px', marginBottom: '20px' }}>
        {['JobTitle', 'State', 'Organization', 'Committee', 'Term'].map(column => (
          <div key={column} style={{ margin: '0 10px' }}>
            <label style={{ marginRight: '5px' }}>{column}:</label>
            <select
              value={filters[column] || 'All'}
              onChange={e => setFilters({ ...filters, [column]: e.target.value })}
              style={{
                padding: '8px',
                width: '150px',
                marginTop: '5px',
                borderRadius: '5px',
                border: '1px solid #ddd',
              }}
            >
              <option value="All">All</option>
              {getUniqueValues(column).map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          width: '80%',
          margin: '20px auto',
          border: '1px solid #ddd',
          borderRadius: '5px',
          overflow: 'hidden',
        }}
      >
        <table {...getTableProps()} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                    style={{
                      border: '1px solid #ddd',
                      padding: '10px',
                      backgroundColor: '#003366',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
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
                  <tr {...row.getRowProps()} key={row.original.naco_prospectivecommitteememberid}>
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        style={{ border: '1px solid #ddd', padding: '8px' }}
                        key={cell.column.id + row.original.naco_prospectivecommitteememberid}
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '10px' }}>
                  No matching results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Export buttons */}
      <div style={{ textAlign: 'center', margin: '20px' }}>
        <button
          onClick={exportToExcel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#003366',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          Export to Excel
        </button>
        <button
          onClick={exportToPDF}
          style={{
            padding: '8px 16px',
            backgroundColor: '#003366',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Export to PDF
        </button>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '80%', margin: '10px auto' }}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          style={{
            padding: '8px 12px',
            marginRight: '10px',
            borderRadius: '5px',
            background: '#003366',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          &lt;
        </button>
        <span style={{ alignSelf: 'center' }}> Page {currentPage + 1} of {pageCount} </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount - 1))}
          disabled={currentPage === pageCount - 1}
          style={{
            padding: '8px 12px',
            marginLeft: '10px',
            borderRadius: '5px',
            background: '#003366',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          &gt;
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default CommitteeApplications;
