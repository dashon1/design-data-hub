import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import APIs from "./APIs";

import Data from "./Data";

import Exports from "./Exports";

import Activity from "./Activity";

import Templates from "./Templates";

import Snapshots from "./Snapshots";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import Login from './Login';

const PAGES = {
    
    Dashboard: Dashboard,
    
    APIs: APIs,
    
    Data: Data,
    
    Exports: Exports,
    
    Activity: Activity,
    
    Templates: Templates,
    
    Snapshots: Snapshots,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    if (/\/login$/i.test(location.pathname)) {
        return <Routes><Route path="/login" element={<Login />} /><Route path="/Login" element={<Login />} /></Routes>;
    }

    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/APIs" element={<APIs />} />
                
                <Route path="/Data" element={<Data />} />
                
                <Route path="/Exports" element={<Exports />} />
                
                <Route path="/Activity" element={<Activity />} />
                
                <Route path="/Templates" element={<Templates />} />
                
                <Route path="/Snapshots" element={<Snapshots />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}