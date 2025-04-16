// src/app/auth/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EditableTable from '@/components/EditableTable';

type Socials = {
    name: string;
    url: string;
    created: string;
    updated: string;
};

const Dashboard = () => {
    const [socialsData, setSocialsData] = useState<Socials[]>([]);

    useEffect(() => {
        const fetchSocials = async () => {
            try {
                // Fetch data from the backend API (which hides the Supabase details)
                const response = await fetch('/api/socials');
                const data = await response.json();

                if (response.ok) {
                    setSocialsData(data); // Set the fetched data in the state
                } else {
                    console.error('Error fetching socials:', data.message);
                }
            } catch (error) {
                console.error('Error fetching socials:', error);
            }
        };

        fetchSocials();
    }, []); // Empty dependency array to run only once when the component mounts

    // handleCellUpdate function to handle updating data (you can expand on this)
    const handleCellUpdate = async (id: string | number, column: string, newValue: string) => {
        try {
            const response = await fetch(`/api/socials/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [column]: newValue }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error updating cell:', data.message || 'Unknown error');
            } else {
                console.log('Cell updated successfully');
            }
        } catch (error) {
            console.error('Error updating cell:', error);
        }
    };


    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <h2>Dashboard</h2>
                <EditableTable
                    table="socials"
                    data={socialsData}
                    visibleColumns={["name", "url", "created", "updated"]}
                    columnLabels={{
                        name: "Name",
                        url: "URL",
                        created: "Created At",
                        updated: "Updated At",
                    }}
                    onCellUpdate={handleCellUpdate}
                />
            </div>
            <Footer />
        </>
    );
};

export default Dashboard;
