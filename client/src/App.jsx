import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './Signup';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Committees from './Committees.jsx';
import ApplicantsWithoutPosition from './ApplicantsWithoutPosition.jsx';
import FinalLeadersList from './FinalLeadersList.jsx';
import CommitteeMember from './CommitteeMember.jsx';
import CommitteeApplications from './CommitteeApplications.jsx';
import Navbar from './Navbar';
import Footer from './Footer';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<Home />} />
          <Route path='/footer' elements={<Footer />} />
          <Route path="/committees" element={<Committees />} />
          <Route path="/applicants-without-position" element={<ApplicantsWithoutPosition />} />
          <Route path="/final-leaders-list" element={<FinalLeadersList />} />
          <Route path="/committee-member" element={<CommitteeMember />} />
          <Route path="/committee-applications" element={<CommitteeApplications />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
