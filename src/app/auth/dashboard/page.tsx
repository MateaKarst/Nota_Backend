"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import EditableTable from '@/components/EditableTable'; // Make sure you import EditableTable

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
            const { data, error } = await supabase.from('socials').select('*');
            if (error) {
                console.error('Error fetching socials:', error);
            } else {
                console.log("Dashboard Page ->", 'Socials:', data);
                setSocialsData(data || []); // Store the fetched data in the state
            }
        };

        fetchSocials();
    }, []); // Empty dependency array to run only once when the component mounts

    // handleCellUpdate function to handle updating data (you can expand on this)
    const handleCellUpdate = async (id: string | number, column: string, newValue: string) => {
        const { error } = await supabase
            .from('socials')
            .update({ [column]: newValue })
            .eq('id', id);
        if (error) {
            console.error('Error updating cell:', error);
        } else {
            console.log('Cell updated successfully');
        }
    };

    return (
        <>
            <Navbar />

            <div className="container mt-5">
                <h2>Dashboard</h2>
                {/* Pass the socialsData to EditableTable */}
                <EditableTable
                    table="role"
                    data={socialsData}
                    visibleColumns={["name","url", "created", "updated"]}
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
