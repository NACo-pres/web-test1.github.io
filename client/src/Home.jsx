import React, { useState } from 'react';
import { Button, Nav, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const [activeTab, setActiveTab] = useState('executive');

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh', fontFamily: 'Aptos, sans-serif' }}>
      {/* Tabs Navigation */}
      <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
        <Nav variant="tabs" className="justify-content mb-4 fw-bold fs-4 p-3" style={{ borderBottom: '3px solid #000' }}>
          <Nav.Item>
            <Nav.Link eventKey="staff" className={`px-4 py-2 ${activeTab === 'staff' ? 'text-dark' : 'text-muted'}`}>
              Staff View
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="executive" className={`px-4 py-2 ${activeTab === 'executive' ? 'text-dark' : 'text-muted'}`}>
              Executive View
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="admin" className={`px-4 py-2 ${activeTab === 'admin' ? 'text-dark' : 'text-muted'}`}>
              Admin
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content className="mt-0 flex-grow-1">
          {/* Executive View Tab */}
          <Tab.Pane eventKey="executive">
            <h1 className="text-center fw-bold mb-2 pt-5">PRESIDENTIAL APPOINTMENTS</h1>
            <h2 className="text-center fw-bold mb-4 pt-5 pb-5">EXECUTIVE VIEW</h2>

            {/* Buttons */}
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-5 mb-5 pb-4">
                  <Link to="/committees">
                    <Button
                      style={{
                        backgroundColor: '#003366',
                        color: 'white',
                        border: 'none',
                        height: '150%',
                        width: '100%',
                        padding: '16px 0',
                        fontWeight: '600'
                      }}
                    >
                      COMMITTEES
                    </Button>
                  </Link>
                </div>

                <div className="col-5 mb-5 pb-4">
                  <Link to="/applicants-without-position">
                    <Button
                      style={{
                        backgroundColor: '#003366',
                        color: 'white',
                        border: 'none',
                        width: '100%',
                        height: '150%',
                        padding: '16px 0',
                        fontWeight: '600'
                      }}
                    >
                      APPLICANTS WITHOUT POSITION
                    </Button>
                  </Link>
                </div>

                <div className="col-5 mb-5 pb-4">
                  <Link to="/committee-member">
                    <Button
                      style={{
                        backgroundColor: '#003366',
                        color: 'white',
                        border: 'none',
                        width: '100%',
                        height: '150%',
                        padding: '16px 0',
                        fontWeight: '600'
                      }}
                    >
                      COMMITTEE MEMBERS
                    </Button>
                  </Link>
                </div>

                <div className="col-5 mb-5 pb-4">
                  <Link to="/final-leaders-list">
                    <Button
                      style={{
                        backgroundColor: '#003366',
                        color: 'white',
                        border: 'none',
                        width: '100%',
                        height: '150%',
                        padding: '16px 0',
                        fontWeight: '600'
                      }}
                    >
                      FINAL LEADERS LIST
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
