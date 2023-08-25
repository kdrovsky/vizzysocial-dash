import Tap from '@tapfiliate/tapfiliate-js';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
// import { getRefCode } from '../helpers';
import { supabase } from '../supabaseClient';

export default function Thankyou() {
    const navigate = useNavigate()

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return navigate("/login")
            const { data, error } = await supabase
            .from('users')
                .select()
                .eq("user_id", user.id)
                .eq('first_account', true)
            if (error) return navigate("/login")
            if (!data[0]?.subscribed) {
                // window.location.pathname = `subscriptions/${data[0].username}`;
                window.location = `/subscriptions/${data[0].username}`;
                return;
            }

            if (data?.[0]) {
                const username = data[0].username
                const email = data[0].email
                try {
                    // Tap.conversion('DM', '99.95', { approved: true, customer_id: user?.id }, null, function (error, result) {
                    // const ref = getRefCode()
                    Tap.conversion(email, '99.95', { approved: true }, null, function (error, result) {
                        if (error) {
                            console.error('Error tracking conversion:', error);
                        } else {
                            console.log('Conversion tracked successfully:', result);
                        }
                    });        
                } catch (error) {
                    console.log(error);
                }
                navigate(`/dashboard/${username}`);
            }
        };

        getData();
    }, [navigate]);

    return (
        <div>...</div>
    )
}
