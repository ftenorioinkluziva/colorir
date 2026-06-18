import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/shared/Header";
import Dashboard from "./pages/Dashboard";
import DomainDetail from "./pages/DomainDetail";
import "./styles/App.css";

function App() {
	return (
		<div className="app">
			<Header />
			<main className="main-content">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/domain/:domainId" element={<DomainDetail />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
